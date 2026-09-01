"""Domain types for binary prediction markets.

A prediction market share pays exactly $1 if the outcome happens and $0 if it
does not, so its price is a probability. Three consequences drive every design
decision in this package:

* Price is bounded in (0, 1). A "price" of 0.97 means the market thinks it is
  97 percent likely, and the most you can make is 3 cents on the dollar.
* Loss is bounded. Buying a share can lose 100 percent of the stake and no
  more, which makes Kelly sizing well defined here in a way it is not for
  equities.
* YES and NO are complements. Holding one of each guarantees $1 at
  resolution, so if you can buy both for less than $1 the profit is locked in
  regardless of the outcome.
"""

from __future__ import annotations

import json
from dataclasses import dataclass, field
from datetime import datetime, timezone
from typing import List, Optional

YES = "Yes"
NO = "No"


@dataclass(frozen=True)
class Level:
    """One price level in an order book."""

    price: float
    size: float

    @property
    def notional(self) -> float:
        return self.price * self.size


@dataclass
class OrderBook:
    """A single outcome token's order book.

    ``bids`` are sorted best (highest) first and ``asks`` best (lowest) first,
    which is the order a taker consumes them in.
    """

    token_id: str
    bids: List[Level] = field(default_factory=list)
    asks: List[Level] = field(default_factory=list)
    tick_size: float = 0.01
    min_order_size: float = 5.0
    fetched_at: Optional[datetime] = None

    @classmethod
    def from_api(cls, payload: dict) -> "OrderBook":
        def levels(rows, reverse):
            out = [
                Level(float(r["price"]), float(r["size"]))
                for r in (rows or [])
                if float(r.get("size", 0)) > 0
            ]
            return sorted(out, key=lambda l: l.price, reverse=reverse)

        return cls(
            token_id=str(payload.get("asset_id") or ""),
            bids=levels(payload.get("bids"), reverse=True),
            asks=levels(payload.get("asks"), reverse=False),
            tick_size=float(payload.get("tick_size") or 0.01),
            min_order_size=float(payload.get("min_order_size") or 5.0),
            fetched_at=datetime.now(timezone.utc),
        )

    @property
    def best_bid(self) -> Optional[float]:
        return self.bids[0].price if self.bids else None

    @property
    def best_ask(self) -> Optional[float]:
        return self.asks[0].price if self.asks else None

    @property
    def mid(self) -> Optional[float]:
        if self.best_bid is None or self.best_ask is None:
            return None
        return (self.best_bid + self.best_ask) / 2.0

    @property
    def spread(self) -> Optional[float]:
        if self.best_bid is None or self.best_ask is None:
            return None
        return self.best_ask - self.best_bid

    def depth(self, side: str, within: float = 1.0) -> float:
        """Total shares available on one side within ``within`` of the touch.

        Depth is the number that matters. A tight spread on top of ten dollars
        of size is not a tradeable price, it is a decoration.
        """
        levels = self.asks if side == "buy" else self.bids
        if not levels:
            return 0.0
        touch = levels[0].price
        total = 0.0
        for level in levels:
            if side == "buy" and level.price > touch + within:
                break
            if side == "sell" and level.price < touch - within:
                break
            total += level.size
        return total

    def notional_depth(self, side: str, within: float = 1.0) -> float:
        levels = self.asks if side == "buy" else self.bids
        if not levels:
            return 0.0
        touch = levels[0].price
        total = 0.0
        for level in levels:
            if side == "buy" and level.price > touch + within:
                break
            if side == "sell" and level.price < touch - within:
                break
            total += level.notional
        return total

    @property
    def is_empty(self) -> bool:
        return not self.bids and not self.asks


@dataclass
class Market:
    """One binary market, its two outcome tokens, and its current quotes."""

    id: str
    question: str
    slug: str
    condition_id: str
    token_ids: List[str] = field(default_factory=list)
    outcomes: List[str] = field(default_factory=list)
    outcome_prices: List[float] = field(default_factory=list)
    end_date: Optional[datetime] = None
    volume: float = 0.0
    liquidity: float = 0.0
    volume_24h: float = 0.0
    best_bid: Optional[float] = None
    best_ask: Optional[float] = None
    last_trade_price: Optional[float] = None
    spread: Optional[float] = None
    tick_size: float = 0.01
    min_order_size: float = 5.0
    active: bool = True
    closed: bool = False
    accepting_orders: bool = True
    order_book_enabled: bool = True
    neg_risk: bool = False
    # Crypto up/down markets carry their resolution config. None elsewhere.
    fees_enabled: bool = False
    fee_rate: Optional[float] = None
    twap_lookback_seconds: Optional[int] = None
    event_start: Optional[datetime] = None

    # ------------------------------------------------------------------

    @classmethod
    def from_gamma(cls, row: dict) -> "Market":
        """Build from a Gamma API market object.

        Gamma returns several list fields as JSON encoded strings rather than
        real arrays, so they are decoded defensively here.
        """
        def as_list(value):
            if isinstance(value, list):
                return value
            if isinstance(value, str) and value.strip():
                try:
                    parsed = json.loads(value)
                    return parsed if isinstance(parsed, list) else []
                except json.JSONDecodeError:
                    return []
            return []

        def as_float(value, default=0.0):
            try:
                return float(value)
            except (TypeError, ValueError):
                return default

        def as_optional_float(value):
            try:
                return float(value)
            except (TypeError, ValueError):
                return None

        schedule = row.get("feeSchedule") if isinstance(row.get("feeSchedule"), dict) else {}
        crypto = row.get("cryptoMarketConfig") if isinstance(row.get("cryptoMarketConfig"), dict) else {}

        return cls(
            id=str(row.get("id") or ""),
            question=str(row.get("question") or ""),
            slug=str(row.get("slug") or ""),
            condition_id=str(row.get("conditionId") or ""),
            token_ids=[str(t) for t in as_list(row.get("clobTokenIds"))],
            outcomes=[str(o) for o in as_list(row.get("outcomes"))],
            outcome_prices=[as_float(p) for p in as_list(row.get("outcomePrices"))],
            end_date=parse_iso(row.get("endDate")),
            volume=as_float(row.get("volumeNum") or row.get("volume")),
            liquidity=as_float(row.get("liquidityNum") or row.get("liquidity")),
            volume_24h=as_float(row.get("volume24hr")),
            best_bid=as_optional_float(row.get("bestBid")),
            best_ask=as_optional_float(row.get("bestAsk")),
            last_trade_price=as_optional_float(row.get("lastTradePrice")),
            spread=as_optional_float(row.get("spread")),
            tick_size=as_float(row.get("orderPriceMinTickSize"), 0.01),
            min_order_size=as_float(row.get("orderMinSize"), 5.0),
            active=bool(row.get("active", True)),
            closed=bool(row.get("closed", False)),
            accepting_orders=bool(row.get("acceptingOrders", True)),
            order_book_enabled=bool(row.get("enableOrderBook", True)),
            neg_risk=bool(row.get("negRisk", False)),
            fees_enabled=bool(row.get("feesEnabled", False)),
            fee_rate=as_optional_float(schedule.get("rate")),
            twap_lookback_seconds=(int(crypto["twapLookbackSeconds"])
                                   if crypto.get("twapLookbackSeconds") else None),
            event_start=parse_iso(row.get("eventStartTime")),
        )

    # ------------------------------------------------------------------

    @property
    def is_binary(self) -> bool:
        return len(self.token_ids) == 2 and len(self.outcomes) == 2

    @property
    def is_tradeable(self) -> bool:
        return (
            self.active
            and not self.closed
            and self.accepting_orders
            and self.order_book_enabled
            and self.is_binary
        )

    def token_for(self, outcome: str) -> Optional[str]:
        """Token id for a named outcome, matched case insensitively."""
        for name, token in zip(self.outcomes, self.token_ids):
            if name.strip().lower() == outcome.strip().lower():
                return token
        return None

    @property
    def yes_token(self) -> Optional[str]:
        return self.token_for(YES) or (self.token_ids[0] if self.token_ids else None)

    @property
    def no_token(self) -> Optional[str]:
        return self.token_for(NO) or (self.token_ids[1] if len(self.token_ids) > 1 else None)

    @property
    def yes_price(self) -> Optional[float]:
        return self.outcome_prices[0] if self.outcome_prices else None

    @property
    def days_to_resolution(self) -> Optional[float]:
        if self.end_date is None:
            return None
        delta = self.end_date - datetime.now(timezone.utc)
        return delta.total_seconds() / 86400.0

    @property
    def is_longshot(self) -> bool:
        """True when the market prices this as a remote possibility."""
        price = self.yes_price
        return price is not None and 0 < price <= 0.10

    def __str__(self) -> str:
        price = f"{self.yes_price:.3f}" if self.yes_price is not None else "n/a"
        return f"{self.question[:60]:<60} YES {price}  ${self.liquidity:,.0f} liq"


@dataclass
class Fill:
    """The result of walking an order book for a target size."""

    shares: float
    cost: float
    average_price: float
    levels_consumed: int
    filled_completely: bool
    worst_price: float = 0.0

    @property
    def is_empty(self) -> bool:
        return self.shares <= 0

    def slippage_vs(self, reference: float) -> float:
        """How far the average fill landed from a reference price, in cents."""
        if self.is_empty:
            return 0.0
        return self.average_price - reference


@dataclass
class Opportunity:
    """A candidate trade found by a scanner or strategy."""

    market: Market
    kind: str
    outcome: str
    token_id: str
    price: float
    edge: float
    size_shares: float = 0.0
    cost: float = 0.0
    expected_profit: float = 0.0
    reason: str = ""
    confidence: float = 0.0

    @property
    def payout_if_right(self) -> float:
        return self.size_shares * 1.0

    @property
    def max_loss(self) -> float:
        """Bounded, unlike a short equity position. This is the whole stake."""
        return self.cost

    def __str__(self) -> str:
        return (
            f"{self.kind:<14} {self.outcome:<4} @ {self.price:.3f}  "
            f"edge {self.edge:+.3f}  {self.market.question[:44]}"
        )


def parse_iso(value) -> Optional[datetime]:
    """Parse the ISO 8601 timestamps Polymarket returns, always UTC aware."""
    if not value:
        return None
    if isinstance(value, datetime):
        return value if value.tzinfo else value.replace(tzinfo=timezone.utc)
    text = str(value).strip().replace("Z", "+00:00")
    for candidate in (text, text.split(".")[0] + "+00:00"):
        try:
            parsed = datetime.fromisoformat(candidate)
            return parsed if parsed.tzinfo else parsed.replace(tzinfo=timezone.utc)
        except ValueError:
            continue
    return None
