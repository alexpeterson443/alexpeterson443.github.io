"""Complementary pair arbitrage.

In a binary market, YES and NO are complements: exactly one of them pays $1 at
resolution. So one YES share plus one NO share is worth exactly $1, always,
with no view on the outcome required.

If both can be bought for less than $1 together, the difference is locked in.
That is the only genuinely risk free structure available on Polymarket, and it
is the honest place to start, because it does not require believing you can
forecast anything.

The catch is that it is not free money:

* Capital is trapped until the market resolves, so the return must be
  annualised before it means anything.
* The edge is usually one or two ticks and the book behind it is thin, so the
  size that actually fills is what matters, not the quoted spread.
* Both legs must fill. A partial fill on one side leaves a directional
  position you did not want.

Everything here walks the real books and reports the size that genuinely fills.
"""

from __future__ import annotations

from dataclasses import dataclass
from typing import List, Optional, Sequence

from .api import MissingOrderBook, PolymarketAPI, PolymarketError
from .sizing import annualised_return
from .types import Market, OrderBook


@dataclass
class ArbOpportunity:
    """A locked in YES plus NO pair trade."""

    market: Market
    shares: float
    yes_cost: float
    no_cost: float
    yes_avg_price: float
    no_avg_price: float
    days_to_resolution: Optional[float] = None
    yes_levels: int = 0
    no_levels: int = 0

    @property
    def total_cost(self) -> float:
        return self.yes_cost + self.no_cost

    @property
    def pair_price(self) -> float:
        """Average cost of one YES plus one NO. Profitable below 1.0."""
        return (self.total_cost / self.shares) if self.shares else 0.0

    @property
    def payout(self) -> float:
        """Guaranteed, since exactly one leg resolves to a dollar."""
        return self.shares

    @property
    def profit(self) -> float:
        return self.payout - self.total_cost

    @property
    def return_pct(self) -> float:
        return (self.profit / self.total_cost) if self.total_cost else 0.0

    @property
    def annualised(self) -> float:
        return annualised_return(self.profit, self.total_cost, self.days_to_resolution or 0.0)

    @property
    def edge_per_pair(self) -> float:
        return 1.0 - self.pair_price

    def __str__(self) -> str:
        days = f"{self.days_to_resolution:.0f}d" if self.days_to_resolution else "?"
        return (
            f"{self.pair_price:.4f} pair  {self.shares:>8.0f} sh  "
            f"${self.total_cost:>9,.2f} -> ${self.payout:>9,.2f}  "
            f"+{self.return_pct:>6.2%}  {self.annualised:>8.1%}/yr  {days:>5}  "
            f"{self.market.question[:44]}"
        )


def find_pair_arbitrage(
    market: Market,
    yes_book: OrderBook,
    no_book: OrderBook,
    *,
    min_edge: float = 0.005,
    max_shares: Optional[float] = None,
) -> Optional[ArbOpportunity]:
    """Walk both ask books together and take every profitable pair.

    Levels are consumed in lockstep. A pair stays profitable while the sum of
    the two current ask prices is below ``1 - min_edge``, so the walk stops at
    exactly the size where the edge runs out rather than averaging a good first
    level together with unprofitable ones behind it.
    """
    if not yes_book.asks or not no_book.asks:
        return None

    yes_levels = list(yes_book.asks)
    no_levels = list(no_book.asks)
    i = j = 0
    yes_remaining = yes_levels[0].size
    no_remaining = no_levels[0].size

    shares = 0.0
    yes_cost = 0.0
    no_cost = 0.0
    yes_used = no_used = 0

    while i < len(yes_levels) and j < len(no_levels):
        pair_price = yes_levels[i].price + no_levels[j].price
        if pair_price >= 1.0 - min_edge:
            break

        take = min(yes_remaining, no_remaining)
        if max_shares is not None:
            take = min(take, max_shares - shares)
        if take <= 1e-9:
            break

        shares += take
        yes_cost += take * yes_levels[i].price
        no_cost += take * no_levels[j].price
        yes_remaining -= take
        no_remaining -= take
        yes_used = i + 1
        no_used = j + 1

        if max_shares is not None and shares >= max_shares - 1e-9:
            break
        if yes_remaining <= 1e-9:
            i += 1
            if i < len(yes_levels):
                yes_remaining = yes_levels[i].size
        if no_remaining <= 1e-9:
            j += 1
            if j < len(no_levels):
                no_remaining = no_levels[j].size

    if shares <= 1e-9:
        return None

    return ArbOpportunity(
        market=market,
        shares=shares,
        yes_cost=yes_cost,
        no_cost=no_cost,
        yes_avg_price=yes_cost / shares,
        no_avg_price=no_cost / shares,
        days_to_resolution=market.days_to_resolution,
        yes_levels=yes_used,
        no_levels=no_used,
    )


def scan(
    api: PolymarketAPI,
    markets: Sequence[Market],
    *,
    min_edge: float = 0.005,
    min_profit: float = 1.0,
    max_capital: Optional[float] = None,
    max_days: Optional[float] = None,
    progress: bool = False,
) -> List[ArbOpportunity]:
    """Check a list of markets for pair arbitrage, best annualised first.

    Two book requests per market, so keep the candidate list to what you are
    willing to wait for.
    """
    found: List[ArbOpportunity] = []
    checked = 0

    for market in markets:
        if not market.is_tradeable:
            continue
        yes_token, no_token = market.yes_token, market.no_token
        if not yes_token or not no_token:
            continue
        if max_days is not None:
            days = market.days_to_resolution
            if days is None or days > max_days:
                continue

        try:
            yes_book = api.book(yes_token)
            no_book = api.book(no_token)
        except (MissingOrderBook, PolymarketError):
            continue

        checked += 1
        if progress and checked % 25 == 0:
            print(f"  ... checked {checked} markets, {len(found)} opportunities")

        opportunity = find_pair_arbitrage(
            market, yes_book, no_book,
            min_edge=min_edge,
            max_shares=(max_capital / max(market.tick_size, 0.001)) if max_capital else None,
        )
        if opportunity is None:
            continue
        if max_capital is not None and opportunity.total_cost > max_capital:
            opportunity = find_pair_arbitrage(
                market, yes_book, no_book, min_edge=min_edge,
                max_shares=max_capital / max(opportunity.pair_price, 1e-6),
            )
            if opportunity is None:
                continue
        if opportunity.profit < min_profit:
            continue
        found.append(opportunity)

    found.sort(key=lambda o: o.annualised, reverse=True)
    return found


def summarise(opportunities: Sequence[ArbOpportunity]) -> dict:
    if not opportunities:
        return {"count": 0, "total_profit": 0.0, "total_capital": 0.0, "best_annualised": 0.0}
    return {
        "count": len(opportunities),
        "total_profit": sum(o.profit for o in opportunities),
        "total_capital": sum(o.total_cost for o in opportunities),
        "best_annualised": max(o.annualised for o in opportunities),
        "median_days": sorted(
            [o.days_to_resolution or 0.0 for o in opportunities]
        )[len(opportunities) // 2],
    }
