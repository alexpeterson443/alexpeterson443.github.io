"""Probability models.

Everything else in this package is mechanical. This is where the actual claim
lives, and it is worth being blunt about what that claim is.

To trade a prediction market profitably you must believe the true probability
of an outcome differs from its price. Sizing, execution and risk control are
all downstream of that one number. A model that cannot beat the market price
has no edge, and no amount of clever Kelly sizing will manufacture one.

So the interface is deliberately narrow: given a market, its book, and its
price history, return your probability, or ``None`` for no opinion. Returning
``None`` is the correct answer far more often than people expect.

``MarketPrice`` is included as the null model. It returns the price itself, so
its edge is exactly zero by construction. Any model you write should be
compared against it, and most will lose.
"""

from __future__ import annotations

import statistics
from abc import ABC, abstractmethod
from typing import Dict, List, Optional, Sequence, Tuple

from .types import Market, OrderBook


class ProbabilityModel(ABC):
    """Estimates the true probability of a market's YES outcome."""

    name = "model"

    def __init__(self, **params):
        merged = self.defaults()
        unknown = set(params) - set(merged)
        if unknown:
            raise ValueError(
                f"{self.name}: unknown parameter(s) {', '.join(sorted(unknown))}; "
                f"valid: {', '.join(sorted(merged)) or 'none'}"
            )
        self.params = {**merged, **params}
        self.validate()

    @classmethod
    def defaults(cls) -> dict:
        return {}

    def validate(self) -> None:
        """Raise if the parameters do not make sense."""

    @abstractmethod
    def estimate(
        self,
        market: Market,
        book: Optional[OrderBook] = None,
        history: Optional[Sequence[Tuple]] = None,
    ) -> Optional[float]:
        """Probability that YES resolves true, or None for no opinion."""

    def describe(self) -> str:
        if not self.params:
            return self.name
        joined = ", ".join(f"{k}={v}" for k, v in sorted(self.params.items()))
        return f"{self.name}({joined})"


class MarketPrice(ProbabilityModel):
    """The null model. Believes the market, so its edge is exactly zero.

    This exists to be beaten. If a model cannot beat it out of sample, that
    model is noise.
    """

    name = "market_price"

    def estimate(self, market, book=None, history=None) -> Optional[float]:
        if book is not None and book.mid is not None:
            return book.mid
        return market.yes_price


class LongshotFade(ProbabilityModel):
    """Fades the favourite longshot bias.

    Across a century of betting market research, very unlikely outcomes trade
    persistently above their true frequency and heavy favourites slightly
    below. The usual explanation is that people overpay for lottery shaped
    payoffs.

    This model shades longshot prices down and favourite prices up by a fixed
    fraction of the distance to the boundary. It is the most defensible simple
    edge available here, and it is still small enough that costs and thin books
    can eat all of it.
    """

    name = "longshot_fade"

    @classmethod
    def defaults(cls) -> dict:
        return {"threshold": 0.15, "shade": 0.25, "min_days": 1.0}

    def validate(self) -> None:
        if not 0 < self.params["threshold"] < 0.5:
            raise ValueError("longshot_fade: threshold must be between 0 and 0.5")
        if not 0 < self.params["shade"] <= 1:
            raise ValueError("longshot_fade: shade must be between 0 and 1")

    def estimate(self, market, book=None, history=None) -> Optional[float]:
        price = book.mid if (book and book.mid is not None) else market.yes_price
        if price is None or not 0 < price < 1:
            return None
        days = market.days_to_resolution
        if days is not None and days < self.params["min_days"]:
            return None    # too close to resolution for a statistical bias to help

        threshold, shade = self.params["threshold"], self.params["shade"]
        if price <= threshold:
            # Longshot is overpriced, so the true probability is lower.
            return max(price * (1.0 - shade), 0.001)
        if price >= 1.0 - threshold:
            # Mirror image: the heavy favourite is slightly underpriced.
            return min(price + (1.0 - price) * shade, 0.999)
        return None


class Momentum(ProbabilityModel):
    """Extrapolates a recent drift in the odds.

    Assumes information arrives gradually and prices under react. Whether that
    is true on Polymarket is an empirical question this model does not answer.
    """

    name = "momentum"

    @classmethod
    def defaults(cls) -> dict:
        return {"lookback": 24, "strength": 0.5, "min_move": 0.03}

    def validate(self) -> None:
        if self.params["lookback"] < 2:
            raise ValueError("momentum: lookback must be at least 2 points")

    def estimate(self, market, book=None, history=None) -> Optional[float]:
        if not history or len(history) < self.params["lookback"]:
            return None
        window = [p for _, p in history[-self.params["lookback"]:]]
        move = window[-1] - window[0]
        if abs(move) < self.params["min_move"]:
            return None
        projected = window[-1] + move * self.params["strength"]
        return _clamp(projected)


class Reversion(ProbabilityModel):
    """Expects a sharp move to give part of itself back.

    The mirror of Momentum. They cannot both be right on the same market at the
    same time, which is a useful thing to see stated plainly.
    """

    name = "reversion"

    @classmethod
    def defaults(cls) -> dict:
        return {"lookback": 72, "recent": 6, "pull": 0.4, "min_move": 0.05}

    def validate(self) -> None:
        if self.params["recent"] >= self.params["lookback"]:
            raise ValueError("reversion: recent window must be shorter than lookback")

    def estimate(self, market, book=None, history=None) -> Optional[float]:
        if not history or len(history) < self.params["lookback"]:
            return None
        prices = [p for _, p in history]
        baseline = statistics.mean(prices[-self.params["lookback"]:])
        current = statistics.mean(prices[-self.params["recent"]:])
        move = current - baseline
        if abs(move) < self.params["min_move"]:
            return None
        return _clamp(current - move * self.params["pull"])


class FixedProbability(ProbabilityModel):
    """Your own number, supplied by hand.

    The most honest model in the file. If you have actually researched an
    event and think the market is wrong, this sizes the position properly
    instead of guessing.
    """

    name = "fixed"

    @classmethod
    def defaults(cls) -> dict:
        return {"probability": 0.5}

    def validate(self) -> None:
        if not 0 < self.params["probability"] < 1:
            raise ValueError("fixed: probability must be strictly between 0 and 1")

    def estimate(self, market, book=None, history=None) -> Optional[float]:
        return float(self.params["probability"])


REGISTRY: Dict[str, type] = {
    cls.name: cls
    for cls in (MarketPrice, LongshotFade, Momentum, Reversion, FixedProbability)
}


def build(name: str, params: Optional[dict] = None) -> ProbabilityModel:
    try:
        cls = REGISTRY[name]
    except KeyError:
        raise ValueError(
            f"unknown model {name!r}; available: {', '.join(sorted(REGISTRY))}"
        ) from None
    return cls(**(params or {}))


def catalog() -> List[str]:
    lines = []
    for name in sorted(REGISTRY):
        cls = REGISTRY[name]
        doc = (cls.__doc__ or "").strip().splitlines()[0]
        params = ", ".join(f"{k}={v}" for k, v in sorted(cls.defaults().items())) or "no parameters"
        lines.append(f"  {name:<18} {doc}\n{'':<20} params: {params}")
    return lines


def _clamp(value: float, low: float = 0.001, high: float = 0.999) -> float:
    return max(low, min(high, value))
