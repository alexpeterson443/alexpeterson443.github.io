"""Broker interfaces.

Two implementations:

* :class:`PaperBroker`  simulated fills against an in memory portfolio
* :class:`AlpacaPaperBroker`  Alpaca's paper trading API over urllib

The Alpaca client refuses any base URL that is not the paper endpoint. Routing
this bot at a live account is not a configuration change you can make by
accident.
"""

from __future__ import annotations

import json
import os
import urllib.error
import urllib.parse
import urllib.request
from abc import ABC, abstractmethod
from datetime import date
from typing import Dict, Optional

from .core import Order, Side
from .portfolio import CostModel, Portfolio

PAPER_HOST = "https://paper-api.alpaca.markets"


class BrokerError(RuntimeError):
    pass


class Broker(ABC):
    """Minimum surface the live loop needs from a venue."""

    @abstractmethod
    def equity(self) -> float: ...

    @abstractmethod
    def cash(self) -> float: ...

    @abstractmethod
    def positions(self) -> Dict[str, float]:
        """Symbol to quantity held."""

    @abstractmethod
    def submit(self, order: Order, reference_price: float) -> Optional[dict]: ...

    def is_long(self, symbol: str) -> bool:
        return self.positions().get(symbol.upper(), 0.0) > 0

    def describe(self) -> str:
        return type(self).__name__


class PaperBroker(Broker):
    """Simulated broker backed by a :class:`Portfolio`.

    Fills happen immediately at the reference price plus the configured
    slippage. Use this for dry runs and for the ``paper`` CLI command when you
    have no brokerage account, which at seventeen you will not.
    """

    def __init__(self, starting_cash: float = 10_000.0, costs: Optional[CostModel] = None,
                 *, fractional: bool = False):
        self.portfolio = Portfolio(starting_cash, costs, fractional=fractional)

    def equity(self) -> float:
        return self.portfolio.equity

    def cash(self) -> float:
        return self.portfolio.cash

    def positions(self) -> Dict[str, float]:
        return {s: p.qty for s, p in self.portfolio.positions.items() if p.is_open}

    def submit(self, order: Order, reference_price: float) -> Optional[dict]:
        today = date.today()
        if order.side is Side.BUY:
            fill = self.portfolio.buy(today, order.symbol, order.qty, reference_price, order.tag)
        else:
            fill = self.portfolio.sell(today, order.symbol, order.qty, reference_price, order.tag)
        if fill is None:
            return None
        return {
            "symbol": fill.symbol,
            "side": fill.side.value,
            "qty": fill.qty,
            "price": round(fill.price, 4),
            "commission": round(fill.commission, 4),
            "status": "filled",
        }

    def mark(self, prices: Dict[str, float]) -> None:
        self.portfolio.mark(date.today(), prices)


class AlpacaPaperBroker(Broker):
    """Thin Alpaca paper trading client built on the standard library.

    Credentials come from the environment:

    ``ALPACA_API_KEY_ID`` and ``ALPACA_API_SECRET_KEY``

    Never commit those to the repository. This project's .gitignore already
    excludes .env for that reason.
    """

    def __init__(self, key_id: Optional[str] = None, secret_key: Optional[str] = None,
                 base_url: str = PAPER_HOST, timeout: float = 15.0):
        if not base_url.startswith(PAPER_HOST):
            raise BrokerError(
                f"refusing to connect to {base_url!r}. This client only talks to {PAPER_HOST}."
            )
        self.base_url = base_url.rstrip("/")
        self.timeout = timeout
        self.key_id = key_id or os.environ.get("ALPACA_API_KEY_ID", "")
        self.secret_key = secret_key or os.environ.get("ALPACA_API_SECRET_KEY", "")
        if not self.key_id or not self.secret_key:
            raise BrokerError(
                "missing Alpaca paper credentials. Set ALPACA_API_KEY_ID and "
                "ALPACA_API_SECRET_KEY in your environment."
            )

    # ------------------------------------------------------------------

    def _request(self, method: str, path: str, body: Optional[dict] = None) -> dict:
        url = f"{self.base_url}/v2/{path.lstrip('/')}"
        payload = json.dumps(body).encode() if body is not None else None
        request = urllib.request.Request(
            url,
            data=payload,
            method=method,
            headers={
                "APCA-API-KEY-ID": self.key_id,
                "APCA-API-SECRET-KEY": self.secret_key,
                "Content-Type": "application/json",
            },
        )
        try:
            with urllib.request.urlopen(request, timeout=self.timeout) as response:
                raw = response.read()
                return json.loads(raw) if raw else {}
        except urllib.error.HTTPError as exc:
            detail = exc.read().decode("utf-8", "replace")[:300]
            raise BrokerError(f"alpaca {method} {path} failed [{exc.code}]: {detail}") from exc
        except (urllib.error.URLError, OSError, TimeoutError) as exc:
            raise BrokerError(f"alpaca {method} {path} unreachable: {exc}") from exc

    # ------------------------------------------------------------------

    def account(self) -> dict:
        return self._request("GET", "account")

    def equity(self) -> float:
        return float(self.account().get("equity", 0.0))

    def cash(self) -> float:
        return float(self.account().get("cash", 0.0))

    def positions(self) -> Dict[str, float]:
        rows = self._request("GET", "positions")
        return {row["symbol"].upper(): float(row["qty"]) for row in rows if float(row["qty"]) > 0}

    def submit(self, order: Order, reference_price: float) -> Optional[dict]:
        body = {
            "symbol": order.symbol.upper(),
            "qty": str(order.qty),
            "side": order.side.value,
            "type": order.type.value,
            "time_in_force": "day",
            "client_order_id": f"tb-{order.tag[:20]}-{date.today().isoformat()}"[:48],
        }
        if order.limit_price is not None:
            body["limit_price"] = str(round(order.limit_price, 2))
        if order.stop_price is not None:
            body["stop_price"] = str(round(order.stop_price, 2))
        return self._request("POST", "orders", body)

    def cancel_all(self) -> None:
        self._request("DELETE", "orders")

    def describe(self) -> str:
        return f"AlpacaPaperBroker({self.base_url})"


def build_broker(kind: str, **kwargs) -> Broker:
    if kind == "paper":
        return PaperBroker(**kwargs)
    if kind == "alpaca":
        return AlpacaPaperBroker()
    raise ValueError(f"unknown broker {kind!r}; expected 'paper' or 'alpaca'")
