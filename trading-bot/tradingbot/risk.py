"""Position sizing and capital protection.

The strategy decides *whether* to trade. This module decides *how much*, and
holds the veto that stops trading when losses run past what you agreed to.
"""

from __future__ import annotations

from dataclasses import dataclass
from datetime import date
from typing import Optional

from .core import Bar, Position


class SizingMode:
    FIXED_FRACTION = "fixed_fraction"
    FIXED_DOLLAR = "fixed_dollar"
    ATR_RISK = "atr_risk"

    ALL = (FIXED_FRACTION, FIXED_DOLLAR, ATR_RISK)


@dataclass
class RiskConfig:
    """Every knob that limits exposure, in one place.

    Set any limit to ``None`` to disable it.
    """

    sizing: str = SizingMode.FIXED_FRACTION
    # fixed_fraction: fraction of current equity per position.
    fraction: float = 0.20
    # fixed_dollar: flat notional per position.
    dollars: float = 1_000.0
    # atr_risk: risk this fraction of equity between entry and the stop.
    risk_per_trade: float = 0.01
    atr_period: int = 14
    atr_stop_mult: float = 2.0

    max_position_pct: float = 0.35     # cap on any single position's weight
    max_open_positions: int = 5
    cash_buffer_pct: float = 0.02      # never deploy the last slice of cash

    stop_loss_pct: Optional[float] = 0.08     # hard stop below entry
    take_profit_pct: Optional[float] = None   # fixed target above entry
    trailing_stop_pct: Optional[float] = None # trails the highest close seen

    max_drawdown_pct: Optional[float] = 0.25  # kill switch on the equity curve
    max_daily_loss_pct: Optional[float] = None

    def validate(self) -> None:
        if self.sizing not in SizingMode.ALL:
            raise ValueError(f"sizing must be one of {', '.join(SizingMode.ALL)}")
        if not 0 < self.fraction <= 1:
            raise ValueError("fraction must be between 0 and 1")
        if not 0 < self.max_position_pct <= 1:
            raise ValueError("max_position_pct must be between 0 and 1")
        if self.max_open_positions < 1:
            raise ValueError("max_open_positions must be at least 1")
        if not 0 <= self.cash_buffer_pct < 1:
            raise ValueError("cash_buffer_pct must be between 0 and 1")
        if self.sizing == SizingMode.ATR_RISK and not 0 < self.risk_per_trade <= 0.1:
            raise ValueError("risk_per_trade should be a small fraction such as 0.01")
        for name in ("stop_loss_pct", "take_profit_pct", "trailing_stop_pct",
                     "max_drawdown_pct", "max_daily_loss_pct"):
            value = getattr(self, name)
            if value is not None and not 0 < value < 1:
                raise ValueError(f"{name} must be between 0 and 1, or None")


@dataclass
class ExitDecision:
    should_exit: bool
    price: float = 0.0
    reason: str = ""


class RiskManager:
    """Applies :class:`RiskConfig` to sizing, stops, and the kill switch."""

    def __init__(self, config: Optional[RiskConfig] = None):
        self.config = config or RiskConfig()
        self.config.validate()
        self.halted = False
        self.halt_reason = ""
        self._day_start_equity: Optional[float] = None
        self._current_day: Optional[date] = None

    # ------------------------------------------------------------------
    # sizing
    # ------------------------------------------------------------------

    def target_qty(
        self,
        *,
        equity: float,
        cash: float,
        price: float,
        atr: Optional[float] = None,
        open_positions: int = 0,
        fractional: bool = False,
    ) -> float:
        """Quantity to buy, already clipped by every configured limit."""
        cfg = self.config
        if self.halted or price <= 0 or equity <= 0:
            return 0.0
        if open_positions >= cfg.max_open_positions:
            return 0.0

        if cfg.sizing == SizingMode.FIXED_FRACTION:
            notional = equity * cfg.fraction
        elif cfg.sizing == SizingMode.FIXED_DOLLAR:
            notional = cfg.dollars
        else:
            if not atr or atr <= 0:
                return 0.0  # no volatility estimate yet, so do not guess
            risk_dollars = equity * cfg.risk_per_trade
            stop_distance = cfg.atr_stop_mult * atr
            notional = risk_dollars / stop_distance * price

        notional = min(notional, equity * cfg.max_position_pct)
        spendable = max(cash - equity * cfg.cash_buffer_pct, 0.0)
        notional = min(notional, spendable)
        qty = notional / price
        return qty if fractional else float(int(qty))

    def initial_stop(self, entry_price: float, atr: Optional[float] = None) -> Optional[float]:
        """Stop price to attach at entry, or ``None`` if no stop is configured."""
        cfg = self.config
        candidates = []
        if cfg.stop_loss_pct:
            candidates.append(entry_price * (1 - cfg.stop_loss_pct))
        if cfg.sizing == SizingMode.ATR_RISK and atr:
            candidates.append(entry_price - cfg.atr_stop_mult * atr)
        if not candidates:
            return None
        # The tightest stop is the one that actually protects capital.
        return max(candidates)

    def initial_target(self, entry_price: float) -> Optional[float]:
        if not self.config.take_profit_pct:
            return None
        return entry_price * (1 + self.config.take_profit_pct)

    # ------------------------------------------------------------------
    # exits
    # ------------------------------------------------------------------

    def check_exit(self, position: Position, bar: Bar) -> ExitDecision:
        """Test stops and targets against a bar's full range.

        When a bar touches both the stop and the target, the stop is assumed to
        have hit first. Being pessimistic here keeps backtests honest.
        """
        cfg = self.config
        if not position.is_open:
            return ExitDecision(False)

        stop = position.stop_price
        if cfg.trailing_stop_pct and position.high_water:
            trail = position.high_water * (1 - cfg.trailing_stop_pct)
            stop = trail if stop is None else max(stop, trail)

        if stop is not None and bar.low <= stop:
            # A gap down fills at the open, not at the stop price.
            fill = min(stop, bar.open)
            return ExitDecision(True, fill, f"stop hit at {fill:.2f}")

        target = position.target_price
        if target is not None and bar.high >= target:
            fill = max(target, bar.open)
            return ExitDecision(True, fill, f"target hit at {fill:.2f}")

        return ExitDecision(False)

    def update_trailing(self, position: Position, price: float) -> None:
        if price > position.high_water:
            position.high_water = price

    # ------------------------------------------------------------------
    # kill switch
    # ------------------------------------------------------------------

    def check_halt(self, ts: date, equity: float, peak_equity: float) -> Optional[str]:
        """Halt new entries when drawdown or daily loss limits are breached."""
        cfg = self.config
        if self._current_day != ts:
            self._current_day = ts
            self._day_start_equity = equity

        if cfg.max_drawdown_pct and peak_equity > 0:
            drawdown = (peak_equity - equity) / peak_equity
            if drawdown >= cfg.max_drawdown_pct:
                self._halt(f"max drawdown breached: {drawdown:.1%} on {ts}")
                return self.halt_reason

        if cfg.max_daily_loss_pct and self._day_start_equity:
            loss = (self._day_start_equity - equity) / self._day_start_equity
            if loss >= cfg.max_daily_loss_pct:
                self._halt(f"daily loss limit breached: {loss:.1%} on {ts}")
                return self.halt_reason
        return None

    def _halt(self, reason: str) -> None:
        if not self.halted:
            self.halted = True
            self.halt_reason = reason

    def resume(self) -> None:
        self.halted = False
        self.halt_reason = ""
