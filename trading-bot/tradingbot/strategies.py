"""Trading strategies.

A strategy precomputes its indicators once per symbol in :meth:`prepare`, then
answers one question per bar in :meth:`evaluate`: given history up to and
including bar ``i``, should we be long?

Indicators are causal, so reading index ``i`` never peeks at the future. The
engine adds one more layer of protection by filling orders on the *next* bar's
open.
"""

from __future__ import annotations

from abc import ABC, abstractmethod
from typing import Dict, List, Optional, Sequence

from . import indicators as ind
from .core import Action, Bar, Signal


class Strategy(ABC):
    """Base class for every strategy."""

    name = "strategy"

    def __init__(self, **params) -> None:
        unknown = set(params) - set(self.defaults())
        if unknown:
            raise ValueError(
                f"{self.name}: unknown parameter(s) {', '.join(sorted(unknown))}; "
                f"valid: {', '.join(sorted(self.defaults()))}"
            )
        self.params = {**self.defaults(), **params}
        self._state: Dict[str, dict] = {}
        self.validate()

    @classmethod
    def defaults(cls) -> dict:
        """Parameter names mapped to their default values."""
        return {}

    def validate(self) -> None:
        """Raise if the configured parameters do not make sense together."""

    @property
    def warmup(self) -> int:
        """Bars of history needed before signals are trustworthy."""
        return 0

    @abstractmethod
    def prepare(self, symbol: str, bars: Sequence[Bar]) -> None:
        """Precompute indicator series for one symbol."""

    @abstractmethod
    def evaluate(self, symbol: str, i: int, in_position: bool) -> Signal:
        """Decide what to do on bar ``i``."""

    # Convenience helpers used by subclasses.
    def _hold(self, symbol: str, reason: str = "") -> Signal:
        return Signal(symbol, Action.HOLD, reason)

    def _enter(self, symbol: str, reason: str) -> Signal:
        return Signal(symbol, Action.ENTER_LONG, reason)

    def _exit(self, symbol: str, reason: str) -> Signal:
        return Signal(symbol, Action.EXIT_LONG, reason)

    def describe(self) -> str:
        if not self.params:
            return self.name
        joined = ", ".join(f"{k}={v}" for k, v in sorted(self.params.items()))
        return f"{self.name}({joined})"


class BuyAndHold(Strategy):
    """Benchmark: buy on the first usable bar and never sell."""

    name = "buy_and_hold"

    def prepare(self, symbol: str, bars: Sequence[Bar]) -> None:
        self._state[symbol] = {"n": len(bars)}

    def evaluate(self, symbol: str, i: int, in_position: bool) -> Signal:
        if not in_position:
            return self._enter(symbol, "benchmark entry")
        return self._hold(symbol)


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

    def evaluate(self, symbol: str, i: int, in_position: bool) -> Signal:
        state = self._state[symbol]
        fast, slow = state["fast"], state["slow"]
        if not in_position and ind.crossed_above(fast, slow, i):
            return self._enter(symbol, f"SMA{self.params['fast']} crossed above SMA{self.params['slow']}")
        if in_position and ind.crossed_below(fast, slow, i):
            return self._exit(symbol, f"SMA{self.params['fast']} crossed below SMA{self.params['slow']}")
        return self._hold(symbol)


class MacdTrend(Strategy):
    """Long when the MACD histogram turns positive, flat when it turns negative."""

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
        line, signal, hist = ind.macd(
            closes, self.params["fast"], self.params["slow"], self.params["signal"]
        )
        trend = (
            ind.sma(closes, self.params["trend_filter"])
            if self.params["trend_filter"]
            else [0.0] * len(closes)
        )
        self._state[symbol] = {"hist": hist, "trend": trend, "closes": closes}

    def evaluate(self, symbol: str, i: int, in_position: bool) -> Signal:
        state = self._state[symbol]
        hist, trend, closes = state["hist"], state["trend"], state["closes"]
        if i < 1 or hist[i] is None or hist[i - 1] is None:
            return self._hold(symbol, "warming up")
        above_trend = True
        if self.params["trend_filter"]:
            if trend[i] is None:
                return self._hold(symbol, "warming up")
            above_trend = closes[i] > trend[i]
        if not in_position and hist[i] > 0 >= hist[i - 1] and above_trend:
            return self._enter(symbol, "MACD histogram turned positive above trend")
        if in_position and hist[i] < 0 <= hist[i - 1]:
            return self._exit(symbol, "MACD histogram turned negative")
        return self._hold(symbol)


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

    def evaluate(self, symbol: str, i: int, in_position: bool) -> Signal:
        state = self._state[symbol]
        value = state["rsi"][i]
        if value is None:
            return self._hold(symbol, "warming up")
        if not in_position:
            if self.params["trend_filter"]:
                trend = state["trend"][i]
                if trend is None or state["closes"][i] < trend:
                    return self._hold(symbol, "below long term trend")
            if value <= self.params["oversold"]:
                return self._enter(symbol, f"RSI {value:.1f} at or below {self.params['oversold']}")
        elif value >= self.params["overbought"]:
            return self._exit(symbol, f"RSI {value:.1f} at or above {self.params['overbought']}")
        return self._hold(symbol)


class DonchianBreakout(Strategy):
    """Turtle style: buy new highs, exit on new lows."""

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
            "lower": ind.lowest(lows, self.params["exit"]),
            "closes": [b.close for b in bars],
        }

    def evaluate(self, symbol: str, i: int, in_position: bool) -> Signal:
        state = self._state[symbol]
        if i < 1:
            return self._hold(symbol, "warming up")
        close = state["closes"][i]
        # Compare against the channel as of the previous bar so the breakout bar
        # itself does not set the level it is breaking.
        upper, lower = state["upper"][i - 1], state["lower"][i - 1]
        if not in_position and upper is not None and close > upper:
            return self._enter(symbol, f"close broke {self.params['entry']} day high")
        if in_position and lower is not None and close < lower:
            return self._exit(symbol, f"close broke {self.params['exit']} day low")
        return self._hold(symbol)


class BollingerReversion(Strategy):
    """Buy a close below the lower band, exit back at the middle band."""

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
        self._state[symbol] = {"lower": lower, "mid": mid, "closes": closes}

    def evaluate(self, symbol: str, i: int, in_position: bool) -> Signal:
        state = self._state[symbol]
        lower, mid, close = state["lower"][i], state["mid"][i], state["closes"][i]
        if lower is None or mid is None:
            return self._hold(symbol, "warming up")
        if not in_position and close < lower:
            return self._enter(symbol, "close below lower Bollinger band")
        if in_position and close >= mid:
            return self._exit(symbol, "close back at the middle band")
        return self._hold(symbol)


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
        lines.append(f"  {name:<22} {doc}\n{'':<24} params: {params}")
    return lines
