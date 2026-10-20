"""Paper portfolio for binary outcome shares.

Differences from the equity portfolio that matter:

* A share is worth between 0 and 1, and at resolution it is worth exactly one
  or exactly the other. Marking to market before resolution is a guess; the
  final value is not.
* There is no shorting. To bet against YES you buy NO, which is why maximum
  loss is always the stake and never more.
* Positions are illiquid in a specific way: capital is committed until the
  market resolves, so cash drag is a real cost that a return number hides.
"""

from __future__ import annotations

import json
import os
from dataclasses import dataclass
from datetime import datetime, timezone
from typing import Dict, List, Optional


@dataclass
class PaperPosition:
    token_id: str
    market_id: str
    question: str
    outcome: str
    shares: float
    avg_price: float
    opened_at: str
    end_date: Optional[str] = None
    model: str = ""
    estimated_probability: float = 0.0

    @property
    def cost(self) -> float:
        return self.shares * self.avg_price

    @property
    def max_payout(self) -> float:
        return self.shares

    @property
    def max_loss(self) -> float:
        return self.cost

    def value_at(self, price: float) -> float:
        return self.shares * price

    def to_dict(self) -> dict:
        return dict(
            token_id=self.token_id, market_id=self.market_id, question=self.question,
            outcome=self.outcome, shares=self.shares, avg_price=self.avg_price,
            opened_at=self.opened_at, end_date=self.end_date, model=self.model,
            estimated_probability=self.estimated_probability,
        )


@dataclass
class ResolvedPosition:
    question: str
    outcome: str
    shares: float
    avg_price: float
    won: bool
    resolved_at: str

    @property
    def cost(self) -> float:
        return self.shares * self.avg_price

    @property
    def payout(self) -> float:
        return self.shares if self.won else 0.0

    @property
    def pnl(self) -> float:
        return self.payout - self.cost


class InsufficientCash(RuntimeError):
    pass


class PaperBook:
    """Tracks cash, open binary positions, and resolved outcomes."""

    def __init__(self, starting_cash: float = 500.0):
        if starting_cash <= 0:
            raise ValueError("starting cash must be positive")
        self.starting_cash = float(starting_cash)
        self.cash = float(starting_cash)
        self.positions: Dict[str, PaperPosition] = {}
        self.resolved: List[ResolvedPosition] = []
        self.log: List[dict] = []

    # ------------------------------------------------------------------

    def buy(
        self, *, token_id: str, market_id: str, question: str, outcome: str,
        shares: float, price: float, end_date: Optional[str] = None,
        model: str = "", estimated_probability: float = 0.0,
    ) -> PaperPosition:
        if shares <= 0:
            raise ValueError("shares must be positive")
        if not 0 < price < 1:
            raise ValueError(f"price {price} must be strictly between 0 and 1")
        cost = shares * price
        if cost > self.cash + 1e-9:
            raise InsufficientCash(
                f"{question[:40]}: {shares:.2f} shares at {price:.3f} costs "
                f"${cost:.2f} but only ${self.cash:.2f} is available"
            )

        existing = self.positions.get(token_id)
        if existing:
            total = existing.shares + shares
            existing.avg_price = (existing.cost + cost) / total
            existing.shares = total
            position = existing
        else:
            position = PaperPosition(
                token_id=token_id, market_id=market_id, question=question,
                outcome=outcome, shares=shares, avg_price=price,
                opened_at=_now(), end_date=end_date, model=model,
                estimated_probability=estimated_probability,
            )
            self.positions[token_id] = position

        self.cash -= cost
        self.log.append({"at": _now(), "action": "buy", "question": question[:60],
                         "outcome": outcome, "shares": round(shares, 2),
                         "price": price, "cost": round(cost, 2)})
        return position

    def sell(self, token_id: str, shares: float, price: float) -> float:
        """Exit before resolution, at whatever the book will pay."""
        position = self.positions.get(token_id)
        if position is None:
            return 0.0
        shares = min(shares, position.shares)
        proceeds = shares * price
        self.cash += proceeds
        position.shares -= shares
        if position.shares <= 1e-9:
            del self.positions[token_id]
        self.log.append({"at": _now(), "action": "sell", "question": position.question[:60],
                         "shares": round(shares, 2), "price": price,
                         "proceeds": round(proceeds, 2)})
        return proceeds

    def resolve(self, token_id: str, won: bool) -> float:
        """Settle a position at $1 or $0. This is the only certain valuation."""
        position = self.positions.pop(token_id, None)
        if position is None:
            return 0.0
        payout = position.shares if won else 0.0
        self.cash += payout
        self.resolved.append(ResolvedPosition(
            question=position.question, outcome=position.outcome,
            shares=position.shares, avg_price=position.avg_price,
            won=won, resolved_at=_now(),
        ))
        self.log.append({"at": _now(), "action": "resolve",
                         "question": position.question[:60], "won": won,
                         "payout": round(payout, 2),
                         "pnl": round(payout - position.cost, 2)})
        return payout

    # ------------------------------------------------------------------

    @property
    def committed(self) -> float:
        return sum(p.cost for p in self.positions.values())

    def equity(self, prices: Optional[Dict[str, float]] = None) -> float:
        """Cash plus positions marked at current prices, or at cost if unknown."""
        prices = prices or {}
        value = sum(
            p.value_at(prices.get(p.token_id, p.avg_price))
            for p in self.positions.values()
        )
        return self.cash + value

    @property
    def worst_case_equity(self) -> float:
        """Cash alone. What is left if every open position resolves to zero."""
        return self.cash

    @property
    def best_case_equity(self) -> float:
        return self.cash + sum(p.max_payout for p in self.positions.values())

    def stats(self) -> dict:
        wins = [r for r in self.resolved if r.won]
        staked = sum(r.cost for r in self.resolved)
        returned = sum(r.payout for r in self.resolved)
        return {
            "starting_cash": round(self.starting_cash, 2),
            "cash": round(self.cash, 2),
            "committed": round(self.committed, 2),
            "open_positions": len(self.positions),
            "resolved": len(self.resolved),
            "win_rate": round(len(wins) / len(self.resolved), 4) if self.resolved else 0.0,
            "realised_pnl": round(returned - staked, 2),
            "return_on_staked": round((returned - staked) / staked, 4) if staked else 0.0,
            "worst_case_equity": round(self.worst_case_equity, 2),
            "best_case_equity": round(self.best_case_equity, 2),
        }

    # ------------------------------------------------------------------

    def save(self, path: str) -> None:
        payload = {
            "saved_at": _now(),
            "starting_cash": self.starting_cash,
            "cash": self.cash,
            "positions": [p.to_dict() for p in self.positions.values()],
            "resolved": [
                dict(question=r.question, outcome=r.outcome, shares=r.shares,
                     avg_price=r.avg_price, won=r.won, resolved_at=r.resolved_at)
                for r in self.resolved
            ],
            "log": self.log[-500:],
        }
        os.makedirs(os.path.dirname(os.path.abspath(path)) or ".", exist_ok=True)
        temp = f"{path}.tmp"
        with open(temp, "w", encoding="utf-8") as handle:
            json.dump(payload, handle, indent=2)
        os.replace(temp, path)

    @classmethod
    def load(cls, path: str) -> "PaperBook":
        with open(path, encoding="utf-8") as handle:
            payload = json.load(handle)
        book = cls(float(payload.get("starting_cash", 500.0)))
        book.cash = float(payload.get("cash", book.starting_cash))
        for row in payload.get("positions", []):
            book.positions[row["token_id"]] = PaperPosition(**row)
        for row in payload.get("resolved", []):
            book.resolved.append(ResolvedPosition(**row))
        book.log = payload.get("log", [])
        return book


def _now() -> str:
    return datetime.now(timezone.utc).isoformat(timespec="seconds")
