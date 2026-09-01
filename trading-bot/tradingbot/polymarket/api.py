"""Read-only Polymarket client, standard library only.

Three public hosts, no API key required for any of the reads used here:

* ``gamma-api.polymarket.com``  market discovery and metadata
* ``clob.polymarket.com``       order books, prices, price history
* ``data-api.polymarket.com``   holders, trades, positions

Writes are deliberately absent. Placing a real order requires signing an
EIP-712 payload with a wallet private key, which this package does not do and
does not want your key for. See ``execution.py`` for what a live path would
need and why it is not implemented here.
"""

from __future__ import annotations

import json
import time
import urllib.error
import urllib.parse
import urllib.request
from datetime import datetime, timezone
from typing import Dict, List, Optional, Sequence

from .types import Market, OrderBook

GAMMA_HOST = "https://gamma-api.polymarket.com"
CLOB_HOST = "https://clob.polymarket.com"
DATA_HOST = "https://data-api.polymarket.com"
USER_AGENT = "tradingbot-polymarket/1.0 (+https://github.com/alexpeterson443)"


class PolymarketError(RuntimeError):
    pass


class MissingOrderBook(PolymarketError):
    """The token exists but has no order book.

    Common enough to be an expected outcome rather than a failure: Gamma marks
    plenty of markets ``enableOrderBook`` that the CLOB has never opened a book
    for. Callers should skip these, not retry them.
    """


class PolymarketAPI:
    """Thin, cached, retrying client over the public Polymarket endpoints."""

    def __init__(self, timeout: float = 20.0, retries: int = 3, cache_seconds: float = 0.0):
        self.timeout = timeout
        self.retries = retries
        self.cache_seconds = cache_seconds
        self._cache: Dict[str, tuple] = {}
        self.request_count = 0

    # ------------------------------------------------------------------

    def _get(self, url: str) -> object:
        if self.cache_seconds > 0:
            hit = self._cache.get(url)
            if hit and (time.monotonic() - hit[0]) < self.cache_seconds:
                return hit[1]

        last: Optional[Exception] = None
        for attempt in range(self.retries):
            request = urllib.request.Request(
                url, headers={"User-Agent": USER_AGENT, "Accept": "application/json"}
            )
            try:
                with urllib.request.urlopen(request, timeout=self.timeout) as response:
                    payload = json.loads(response.read())
                self.request_count += 1
                if self.cache_seconds > 0:
                    self._cache[url] = (time.monotonic(), payload)
                return payload
            except urllib.error.HTTPError as exc:
                body = exc.read().decode("utf-8", "replace")[:200]
                if exc.code == 404 and "orderbook" in body.lower():
                    raise MissingOrderBook(f"no order book for {url}") from exc
                # Other 4xx will not fix itself on a retry.
                if 400 <= exc.code < 500 and exc.code != 429:
                    raise PolymarketError(f"{url} returned {exc.code}: {body}") from exc
                last = exc
            except (urllib.error.URLError, OSError, TimeoutError, json.JSONDecodeError) as exc:
                last = exc
            if attempt < self.retries - 1:
                time.sleep(2**attempt)
        raise PolymarketError(f"request failed for {url}: {last}")

    @staticmethod
    def _query(params: dict) -> str:
        clean = {k: v for k, v in params.items() if v is not None}
        return urllib.parse.urlencode(clean)

    # ------------------------------------------------------------------
    # market discovery
    # ------------------------------------------------------------------

    def markets(
        self,
        *,
        limit: int = 100,
        offset: int = 0,
        closed: Optional[bool] = False,
        active: Optional[bool] = True,
        order: str = "liquidityNum",
        ascending: bool = False,
        tag: Optional[str] = None,
    ) -> List[Market]:
        """One page of markets from Gamma, newest and most liquid first."""
        query = self._query({
            "limit": min(limit, 500), "offset": offset,
            "closed": _bool(closed), "active": _bool(active),
            "order": order, "ascending": _bool(ascending), "tag_id": tag,
        })
        rows = self._get(f"{GAMMA_HOST}/markets?{query}")
        if not isinstance(rows, list):
            raise PolymarketError(f"unexpected markets payload: {str(rows)[:120]}")
        return [Market.from_gamma(row) for row in rows]

    def iter_markets(
        self, *, pages: int = 5, page_size: int = 100, **kwargs
    ) -> List[Market]:
        """Walk several pages of markets, stopping early when a page is short."""
        out: List[Market] = []
        for page in range(pages):
            batch = self.markets(limit=page_size, offset=page * page_size, **kwargs)
            out.extend(batch)
            if len(batch) < page_size:
                break
        return out

    def market_by_slug(self, slug: str) -> Optional[Market]:
        rows = self._get(f"{GAMMA_HOST}/markets?{self._query({'slug': slug})}")
        if isinstance(rows, list) and rows:
            return Market.from_gamma(rows[0])
        return None

    def search(self, text: str, *, limit: int = 200, pages: int = 3) -> List[Market]:
        """Substring match over open market questions.

        Gamma has no full text search on this endpoint, so this filters pages
        client side. Keep the page count modest.
        """
        needle = text.strip().lower()
        found = [
            m for m in self.iter_markets(pages=pages, page_size=100)
            if needle in m.question.lower() or needle in m.slug.lower()
        ]
        return found[:limit]

    # ------------------------------------------------------------------
    # prices and books
    # ------------------------------------------------------------------

    def book(self, token_id: str) -> OrderBook:
        payload = self._get(f"{CLOB_HOST}/book?{self._query({'token_id': token_id})}")
        if not isinstance(payload, dict):
            raise PolymarketError(f"unexpected book payload for {token_id}")
        book = OrderBook.from_api(payload)
        if not book.token_id:
            book.token_id = token_id
        return book

    def book_or_none(self, token_id: str) -> Optional[OrderBook]:
        """Fetch a book, returning None when the token simply has no book."""
        try:
            return self.book(token_id)
        except MissingOrderBook:
            return None

    def books(self, token_ids: Sequence[str]) -> Dict[str, OrderBook]:
        """Fetch several books. Individual failures are skipped, not fatal."""
        out: Dict[str, OrderBook] = {}
        for token_id in token_ids:
            try:
                out[token_id] = self.book(token_id)
            except PolymarketError:
                continue
        return out

    def price(self, token_id: str, side: str = "buy") -> Optional[float]:
        """Best price a taker on ``side`` would touch."""
        if side not in ("buy", "sell"):
            raise ValueError("side must be 'buy' or 'sell'")
        payload = self._get(f"{CLOB_HOST}/price?{self._query({'token_id': token_id, 'side': side})}")
        return _as_float(payload.get("price")) if isinstance(payload, dict) else None

    def midpoint(self, token_id: str) -> Optional[float]:
        payload = self._get(f"{CLOB_HOST}/midpoint?{self._query({'token_id': token_id})}")
        return _as_float(payload.get("mid")) if isinstance(payload, dict) else None

    def spread(self, token_id: str) -> Optional[float]:
        payload = self._get(f"{CLOB_HOST}/spread?{self._query({'token_id': token_id})}")
        return _as_float(payload.get("spread")) if isinstance(payload, dict) else None

    def price_history(
        self, token_id: str, *, interval: str = "1m", fidelity: int = 60
    ) -> List[tuple]:
        """Historical midpoints as ``(datetime, price)`` pairs, oldest first.

        ``interval`` accepts Polymarket's own labels: 1h, 6h, 1d, 1w, 1m, max.
        ``fidelity`` is the bucket width in minutes.
        """
        query = self._query({"market": token_id, "interval": interval, "fidelity": fidelity})
        payload = self._get(f"{CLOB_HOST}/prices-history?{query}")
        rows = payload.get("history", []) if isinstance(payload, dict) else []
        out = []
        for row in rows:
            try:
                stamp = datetime.fromtimestamp(int(row["t"]), tz=timezone.utc)
                out.append((stamp, float(row["p"])))
            except (KeyError, TypeError, ValueError):
                continue
        return out

    # ------------------------------------------------------------------
    # data api
    # ------------------------------------------------------------------

    def holders(self, condition_id: str, limit: int = 20) -> List[dict]:
        query = self._query({"market": condition_id, "limit": limit})
        payload = self._get(f"{DATA_HOST}/holders?{query}")
        if isinstance(payload, list):
            return payload
        if isinstance(payload, dict):
            return payload.get("holders", []) or []
        return []

    def health(self) -> bool:
        try:
            payload = self._get(f"{DATA_HOST}/")
            return isinstance(payload, dict) and payload.get("data") == "OK"
        except PolymarketError:
            return False


def _bool(value: Optional[bool]) -> Optional[str]:
    if value is None:
        return None
    return "true" if value else "false"


def _as_float(value) -> Optional[float]:
    try:
        return float(value)
    except (TypeError, ValueError):
        return None
