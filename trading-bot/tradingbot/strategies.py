"""Trading strategies.

A strategy answers one question per bar: given history up to and including bar
``i``, what stance should we hold in this symbol?

* ``+1`` bullish, we want to be long
* ``-1`` bearish, we want to be short
* ``0``  neutral, we want to be flat
* ``None`` no opinion, leave the position as it is

The base class translates that stance, the current position, and the configured
``direction`` into a concrete action. That keeps every rule symmetrical for free
and means a strategy can never accidentally emit a short while running long only.

Indicators are causal, so reading index ``i`` never peeks at the future. The
engine adds a second layer of protection by filling orders on the *next* bar's
open.
"""

from __future__ import annotations

from abc import ABC, abstractmethod
from typing import Dict, List, Optional, Sequence

from . import indicators as ind
from .core import Action, Bar, Signal

# Accepted by every strategy, on top of its own parameters.
DIRECTIONS = ("long", "short", "both")


class Strategy(ABC):
    """Base class for every strategy."""

    name = "strategy"

    def __init__(self, **params) -> None:
        merged_defaults = {**self.defaults(), "direction": "long"}
        unknown = set(params) - set(merged_defaults)
        if unknown:
            raise ValueError(
                f"{self.name}: unknown parameter(s) {', '.join(sorted(unknown))}; "
                f"valid: {', '.join(sorted(merged_defaults))}"
            )
        self.params = {**merged_defaults, **params}
        if self.params["direction"] not in DIRECTIONS:
            raise ValueError(
                f"{self.name}: direction must be one of {', '.join(DIRECTIONS)}"
            )
        self._state: Dict[str, dict] = {}
        self.validate()

    @classmethod
    def defaults(cls) -> dict:
        """Parameter names mapped to their default values."""
        return {}

    def validate(self) -> None:
        """Raise if the configured parameters do not make sense together."""

    @property
    def direction(self) -> str:
        return self.params["direction"]

    @property
    def warmup(self) -> int:
        """Bars of history needed before signals are trustworthy."""
        return 0

    @abstractmethod
    def prepare(self, symbol: str, bars: Sequence[Bar]) -> None:
        """Precompute indicator series for one symbol."""

    @abstractmethod
    def stance(self, symbol: str, i: int) -> Optional[int]:
        """Desired stance on bar ``i``: +1, -1, 0, or None to hold."""

    # ------------------------------------------------------------------

    def evaluate(self, symbol: str, i: int, position: int = 0) -> Signal:
        """Translate the stance into an action given the current position.

        ``position`` is +1 long, -1 short, 0 flat. Booleans work too, since
        ``True == 1``.
        """
        position = int(position)
        target = self.stance(symbol, i)
        if target is None:
            return Signal(symbol, Action.HOLD, "no change")

        # Clip the target to the side this strategy is allowed to take.
        if self.direction == "long":
            target = max(target, 0)
        elif self.direction == "short":
            target = min(target, 0)

        if target == position:
            return Signal(symbol, Action.HOLD)

        reason = self.reason(symbol, i, target) or self._default_reason(target)

        # Close what is open before opening the other side. The reversal
        # completes on the following bar, which is deliberate: a strategy that
        # flips on a single bar is usually reacting to noise.
        if position > 0:
            return Signal(symbol, Action.EXIT_LONG, reason)
        if position < 0:
            return Signal(symbol, Action.EXIT_SHORT, reason)
        if target > 0:
            return Signal(symbol, Action.ENTER_LONG, reason)
        return Signal(symbol, Action.ENTER_SHORT, reason)

    def reason(self, symbol: str, i: int, target: int) -> str:
        """Human readable explanation for a stance change. Optional."""
        return ""

    @staticmethod
    def _default_reason(target: int) -> str:
        return {1: "turned bullish", -1: "turned bearish", 0: "signal neutral"}[target]

    def describe(self) -> str:
        shown = {k: v for k, v in self.params.items() if k != "direction" or v != "long"}
        if not shown:
            return self.name
        joined = ", ".join(f"{k}={v}" for k, v in sorted(shown.items()))
        return f"{self.name}({joined})"


# ----------------------------------------------------------------------


class BuyAndHold(Strategy):
    """Benchmark: buy on the first usable bar and never sell."""

    name = "buy_and_hold"

    def prepare(self, symbol: str, bars: Sequence[Bar]) -> None:
        self._state[symbol] = {"n": len(bars)}

    def stance(self, symbol: str, i: int) -> Optional[int]:
        return 1

    def reason(self, symbol: str, i: int, target: int) -> str:
        return "benchmark entry"


class SmaCrossover(Strategy):
    """Classic trend following: long while the fast average leads the slow one."""

    name = "sma_crossover"

    @classmethod
    def defaults(cls) -> dict:
        return {"fast": 20, "slow": 50}

    def validate(self) -> None:
        if self.params["fast"] >= self.params["slow"]:
            raise ValueError("sma_crossover: fast must be shorter than slow")

    @property
    def warmup(self) -> int:
        return self.params["slow"] + 1

    def prepare(self, symbol: str, bars: Sequence[Bar]) -> None:
        closes = [b.close for b in bars]
        self._state[symbol] = {
            "fast": ind.sma(closes, self.params["fast"]),
            "slow": ind.sma(closes, self.params["slow"]),
        }

    def stance(self, symbol: str, i: int) -> Optional[int]:
        state = self._state[symbol]
        fast, slow = state["fast"][i], state["slow"][i]
        if fast is None or slow is None:
            return None
        return 1 if fast > slow else -1

    def reason(self, symbol: str, i: int, target: int) -> str:
        f, s = self.params["fast"], self.params["slow"]
        return f"SMA{f} {'above' if target > 0 else 'below'} SMA{s}"


class MacdTrend(Strategy):
    """Long when the MACD histogram is positive, short when it is negative."""

    name = "macd_trend"

    @classmethod
    def defaults(cls) -> dict:
        return {"fast": 12, "slow": 26, "signal": 9, "trend_filter": 200}

    def validate(self) -> None:
        if self.params["fast"] >= self.params["slow"]:
            raise ValueError("macd_trend: fast must be shorter than slow")

    @property
    def warmup(self) -> int:
        return max(self.params["slow"] + self.params["signal"], self.params["trend_filter"]) + 1

    def prepare(self, symbol: str, bars: Sequence[Bar]) -> None:
        closes = [b.close for b in bars]
        _, _, hist = ind.macd(closes, self.params["fast"], self.params["slow"], self.params["signal"])
        trend = (
            ind.sma(closes, self.params["trend_filter"])
            if self.params["trend_filter"]
            else [0.0] * len(closes)
        )
        self._state[symbol] = {"hist": hist, "trend": trend, "closes": closes}

    def stance(self, symbol: str, i: int) -> Optional[int]:
        state = self._state[symbol]
        hist = state["hist"][i]
        if hist is None:
            return None
        if self.params["trend_filter"]:
            trend = state["trend"][i]
            if trend is None:
                return None
            above = state["closes"][i] > trend
            # The long term trend vetoes taking the other side.
            if hist > 0:
                return 1 if above else 0
            return -1 if not above else 0
        return 1 if hist > 0 else -1

    def reason(self, symbol: str, i: int, target: int) -> str:
        if target > 0:
            return "MACD histogram positive above trend"
        if target < 0:
            return "MACD histogram negative below trend"
        return "MACD and trend disagree"


class RsiMeanReversion(Strategy):
    """Buy oversold dips inside an uptrend, sell back into strength."""

    name = "rsi_reversion"

    @classmethod
    def defaults(cls) -> dict:
        return {"period": 14, "oversold": 30.0, "overbought": 55.0, "trend_filter": 200}

    def validate(self) -> None:
        if self.params["oversold"] >= self.params["overbought"]:
            raise ValueError("rsi_reversion: oversold must be below overbought")

    @property
    def warmup(self) -> int:
        return max(self.params["period"] + 1, self.params["trend_filter"]) + 1

    def prepare(self, symbol: str, bars: Sequence[Bar]) -> None:
        closes = [b.close for b in bars]
        trend = (
            ind.sma(closes, self.params["trend_filter"])
            if self.params["trend_filter"]
            else [0.0] * len(closes)
        )
        self._state[symbol] = {
            "rsi": ind.rsi(closes, self.params["period"]),
            "trend": trend,
            "closes": closes,
        }

    def stance(self, symbol: str, i: int) -> Optional[int]:
        state = self._state[symbol]
        value = state["rsi"][i]
        if value is None:
            return None
        above_trend = True
        if self.params["trend_filter"]:
            trend = state["trend"][i]
            if trend is None:
                return None
            above_trend = state["closes"][i] >= trend

        if value <= self.params["oversold"]:
            return 1 if above_trend else 0
        if value >= self.params["overbought"]:
            # Overbought inside a downtrend is the mirror image short setup.
            return -1 if not above_trend else 0
        return None

    def reason(self, symbol: str, i: int, target: int) -> str:
        value = self._state[symbol]["rsi"][i]
        if value is None:
            return ""
        if target > 0:
            return f"RSI {value:.1f} oversold in an uptrend"
        if target < 0:
            return f"RSI {value:.1f} overbought in a downtrend"
        return f"RSI {value:.1f} back to neutral"


class DonchianBreakout(Strategy):
    """Turtle style: buy new highs, exit or reverse on new lows."""

    name = "donchian_breakout"

    @classmethod
    def defaults(cls) -> dict:
        return {"entry": 20, "exit": 10}

    def validate(self) -> None:
        if self.params["exit"] > self.params["entry"]:
            raise ValueError("donchian_breakout: exit window should not exceed entry window")

    @property
    def warmup(self) -> int:
        return self.params["entry"] + 1

    def prepare(self, symbol: str, bars: Sequence[Bar]) -> None:
        highs = [b.high for b in bars]
        lows = [b.low for b in bars]
        self._state[symbol] = {
            "upper": ind.highest(highs, self.params["entry"]),
            "lower_entry": ind.lowest(lows, self.params["entry"]),
            "lower_exit": ind.lowest(lows, self.params["exit"]),
            "upper_exit": ind.highest(highs, self.params["exit"]),
            "closes": [b.close for b in bars],
        }

    def stance(self, symbol: str, i: int) -> Optional[int]:
        state = self._state[symbol]
        if i < 1:
            return None
        close = state["closes"][i]
        # Compare against the channel as of the previous bar, so the breakout
        # bar does not set the level it is breaking.
        upper, lower = state["upper"][i - 1], state["lower_entry"][i - 1]
        if upper is not None and close > upper:
            return 1
        if lower is not None and close < lower:
            return -1
        lower_exit, upper_exit = state["lower_exit"][i - 1], state["upper_exit"][i - 1]
        if lower_exit is not None and close < lower_exit:
            return 0
        if upper_exit is not None and close > upper_exit:
            return 0
        return None

    def reason(self, symbol: str, i: int, target: int) -> str:
        n, m = self.params["entry"], self.params["exit"]
        if target > 0:
            return f"close broke the {n} day high"
        if target < 0:
            return f"close broke the {n} day low"
        return f"close crossed the {m} day channel"


class BollingerReversion(Strategy):
    """Fade the bands: buy below the lower one, sell above the upper one."""

    name = "bollinger_reversion"

    @classmethod
    def defaults(cls) -> dict:
        return {"period": 20, "num_stdev": 2.0}

    @property
    def warmup(self) -> int:
        return self.params["period"] + 1

    def prepare(self, symbol: str, bars: Sequence[Bar]) -> None:
        closes = [b.close for b in bars]
        lower, mid, upper = ind.bollinger(closes, self.params["period"], self.params["num_stdev"])
        self._state[symbol] = {"lower": lower, "mid": mid, "upper": upper, "closes": closes}

    def stance(self, symbol: str, i: int) -> Optional[int]:
        state = self._state[symbol]
        lower, mid, upper = state["lower"][i], state["mid"][i], state["upper"][i]
        close = state["closes"][i]
        if lower is None or mid is None or upper is None:
            return None
        if close < lower:
            return 1
        if close > upper:
            return -1
        # Back at the mean is the exit for either side.
        if abs(close - mid) / mid < 0.002:
            return 0
        return None

    def reason(self, symbol: str, i: int, target: int) -> str:
        if target > 0:
            return "close below the lower Bollinger band"
        if target < 0:
            return "close above the upper Bollinger band"
        return "close back at the middle band"


REGISTRY: Dict[str, type] = {
    cls.name: cls
    for cls in (
        BuyAndHold,
        SmaCrossover,
        MacdTrend,
        RsiMeanReversion,
        DonchianBreakout,
        BollingerReversion,
    )
}


def build(name: str, params: Optional[dict] = None) -> Strategy:
    """Instantiate a registered strategy by name."""
    try:
        cls = REGISTRY[name]
    except KeyError:
        raise ValueError(
            f"unknown strategy {name!r}; available: {', '.join(sorted(REGISTRY))}"
        ) from None
    return cls(**(params or {}))


def catalog() -> List[str]:
    lines = []
    for name in sorted(REGISTRY):
        cls = REGISTRY[name]
        defaults = cls.defaults()
        doc = (cls.__doc__ or "").strip().splitlines()[0]
        params = ", ".join(f"{k}={v}" for k, v in sorted(defaults.items())) or "no parameters"
        lines.append(f"  {name:<22} {doc}\n{'':<24} params: {params}, direction=long")
    return lines
