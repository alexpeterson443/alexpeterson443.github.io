"""Live and paper trading loop.

One ``step`` is one decision cycle: pull recent bars, ask the strategy about the
most recent completed bar, apply the risk limits, and send orders to a broker.

Everything that could stop this from being safe to leave running is handled
here: the market calendar so it does not trade into a holiday, the journal so
every order is recorded before anything else happens, the kill switch, and a
dry run mode that goes through the whole motion without sending.
"""

from __future__ import annotations

import json
import os
from datetime import date, datetime, timedelta
from typing import Dict, List, Optional, Sequence

from . import data as data_mod
from . import indicators as ind
from . import market_calendar as cal
from .broker import AlpacaBroker, Broker, PaperBroker
from .core import Action, Bar, Order, OrderType, Side, as_date, parse_date
from .journal import Journal
from .notify import Notifier
from .risk import RiskConfig, RiskManager
from .strategies import Strategy


class Trader:
    """Drives a strategy against a broker on live or delayed data."""

    def __init__(
        self,
        strategy: Strategy,
        broker: Broker,
        symbols: Sequence[str],
        *,
        risk: Optional[RiskConfig] = None,
        provider: str = "yahoo",
        interval: str = "1d",
        lookback_days: int = 400,
        state_path: Optional[str] = None,
        journal_path: Optional[str] = None,
        csv_dir: Optional[str] = None,
        dry_run: bool = False,
        notifier: Optional[Notifier] = None,
        require_market_open: bool = False,
    ):
        self.strategy = strategy
        self.broker = broker
        self.symbols = [s.upper() for s in symbols]
        self.risk = RiskManager(risk or RiskConfig())
        self.provider = provider
        self.interval = interval
        self.lookback_days = lookback_days
        self.state_path = state_path
        self.csv_dir = csv_dir
        self.dry_run = dry_run
        self.journal = Journal(journal_path)
        self.notifier = notifier or Notifier()
        self.require_market_open = require_market_open
        self.log: List[str] = []
        if state_path:
            self.load_state()

    # ------------------------------------------------------------------

    @property
    def mode(self) -> str:
        if self.dry_run:
            return "dry-run"
        if isinstance(self.broker, AlpacaBroker) and self.broker.live:
            return "LIVE"
        return "paper"

    def _say(self, message: str) -> None:
        stamped = f"[{datetime.now():%Y-%m-%d %H:%M:%S}] {message}"
        self.log.append(stamped)
        print(stamped)

    def fetch(self, as_of: Optional[date] = None) -> Dict[str, List[Bar]]:
        end = as_of or date.today()
        start = end - timedelta(days=self.lookback_days)
        return data_mod.load_universe(
            self.symbols, start, end,
            provider=self.provider, csv_dir=self.csv_dir, interval=self.interval,
        )

    # ------------------------------------------------------------------

    def plan(self, series: Dict[str, List[Bar]]) -> List[dict]:
        """Decide what to do without sending anything. Safe to call anytime."""
        # Mark to the latest closes first, so sizing and the kill switch both
        # judge the portfolio at today's prices rather than stale ones.
        portfolio = getattr(self.broker, "portfolio", None)
        if portfolio is not None:
            portfolio.update_prices({s: bars[-1].close for s, bars in series.items() if bars})
        equity = self.broker.equity()
        held = self.broker.positions()
        peak_equity = portfolio.peak_equity if portfolio is not None else equity

        halt = self.risk.check_halt(date.today(), equity, peak_equity)
        if halt:
            self._say(f"RISK HALT: {halt}. Flattening positions, no new entries.")
            return [
                {"symbol": s, "side": Side.SELL if qty > 0 else Side.BUY,
                 "qty": abs(qty), "price": series[s][-1].close,
                 "reason": "risk halt", "closing": True}
                for s, qty in held.items()
                if s in series
            ]

        gross = portfolio.gross_exposure if portfolio is not None else 0.0
        intents: List[dict] = []
        for symbol in self.symbols:
            bars = series.get(symbol)
            if not bars:
                continue
            self.strategy.prepare(symbol, bars)
            i = len(bars) - 1
            if i < self.strategy.warmup:
                self._say(f"{symbol}: only {i + 1} bars, need {self.strategy.warmup}. Skipping.")
                continue

            last = bars[i]
            qty_held = held.get(symbol, 0.0)
            position = (qty_held > 0) - (qty_held < 0)
            signal = self.strategy.evaluate(symbol, i, position)

            if signal.action is Action.HOLD:
                continue

            if signal.is_exit and position != 0:
                intents.append({
                    "symbol": symbol,
                    "side": Side.SELL if position > 0 else Side.BUY,
                    "qty": abs(qty_held), "price": last.close,
                    "reason": signal.reason, "closing": True,
                })
                continue

            if signal.is_entry and position == 0:
                direction = signal.direction
                atr_series = ind.atr(
                    [b.high for b in bars], [b.low for b in bars], [b.close for b in bars],
                    self.risk.config.atr_period,
                )
                qty = self.risk.target_qty(
                    equity=equity, cash=self.broker.cash(), price=last.close,
                    atr=atr_series[i], open_positions=len(held),
                    fractional=False, gross_exposure=gross,
                )
                if qty <= 0:
                    self._say(f"{symbol}: entry signal but risk limits sized it to zero.")
                    continue
                if direction < 0 and not self.risk.config.allow_short:
                    self._say(f"{symbol}: short signal ignored, shorting is disabled.")
                    continue
                intents.append({
                    "symbol": symbol,
                    "side": Side.BUY if direction > 0 else Side.SELL,
                    "qty": qty, "price": last.close, "reason": signal.reason,
                    "closing": False, "direction": direction,
                    "stop": self.risk.initial_stop(last.close, atr_series[i], direction),
                    "target": self.risk.initial_target(last.close, direction),
                })
        return intents

    # ------------------------------------------------------------------

    def step(self, as_of: Optional[date] = None, force: bool = False) -> List[dict]:
        """Fetch, plan, and execute one cycle. Returns the executed orders."""
        if self.require_market_open and not force and not cal.is_market_open():
            self._say(f"Skipping cycle. {cal.describe()}")
            return []

        series = self.fetch(as_of)
        intents = self.plan(series)

        if not intents:
            self._say("No action. Holding current positions.")
        executed: List[dict] = []
        for intent in intents:
            label = (f"{intent['side'].value.upper()} {intent['qty']:g} {intent['symbol']} "
                     f"near {intent['price']:.2f}  ({intent['reason']})")

            # The journal records the intent before the order goes anywhere, so
            # a crash mid send still leaves a trace of what was attempted.
            self.journal.record(
                mode=self.mode, symbol=intent["symbol"], side=intent["side"].value,
                qty=intent["qty"], price=round(intent["price"], 4),
                strategy=self.strategy.name, reason=intent["reason"],
                status="dry-run" if self.dry_run else "submitted",
                equity=round(self.broker.equity(), 2), cash=round(self.broker.cash(), 2),
            )

            if self.dry_run:
                self._say(f"DRY RUN would {label}")
                continue

            order = Order(
                symbol=intent["symbol"], side=intent["side"], qty=intent["qty"],
                type=OrderType.MARKET, tag=intent["reason"][:24],
            )
            receipt = self._submit(order, intent)
            if receipt:
                self._say(f"SENT {label}")
                executed.append(receipt)
                self.journal.record(
                    mode=self.mode, symbol=intent["symbol"], side=intent["side"].value,
                    qty=intent["qty"], price=round(intent["price"], 4),
                    strategy=self.strategy.name, reason=intent["reason"], status="filled",
                    equity=round(self.broker.equity(), 2), cash=round(self.broker.cash(), 2),
                )
            else:
                reason = getattr(self.broker, "last_rejection", None) or "broker declined"
                self._say(f"REJECTED {label}: {reason}")
                self.journal.record(
                    mode=self.mode, symbol=intent["symbol"], side=intent["side"].value,
                    qty=intent["qty"], price=round(intent["price"], 4),
                    strategy=self.strategy.name, reason=intent["reason"],
                    status="rejected", note=str(reason)[:200],
                )

        if isinstance(self.broker, PaperBroker):
            self.broker.mark({s: bars[-1].close for s, bars in series.items()})
        if self.state_path and not self.dry_run:
            self.save_state()
        if executed and self.notifier.enabled:
            self._announce(executed)
        return executed

    def _submit(self, order: Order, intent: dict) -> Optional[dict]:
        """Send one order, attaching bracket legs where the broker supports them."""
        if isinstance(self.broker, AlpacaBroker) and not intent.get("closing"):
            stop, target = intent.get("stop"), intent.get("target")
            if stop is not None and target is not None:
                return self.broker.submit(order, intent["price"],
                                          take_profit=target, stop_loss=stop)
        return self.broker.submit(order, intent["price"])

    def _announce(self, executed: Sequence[dict]) -> None:
        lines = [
            f"{r.get('side', '?').upper()} {r.get('qty', '?')} {r.get('symbol', '?')} "
            f"at {r.get('price', '?')}"
            for r in executed
        ]
        body = "\n".join(lines) + f"\n\nEquity: {self.broker.equity():,.2f}"
        if not self.notifier.send(f"{self.mode} orders filled", body):
            for error in self.notifier.errors[-2:]:
                self._say(f"notification: {error}")

    # ------------------------------------------------------------------
    # persistence
    # ------------------------------------------------------------------

    def save_state(self) -> None:
        if not self.state_path or not isinstance(self.broker, PaperBroker):
            return
        portfolio = self.broker.portfolio
        payload = {
            "saved_at": datetime.now().isoformat(timespec="seconds"),
            "strategy": self.strategy.describe(),
            "symbols": self.symbols,
            "cash": portfolio.cash,
            "starting_cash": portfolio.starting_cash,
            "positions": {
                s: {
                    "qty": p.qty,
                    "avg_price": p.avg_price,
                    "opened_at": as_date(p.opened_at).isoformat() if p.opened_at else None,
                    "high_water": p.high_water,
                    "low_water": p.low_water,
                    "stop_price": p.stop_price,
                    "target_price": p.target_price,
                }
                for s, p in portfolio.positions.items()
                if p.is_open
            },
            "closed_trades": len(portfolio.trades),
            "halted": self.risk.halted,
            "halt_reason": self.risk.halt_reason,
        }
        os.makedirs(os.path.dirname(os.path.abspath(self.state_path)) or ".", exist_ok=True)
        # Write to a temporary file and rename, so a crash mid write cannot
        # leave a truncated state file behind.
        temp = f"{self.state_path}.tmp"
        with open(temp, "w", encoding="utf-8") as handle:
            json.dump(payload, handle, indent=2)
        os.replace(temp, self.state_path)

    def load_state(self) -> bool:
        if not self.state_path or not os.path.exists(self.state_path):
            return False
        if not isinstance(self.broker, PaperBroker):
            return False
        try:
            with open(self.state_path, encoding="utf-8") as handle:
                payload = json.load(handle)
        except (json.JSONDecodeError, OSError) as exc:
            self._say(f"warning: could not read {self.state_path}: {exc}. Starting fresh.")
            return False
        portfolio = self.broker.portfolio
        portfolio.cash = float(payload.get("cash", portfolio.cash))
        portfolio.starting_cash = float(payload.get("starting_cash", portfolio.starting_cash))
        for symbol, saved in (payload.get("positions") or {}).items():
            position = portfolio.position(symbol)
            position.qty = float(saved["qty"])
            position.avg_price = float(saved["avg_price"])
            position.opened_at = parse_date(saved["opened_at"]) if saved.get("opened_at") else None
            position.high_water = float(saved.get("high_water") or 0.0)
            position.low_water = float(saved.get("low_water") or 0.0)
            position.stop_price = saved.get("stop_price")
            position.target_price = saved.get("target_price")
        if payload.get("halted"):
            self.risk.halted = True
            self.risk.halt_reason = payload.get("halt_reason", "restored from saved state")
        self._say(f"Restored state from {self.state_path} (saved {payload.get('saved_at')}).")
        return True

    def status(self) -> dict:
        positions = self.broker.positions()
        return {
            "mode": self.mode,
            "broker": self.broker.describe(),
            "strategy": self.strategy.describe(),
            "market": cal.describe(),
            "equity": round(self.broker.equity(), 2),
            "cash": round(self.broker.cash(), 2),
            "positions": {
                s: {"qty": q, "side": "long" if q > 0 else "short"}
                for s, q in positions.items()
            },
            "halted": self.risk.halted,
            "halt_reason": self.risk.halt_reason,
            "journal": self.journal.path,
        }
