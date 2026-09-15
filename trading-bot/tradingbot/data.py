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

from .core import Bar, parse_date, parse_timestamp

USER_AGENT = "Mozilla/5.0 (compatible; tradingbot/1.0; +https://github.com/alexpeterson443)"
DEFAULT_CACHE_DIR = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "data", "cache")
PROVIDERS = ("csv", "yahoo", "stooq", "alpaca", "tiingo", "finnhub", "synthetic")

# Providers that can serve bars finer than one day, and the interval names the
# CLI accepts. Yahoo serves intraday too, with a much shorter history window.
INTERVALS = ("1d", "1h", "30m", "15m", "5m", "1m")
INTRADAY_PROVIDERS = ("yahoo", "alpaca", "csv", "synthetic")

_YAHOO_INTERVALS = {"1d": "1d", "1h": "1h", "30m": "30m", "15m": "15m", "5m": "5m", "1m": "1m"}
_ALPACA_TIMEFRAMES = {"1d": "1Day", "1h": "1Hour", "30m": "30Min", "15m": "15Min",
                      "5m": "5Min", "1m": "1Min"}


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
    """Sort, deduplicate by timestamp, and clip to the requested window."""
    by_ts: Dict[object, Bar] = {}
    for bar in bars:
        day = bar.ts.date() if isinstance(bar.ts, datetime) else bar.ts
        if start and day < start:
            continue
        if end and day > end:
            continue
        by_ts[bar.ts] = bar
    return [by_ts[key] for key in sorted(by_ts)]


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
                        ts=parse_timestamp(raw_date),
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
        # isoformat round trips through parse_timestamp for both date and datetime.


def fetch_yahoo(symbol: str, start: date, end: date, interval: str = "1d") -> List[Bar]:
    """Split and dividend adjusted bars from the Yahoo chart endpoint."""
    if interval not in _YAHOO_INTERVALS:
        raise DataError(f"yahoo does not serve the {interval!r} interval")
    query = urllib.parse.urlencode(
        {
            "period1": _to_epoch(start),
            "period2": _to_epoch(end + timedelta(days=1)),
            "interval": _YAHOO_INTERVALS[interval],
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
        moment = datetime.fromtimestamp(stamp, tz=timezone.utc).replace(tzinfo=None)
        bars.append(
            Bar(
                ts=moment.date() if interval == "1d" else moment,
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


def fetch_alpaca(symbol: str, start: date, end: date, interval: str = "1d") -> List[Bar]:
    """Bars from Alpaca's market data API.

    Uses the same ALPACA_API_KEY_ID and ALPACA_API_SECRET_KEY as the broker, so
    a free paper account is enough. The IEX feed is requested because it is the
    one available without a paid subscription.
    """
    key = os.environ.get("ALPACA_API_KEY_ID", "")
    secret = os.environ.get("ALPACA_API_SECRET_KEY", "")
    if not key or not secret:
        raise DataError(
            "alpaca data needs ALPACA_API_KEY_ID and ALPACA_API_SECRET_KEY in the environment"
        )
    if interval not in _ALPACA_TIMEFRAMES:
        raise DataError(f"alpaca does not serve the {interval!r} interval")

    bars: List[Bar] = []
    page_token = None
    for _ in range(20):        # bounded, so a bad cursor cannot loop forever
        params = {
            "timeframe": _ALPACA_TIMEFRAMES[interval],
            "start": start.isoformat(),
            "end": end.isoformat(),
            "adjustment": "all",
            "feed": "iex",
            "limit": "10000",
        }
        if page_token:
            params["page_token"] = page_token
        url = (f"https://data.alpaca.markets/v2/stocks/{urllib.parse.quote(symbol.upper())}"
               f"/bars?{urllib.parse.urlencode(params)}")
        request = urllib.request.Request(
            url, headers={"APCA-API-KEY-ID": key, "APCA-API-SECRET-KEY": secret,
                          "User-Agent": USER_AGENT},
        )
        try:
            with urllib.request.urlopen(request, timeout=25) as response:
                payload = json.loads(response.read())
        except urllib.error.HTTPError as exc:
            raise DataError(
                f"alpaca rejected {symbol} [{exc.code}]: "
                f"{exc.read().decode('utf-8', 'replace')[:200]}"
            ) from exc
        except (urllib.error.URLError, OSError, TimeoutError) as exc:
            raise DataError(f"alpaca unreachable for {symbol}: {exc}") from exc

        for row in payload.get("bars") or []:
            moment = parse_timestamp(row["t"])
            bars.append(
                Bar(
                    ts=moment.date() if interval == "1d" and isinstance(moment, datetime) else moment,
                    open=float(row["o"]), high=float(row["h"]),
                    low=float(row["l"]), close=float(row["c"]),
                    volume=float(row.get("v") or 0),
                )
            )
        page_token = payload.get("next_page_token")
        if not page_token:
            break

    if not bars:
        raise DataError(f"alpaca returned no bars for {symbol}")
    return bars


def fetch_tiingo(symbol: str, start: date, end: date) -> List[Bar]:
    """Daily adjusted bars from Tiingo. Needs TIINGO_API_KEY in the environment."""
    token = os.environ.get("TIINGO_API_KEY", "")
    if not token:
        raise DataError("tiingo needs TIINGO_API_KEY in the environment")
    query = urllib.parse.urlencode(
        {"startDate": start.isoformat(), "endDate": end.isoformat(),
         "format": "json", "token": token}
    )
    url = f"https://api.tiingo.com/tiingo/daily/{urllib.parse.quote(symbol.lower())}/prices?{query}"
    rows = json.loads(_http_get(url))
    if not isinstance(rows, list) or not rows:
        raise DataError(f"tiingo returned no bars for {symbol}")
    bars = []
    for row in rows:
        try:
            bars.append(
                Bar(
                    ts=parse_date(row["date"][:10]),
                    open=float(row["adjOpen"]), high=float(row["adjHigh"]),
                    low=float(row["adjLow"]), close=float(row["adjClose"]),
                    volume=float(row.get("adjVolume") or 0),
                )
            )
        except (KeyError, TypeError, ValueError):
            continue
    if not bars:
        raise DataError(f"tiingo returned no usable bars for {symbol}")
    return bars


def fetch_finnhub(symbol: str, start: date, end: date) -> List[Bar]:
    """Daily bars from Finnhub. Needs FINNHUB_API_KEY in the environment."""
    token = os.environ.get("FINNHUB_API_KEY", "")
    if not token:
        raise DataError("finnhub needs FINNHUB_API_KEY in the environment")
    query = urllib.parse.urlencode(
        {"symbol": symbol.upper(), "resolution": "D",
         "from": _to_epoch(start), "to": _to_epoch(end + timedelta(days=1)), "token": token}
    )
    payload = json.loads(_http_get(f"https://finnhub.io/api/v1/stock/candle?{query}"))
    if payload.get("s") != "ok":
        raise DataError(f"finnhub returned no data for {symbol} (status {payload.get('s')!r})")
    bars = []
    for i, stamp in enumerate(payload.get("t", [])):
        try:
            bars.append(
                Bar(
                    ts=datetime.fromtimestamp(stamp, tz=timezone.utc).date(),
                    open=float(payload["o"][i]), high=float(payload["h"][i]),
                    low=float(payload["l"][i]), close=float(payload["c"][i]),
                    volume=float(payload["v"][i]),
                )
            )
        except (KeyError, IndexError, TypeError, ValueError):
            continue
    if not bars:
        raise DataError(f"finnhub returned no usable bars for {symbol}")
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
    interval: str = "1d",
) -> List[Bar]:
    """Load bars for one symbol from the named provider."""
    if provider not in PROVIDERS:
        raise DataError(f"unknown provider {provider!r}, expected one of {', '.join(PROVIDERS)}")
    if interval not in INTERVALS:
        raise DataError(f"unknown interval {interval!r}, expected one of {', '.join(INTERVALS)}")
    if interval != "1d" and provider not in INTRADAY_PROVIDERS:
        raise DataError(
            f"provider {provider!r} only serves daily bars. "
            f"Intraday providers: {', '.join(INTRADAY_PROVIDERS)}"
        )
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
            cache_dir,
            f"{provider}_{symbol.upper()}_{interval}_{start_d.isoformat()}_{end_d.isoformat()}.csv",
        )
        if os.path.exists(cache_path):
            return _clean(read_csv_bars(cache_path), start_d, end_d)

    if provider == "yahoo":
        bars = fetch_yahoo(symbol, start_d, end_d, interval)
    elif provider == "alpaca":
        bars = fetch_alpaca(symbol, start_d, end_d, interval)
    elif provider == "tiingo":
        bars = fetch_tiingo(symbol, start_d, end_d)
    elif provider == "finnhub":
        bars = fetch_finnhub(symbol, start_d, end_d)
    else:
        bars = fetch_stooq(symbol, start_d, end_d)
    bars = _clean(bars, start_d, end_d)
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
