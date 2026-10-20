"""Depth aware execution.

The single most common way a prediction market strategy lies to itself is
assuming it fills at the quoted price. On Polymarket a market can show a one
tick spread on top of forty dollars of size. Take a three hundred dollar
position against that book and you eat several cents of slippage, which on a
contract that pays at most one dollar is enormous.

Everything here walks the real order book level by level and reports what the
fill would actually cost.
"""

from __future__ import annotations

from typing import List, Optional, Sequence

from .types import Fill, Level, OrderBook


def walk_book(book: OrderBook, side: str, shares: float) -> Fill:
    """Consume ``shares`` from the book and report the true average price.

    ``side`` is the taker's side: ``buy`` lifts asks, ``sell`` hits bids. A
    partial fill is reported honestly rather than padded out at the last price.
    """
    if side not in ("buy", "sell"):
        raise ValueError("side must be 'buy' or 'sell'")
    if shares <= 0:
        return Fill(0.0, 0.0, 0.0, 0, True)

    levels: Sequence[Level] = book.asks if side == "buy" else book.bids
    remaining = shares
    cost = 0.0
    consumed = 0
    worst = 0.0

    for level in levels:
        if remaining <= 1e-9:
            break
        take = min(remaining, level.size)
        cost += take * level.price
        remaining -= take
        consumed += 1
        worst = level.price

    filled = shares - remaining
    if filled <= 1e-9:
        return Fill(0.0, 0.0, 0.0, 0, False)
    return Fill(
        shares=filled,
        cost=cost,
        average_price=cost / filled,
        levels_consumed=consumed,
        filled_completely=remaining <= 1e-9,
        worst_price=worst,
    )


def walk_book_notional(book: OrderBook, side: str, dollars: float) -> Fill:
    """Spend at most ``dollars`` walking the book, and report what that buys."""
    if dollars <= 0:
        return Fill(0.0, 0.0, 0.0, 0, True)
    levels: Sequence[Level] = book.asks if side == "buy" else book.bids

    budget = dollars
    shares = 0.0
    cost = 0.0
    consumed = 0
    worst = 0.0
    for level in levels:
        if budget <= 1e-9:
            break
        affordable = budget / level.price if level.price > 0 else 0.0
        take = min(affordable, level.size)
        if take <= 0:
            break
        shares += take
        spent = take * level.price
        cost += spent
        budget -= spent
        consumed += 1
        worst = level.price

    if shares <= 1e-9:
        return Fill(0.0, 0.0, 0.0, 0, False)
    return Fill(
        shares=shares,
        cost=cost,
        average_price=cost / shares,
        levels_consumed=consumed,
        filled_completely=budget <= 1e-9,
        worst_price=worst,
    )


def effective_price(book: OrderBook, side: str, shares: float) -> Optional[float]:
    """Average price for a given size, or ``None`` if the book cannot fill it."""
    fill = walk_book(book, side, shares)
    return fill.average_price if fill.filled_completely else None


def max_size_within(book: OrderBook, side: str, limit_price: float) -> float:
    """Shares available without crossing past ``limit_price``.

    This is the honest answer to "how big can I go here", which is the question
    a thin book quietly punishes you for not asking.
    """
    levels = book.asks if side == "buy" else book.bids
    total = 0.0
    for level in levels:
        if side == "buy" and level.price > limit_price + 1e-12:
            break
        if side == "sell" and level.price < limit_price - 1e-12:
            break
        total += level.size
    return total


def slippage_curve(book: OrderBook, side: str, sizes: Sequence[float]) -> List[dict]:
    """Average price and slippage at a range of sizes.

    Reading this curve before sizing a position is the difference between a
    strategy that works on paper and one that works.
    """
    touch = book.best_ask if side == "buy" else book.best_bid
    rows = []
    for size in sizes:
        fill = walk_book(book, side, size)
        rows.append({
            "size": size,
            "filled": fill.shares,
            "complete": fill.filled_completely,
            "avg_price": fill.average_price,
            "slippage": (fill.average_price - touch) if (touch and fill.shares) else 0.0,
            "levels": fill.levels_consumed,
        })
    return rows


def round_to_tick(price: float, tick: float, *, side: str = "buy") -> float:
    """Snap a price to the market's tick grid, conservatively.

    A buy rounds up and a sell rounds down, so a rounded price is never more
    optimistic than the one it replaced.
    """
    if tick <= 0:
        return price
    steps = price / tick
    import math

    snapped = (math.ceil(steps) if side == "buy" else math.floor(steps)) * tick
    return round(min(max(snapped, tick), 1.0 - tick), 10)
