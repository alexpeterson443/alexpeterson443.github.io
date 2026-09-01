"""Polymarket 5 minute Bitcoin Up/Down "sniping".

The idea, as pitched: in the final minute of a five minute window the outcome
is nearly decided, so buy the leading side at 85 to 92 cents and collect the
remainder. High win rate, small profit per trade.

This module implements that strategy exactly as specified, and also does the
arithmetic the pitch skipped. Three facts, all verified against the live
market, decide whether it can work:

1. Fees. ``fee = shares * 0.07 * p * (1 - p)``, charged to the taker. At 85
   cents that is about 0.9 cents a share, six percent of the gross margin.
2. Resolution is a Chainlink TWAP with a 60 second lookback, compared to the
   price at the window open. The spot price at the buzzer does not decide it.
   The final 15 seconds carry a quarter of the weight, not all of it.
3. Break even. Buying at price ``c`` needs a win rate of at least ``c``. The
   pitch claims 10 of 12 (83.3 percent) and instructs buying at 85 cents and
   above. 83.3 is less than 85. The strategy as written loses money by its
   own numbers, before fees, and its profit table quietly assumes a 75 cent
   entry that its rules forbid.

None of that is a reason not to build it. It is a reason to build the part the
pitch never had: a recorder that watches real windows, logs the price ladder in
the final ninety seconds, logs how each one resolved, and reports the actual
win rate at each entry price. Then the numbers are yours, not an AI's.

No orders are placed. This reads and records.
"""

from __future__ import annotations

import csv
import json
import os
import statistics
import time
import urllib.error
import urllib.request
from dataclasses import dataclass, field
from datetime import datetime, timezone
from typing import Dict, List, Optional, Sequence, Tuple

from .api import PolymarketAPI
from .types import Market, OrderBook

WINDOW_SECONDS = 300
SLUG_PREFIX = "btc-updown-5m-"
CRYPTO_FEE_RATE = 0.07            # verified: feeSchedule.rate on live markets
TWAP_LOOKBACK_SECONDS = 60        # fallback only; live value read from cryptoMarketConfig
MIN_ORDER_SHARES = 5              # verified: orderMinSize on live markets

UP, DOWN = "Up", "Down"


# ----------------------------------------------------------------------
# arithmetic the pitch skipped
# ----------------------------------------------------------------------

def taker_fee(shares: float, price: float, rate: float = CRYPTO_FEE_RATE) -> float:
    """Polymarket crypto market taker fee. Peaks at 50 cents, vanishes at the ends."""
    if shares <= 0 or not 0 < price < 1:
        return 0.0
    return shares * rate * price * (1.0 - price)


def fee_per_share(price: float, rate: float = CRYPTO_FEE_RATE) -> float:
    return taker_fee(1.0, price, rate)


def breakeven_win_rate(price: float, rate: float = CRYPTO_FEE_RATE) -> float:
    """Win rate needed to break even buying at ``price``, fees included.

    Win:  gain (1 - price) - fee
    Lose: lose price + fee
    Break even when  w * gain = (1 - w) * loss.
    """
    if not 0 < price < 1:
        return 1.0
    fee = fee_per_share(price, rate)
    gain = (1.0 - price) - fee
    loss = price + fee
    if gain <= 0:
        return 1.0
    return loss / (gain + loss)


def wins_to_recover(price: float, rate: float = CRYPTO_FEE_RATE) -> float:
    """Consecutive wins needed to pay back one full loss. The pitch's own metric."""
    fee = fee_per_share(price, rate)
    gain = (1.0 - price) - fee
    loss = price + fee
    return (loss / gain) if gain > 0 else float("inf")


def expectancy(price: float, win_rate: float, rate: float = CRYPTO_FEE_RATE) -> float:
    """Expected profit per share at a given win rate, fees included."""
    fee = fee_per_share(price, rate)
    return win_rate * ((1.0 - price) - fee) - (1.0 - win_rate) * (price + fee)


def daily_projection(
    *, stake: float, trades_per_day: int, price: float, win_rate: float,
    rate: float = CRYPTO_FEE_RATE,
) -> dict:
    """Reproduce the pitch's profit table, then correct it.

    The pitch's $48 a day comes from 10 wins of 12 at a 75 cent entry. Its own
    rules require 85 cents and above. This shows both.
    """
    shares = stake / price
    per_trade = expectancy(price, win_rate, rate) * shares
    daily = per_trade * trades_per_day
    return {
        "stake": stake, "shares": round(shares, 2), "price": price,
        "win_rate": win_rate, "breakeven_win_rate": round(breakeven_win_rate(price, rate), 4),
        "edge_vs_breakeven": round(win_rate - breakeven_win_rate(price, rate), 4),
        "expectancy_per_trade": round(per_trade, 4),
        "daily": round(daily, 2), "weekly": round(daily * 7, 2),
        "monthly": round(daily * 30, 2), "yearly": round(daily * 365, 2),
        "fee_per_trade": round(taker_fee(shares, price, rate), 4),
    }


# ----------------------------------------------------------------------
# the rules, exactly as pitched
# ----------------------------------------------------------------------

@dataclass
class SnipeRules:
    """The three gates from the pitch, plus its own contradictory ceiling."""

    # Gate 1: clock. Only act inside this many seconds of the close.
    max_seconds_left: float = 45.0
    # Gate 2: distance. Running TWAP must be this many 1 minute ATRs from the
    # open, in the direction of the trade.
    atr_multiple: float = 1.5
    # Gate 3: price ladder. Minimum acceptable ask by seconds remaining.
    # (upper bound on seconds left, minimum price). Checked top down.
    ladder: Tuple[Tuple[float, float], ...] = (
        (60.0, 0.92),
        (45.0, 0.88),
        (30.0, 0.85),
        (15.0, 0.0),     # "any price" under 15 seconds
    )
    # From the pitch's own second tab: never buy above this. Contradicts the
    # ladder above, which is exactly the point of keeping both.
    price_ceiling: Optional[float] = 0.80
    # Execution: limit orders only, flat stake.
    stake: float = 5.0
    limit_only: bool = True
    min_shares: float = MIN_ORDER_SHARES

    def minimum_price(self, seconds_left: float) -> Optional[float]:
        """Minimum ask the ladder accepts at this point on the clock."""
        if seconds_left > self.ladder[0][0]:
            return None
        for upper, minimum in self.ladder:
            if seconds_left <= upper:
                floor = minimum
        return floor


@dataclass
class Gate:
    name: str
    passed: bool
    detail: str


@dataclass
class SnipeDecision:
    side: Optional[str]
    price: Optional[float]
    shares: float
    gates: List[Gate] = field(default_factory=list)
    reason: str = ""

    @property
    def go(self) -> bool:
        return self.side is not None and all(g.passed for g in self.gates)

    def summary(self) -> str:
        marks = "  ".join(f"[{'x' if g.passed else ' '}] {g.name}" for g in self.gates)
        head = f"SNIPE {self.side} @ {self.price:.2f} x{self.shares:.0f}" if self.go else "SKIP"
        return f"{head}   {marks}   {self.reason}"


def evaluate(
    rules: SnipeRules,
    *,
    seconds_left: float,
    up_book: Optional[OrderBook],
    down_book: Optional[OrderBook],
    twap_now: Optional[float],
    open_price: Optional[float],
    atr_1m: Optional[float],
) -> SnipeDecision:
    """Run the pitch's three gate checklist against live inputs.

    Every gate is recorded whether or not an earlier one failed, so a skipped
    trade always says exactly why.
    """
    gates: List[Gate] = []

    # Which side is leading, by the running TWAP versus the open.
    if twap_now is None or open_price is None:
        return SnipeDecision(None, None, 0.0, [Gate("data", False, "no TWAP or open price")],
                             "missing price data")
    distance = twap_now - open_price
    side = UP if distance >= 0 else DOWN
    book = up_book if side == UP else down_book

    # Gate 1: clock.
    on_clock = seconds_left <= rules.max_seconds_left
    gates.append(Gate("clock", on_clock,
                      f"{seconds_left:.0f}s left, need <= {rules.max_seconds_left:.0f}s"))

    # Gate 2: distance from the open in ATR units.
    if atr_1m and atr_1m > 0:
        needed = rules.atr_multiple * atr_1m
        far_enough = abs(distance) >= needed
        gates.append(Gate("distance", far_enough,
                          f"TWAP {distance:+.0f} from open, need |{needed:.0f}| "
                          f"({rules.atr_multiple:g} x ATR ${atr_1m:.0f})"))
    else:
        gates.append(Gate("distance", False, "no ATR available"))

    # Gate 3: price ladder against the real ask.
    ask = book.best_ask if book is not None else None
    floor = rules.minimum_price(seconds_left)
    if ask is None:
        gates.append(Gate("price", False, f"{side} has no ask"))
    elif floor is None:
        gates.append(Gate("price", False, f"outside the ladder ({seconds_left:.0f}s left)"))
    else:
        gates.append(Gate("price", ask >= floor, f"{side} ask {ask:.2f}, ladder floor {floor:.2f}"))

    # The pitch's own ceiling from its second tab.
    if rules.price_ceiling is not None and ask is not None:
        gates.append(Gate("ceiling", ask <= rules.price_ceiling,
                          f"ask {ask:.2f} vs ceiling {rules.price_ceiling:.2f} (pitch tab 2)"))

    if ask is None or not all(g.passed for g in gates):
        failed = ", ".join(g.name for g in gates if not g.passed)
        return SnipeDecision(side, ask, 0.0, gates, f"blocked by {failed}")

    shares = max(rules.stake / ask, rules.min_shares)
    depth = book.depth("buy", within=0.0) if book else 0.0
    if depth < shares:
        gates.append(Gate("depth", False, f"{depth:.0f} shares at the touch, need {shares:.0f}"))
        return SnipeDecision(side, ask, 0.0, gates, "not enough size at the limit price")

    return SnipeDecision(side, ask, shares, gates,
                         f"gross {(1 - ask) * shares:.3f}, fee {taker_fee(shares, ask):.3f}")


# ----------------------------------------------------------------------
# market discovery and price feed
# ----------------------------------------------------------------------

def window_start(ts: Optional[float] = None) -> int:
    """Unix timestamp of the five minute window containing ``ts``."""
    now = int(ts if ts is not None else time.time())
    return (now // WINDOW_SECONDS) * WINDOW_SECONDS


def window_slug(start_ts: int) -> str:
    return f"{SLUG_PREFIX}{start_ts}"


def twap_lookback(market: Market) -> int:
    """The averaging window this market resolves on, from its own config.

    Reporting around the August 2026 change said five minute markets use 30
    seconds; the live config on every window inspected says 60. The market's
    own field is authoritative, so read it and only fall back when absent.
    """
    value = market.twap_lookback_seconds
    return int(value) if value else TWAP_LOOKBACK_SECONDS


def seconds_until_close(market: Market, now: Optional[datetime] = None) -> Optional[float]:
    if market.end_date is None:
        return None
    now = now or datetime.now(timezone.utc)
    return (market.end_date - now).total_seconds()


def current_and_next(api: PolymarketAPI) -> Tuple[Optional[Market], Optional[Market]]:
    """The window closing next and the one after it. Either may be missing."""
    start = window_start()
    current = api.market_by_slug(window_slug(start))
    following = api.market_by_slug(window_slug(start + WINDOW_SECONDS))
    return current, following


class BtcFeed:
    """Spot, one minute ATR, and a running TWAP estimate from Coinbase.

    Coinbase is used because it is reachable from the United States. The
    resolution source is Chainlink, which aggregates several venues, so this
    is an approximation and is labelled as one everywhere it is shown.
    """

    CANDLES = "https://api.exchange.coinbase.com/products/BTC-USD/candles?granularity=60"
    SPOT = "https://api.coinbase.com/v2/prices/BTC-USD/spot"

    def __init__(self, timeout: float = 8.0):
        self.timeout = timeout
        self._ticks: List[Tuple[float, float]] = []      # (unix ts, price)

    def _get(self, url: str):
        request = urllib.request.Request(url, headers={"User-Agent": "tradingbot/1.0"})
        with urllib.request.urlopen(request, timeout=self.timeout) as response:
            return json.loads(response.read())

    def spot(self) -> Optional[float]:
        try:
            price = float(self._get(self.SPOT)["data"]["amount"])
        except (urllib.error.URLError, OSError, KeyError, ValueError, TimeoutError):
            return None
        self._ticks.append((time.time(), price))
        cutoff = time.time() - 2 * TWAP_LOOKBACK_SECONDS
        self._ticks = [t for t in self._ticks if t[0] >= cutoff]
        return price

    def candles(self, count: int = 30) -> List[Tuple[int, float, float, float, float]]:
        """Newest first: (time, low, high, open, close)."""
        try:
            rows = self._get(self.CANDLES)
        except (urllib.error.URLError, OSError, ValueError, TimeoutError):
            return []
        return [(int(r[0]), float(r[1]), float(r[2]), float(r[3]), float(r[4])) for r in rows[:count]]

    def atr_1m(self, period: int = 14) -> Optional[float]:
        rows = self.candles(period + 2)
        if len(rows) < period + 1:
            return None
        trs = []
        for i in range(period):
            _, low, high, _, _ = rows[i]
            prev_close = rows[i + 1][4]
            trs.append(max(high - low, abs(high - prev_close), abs(low - prev_close)))
        return sum(trs) / len(trs)

    def twap(self, lookback: float = TWAP_LOOKBACK_SECONDS) -> Optional[float]:
        """Time weighted average of the ticks we have sampled in the lookback.

        This is only as good as the sampling cadence. Poll every few seconds
        during the final minute or the estimate is meaningless.
        """
        cutoff = time.time() - lookback
        recent = [t for t in self._ticks if t[0] >= cutoff]
        if len(recent) < 2:
            return recent[0][1] if recent else None
        weighted = 0.0
        span = 0.0
        for (t0, p0), (t1, _) in zip(recent, recent[1:]):
            dt = t1 - t0
            weighted += p0 * dt
            span += dt
        return (weighted / span) if span > 0 else recent[-1][1]

    def open_price_for(self, start_ts: int) -> Optional[float]:
        """TWAP proxy for the reference price at the window open.

        Both ends of the window resolve on the same Chainlink TWAP feed, so the
        open is an average too, not a single print. The one minute candle ending
        at the open is the closest thing Coinbase offers; its OHLC mean is a fair
        stand in for a sixty second average. Off by whatever Coinbase and
        Chainlink disagreed by, usually a few dollars.
        """
        for t, low, high, open_, close in self.candles(40):
            if t == start_ts - 60:
                return (open_ + high + low + close) / 4.0
        return None


# ----------------------------------------------------------------------
# the recorder: measure what the pitch asserted
# ----------------------------------------------------------------------

SNAPSHOT_FIELDS = [
    "recorded_at", "slug", "window_start", "seconds_left", "btc_spot", "twap_60s",
    "open_price", "atr_1m", "distance", "leading", "up_bid", "up_ask", "up_ask_size",
    "down_bid", "down_ask", "down_ask_size", "ladder_floor", "decision", "decision_side",
    "decision_price", "decision_shares", "blocked_by",
]
RESOLUTION_FIELDS = ["resolved_at", "slug", "window_start", "winner", "final_up", "final_down"]


class Recorder:
    """Watches live windows and writes what actually happened.

    Two CSVs. ``snapshots`` holds the book and price state every few seconds in
    the final stretch of each window, with the rule engine's verdict at that
    instant. ``resolutions`` holds how each window resolved. Join them on slug
    and you have the win rate at every entry price, measured rather than
    assumed.
    """

    def __init__(self, api: PolymarketAPI, feed: BtcFeed, rules: SnipeRules, out_dir: str = "snipe_data"):
        self.api = api
        self.feed = feed
        self.rules = rules
        self.out_dir = out_dir
        os.makedirs(out_dir, exist_ok=True)
        self.snapshots_path = os.path.join(out_dir, "snapshots.csv")
        self.resolutions_path = os.path.join(out_dir, "resolutions.csv")
        self._ensure(self.snapshots_path, SNAPSHOT_FIELDS)
        self._ensure(self.resolutions_path, RESOLUTION_FIELDS)
        self._pending: Dict[str, int] = {}          # slug -> window start awaiting resolution

    @staticmethod
    def _ensure(path: str, fields: Sequence[str]) -> None:
        if not os.path.exists(path) or os.path.getsize(path) == 0:
            with open(path, "w", newline="", encoding="utf-8") as handle:
                csv.DictWriter(handle, fieldnames=fields).writeheader()

    def _append(self, path: str, fields: Sequence[str], row: dict) -> None:
        with open(path, "a", newline="", encoding="utf-8") as handle:
            csv.DictWriter(handle, fieldnames=fields).writerow({k: row.get(k, "") for k in fields})

    # ------------------------------------------------------------------

    def snapshot(self, market: Market, start_ts: int) -> Optional[SnipeDecision]:
        """One observation of one window. Returns the rule engine's verdict."""
        left = seconds_until_close(market)
        if left is None:
            return None
        up_book = self.api.book_or_none(market.token_for(UP) or "")
        down_book = self.api.book_or_none(market.token_for(DOWN) or "")
        spot = self.feed.spot()
        twap = self.feed.twap(lookback=twap_lookback(market))
        open_price = self.feed.open_price_for(start_ts)
        atr = self.feed.atr_1m()

        decision = evaluate(
            self.rules, seconds_left=left, up_book=up_book, down_book=down_book,
            twap_now=twap, open_price=open_price, atr_1m=atr,
        )
        distance = (twap - open_price) if (twap is not None and open_price is not None) else None
        self._append(self.snapshots_path, SNAPSHOT_FIELDS, {
            "recorded_at": _now(), "slug": market.slug, "window_start": start_ts,
            "seconds_left": round(left, 1), "btc_spot": spot, "twap_60s": _r(twap),
            "open_price": _r(open_price), "atr_1m": _r(atr), "distance": _r(distance),
            "leading": decision.side or "",
            "up_bid": _b(up_book, "bid"), "up_ask": _b(up_book, "ask"),
            "up_ask_size": _sz(up_book),
            "down_bid": _b(down_book, "bid"), "down_ask": _b(down_book, "ask"),
            "down_ask_size": _sz(down_book),
            "ladder_floor": self.rules.minimum_price(left),
            "decision": "GO" if decision.go else "SKIP",
            "decision_side": decision.side if decision.go else "",
            "decision_price": decision.price if decision.go else "",
            "decision_shares": round(decision.shares, 2) if decision.go else "",
            "blocked_by": "" if decision.go else ",".join(g.name for g in decision.gates if not g.passed),
        })
        self._pending[market.slug] = start_ts
        return decision

    def settle(self) -> List[dict]:
        """Record resolutions for windows that have closed."""
        settled = []
        for slug, start_ts in list(self._pending.items()):
            if time.time() < start_ts + WINDOW_SECONDS + 20:
                continue        # give the oracle a moment
            market = self.api.market_by_slug(slug)
            if market is None:
                # Gamma drops resolved windows quickly. Fall back to the last
                # observed price, which converges to 0.99/0.01 at the end.
                winner = self._last_leader(slug)
                final_up = final_down = ""
            else:
                prices = market.outcome_prices or [None, None]
                final_up, final_down = prices[0], prices[1] if len(prices) > 1 else None
                if final_up is None:
                    winner = self._last_leader(slug)
                else:
                    winner = UP if final_up >= 0.5 else DOWN
            row = {"resolved_at": _now(), "slug": slug, "window_start": start_ts,
                   "winner": winner, "final_up": final_up, "final_down": final_down}
            self._append(self.resolutions_path, RESOLUTION_FIELDS, row)
            settled.append(row)
            del self._pending[slug]
        return settled

    def _last_leader(self, slug: str) -> str:
        last = ""
        with open(self.snapshots_path, newline="", encoding="utf-8") as handle:
            for row in csv.DictReader(handle):
                if row["slug"] == slug:
                    up_bid = row.get("up_bid")
                    if up_bid not in ("", None):
                        last = UP if float(up_bid) >= 0.5 else DOWN
        return last or "unknown"

    # ------------------------------------------------------------------

    def report(self) -> dict:
        """Observed win rate at each ladder rung, from the recorded data."""
        winners: Dict[str, str] = {}
        with open(self.resolutions_path, newline="", encoding="utf-8") as handle:
            for row in csv.DictReader(handle):
                winners[row["slug"]] = row["winner"]

        buckets: Dict[str, dict] = {}
        with open(self.snapshots_path, newline="", encoding="utf-8") as handle:
            for row in csv.DictReader(handle):
                winner = winners.get(row["slug"])
                if not winner or winner == "unknown" or not row.get("leading"):
                    continue
                side = row["leading"]
                ask = row["up_ask"] if side == UP else row["down_ask"]
                if ask in ("", None):
                    continue
                ask = float(ask)
                left = float(row["seconds_left"])
                rung = _rung(left)
                bucket = buckets.setdefault(rung, {"n": 0, "wins": 0, "asks": []})
                bucket["n"] += 1
                bucket["wins"] += int(side == winner)
                bucket["asks"].append(ask)

        out = {"windows_resolved": len(winners), "rungs": {}}
        for rung, b in sorted(buckets.items()):
            asks = b["asks"]
            median_ask = statistics.median(asks) if asks else 0.0
            win_rate = b["wins"] / b["n"] if b["n"] else 0.0
            out["rungs"][rung] = {
                "observations": b["n"], "win_rate": round(win_rate, 4),
                "median_ask": round(median_ask, 3),
                "breakeven_at_median_ask": round(breakeven_win_rate(median_ask), 4) if median_ask else None,
                "expectancy_per_share": round(expectancy(median_ask, win_rate), 4) if median_ask else None,
            }
        return out


def _rung(seconds_left: float) -> str:
    if seconds_left > 60:
        return "a_60s+"
    if seconds_left > 45:
        return "b_60-45s"
    if seconds_left > 30:
        return "c_45-30s"
    if seconds_left > 15:
        return "d_30-15s"
    return "e_<15s"


def _now() -> str:
    return datetime.now(timezone.utc).isoformat(timespec="seconds")


def _r(value: Optional[float]) -> Optional[float]:
    return round(value, 2) if value is not None else None


def _b(book: Optional[OrderBook], side: str) -> Optional[float]:
    if book is None:
        return None
    return book.best_bid if side == "bid" else book.best_ask


def _sz(book: Optional[OrderBook]) -> Optional[float]:
    if book is None or not book.asks:
        return None
    return round(book.asks[0].size, 1)
