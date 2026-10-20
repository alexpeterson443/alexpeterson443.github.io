"""The backtest engine.

Timing rule, and the single most important line in this file: a signal
generated from bar ``i``'s close is executed at bar ``i + 1``'s open. Filling on
the same close the signal was derived from is the most common way a backtest
lies to you, and this engine structurally cannot do it.

Order of operations on each bar:

1. fill orders queued by the previous bar, at this bar's open
2. test stops and targets against this bar's high and low
3. mark the portfolio to this bar's close
4. check the drawdown kill switch
5. ask the strategy for signals and queue them for the next bar
"""

from __future__ import annotations

from dataclasses import dataclass, field
from datetime import date
from typing import Dict, List, Optional, Sequence, Tuple

from . import indicators as ind
from . import metrics as metrics_mod
from .core import Action, Bar, BacktestResult, EquityPoint, Signal
from .portfolio import (
    CostModel, ExposureLimit, InsufficientFunds, Portfolio, ShortingDisabled,
)
from .risk import RiskConfig, RiskManager
from .strategies import Strategy


@dataclass
class EngineConfig:
    starting_cash: float = 10_000.0
    costs: CostModel = field(default_factory=CostModel)
    risk: RiskConfig = field(default_factory=RiskConfig)
    fractional: bool = False
    risk_free_rate: float = 0.0
    liquidate_on_halt: bool = True
    verbose: bool = False

    @property
    def allow_short(self) -> bool:
        return self.risk.allow_short


class Backtester:
    """Runs one strategy over one or more symbols."""

    def __init__(self, strategy: Strategy, config: Optional[EngineConfig] = None):
        self.strategy = strategy
        self.config = config or EngineConfig()
        self.portfolio = Portfolio(
            self.config.starting_cash,
            self.config.costs,
            fractional=self.config.fractional,
            allow_short=self.config.risk.allow_short,
            max_gross_exposure=self.config.risk.max_gross_exposure,
        )
        self.risk = RiskManager(self.config.risk)
        self._pending: List[Tuple[str, Action, str]] = []
        self._atr: Dict[str, List[Optional[float]]] = {}
        self._index: Dict[str, Dict[date, int]] = {}
        self._bars: Dict[str, List[Bar]] = {}
        self._last_price: Dict[str, float] = {}

    # ------------------------------------------------------------------

    def run(self, series: Dict[str, Sequence[Bar]]) -> BacktestResult:
        if not series:
            raise ValueError("no price series supplied")

        self._prepare(series)
        all_dates = sorted({bar.ts for bars in self._bars.values() for bar in bars})
        if not all_dates:
            raise ValueError("price series contained no bars")

        result = BacktestResult(
            strategy=self.strategy.describe(),
            symbols=sorted(self._bars),
            starting_cash=self.config.starting_cash,
        )

        for ts in all_dates:
            today = {s: self._bars[s][i] for s, i in self._bars_on(ts)}
            if not today:
                continue

            self._fill_pending(ts, today)
            self._apply_stops(ts, today)
            self.portfolio.accrue_borrow(ts)

            closes = {s: bar.close for s, bar in today.items()}
            self._last_price.update(closes)
            self.portfolio.mark(ts, dict(self._last_price))

            reason = self.risk.check_halt(ts, self.portfolio.equity, self.portfolio.peak_equity)
            if reason and result.halted_on is None:
                result.halted_on = ts
                result.halt_reason = reason
                if self.config.verbose:
                    print(f"[{ts}] TRADING HALTED: {reason}")
                if self.config.liquidate_on_halt:
                    self._liquidate(ts, today, "risk halt")
                    self.portfolio.equity_curve[-1] = EquityPoint(ts, self.portfolio.cash, 0.0)

            if not self.risk.halted:
                self._collect_signals(ts, today)

        result.equity_curve = self.portfolio.equity_curve
        result.trades = self.portfolio.trades
        result.fills = self.portfolio.fills
        result.metrics = metrics_mod.summarize(
            result.equity_curve,
            result.trades,
            risk_free_rate=self.config.risk_free_rate,
            benchmark=self._benchmark_curve(all_dates),
        )
        result.metrics["total_costs"] = self.portfolio.total_costs
        return result

    # ------------------------------------------------------------------
    # setup
    # ------------------------------------------------------------------

    def _prepare(self, series: Dict[str, Sequence[Bar]]) -> None:
        for symbol, bars in series.items():
            symbol = symbol.upper()
            ordered = sorted(bars, key=lambda b: b.ts)
            if not ordered:
                continue
            self._bars[symbol] = ordered
            self._index[symbol] = {bar.ts: i for i, bar in enumerate(ordered)}
            self._atr[symbol] = ind.atr(
                [b.high for b in ordered],
                [b.low for b in ordered],
                [b.close for b in ordered],
                self.config.risk.atr_period,
            )
            self.strategy.prepare(symbol, ordered)

    def _bars_on(self, ts: date):
        for symbol, table in self._index.items():
            i = table.get(ts)
            if i is not None:
                yield symbol, i

    # ------------------------------------------------------------------
    # per bar steps
    # ------------------------------------------------------------------

    def _fill_pending(self, ts: date, today: Dict[str, Bar]) -> None:
        queued, self._pending = self._pending, []
        for symbol, action, reason in queued:
            bar = today.get(symbol)
            if bar is None:
                # No bar for this symbol today, so carry the order forward.
                self._pending.append((symbol, action, reason))
                continue

            if action.is_exit:
                if self.portfolio.position(symbol).is_open:
                    self.portfolio.close(ts, symbol, bar.open, reason)
                    self._log(ts, f"CLOSE {symbol} at {bar.open:.2f} ({reason})")
                continue

            if self.portfolio.position(symbol).is_open or self.risk.halted:
                continue

            direction = action.direction
            i = self._index[symbol][ts]
            qty = self.risk.target_qty(
                equity=self.portfolio.equity,
                cash=self.portfolio.cash,
                price=bar.open,
                atr=self._atr[symbol][i],
                open_positions=len(self.portfolio.open_symbols),
                fractional=self.config.fractional,
                gross_exposure=self.portfolio.gross_exposure,
            )
            if qty <= 0:
                continue
            try:
                if direction > 0:
                    fill = self.portfolio.buy(ts, symbol, qty, bar.open, reason)
                else:
                    fill = self.portfolio.sell(ts, symbol, qty, bar.open, reason)
            except (InsufficientFunds, ExposureLimit, ShortingDisabled) as exc:
                self._log(ts, f"SKIP {symbol}: {exc}")
                continue
            if fill is None:
                continue
            position = self.portfolio.position(symbol)
            position.stop_price = self.risk.initial_stop(fill.price, self._atr[symbol][i], direction)
            position.target_price = self.risk.initial_target(fill.price, direction)
            position.high_water = bar.open
            position.low_water = bar.open
            verb = "BUY " if direction > 0 else "SHORT"
            self._log(ts, f"{verb} {symbol} {fill.qty:g} at {fill.price:.2f} ({reason})")

    def _apply_stops(self, ts: date, today: Dict[str, Bar]) -> None:
        for symbol, bar in today.items():
            position = self.portfolio.position(symbol)
            if not position.is_open:
                continue
            decision = self.risk.check_exit(position, bar)
            if decision.should_exit:
                self.portfolio.close(ts, symbol, decision.price, decision.reason)
                self._log(ts, f"EXIT {symbol} at {decision.price:.2f} ({decision.reason})")
                # A stop-out cancels any entry queued for this symbol.
                self._pending = [p for p in self._pending if p[0] != symbol]

    def _collect_signals(self, ts: date, today: Dict[str, Bar]) -> None:
        for symbol, bar in today.items():
            i = self._index[symbol][ts]
            if i < self.strategy.warmup:
                continue
            position = self.portfolio.direction(symbol)
            signal: Signal = self.strategy.evaluate(symbol, i, position)
            if signal.action is Action.HOLD:
                continue
            if signal.is_entry and position != 0:
                continue
            if signal.is_exit and position == 0:
                continue
            self._pending.append((symbol, signal.action, signal.reason))

    def _liquidate(self, ts: date, today: Dict[str, Bar], reason: str) -> None:
        for symbol in list(self.portfolio.open_symbols):
            bar = today.get(symbol)
            price = bar.close if bar else self._last_price.get(symbol)
            if price:
                self.portfolio.close(ts, symbol, price, reason)
                self._log(ts, f"LIQUIDATE {symbol} at {price:.2f} ({reason})")
        self._pending = []

    # ------------------------------------------------------------------

    def _benchmark_curve(self, all_dates: Sequence[date]) -> List[EquityPoint]:
        """Equal weight buy and hold across the same symbols, for comparison."""
        symbols = sorted(self._bars)
        if not symbols:
            return []
        per_symbol = self.config.starting_cash / len(symbols)
        shares: Dict[str, float] = {}
        for symbol in symbols:
            first = self._bars[symbol][0]
            shares[symbol] = per_symbol / first.close

        curve: List[EquityPoint] = []
        last: Dict[str, float] = {}
        for ts in all_dates:
            for symbol, i in self._bars_on(ts):
                last[symbol] = self._bars[symbol][i].close
            value = sum(shares[s] * last[s] for s in symbols if s in last)
            uninvested = sum(per_symbol for s in symbols if s not in last)
            curve.append(EquityPoint(ts, uninvested, value))
        return curve

    def _log(self, ts: date, message: str) -> None:
        if self.config.verbose:
            print(f"[{ts}] {message}")


def run_backtest(
    strategy: Strategy,
    series: Dict[str, Sequence[Bar]],
    config: Optional[EngineConfig] = None,
) -> BacktestResult:
    """Convenience wrapper around :class:`Backtester`."""
    return Backtester(strategy, config).run(series)
