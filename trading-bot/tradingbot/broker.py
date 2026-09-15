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
from datetime import date, datetime
from typing import Dict, Optional

from .core import Order, Side
from .portfolio import (
    CostModel, ExposureLimit, InsufficientFunds, Portfolio, ShortingDisabled,
)

PAPER_HOST = "https://paper-api.alpaca.markets"
LIVE_HOST = "https://api.alpaca.markets"

# Live trading is gated three ways, and all three must be opened deliberately.
LIVE_ENV_GATE = "TRADINGBOT_ALLOW_LIVE"
LIVE_CONFIRM_PHRASE = "TRADE REAL MONEY"


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

    def direction(self, symbol: str) -> int:
        """+1 long, -1 short, 0 flat."""
        qty = self.positions().get(symbol.upper(), 0.0)
        return (qty > 0) - (qty < 0)

    def describe(self) -> str:
        return type(self).__name__


class PaperBroker(Broker):
    """Simulated broker backed by a :class:`Portfolio`.

    Fills happen immediately at the reference price plus the configured
    slippage. Use this for dry runs and for the ``paper`` CLI command when you
    have no brokerage account, which at seventeen you will not.
    """

    def __init__(self, starting_cash: float = 10_000.0, costs: Optional[CostModel] = None,
                 *, fractional: bool = False, allow_short: bool = False,
                 max_gross_exposure: float = 1.0):
        self.portfolio = Portfolio(
            starting_cash, costs, fractional=fractional,
            allow_short=allow_short, max_gross_exposure=max_gross_exposure,
        )
        self.last_rejection: Optional[str] = None

    def equity(self) -> float:
        return self.portfolio.equity

    def cash(self) -> float:
        return self.portfolio.cash

    def positions(self) -> Dict[str, float]:
        """Signed quantities. Negative means short."""
        return {s: p.qty for s, p in self.portfolio.positions.items() if p.is_open}

    def submit(self, order: Order, reference_price: float) -> Optional[dict]:
        """Fill immediately, or return None with the reason in ``last_rejection``.

        A real broker rejects orders it will not accept rather than raising, so
        the portfolio's refusals are translated into the same shape here.
        """
        today = date.today()
        self.last_rejection = None
        try:
            if order.side is Side.BUY:
                fill = self.portfolio.buy(today, order.symbol, order.qty, reference_price, order.tag)
            else:
                fill = self.portfolio.sell(today, order.symbol, order.qty, reference_price, order.tag)
        except (InsufficientFunds, ExposureLimit, ShortingDisabled) as exc:
            self.last_rejection = str(exc)
            return None
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


class AlpacaBroker(Broker):
    """Alpaca client built on the standard library.

    Credentials come from the environment:

    ``ALPACA_API_KEY_ID`` and ``ALPACA_API_SECRET_KEY``

    Never commit those. This project's .gitignore excludes .env for that reason.

    Live mode is deliberately awkward to reach. It requires all of:

    1. ``mode="live"`` passed explicitly in code or ``--live`` on the CLI
    2. the environment variable ``TRADINGBOT_ALLOW_LIVE=yes``
    3. ``confirm`` matching the phrase ``TRADE REAL MONEY``

    On top of that, every live order is checked against a per order notional
    cap and a daily order count cap, so a strategy bug cannot empty the account
    in one afternoon.
    """

    def __init__(
        self,
        key_id: Optional[str] = None,
        secret_key: Optional[str] = None,
        *,
        mode: str = "paper",
        confirm: str = "",
        timeout: float = 15.0,
        max_order_notional: float = 1_000.0,
        max_daily_orders: int = 20,
        base_url: Optional[str] = None,
    ):
        if mode not in ("paper", "live"):
            raise BrokerError(f"mode must be 'paper' or 'live', got {mode!r}")
        self.mode = mode
        self.live = mode == "live"

        if self.live:
            self._check_live_gates(confirm)
            resolved = base_url or LIVE_HOST
        else:
            resolved = base_url or PAPER_HOST
            if not resolved.startswith(PAPER_HOST):
                raise BrokerError(
                    f"refusing to connect to {resolved!r} in paper mode. "
                    f"Paper mode only talks to {PAPER_HOST}."
                )

        self.base_url = resolved.rstrip("/")
        self.timeout = timeout
        self.max_order_notional = max_order_notional
        self.max_daily_orders = max_daily_orders
        self._orders_today = 0
        self._order_day = date.today()
        self.last_rejection: Optional[str] = None

        self.key_id = key_id or os.environ.get("ALPACA_API_KEY_ID", "")
        self.secret_key = secret_key or os.environ.get("ALPACA_API_SECRET_KEY", "")
        if not self.key_id or not self.secret_key:
            raise BrokerError(
                f"missing Alpaca {mode} credentials. Set ALPACA_API_KEY_ID and "
                "ALPACA_API_SECRET_KEY in your environment."
            )

    @staticmethod
    def _check_live_gates(confirm: str) -> None:
        """Refuse live trading unless every gate has been opened on purpose."""
        if os.environ.get(LIVE_ENV_GATE, "").strip().lower() not in ("yes", "1", "true"):
            raise BrokerError(
                f"live trading is disabled. Set {LIVE_ENV_GATE}=yes in your environment "
                f"to enable it. Read the risk section of the README first."
            )
        if confirm.strip().upper() != LIVE_CONFIRM_PHRASE:
            raise BrokerError(
                f"live trading requires explicit confirmation. Pass the exact phrase "
                f"{LIVE_CONFIRM_PHRASE!r} to proceed."
            )

    def _guard_order(self, order: Order, reference_price: float) -> None:
        """Per order and per day caps. Applied in live mode only."""
        if not self.live:
            return
        if self._order_day != date.today():
            self._order_day = date.today()
            self._orders_today = 0
        notional = abs(order.qty) * reference_price
        if notional > self.max_order_notional:
            raise BrokerError(
                f"order for {order.symbol} is {notional:,.2f}, above the live cap of "
                f"{self.max_order_notional:,.2f}. Raise max_order_notional deliberately "
                f"if this is intended."
            )
        if self._orders_today >= self.max_daily_orders:
            raise BrokerError(
                f"daily live order cap of {self.max_daily_orders} already reached. "
                f"This is a circuit breaker against a runaway strategy."
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
        """Signed quantities. Alpaca reports shorts as a negative qty."""
        rows = self._request("GET", "positions")
        return {
            row["symbol"].upper(): float(row["qty"])
            for row in rows
            if abs(float(row["qty"])) > 0
        }

    def submit(
        self,
        order: Order,
        reference_price: float,
        *,
        take_profit: Optional[float] = None,
        stop_loss: Optional[float] = None,
    ) -> Optional[dict]:
        """Send an order. Supply both bracket legs to attach them server side.

        A bracket order is the safer shape for live trading: the stop lives at
        the broker, so it still protects the position if this process dies.
        """
        self.last_rejection = None
        try:
            self._guard_order(order, reference_price)
        except BrokerError as exc:
            self.last_rejection = str(exc)
            return None

        body = {
            "symbol": order.symbol.upper(),
            "qty": str(abs(order.qty)),
            "side": order.side.value,
            "type": order.type.value,
            "time_in_force": "day",
            "client_order_id": f"tb-{order.tag[:16]}-{datetime.now():%Y%m%d%H%M%S}"[:48],
        }
        if order.limit_price is not None:
            body["limit_price"] = str(round(order.limit_price, 2))
        if order.stop_price is not None:
            body["stop_price"] = str(round(order.stop_price, 2))
        if take_profit is not None and stop_loss is not None:
            body["order_class"] = "bracket"
            body["take_profit"] = {"limit_price": str(round(take_profit, 2))}
            body["stop_loss"] = {"stop_price": str(round(stop_loss, 2))}

        receipt = self._request("POST", "orders", body)
        self._orders_today += 1
        return receipt

    def open_orders(self) -> list:
        return self._request("GET", "orders?status=open")

    def cancel_all(self) -> None:
        self._request("DELETE", "orders")

    def close_all(self) -> None:
        """Liquidate every position. The emergency stop."""
        self._request("DELETE", "positions")

    def clock(self) -> dict:
        """Alpaca's own view of whether the market is open."""
        return self._request("GET", "clock")

    def describe(self) -> str:
        label = "LIVE" if self.live else "paper"
        return f"AlpacaBroker[{label}]({self.base_url})"


class AlpacaPaperBroker(AlpacaBroker):
    """Alpaca restricted to the paper endpoint. Cannot be pointed at live."""

    def __init__(self, key_id: Optional[str] = None, secret_key: Optional[str] = None,
                 base_url: str = PAPER_HOST, timeout: float = 15.0):
        super().__init__(key_id, secret_key, mode="paper", base_url=base_url, timeout=timeout)


def build_broker(kind: str, *, confirm: str = "", **kwargs) -> Broker:
    """Construct a broker by name.

    ``simulated`` never touches the network. ``alpaca`` uses the paper
    endpoint. ``alpaca-live`` sends real orders and is gated on all of
    TRADINGBOT_ALLOW_LIVE, the confirmation phrase, and the order caps.
    """
    if kind in ("paper", "simulated"):
        return PaperBroker(**kwargs)
    if kind == "alpaca":
        return AlpacaBroker(mode="paper")
    if kind == "alpaca-live":
        return AlpacaBroker(
            mode="live",
            confirm=confirm,
            max_order_notional=kwargs.get("max_order_notional", 1_000.0),
            max_daily_orders=kwargs.get("max_daily_orders", 20),
        )
    raise ValueError(
        f"unknown broker {kind!r}; expected 'paper', 'alpaca', or 'alpaca-live'"
    )
