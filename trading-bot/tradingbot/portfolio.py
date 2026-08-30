"""Cash, positions, and the running equity curve.

The portfolio is long only and never lets cash go negative. Trading costs are
modelled explicitly because a strategy that looks profitable before costs very
often is not profitable after them.
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

    def fill_price(self, side: Side, quoted: float) -> float:
        return quoted * (1 + side.sign * self.slippage_bps / 10_000.0)

    def commission(self, qty: float, price: float) -> float:
        total = (
            self.commission_per_trade
            + self.commission_per_share * qty
            + self.commission_bps / 10_000.0 * qty * price
        )
        if total <= 0:
            return 0.0
        return max(total, self.min_commission)


class InsufficientFunds(RuntimeError):
    pass


class Portfolio:
    """Tracks cash, open positions, realised trades, and equity over time."""

    def __init__(self, starting_cash: float, costs: Optional[CostModel] = None, *, fractional: bool = False):
        if starting_cash <= 0:
            raise ValueError("starting cash must be positive")
        self.starting_cash = float(starting_cash)
        self.cash = float(starting_cash)
        self.costs = costs or CostModel()
        self.fractional = fractional
        self.positions: Dict[str, Position] = {}
        self.fills: List[Fill] = []
        self.trades: List[Trade] = []
        self.equity_curve: List[EquityPoint] = []
        self._open_costs: Dict[str, float] = {}
        self._last_prices: Dict[str, float] = {}

    # ------------------------------------------------------------------
    # position helpers
    # ------------------------------------------------------------------

    def position(self, symbol: str) -> Position:
        return self.positions.setdefault(symbol, Position(symbol=symbol))

    def is_long(self, symbol: str) -> bool:
        return self.position(symbol).is_open

    @property
    def open_symbols(self) -> List[str]:
        return [s for s, p in self.positions.items() if p.is_open]

    def round_qty(self, qty: float) -> float:
        return qty if self.fractional else float(int(qty))

    def affordable_qty(self, price: float, budget: float) -> float:
        """Largest quantity that ``budget`` covers once costs are included."""
        if price <= 0 or budget <= 0:
            return 0.0
        # Solve for qty ignoring the fixed fee first, then subtract it.
        per_share = price * (1 + self.costs.commission_bps / 10_000.0) + self.costs.commission_per_share
        usable = budget - self.costs.commission_per_trade
        if usable <= 0:
            return 0.0
        return max(self.round_qty(usable / per_share), 0.0)

    # ------------------------------------------------------------------
    # execution
    # ------------------------------------------------------------------

    def buy(self, ts: date, symbol: str, qty: float, quoted_price: float, tag: str = "") -> Optional[Fill]:
        qty = self.round_qty(qty)
        if qty <= 0:
            return None
        price = self.costs.fill_price(Side.BUY, quoted_price)
        commission = self.costs.commission(qty, price)
        total = qty * price + commission
        if total > self.cash + 1e-9:
            raise InsufficientFunds(
                f"{symbol}: buying {qty} at {price:.2f} needs {total:.2f} but only {self.cash:.2f} is available"
            )

        pos = self.position(symbol)
        if pos.is_open:
            pos.avg_price = (pos.cost_basis + qty * price) / (pos.qty + qty)
            pos.qty += qty
        else:
            pos.qty = qty
            pos.avg_price = price
            pos.opened_at = ts
            pos.high_water = quoted_price
            self._open_costs[symbol] = 0.0
        # Only commission is tracked here. Slippage is already baked into
        # ``price``, so charging it again would double count it.
        self._open_costs[symbol] = self._open_costs.get(symbol, 0.0) + commission

        self.cash -= total
        fill = Fill(ts, symbol, Side.BUY, qty, price, commission,
                    self._slippage_cost(qty, quoted_price, price), tag)
        self.fills.append(fill)
        return fill

    def sell(self, ts: date, symbol: str, qty: float, quoted_price: float, tag: str = "") -> Optional[Fill]:
        pos = self.position(symbol)
        qty = min(self.round_qty(qty), pos.qty)
        if qty <= 0:
            return None
        price = self.costs.fill_price(Side.SELL, quoted_price)
        commission = self.costs.commission(qty, price)
        slippage = self._slippage_cost(qty, quoted_price, price)
        entry_price = pos.avg_price
        entry_ts = pos.opened_at or ts

        # Costs recorded while the position was open are attributed pro rata.
        share = qty / pos.qty if pos.qty else 1.0
        entry_costs = self._open_costs.get(symbol, 0.0) * share
        self._open_costs[symbol] = self._open_costs.get(symbol, 0.0) - entry_costs

        self.cash += qty * price - commission
        pos.qty -= qty
        if pos.qty <= 1e-9:
            pos.qty = 0.0
            pos.avg_price = 0.0
            pos.opened_at = None
            pos.stop_price = None
            pos.target_price = None
            pos.high_water = 0.0
            self._open_costs.pop(symbol, None)

        self.trades.append(
            Trade(
                symbol=symbol,
                entry_ts=entry_ts,
                entry_price=entry_price,
                exit_ts=ts,
                exit_price=price,
                qty=qty,
                costs=entry_costs + commission,
                exit_reason=tag,
            )
        )
        fill = Fill(ts, symbol, Side.SELL, qty, price, commission, slippage, tag)
        self.fills.append(fill)
        return fill

    @staticmethod
    def _slippage_cost(qty: float, quoted: float, filled: float) -> float:
        return abs(filled - quoted) * qty

    # ------------------------------------------------------------------
    # valuation
    # ------------------------------------------------------------------

    def mark(self, ts: date, prices: Dict[str, float]) -> EquityPoint:
        """Mark open positions to market and append an equity curve point."""
        self._last_prices.update(prices)
        value = 0.0
        for symbol, pos in self.positions.items():
            if not pos.is_open:
                continue
            price = self._last_prices.get(symbol)
            if price is None:
                raise KeyError(f"no price available to mark {symbol} on {ts}")
            value += pos.market_value(price)
            pos.high_water = max(pos.high_water, price)
        point = EquityPoint(ts=ts, cash=self.cash, positions_value=value)
        self.equity_curve.append(point)
        return point

    def update_prices(self, prices: Dict[str, float]) -> None:
        """Refresh the marks without appending to the equity curve."""
        self._last_prices.update(prices)

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
        return sum(f.commission + f.slippage for f in self.fills)

    def snapshot(self) -> dict:
        return {
            "cash": round(self.cash, 2),
            "equity": round(self.equity, 2),
            "open_positions": {
                s: {"qty": p.qty, "avg_price": round(p.avg_price, 4), "stop": p.stop_price}
                for s, p in self.positions.items()
                if p.is_open
            },
            "closed_trades": len(self.trades),
            "total_costs": round(self.total_costs, 2),
        }
