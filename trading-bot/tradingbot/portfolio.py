"""Cash, positions, and the running equity curve.

Positions are signed: positive is long, negative is short. Cash moves the same
way for both sides, a sale credits and a purchase debits, so equity is always
``cash + sum(qty * price)`` and short profit falls out of the arithmetic without
a parallel code path.

Shorting is refused unless explicitly enabled, and gross exposure is capped so
the accounting cannot quietly invent leverage.
"""

from __future__ import annotations

from dataclasses import dataclass
from datetime import date
from typing import Dict, List, Optional

from .core import EquityPoint, Fill, Position, Side, Trade


@dataclass
class CostModel:
    """Commission and slippage assumptions.

    ``slippage_bps`` is applied against the fill price in the direction that
    hurts: buys fill a little high, sells fill a little low.
    """

    commission_per_trade: float = 0.0
    commission_per_share: float = 0.0
    commission_bps: float = 0.0
    slippage_bps: float = 5.0
    min_commission: float = 0.0
    # Annualised borrow cost charged on short positions held overnight.
    borrow_rate_annual: float = 0.0

    def fill_price(self, side: Side, quoted: float) -> float:
        return quoted * (1 + side.sign * self.slippage_bps / 10_000.0)

    def commission(self, qty: float, price: float) -> float:
        total = (
            self.commission_per_trade
            + self.commission_per_share * abs(qty)
            + self.commission_bps / 10_000.0 * abs(qty) * price
        )
        if total <= 0:
            return 0.0
        return max(total, self.min_commission)

    def daily_borrow(self, short_value: float) -> float:
        if self.borrow_rate_annual <= 0 or short_value <= 0:
            return 0.0
        return short_value * self.borrow_rate_annual / 252.0


class InsufficientFunds(RuntimeError):
    pass


class ShortingDisabled(RuntimeError):
    pass


class ExposureLimit(RuntimeError):
    pass


class Portfolio:
    """Tracks cash, open positions, realised trades, and equity over time."""

    def __init__(
        self,
        starting_cash: float,
        costs: Optional[CostModel] = None,
        *,
        fractional: bool = False,
        allow_short: bool = False,
        max_gross_exposure: float = 1.0,
    ):
        if starting_cash <= 0:
            raise ValueError("starting cash must be positive")
        if max_gross_exposure <= 0:
            raise ValueError("max_gross_exposure must be positive")
        self.starting_cash = float(starting_cash)
        self.cash = float(starting_cash)
        self.costs = costs or CostModel()
        self.fractional = fractional
        self.allow_short = allow_short
        self.max_gross_exposure = max_gross_exposure
        self.positions: Dict[str, Position] = {}
        self.fills: List[Fill] = []
        self.trades: List[Trade] = []
        self.equity_curve: List[EquityPoint] = []
        self.borrow_paid = 0.0
        self._open_costs: Dict[str, float] = {}
        self._last_prices: Dict[str, float] = {}

    # ------------------------------------------------------------------
    # position helpers
    # ------------------------------------------------------------------

    def position(self, symbol: str) -> Position:
        return self.positions.setdefault(symbol, Position(symbol=symbol))

    def is_long(self, symbol: str) -> bool:
        return self.position(symbol).is_long

    def is_short(self, symbol: str) -> bool:
        return self.position(symbol).is_short

    def direction(self, symbol: str) -> int:
        return self.position(symbol).direction

    @property
    def open_symbols(self) -> List[str]:
        return [s for s, p in self.positions.items() if p.is_open]

    @property
    def gross_exposure(self) -> float:
        """Absolute market value of every open position."""
        total = 0.0
        for symbol, position in self.positions.items():
            if position.is_open:
                total += abs(position.qty) * self._last_prices.get(symbol, position.avg_price)
        return total

    def round_qty(self, qty: float) -> float:
        return qty if self.fractional else float(int(qty))

    def affordable_qty(self, price: float, budget: float) -> float:
        """Largest quantity that ``budget`` covers once costs are included."""
        if price <= 0 or budget <= 0:
            return 0.0
        per_share = price * (1 + self.costs.commission_bps / 10_000.0) + self.costs.commission_per_share
        usable = budget - self.costs.commission_per_trade
        if usable <= 0:
            return 0.0
        return max(self.round_qty(usable / per_share), 0.0)

    # ------------------------------------------------------------------
    # execution
    # ------------------------------------------------------------------

    def buy(self, ts: date, symbol: str, qty: float, quoted_price: float, tag: str = "") -> Optional[Fill]:
        """Buy shares. Covers an open short first, then opens or adds to a long."""
        return self._execute(ts, symbol, Side.BUY, qty, quoted_price, tag)

    def sell(self, ts: date, symbol: str, qty: float, quoted_price: float, tag: str = "") -> Optional[Fill]:
        """Sell shares. Reduces an open long first, then opens a short if allowed."""
        return self._execute(ts, symbol, Side.SELL, qty, quoted_price, tag)

    def close(self, ts: date, symbol: str, quoted_price: float, tag: str = "") -> Optional[Fill]:
        """Flatten whatever is open in this symbol, long or short."""
        position = self.position(symbol)
        if not position.is_open:
            return None
        side = Side.SELL if position.is_long else Side.BUY
        return self._execute(ts, symbol, side, position.abs_qty, quoted_price, tag)

    def _execute(
        self, ts: date, symbol: str, side: Side, qty: float, quoted_price: float, tag: str
    ) -> Optional[Fill]:
        qty = self.round_qty(abs(qty))
        if qty <= 0:
            return None
        price = self.costs.fill_price(side, quoted_price)
        position = self.position(symbol)
        signed = side.sign * qty                       # +qty to buy, -qty to sell

        # Split the order into the part that reduces an existing position and
        # the part that opens a new one in the opposite direction.
        reducing = 0.0
        opening = qty
        if position.is_open and position.direction != side.sign:
            reducing = min(qty, position.abs_qty)
            opening = qty - reducing

        commission = self.costs.commission(qty, price)
        cash_delta = -side.sign * qty * price - commission

        # Every refusal below happens before any state is mutated, so a
        # rejected order leaves the portfolio exactly as it was.
        if cash_delta < 0 and -cash_delta > self.cash + 1e-9:
            raise InsufficientFunds(
                f"{symbol}: {side.value}ing {qty:g} at {price:.2f} needs "
                f"{-cash_delta:.2f} but only {self.cash:.2f} is available"
            )

        if opening > 0:
            # On a sell, any portion beyond closing an existing long opens a
            # short, whether or not a long is currently held.
            if side is Side.SELL and not self.allow_short:
                raise ShortingDisabled(
                    f"{symbol}: short selling is disabled. Enable it with allow_short=True "
                    f"or --allow-short if you understand the unlimited loss exposure."
                )
            self._check_exposure(symbol, opening, quoted_price)

        # Record the closed portion as a completed round trip before the
        # position's average price is overwritten by any opening portion.
        if reducing > 0:
            self._record_trade(ts, position, reducing, price, commission * (reducing / qty), tag)

        self._apply(position, ts, signed, price, reducing, opening)
        self.cash += cash_delta
        if opening > 0:
            self._open_costs[symbol] = self._open_costs.get(symbol, 0.0) + commission * (opening / qty)

        fill = Fill(ts, symbol, side, qty, price, commission,
                    abs(price - quoted_price) * qty, tag)
        self.fills.append(fill)
        return fill

    def _apply(self, position: Position, ts: date, signed: float, price: float,
               reducing: float, opening: float) -> None:
        """Move the position by ``signed`` shares at ``price``."""
        was_open = position.is_open
        adding = was_open and position.direction == (1 if signed > 0 else -1)

        if adding:
            total = position.abs_qty + abs(signed)
            position.avg_price = (position.cost_basis + abs(signed) * price) / total

        position.qty += signed

        if abs(position.qty) < 1e-9:
            position.reset()
            self._open_costs.pop(position.symbol, None)
            return

        if opening > 0 and reducing > 0:
            # The order flipped the position, so this is a brand new trade.
            position.avg_price = price
            position.opened_at = ts
            position.high_water = price
            position.low_water = price
        elif not was_open:
            position.avg_price = price
            position.opened_at = ts
            position.high_water = price
            position.low_water = price

    def _record_trade(self, ts: date, position: Position, qty: float,
                      exit_price: float, exit_commission: float, tag: str) -> None:
        share = qty / position.abs_qty if position.abs_qty else 1.0
        entry_costs = self._open_costs.get(position.symbol, 0.0) * share
        self._open_costs[position.symbol] = self._open_costs.get(position.symbol, 0.0) - entry_costs
        self.trades.append(
            Trade(
                symbol=position.symbol,
                entry_ts=position.opened_at or ts,
                entry_price=position.avg_price,
                exit_ts=ts,
                exit_price=exit_price,
                qty=qty,
                costs=entry_costs + exit_commission,
                exit_reason=tag,
                direction=position.direction,
            )
        )

    def _check_exposure(self, symbol: str, qty: float, price: float) -> None:
        projected = self.gross_exposure + qty * price
        ceiling = self.equity * self.max_gross_exposure
        if projected > ceiling + 1e-6:
            raise ExposureLimit(
                f"{symbol}: opening {qty:g} at {price:.2f} would take gross exposure to "
                f"{projected:,.2f}, above the {self.max_gross_exposure:.0%} of equity limit "
                f"({ceiling:,.2f})"
            )

    # ------------------------------------------------------------------
    # valuation
    # ------------------------------------------------------------------

    def accrue_borrow(self, ts: date) -> float:
        """Charge one day of borrow on open shorts. Returns the amount charged."""
        if self.costs.borrow_rate_annual <= 0:
            return 0.0
        short_value = sum(
            abs(p.qty) * self._last_prices.get(s, p.avg_price)
            for s, p in self.positions.items()
            if p.is_short
        )
        charge = self.costs.daily_borrow(short_value)
        if charge > 0:
            self.cash -= charge
            self.borrow_paid += charge
        return charge

    def update_prices(self, prices: Dict[str, float]) -> None:
        """Refresh the marks without appending to the equity curve."""
        self._last_prices.update(prices)

    def mark(self, ts: date, prices: Dict[str, float]) -> EquityPoint:
        """Mark open positions to market and append an equity curve point."""
        self._last_prices.update(prices)
        value = 0.0
        for symbol, position in self.positions.items():
            if not position.is_open:
                continue
            price = self._last_prices.get(symbol)
            if price is None:
                raise KeyError(f"no price available to mark {symbol} on {ts}")
            value += position.market_value(price)
            position.high_water = max(position.high_water or price, price)
            position.low_water = min(position.low_water or price, price)
        point = EquityPoint(ts=ts, cash=self.cash, positions_value=value)
        self.equity_curve.append(point)
        return point

    @property
    def equity(self) -> float:
        """Cash plus positions at the most recent known price.

        Computed live rather than read from the last equity curve point, so a
        portfolio restored from saved state reports its true value instead of
        cash alone. Positions with no known price fall back to their cost basis.
        """
        value = 0.0
        for symbol, position in self.positions.items():
            if position.is_open:
                value += position.market_value(self._last_prices.get(symbol, position.avg_price))
        return self.cash + value

    @property
    def peak_equity(self) -> float:
        historic = max((p.equity for p in self.equity_curve), default=self.starting_cash)
        return max(historic, self.equity, self.starting_cash)

    @property
    def total_costs(self) -> float:
        return sum(f.commission + f.slippage for f in self.fills) + self.borrow_paid

    def snapshot(self) -> dict:
        return {
            "cash": round(self.cash, 2),
            "equity": round(self.equity, 2),
            "gross_exposure": round(self.gross_exposure, 2),
            "open_positions": {
                s: {
                    "qty": p.qty,
                    "side": "short" if p.is_short else "long",
                    "avg_price": round(p.avg_price, 4),
                    "stop": p.stop_price,
                }
                for s, p in self.positions.items()
                if p.is_open
            },
            "closed_trades": len(self.trades),
            "total_costs": round(self.total_costs, 2),
        }
