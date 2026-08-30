"""Market data providers.

Four sources, all reachable through one ``load_bars`` call:

* ``csv``       local OHLCV files, the offline default
* ``yahoo``     Yahoo Finance chart API over urllib, no API key, no dependency
* ``stooq``     Stooq daily CSV, a fallback when Yahoo is unreachable
* ``synthetic`` seeded geometric Brownian motion, for tests and demos

Downloaded history is cached to disk so repeated backtests do not hammer a
public endpoint.
"""

from __future__ import annotations

import csv
import json
import math
import os
import random
import time
import zlib
import urllib.error
import urllib.parse
import urllib.request
from datetime import date, datetime, timedelta, timezone
from typing import Dict, List, Optional, Sequence, Tuple

from .core import Bar, parse_date

USER_AGENT = "Mozilla/5.0 (compatible; tradingbot/1.0; +https://github.com/alexpeterson443)"
DEFAULT_CACHE_DIR = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "data", "cache")
PROVIDERS = ("csv", "yahoo", "stooq", "synthetic")


class DataError(RuntimeError):
    """Raised when bars cannot be produced for a symbol."""


# --------------------------------------------------------------------------
# helpers
# --------------------------------------------------------------------------

def _http_get(url: str, timeout: float = 20.0, retries: int = 3) -> bytes:
    last: Optional[Exception] = None
    for attempt in range(retries):
        request = urllib.request.Request(url, headers={"User-Agent": USER_AGENT, "Accept": "*/*"})
        try:
            with urllib.request.urlopen(request, timeout=timeout) as response:
                return response.read()
        except (urllib.error.URLError, urllib.error.HTTPError, TimeoutError, OSError) as exc:
            last = exc
            if attempt < retries - 1:
                time.sleep(2 ** attempt)
    raise DataError(f"request failed for {url}: {last}")


def _to_epoch(value: date) -> int:
    return int(datetime(value.year, value.month, value.day, tzinfo=timezone.utc).timestamp())


def _symbol_seed(symbol: str, seed: Optional[int]) -> int:
    """Deterministic per symbol seed, stable across processes and platforms."""
    checksum = zlib.crc32(symbol.upper().encode())
    return (checksum + (seed or 0) * 2_654_435_761) % (2**32)


def _clean(bars: List[Bar], start: Optional[date], end: Optional[date]) -> List[Bar]:
    """Sort, deduplicate by date, and clip to the requested window."""
    by_date: Dict[date, Bar] = {}
    for bar in bars:
        if start and bar.ts < start:
            continue
        if end and bar.ts > end:
            continue
        by_date[bar.ts] = bar
    return [by_date[key] for key in sorted(by_date)]


# --------------------------------------------------------------------------
# providers
# --------------------------------------------------------------------------

def read_csv_bars(path: str) -> List[Bar]:
    """Read an OHLCV CSV. Column names are matched case insensitively."""
    if not os.path.exists(path):
        raise DataError(f"no such CSV file: {path}")
    bars: List[Bar] = []
    with open(path, newline="", encoding="utf-8") as handle:
        reader = csv.DictReader(handle)
        if not reader.fieldnames:
            raise DataError(f"{path} has no header row")
        columns = {name.strip().lower(): name for name in reader.fieldnames}
        required = ("open", "high", "low", "close")
        date_key = columns.get("date") or columns.get("timestamp") or columns.get("time")
        if date_key is None:
            raise DataError(f"{path} needs a 'date' column")
        missing = [name for name in required if name not in columns]
        if missing:
            raise DataError(f"{path} is missing columns: {', '.join(missing)}")
        volume_key = columns.get("volume")
        for line_no, row in enumerate(reader, start=2):
            raw_date = (row.get(date_key) or "").strip()
            if not raw_date:
                continue
            try:
                bars.append(
                    Bar(
                        ts=parse_date(raw_date),
                        open=float(row[columns["open"]]),
                        high=float(row[columns["high"]]),
                        low=float(row[columns["low"]]),
                        close=float(row[columns["close"]]),
                        volume=float(row[volume_key] or 0) if volume_key else 0.0,
                    )
                )
            except (ValueError, TypeError, KeyError) as exc:
                raise DataError(f"{path} line {line_no}: {exc}") from exc
    if not bars:
        raise DataError(f"{path} contained no usable rows")
    return bars


def write_csv_bars(path: str, bars: Sequence[Bar]) -> None:
    os.makedirs(os.path.dirname(os.path.abspath(path)) or ".", exist_ok=True)
    with open(path, "w", newline="", encoding="utf-8") as handle:
        writer = csv.writer(handle)
        writer.writerow(["date", "open", "high", "low", "close", "volume"])
        for bar in bars:
            writer.writerow(
                [bar.ts.isoformat(), bar.open, bar.high, bar.low, bar.close, bar.volume]
            )


def fetch_yahoo(symbol: str, start: date, end: date) -> List[Bar]:
    """Daily split and dividend adjusted bars from the Yahoo chart endpoint."""
    query = urllib.parse.urlencode(
        {
            "period1": _to_epoch(start),
            "period2": _to_epoch(end + timedelta(days=1)),
            "interval": "1d",
            "events": "div|split",
            "includeAdjustedClose": "true",
        }
    )
    url = f"https://query1.finance.yahoo.com/v8/finance/chart/{urllib.parse.quote(symbol)}?{query}"
    payload = json.loads(_http_get(url))
    chart = payload.get("chart") or {}
    if chart.get("error"):
        raise DataError(f"yahoo rejected {symbol}: {chart['error']}")
    results = chart.get("result") or []
    if not results:
        raise DataError(f"yahoo returned no data for {symbol}")
    result = results[0]
    stamps = result.get("timestamp") or []
    quote = (result.get("indicators", {}).get("quote") or [{}])[0]
    adjusted = (result.get("indicators", {}).get("adjclose") or [{}])[0].get("adjclose")

    bars: List[Bar] = []
    for i, stamp in enumerate(stamps):
        o, h, l, c = (quote.get(k, [None] * len(stamps))[i] for k in ("open", "high", "low", "close"))
        if None in (o, h, l, c):
            continue
        # Scale the whole bar by the adjusted close so splits do not fake a gap.
        ratio = (adjusted[i] / c) if adjusted and adjusted[i] and c else 1.0
        volume = quote.get("volume", [0] * len(stamps))[i] or 0
        bars.append(
            Bar(
                ts=datetime.fromtimestamp(stamp, tz=timezone.utc).date(),
                open=o * ratio,
                high=h * ratio,
                low=l * ratio,
                close=c * ratio,
                volume=float(volume),
            )
        )
    if not bars:
        raise DataError(f"yahoo returned no usable bars for {symbol}")
    return bars


def fetch_stooq(symbol: str, start: date, end: date) -> List[Bar]:
    """Daily bars from Stooq. US tickers need the ``.us`` suffix, added here."""
    ticker = symbol.lower()
    if "." not in ticker:
        ticker += ".us"
    query = urllib.parse.urlencode(
        {"s": ticker, "d1": start.strftime("%Y%m%d"), "d2": end.strftime("%Y%m%d"), "i": "d"}
    )
    text = _http_get(f"https://stooq.com/q/d/l/?{query}").decode("utf-8", "replace")
    if not text.lstrip().lower().startswith("date"):
        raise DataError(f"stooq returned no CSV for {symbol} (got {text[:80]!r})")
    bars: List[Bar] = []
    for row in csv.DictReader(text.splitlines()):
        try:
            bars.append(
                Bar(
                    ts=parse_date(row["Date"]),
                    open=float(row["Open"]),
                    high=float(row["High"]),
                    low=float(row["Low"]),
                    close=float(row["Close"]),
                    volume=float(row.get("Volume") or 0),
                )
            )
        except (ValueError, TypeError, KeyError):
            continue
    if not bars:
        raise DataError(f"stooq returned no usable bars for {symbol}")
    return bars


def synthetic_bars(
    symbol: str,
    start: date,
    end: date,
    *,
    seed: Optional[int] = None,
    start_price: float = 100.0,
    annual_drift: float = 0.08,
    annual_vol: float = 0.28,
) -> List[Bar]:
    """Deterministic fake price history for tests and offline demos.

    Geometric Brownian motion on trading days only. The seed is mixed with a
    stable checksum of the symbol, so each ticker gets its own series and the
    same ticker reproduces exactly on every run and every machine. Python's
    built in ``hash`` is randomised per process and cannot be used here.
    """
    rng = random.Random(_symbol_seed(symbol, seed))
    daily_drift = annual_drift / 252.0
    daily_vol = annual_vol / math.sqrt(252.0)

    bars: List[Bar] = []
    price = start_price
    current = start
    while current <= end:
        if current.weekday() < 5:  # skip weekends
            shock = rng.gauss(0.0, 1.0)
            ret = daily_drift - 0.5 * daily_vol**2 + daily_vol * shock
            close = max(price * math.exp(ret), 0.01)
            open_ = price * math.exp(rng.gauss(0.0, daily_vol * 0.25))
            high = max(open_, close) * (1 + abs(rng.gauss(0.0, daily_vol * 0.4)))
            low = min(open_, close) * (1 - abs(rng.gauss(0.0, daily_vol * 0.4)))
            bars.append(
                Bar(
                    ts=current,
                    open=round(open_, 4),
                    high=round(high, 4),
                    low=round(max(low, 0.01), 4),
                    close=round(close, 4),
                    volume=float(rng.randint(500_000, 5_000_000)),
                )
            )
            price = close
        current += timedelta(days=1)
    if not bars:
        raise DataError("synthetic range produced no trading days")
    return bars


# --------------------------------------------------------------------------
# public entry point
# --------------------------------------------------------------------------

def load_bars(
    symbol: str,
    start,
    end,
    *,
    provider: str = "yahoo",
    csv_dir: Optional[str] = None,
    cache_dir: Optional[str] = DEFAULT_CACHE_DIR,
    use_cache: bool = True,
    seed: Optional[int] = None,
) -> List[Bar]:
    """Load daily bars for one symbol from the named provider."""
    if provider not in PROVIDERS:
        raise DataError(f"unknown provider {provider!r}, expected one of {', '.join(PROVIDERS)}")
    start_d, end_d = parse_date(start), parse_date(end)
    if start_d > end_d:
        raise DataError(f"start {start_d} is after end {end_d}")

    if provider == "csv":
        directory = csv_dir or os.getcwd()
        return _clean(read_csv_bars(os.path.join(directory, f"{symbol.upper()}.csv")), start_d, end_d)

    if provider == "synthetic":
        return _clean(synthetic_bars(symbol, start_d, end_d, seed=seed), start_d, end_d)

    cache_path = None
    if use_cache and cache_dir:
        cache_path = os.path.join(
            cache_dir, f"{provider}_{symbol.upper()}_{start_d.isoformat()}_{end_d.isoformat()}.csv"
        )
        if os.path.exists(cache_path):
            return _clean(read_csv_bars(cache_path), start_d, end_d)

    fetch = fetch_yahoo if provider == "yahoo" else fetch_stooq
    bars = _clean(fetch(symbol, start_d, end_d), start_d, end_d)
    if not bars:
        raise DataError(f"no bars for {symbol} between {start_d} and {end_d}")
    if cache_path:
        write_csv_bars(cache_path, bars)
    return bars


def load_universe(symbols: Sequence[str], start, end, **kwargs) -> Dict[str, List[Bar]]:
    """Load bars for several symbols, reporting every symbol that failed."""
    out: Dict[str, List[Bar]] = {}
    failures: List[str] = []
    for symbol in symbols:
        try:
            out[symbol.upper()] = load_bars(symbol, start, end, **kwargs)
        except DataError as exc:
            failures.append(f"{symbol}: {exc}")
    if not out:
        raise DataError("no symbols could be loaded:\n  " + "\n  ".join(failures))
    if failures:
        print("warning: skipped symbols:\n  " + "\n  ".join(failures))
    return out


def align(series: Dict[str, List[Bar]]) -> Tuple[List[date], Dict[str, Dict[date, Bar]]]:
    """Return the union of trading dates plus a date lookup per symbol."""
    lookup = {symbol: {bar.ts: bar for bar in bars} for symbol, bars in series.items()}
    all_dates = sorted({ts for table in lookup.values() for ts in table})
    return all_dates, lookup
