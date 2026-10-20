"""Technical indicators in pure Python.

Every function takes a list of floats (oldest first) and returns a list of the
same length. Positions that do not yet have enough history hold ``None`` so the
output stays aligned with the input bars and nothing can silently look ahead.
"""

from __future__ import annotations

import math
from typing import List, Optional, Sequence

Series = List[Optional[float]]


def _check(period: int) -> None:
    if period < 1:
        raise ValueError("period must be at least 1")


def sma(values: Sequence[float], period: int) -> Series:
    """Simple moving average."""
    _check(period)
    out: Series = [None] * len(values)
    running = 0.0
    for i, value in enumerate(values):
        running += value
        if i >= period:
            running -= values[i - period]
        if i >= period - 1:
            out[i] = running / period
    return out


def ema(values: Sequence[float], period: int) -> Series:
    """Exponential moving average, seeded with an SMA of the first window."""
    _check(period)
    out: Series = [None] * len(values)
    if len(values) < period:
        return out
    k = 2.0 / (period + 1)
    prev = sum(values[:period]) / period
    out[period - 1] = prev
    for i in range(period, len(values)):
        prev = values[i] * k + prev * (1 - k)
        out[i] = prev
    return out


def rma(values: Sequence[float], period: int) -> Series:
    """Wilder's smoothing, the average used by RSI and ATR."""
    _check(period)
    out: Series = [None] * len(values)
    if len(values) < period:
        return out
    prev = sum(values[:period]) / period
    out[period - 1] = prev
    for i in range(period, len(values)):
        prev = (prev * (period - 1) + values[i]) / period
        out[i] = prev
    return out


def stdev(values: Sequence[float], period: int) -> Series:
    """Rolling population standard deviation."""
    _check(period)
    out: Series = [None] * len(values)
    for i in range(period - 1, len(values)):
        window = values[i - period + 1 : i + 1]
        mean = sum(window) / period
        variance = sum((v - mean) ** 2 for v in window) / period
        out[i] = math.sqrt(variance)
    return out


def rsi(closes: Sequence[float], period: int = 14) -> Series:
    """Relative strength index on Wilder's smoothing."""
    _check(period)
    out: Series = [None] * len(closes)
    if len(closes) < period + 1:
        return out
    gains = [0.0] * len(closes)
    losses = [0.0] * len(closes)
    for i in range(1, len(closes)):
        change = closes[i] - closes[i - 1]
        gains[i] = max(change, 0.0)
        losses[i] = max(-change, 0.0)
    # Skip index 0, which has no change to measure.
    avg_gain = rma(gains[1:], period)
    avg_loss = rma(losses[1:], period)
    for i, (g, l) in enumerate(zip(avg_gain, avg_loss), start=1):
        if g is None or l is None:
            continue
        if l == 0:
            out[i] = 100.0
        else:
            rs = g / l
            out[i] = 100.0 - (100.0 / (1.0 + rs))
    return out


def true_range(highs: Sequence[float], lows: Sequence[float], closes: Sequence[float]) -> List[float]:
    out = [highs[0] - lows[0]] if highs else []
    for i in range(1, len(highs)):
        prev_close = closes[i - 1]
        out.append(
            max(
                highs[i] - lows[i],
                abs(highs[i] - prev_close),
                abs(lows[i] - prev_close),
            )
        )
    return out


def atr(
    highs: Sequence[float],
    lows: Sequence[float],
    closes: Sequence[float],
    period: int = 14,
) -> Series:
    """Average true range."""
    return rma(true_range(highs, lows, closes), period)


def macd(
    closes: Sequence[float],
    fast: int = 12,
    slow: int = 26,
    signal_period: int = 9,
):
    """Return (macd_line, signal_line, histogram)."""
    if fast >= slow:
        raise ValueError("fast period must be shorter than slow period")
    fast_ema = ema(closes, fast)
    slow_ema = ema(closes, slow)
    line: Series = [
        (f - s) if (f is not None and s is not None) else None
        for f, s in zip(fast_ema, slow_ema)
    ]
    # The signal EMA only sees the defined part of the MACD line.
    defined = [v for v in line if v is not None]
    offset = len(line) - len(defined)
    signal_tail = ema(defined, signal_period)
    signal: Series = [None] * offset + list(signal_tail)
    hist: Series = [
        (m - s) if (m is not None and s is not None) else None
        for m, s in zip(line, signal)
    ]
    return line, signal, hist


def bollinger(closes: Sequence[float], period: int = 20, num_stdev: float = 2.0):
    """Return (lower_band, middle_band, upper_band)."""
    mid = sma(closes, period)
    sd = stdev(closes, period)
    lower: Series = []
    upper: Series = []
    for m, s in zip(mid, sd):
        if m is None or s is None:
            lower.append(None)
            upper.append(None)
        else:
            lower.append(m - num_stdev * s)
            upper.append(m + num_stdev * s)
    return lower, mid, upper


def highest(values: Sequence[float], period: int) -> Series:
    _check(period)
    out: Series = [None] * len(values)
    for i in range(period - 1, len(values)):
        out[i] = max(values[i - period + 1 : i + 1])
    return out


def lowest(values: Sequence[float], period: int) -> Series:
    _check(period)
    out: Series = [None] * len(values)
    for i in range(period - 1, len(values)):
        out[i] = min(values[i - period + 1 : i + 1])
    return out


def roc(values: Sequence[float], period: int) -> Series:
    """Rate of change as a fraction, e.g. 0.05 for a five percent gain."""
    _check(period)
    out: Series = [None] * len(values)
    for i in range(period, len(values)):
        past = values[i - period]
        if past:
            out[i] = (values[i] - past) / past
    return out


def crossed_above(fast: Series, slow: Series, i: int) -> bool:
    """True when ``fast`` crossed up through ``slow`` on bar ``i``."""
    if i < 1:
        return False
    a, b = fast[i - 1], slow[i - 1]
    c, d = fast[i], slow[i]
    if None in (a, b, c, d):
        return False
    return a <= b and c > d


def crossed_below(fast: Series, slow: Series, i: int) -> bool:
    """True when ``fast`` crossed down through ``slow`` on bar ``i``."""
    if i < 1:
        return False
    a, b = fast[i - 1], slow[i - 1]
    c, d = fast[i], slow[i]
    if None in (a, b, c, d):
        return False
    return a >= b and c < d
