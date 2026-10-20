"""Position sizing for binary contracts.

Kelly is the natural sizing rule here in a way it is not for equities, because
the payoff is exactly known: a share costs ``c``, pays ``1`` if the outcome
happens, and ``0`` if it does not. Loss is bounded at the stake.

Buying at price ``c`` when you believe the true probability is ``p``:

    net odds  b  = (1 - c) / c
    Kelly     f* = (p * b - (1 - p)) / b  =  (p - c) / (1 - c)

So the full Kelly fraction of bankroll is simply the edge divided by the
distance to a dollar. It is positive only when ``p > c``.

Full Kelly is almost always wrong in practice. It is optimal only if ``p`` is
exactly right, and ``p`` is an estimate. Halving it costs a quarter of the
growth rate and roughly halves the volatility, so this module defaults to a
quarter Kelly and caps every position regardless.
"""

from __future__ import annotations

from dataclasses import dataclass
from typing import Optional


@dataclass
class SizingConfig:
    """Limits applied to every position, in order."""

    kelly_fraction: float = 0.25      # quarter Kelly by default
    max_position_pct: float = 0.05    # never more than 5 percent of bankroll
    max_position_dollars: Optional[float] = None
    min_position_dollars: float = 1.0
    min_edge: float = 0.02            # ignore edges thinner than 2 cents
    # Refuse prices near the boundaries: the arithmetic explodes and the
    # payoff is a rounding error either way.
    min_price: float = 0.02
    max_price: float = 0.98

    def validate(self) -> None:
        if not 0 < self.kelly_fraction <= 1:
            raise ValueError("kelly_fraction must be between 0 and 1")
        if not 0 < self.max_position_pct <= 1:
            raise ValueError("max_position_pct must be between 0 and 1")
        if not 0 <= self.min_edge < 1:
            raise ValueError("min_edge must be between 0 and 1")
        if not 0 < self.min_price < self.max_price < 1:
            raise ValueError("min_price must be below max_price, both inside (0, 1)")


def kelly_fraction(probability: float, price: float) -> float:
    """Full Kelly fraction of bankroll for a binary contract.

    Returns 0 when there is no edge. Never returns a negative number: a
    negative Kelly here means "buy the other side", which the caller should do
    explicitly rather than by sign convention.
    """
    if not 0 < price < 1:
        return 0.0
    if not 0 <= probability <= 1:
        raise ValueError("probability must be between 0 and 1")
    edge = probability - price
    if edge <= 0:
        return 0.0
    return edge / (1.0 - price)


def expected_value(probability: float, price: float) -> float:
    """Expected profit per dollar staked.

    Buying at ``price`` returns ``1/price`` per dollar if right, nothing if
    wrong, so EV per dollar is ``p / price - 1``.
    """
    if price <= 0:
        return 0.0
    return probability / price - 1.0


def edge_in_cents(probability: float, price: float) -> float:
    return probability - price


def position_size(
    *,
    bankroll: float,
    probability: float,
    price: float,
    config: Optional[SizingConfig] = None,
    available_shares: Optional[float] = None,
) -> dict:
    """Dollars and shares to stake, with the reason when the answer is zero.

    Every limit is applied in sequence and the binding one is named, so a zero
    size is never mysterious.
    """
    cfg = config or SizingConfig()
    cfg.validate()

    if bankroll <= 0:
        return _no("bankroll is zero")
    if not 0 < price < 1:
        return _no(f"price {price} is outside (0, 1)")
    if price < cfg.min_price or price > cfg.max_price:
        return _no(f"price {price:.3f} outside the tradeable band "
                   f"[{cfg.min_price}, {cfg.max_price}]")

    edge = probability - price
    if edge < cfg.min_edge:
        return _no(f"edge {edge:+.3f} below the {cfg.min_edge:.3f} minimum")

    full = kelly_fraction(probability, price)
    if full <= 0:
        return _no("no positive Kelly edge")

    fraction = full * cfg.kelly_fraction
    dollars = bankroll * fraction

    binding = "kelly"
    ceiling = bankroll * cfg.max_position_pct
    if dollars > ceiling:
        dollars, binding = ceiling, "max_position_pct"
    if cfg.max_position_dollars is not None and dollars > cfg.max_position_dollars:
        dollars, binding = cfg.max_position_dollars, "max_position_dollars"

    if dollars < cfg.min_position_dollars:
        return _no(f"size ${dollars:.2f} below the ${cfg.min_position_dollars:.2f} minimum")

    shares = dollars / price
    if available_shares is not None and shares > available_shares:
        shares = available_shares
        dollars = shares * price
        binding = "order book depth"
        if dollars < cfg.min_position_dollars:
            return _no("book too thin to fill the minimum size")

    return {
        "dollars": round(dollars, 2),
        "shares": round(shares, 2),
        "price": price,
        "full_kelly": round(full, 4),
        "applied_fraction": round(fraction, 4),
        "edge": round(edge, 4),
        "expected_value_per_dollar": round(expected_value(probability, price), 4),
        "expected_profit": round(dollars * expected_value(probability, price), 2),
        "max_loss": round(dollars, 2),
        "binding_limit": binding,
        "reason": "",
    }


def _no(reason: str) -> dict:
    return {
        "dollars": 0.0, "shares": 0.0, "price": 0.0,
        "full_kelly": 0.0, "applied_fraction": 0.0, "edge": 0.0,
        "expected_value_per_dollar": 0.0, "expected_profit": 0.0, "max_loss": 0.0,
        "binding_limit": "rejected", "reason": reason,
    }


def annualised_return(profit: float, cost: float, days: float) -> float:
    """Annualise a locked in return over its holding period.

    Capital in a prediction market is trapped until resolution. A four percent
    edge that resolves next week is excellent; the same four percent locked up
    for two years is worse than leaving the money alone.
    """
    if cost <= 0 or days <= 0:
        return 0.0
    simple = profit / cost
    years = days / 365.25
    try:
        return (1.0 + simple) ** (1.0 / years) - 1.0
    except (OverflowError, ValueError):
        return float("inf")
