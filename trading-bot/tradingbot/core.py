"""Core value types shared across the trading bot.

Everything here is a plain dataclass with no third party dependencies so the
package runs on a stock Python install.
"""

from __future__ import annotations

import math
from dataclasses import dataclass, field
from datetime import date, datetime
from enum import Enum
from typing import Optional


class Side(str, Enum):
    BUY = "buy"
    SELL = "sell"

    @property
    def sign(self) -> int:
        return 1 if self is Side.BUY else -1


class OrderType(str, Enum):
    MARKET = "market"
    LIMIT = "limit"
    STOP = "stop"


class Action(str, Enum):
    """What a strategy wants to happen to a position."""

    ENTER_LONG = "enter_long"
    EXIT_LONG = "exit_long"
    HOLD = "hold"


@dataclass(frozen=True)
class Bar:
    """A single OHLCV price bar."""

    ts: date
    open: float
    high: float
    low: float
    close: float
    volume: float = 0.0

    def __post_init__(self) -> None:
        if self.high < self.low:
            raise ValueError(f"bar {self.ts}: high {self.high} below low {self.low}")
        for name in ("open", "high", "low", "close"):
            value = getattr(self, name)
            if not math.isfinite(value) or value <= 0:
                raise ValueError(f"bar {self.ts}: {name} must be a positive number")

    @property
    def typical(self) -> float:
        return (self.high + self.low + self.close) / 3.0


@dataclass(frozen=True)
class Signal:
    """A strategy's opinion about one symbol on one bar."""

    symbol: str
    action: Action
    reason: str = ""
    strength: float = 1.0

    @property
    def is_entry(self) -> bool:
        return self.action is Action.ENTER_LONG

    @property
    def is_exit(self) -> bool:
        return self.action is Action.EXIT_LONG


@dataclass
class Order:
    symbol: str
    side: Side
    qty: float
    type: OrderType = OrderType.MARKET
    limit_price: Optional[float] = None
    stop_price: Optional[float] = None
    tag: str = ""

    def __post_init__(self) -> None:
        if self.qty <= 0:
            raise ValueError("order qty must be positive")
        if self.type is OrderType.LIMIT and self.limit_price is None:
            raise ValueError("limit order requires limit_price")
        if self.type is OrderType.STOP and self.stop_price is None:
            raise ValueError("stop order requires stop_price")


@dataclass(frozen=True)
class Fill:
    ts: date
    symbol: str
    side: Side
    qty: float
    price: float
    commission: float = 0.0
    slippage: float = 0.0
    tag: str = ""

    @property
    def gross_value(self) -> float:
        return self.qty * self.price

    @property
    def cash_delta(self) -> float:
        """Signed change to cash, commission included."""
        return -self.side.sign * self.gross_value - self.commission


@dataclass
class Position:
    symbol: str
    qty: float = 0.0
    avg_price: float = 0.0
    opened_at: Optional[date] = None
    # Highest close seen while the position was open, for trailing stops.
    high_water: float = 0.0
    stop_price: Optional[float] = None
    target_price: Optional[float] = None

    @property
    def is_open(self) -> bool:
        return self.qty > 0

    @property
    def cost_basis(self) -> float:
        return self.qty * self.avg_price

    def market_value(self, price: float) -> float:
        return self.qty * price

    def unrealized_pnl(self, price: float) -> float:
        return (price - self.avg_price) * self.qty


@dataclass
class Trade:
    """A completed round trip, used for performance statistics."""

    symbol: str
    entry_ts: date
    entry_price: float
    exit_ts: date
    exit_price: float
    qty: float
    # Commission only. Slippage is already reflected in entry_price/exit_price.
    costs: float = 0.0
    exit_reason: str = ""

    @property
    def pnl(self) -> float:
        return (self.exit_price - self.entry_price) * self.qty - self.costs

    @property
    def return_pct(self) -> float:
        basis = self.entry_price * self.qty
        return self.pnl / basis if basis else 0.0

    @property
    def bars_held(self) -> int:
        return (self.exit_ts - self.entry_ts).days

    @property
    def is_win(self) -> bool:
        return self.pnl > 0


@dataclass
class EquityPoint:
    ts: date
    cash: float
    positions_value: float

    @property
    def equity(self) -> float:
        return self.cash + self.positions_value


@dataclass
class BacktestResult:
    strategy: str
    symbols: list
    equity_curve: list = field(default_factory=list)
    trades: list = field(default_factory=list)
    fills: list = field(default_factory=list)
    starting_cash: float = 0.0
    metrics: dict = field(default_factory=dict)
    halted_on: Optional[date] = None
    halt_reason: str = ""

    @property
    def final_equity(self) -> float:
        return self.equity_curve[-1].equity if self.equity_curve else self.starting_cash


def parse_date(value) -> date:
    """Accept a date, datetime, or ISO-ish string and return a date."""
    if isinstance(value, datetime):
        return value.date()
    if isinstance(value, date):
        return value
    text = str(value).strip()
    if not text:
        raise ValueError("empty date")
    return datetime.strptime(text[:10], "%Y-%m-%d").date()
