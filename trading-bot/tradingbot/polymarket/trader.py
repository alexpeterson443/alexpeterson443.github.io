"""Turns a probability model into sized, executable candidate trades.

The chain is deliberately explicit, because each link is a place where a
plausible looking idea quietly dies:

    model estimates p  ->  compare to the real ask, not the mid
                       ->  Kelly size against bankroll
                       ->  walk the book to see what actually fills
                       ->  reject if slippage eats the edge

That last step removes most candidates. It is supposed to.
"""

from __future__ import annotations

from dataclasses import dataclass
from typing import List, Optional, Sequence

from .api import MissingOrderBook, PolymarketAPI, PolymarketError
from .book import walk_book
from .models import ProbabilityModel
from .sizing import SizingConfig, expected_value, position_size
from .types import Market, OrderBook


@dataclass
class Candidate:
    market: Market
    outcome: str
    token_id: str
    quoted_price: float
    fill_price: float
    probability: float
    shares: float
    cost: float
    edge_quoted: float
    edge_after_slippage: float
    expected_profit: float
    model: str
    binding_limit: str
    levels_consumed: int

    @property
    def slippage(self) -> float:
        return self.fill_price - self.quoted_price

    @property
    def days(self) -> Optional[float]:
        return self.market.days_to_resolution

    def __str__(self) -> str:
        days = f"{self.days:.0f}d" if self.days is not None else "?"
        return (
            f"{self.outcome:<4} @ {self.fill_price:.3f} (quote {self.quoted_price:.3f}) "
            f"p={self.probability:.3f} edge {self.edge_after_slippage:+.3f} "
            f"${self.cost:>7.2f} {days:>5}  {self.market.question[:44]}"
        )


class Trader:
    """Finds and sizes candidates for one probability model."""

    def __init__(
        self,
        api: PolymarketAPI,
        model: ProbabilityModel,
        *,
        bankroll: float = 500.0,
        sizing: Optional[SizingConfig] = None,
        use_history: bool = False,
        history_interval: str = "1w",
    ):
        self.api = api
        self.model = model
        self.bankroll = bankroll
        self.sizing = sizing or SizingConfig()
        self.sizing.validate()
        self.use_history = use_history
        self.history_interval = history_interval
        # Why markets were dropped. Silent skips hide bugs, so they are counted.
        self.skipped = {"not_tradeable": 0, "no_book": 0, "no_opinion": 0,
                        "api_error": 0, "no_quote": 0, "sized_to_zero": 0,
                        "book_too_thin": 0, "no_edge": 0}
        # The last reason a position was sized to zero, for diagnostics.
        self.last_sizing_reason = ""

    # ------------------------------------------------------------------

    def evaluate(self, market: Market) -> List[Candidate]:
        """Check both sides of one market. Returns zero, one, or two candidates."""
        if not market.is_tradeable:
            self.skipped["not_tradeable"] += 1
            return []
        yes_token, no_token = market.yes_token, market.no_token
        if not yes_token or not no_token:
            self.skipped["not_tradeable"] += 1
            return []

        try:
            yes_book = self.api.book(yes_token)
        except MissingOrderBook:
            self.skipped["no_book"] += 1
            return []
        except PolymarketError:
            self.skipped["api_error"] += 1
            return []

        history = None
        if self.use_history:
            try:
                history = self.api.price_history(yes_token, interval=self.history_interval)
            except PolymarketError:
                history = None

        probability = self.model.estimate(market, yes_book, history)
        if probability is None:
            self.skipped["no_opinion"] += 1
            return []

        out: List[Candidate] = []

        # Betting YES: pay the YES ask, win if the event happens.
        candidate = self._size(market, "Yes", yes_token, yes_book, probability)
        if candidate:
            out.append(candidate)

        # Betting NO: pay the NO ask, win if it does not. The probability of
        # NO is one minus the probability of YES.
        try:
            no_book = self.api.book(no_token)
        except PolymarketError:
            self.skipped["no_book"] += 1
            return out
        candidate = self._size(market, "No", no_token, no_book, 1.0 - probability)
        if candidate:
            out.append(candidate)

        return out

    def _size(
        self, market: Market, outcome: str, token_id: str,
        book: OrderBook, probability: float,
    ) -> Optional[Candidate]:
        quoted = book.best_ask
        if quoted is None or not 0 < quoted < 1:
            self.skipped["no_quote"] += 1
            return None

        # Size against the quoted price first, then re-price against the book.
        provisional = position_size(
            bankroll=self.bankroll, probability=probability,
            price=quoted, config=self.sizing,
            available_shares=book.depth("buy", within=0.10),
        )
        if provisional["shares"] <= 0:
            self.skipped["sized_to_zero"] += 1
            self.last_sizing_reason = provisional["reason"]
            return None

        fill = walk_book(book, "buy", provisional["shares"])
        if fill.is_empty or not fill.filled_completely:
            self.skipped["book_too_thin"] += 1
            return None

        edge_after = probability - fill.average_price
        if edge_after < self.sizing.min_edge:
            self.skipped["no_edge"] += 1
            return None    # slippage ate the edge, which is the common case

        cost = fill.cost
        if cost < self.sizing.min_position_dollars:
            self.skipped["sized_to_zero"] += 1
            return None

        return Candidate(
            market=market, outcome=outcome, token_id=token_id,
            quoted_price=quoted, fill_price=fill.average_price,
            probability=probability, shares=fill.shares, cost=cost,
            edge_quoted=probability - quoted, edge_after_slippage=edge_after,
            expected_profit=cost * expected_value(probability, fill.average_price),
            model=self.model.name, binding_limit=provisional["binding_limit"],
            levels_consumed=fill.levels_consumed,
        )

    # ------------------------------------------------------------------

    def scan(
        self, markets: Sequence[Market], *, limit: Optional[int] = None,
        progress: bool = False,
    ) -> List[Candidate]:
        """Evaluate many markets, best edge after slippage first."""
        found: List[Candidate] = []
        for index, market in enumerate(markets, start=1):
            found.extend(self.evaluate(market))
            if progress and index % 25 == 0:
                print(f"  ... evaluated {index} markets, {len(found)} candidates")
            if limit and len(found) >= limit:
                break
        found.sort(key=lambda c: c.edge_after_slippage, reverse=True)
        return found
