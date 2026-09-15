"""Robustness analysis.

A single backtest number is close to meaningless. These tools ask the harder
question: would this result have survived being tested honestly?

* :func:`walk_forward` refits parameters on a rolling window and only ever
  scores the untouched window that follows. This is the closest thing to an
  honest simulation of running a strategy you re-tune periodically.
* :func:`monte_carlo` reshuffles the realised trade sequence to show how much
  of the equity curve was ordering luck.
* :func:`parameter_surface` reports whether good results sit on a broad plateau
  or a lone spike. A spike is almost always an artefact.
"""

from __future__ import annotations

import itertools
import random
import statistics
from dataclasses import dataclass, field
from datetime import date
from typing import Dict, List, Optional, Sequence

from .core import Bar, Trade
from .engine import Backtester, EngineConfig
from .metrics import max_drawdown
from .strategies import build as build_strategy


# ----------------------------------------------------------------------
# walk forward
# ----------------------------------------------------------------------

@dataclass
class WalkForwardFold:
    index: int
    train_start: date
    train_end: date
    test_start: date
    test_end: date
    best_params: dict
    train_metric: float
    test_return: float
    test_sharpe: float
    test_drawdown: float
    test_trades: int


@dataclass
class WalkForwardResult:
    folds: List[WalkForwardFold] = field(default_factory=list)
    strategy: str = ""
    metric: str = "sharpe"

    @property
    def total_return(self) -> float:
        """Compounded return across every out of sample window."""
        compounded = 1.0
        for fold in self.folds:
            compounded *= (1 + fold.test_return)
        return compounded - 1.0

    @property
    def positive_folds(self) -> int:
        return sum(1 for f in self.folds if f.test_return > 0)

    @property
    def consistency(self) -> float:
        """Fraction of out of sample windows that made money."""
        return self.positive_folds / len(self.folds) if self.folds else 0.0

    @property
    def parameter_stability(self) -> float:
        """Fraction of folds that chose the single most common parameter set.

        A strategy whose optimal parameters jump around every window has not
        found anything durable, whatever its headline return.
        """
        if not self.folds:
            return 0.0
        counts: Dict[str, int] = {}
        for fold in self.folds:
            key = repr(sorted(fold.best_params.items()))
            counts[key] = counts.get(key, 0) + 1
        return max(counts.values()) / len(self.folds)

    def summary(self) -> dict:
        returns = [f.test_return for f in self.folds]
        return {
            "folds": len(self.folds),
            "total_return": self.total_return,
            "mean_fold_return": statistics.mean(returns) if returns else 0.0,
            "median_fold_return": statistics.median(returns) if returns else 0.0,
            "worst_fold": min(returns) if returns else 0.0,
            "best_fold": max(returns) if returns else 0.0,
            "consistency": self.consistency,
            "parameter_stability": self.parameter_stability,
            "mean_sharpe": statistics.mean([f.test_sharpe for f in self.folds]) if self.folds else 0.0,
            "worst_drawdown": max([f.test_drawdown for f in self.folds]) if self.folds else 0.0,
        }


def _slice(series: Dict[str, Sequence[Bar]], start: date, end: date) -> Dict[str, List[Bar]]:
    out = {}
    for symbol, bars in series.items():
        window = [b for b in bars if start <= _day(b.ts) <= end]
        if window:
            out[symbol] = window
    return out


def _day(ts) -> date:
    return ts.date() if hasattr(ts, "date") and not isinstance(ts, date) else ts


def walk_forward(
    strategy_name: str,
    series: Dict[str, Sequence[Bar]],
    grid: Dict[str, list],
    config: Optional[EngineConfig] = None,
    *,
    train_days: int = 504,
    test_days: int = 126,
    metric: str = "sharpe",
    warmup_days: int = 0,
) -> WalkForwardResult:
    """Roll a train and test window forward through history.

    Parameters are chosen on the training window only, then scored once on the
    test window that follows it, and never revisited. The reported return is
    the compounded sequence of those untouched test windows.
    """
    config = config or EngineConfig()
    all_days = sorted({_day(b.ts) for bars in series.values() for b in bars})
    if len(all_days) < train_days + test_days:
        raise ValueError(
            f"need at least {train_days + test_days} trading days for this split, "
            f"only {len(all_days)} available"
        )

    names = sorted(grid)
    combos = list(itertools.product(*(grid[n] for n in names)))
    result = WalkForwardResult(strategy=strategy_name, metric=metric)

    cursor = 0
    fold_index = 0
    while cursor + train_days + test_days <= len(all_days):
        train_days_slice = all_days[cursor : cursor + train_days]
        test_days_slice = all_days[cursor + train_days : cursor + train_days + test_days]

        train = _slice(series, train_days_slice[0], train_days_slice[-1])
        # The test window carries enough leading history to warm indicators up,
        # otherwise every fold would start blind.
        lead = all_days[max(0, cursor + train_days - warmup_days)]
        test = _slice(series, lead, test_days_slice[-1])

        best_params, best_score = None, float("-inf")
        for combo in combos:
            params = dict(zip(names, combo))
            try:
                run = Backtester(build_strategy(strategy_name, params), config).run(train)
            except (ValueError, KeyError):
                continue
            score = run.metrics.get(metric, 0.0)
            if score > best_score:
                best_params, best_score = params, score

        if best_params is None:
            cursor += test_days
            continue

        try:
            scored = Backtester(build_strategy(strategy_name, best_params), config).run(test)
        except (ValueError, KeyError):
            cursor += test_days
            continue

        # Score only the untouched portion, not the warmup lead in.
        curve = [p for p in scored.equity_curve if _day(p.ts) >= test_days_slice[0]]
        fold_return = (curve[-1].equity / curve[0].equity - 1.0) if len(curve) > 1 else 0.0

        result.folds.append(
            WalkForwardFold(
                index=fold_index,
                train_start=train_days_slice[0],
                train_end=train_days_slice[-1],
                test_start=test_days_slice[0],
                test_end=test_days_slice[-1],
                best_params=best_params,
                train_metric=best_score,
                test_return=fold_return,
                test_sharpe=scored.metrics.get("sharpe", 0.0),
                test_drawdown=max_drawdown(curve)["max_drawdown"] if curve else 0.0,
                test_trades=len([t for t in scored.trades if t.exit_ts >= test_days_slice[0]]),
            )
        )
        fold_index += 1
        cursor += test_days

    return result


# ----------------------------------------------------------------------
# monte carlo
# ----------------------------------------------------------------------

@dataclass
class MonteCarloResult:
    trials: int
    final_equities: List[float]
    drawdowns: List[float]
    starting_equity: float
    method: str = "bootstrap"

    def percentile(self, values: Sequence[float], pct: float) -> float:
        if not values:
            return 0.0
        ordered = sorted(values)
        index = min(int(pct / 100.0 * len(ordered)), len(ordered) - 1)
        return ordered[index]

    def summary(self) -> dict:
        returns = [(e / self.starting_equity - 1.0) for e in self.final_equities]
        return {
            "trials": self.trials,
            "method": self.method,
            "median_return": self.percentile(returns, 50),
            "p05_return": self.percentile(returns, 5),
            "p95_return": self.percentile(returns, 95),
            "worst_return": min(returns) if returns else 0.0,
            "probability_of_loss": (
                sum(1 for r in returns if r < 0) / len(returns) if returns else 0.0
            ),
            "median_drawdown": self.percentile(self.drawdowns, 50),
            "p95_drawdown": self.percentile(self.drawdowns, 95),
            "worst_drawdown": max(self.drawdowns) if self.drawdowns else 0.0,
        }


def monte_carlo(
    trades: Sequence[Trade],
    starting_equity: float,
    *,
    trials: int = 1_000,
    seed: Optional[int] = 42,
    method: str = "bootstrap",
) -> MonteCarloResult:
    """Resample the realised trades to expose how much of the result was luck.

    Two methods, and the difference between them matters:

    ``bootstrap`` (default) draws the same number of trades *with replacement*
    from the observed distribution. Both final equity and drawdown vary, so it
    answers "what else could this strategy plausibly have returned".

    ``shuffle`` keeps exactly the observed trades and only reorders them. Note
    that compounding is commutative, so every shuffle ends at the identical
    final equity by construction. Shuffling therefore says nothing about return
    and is only informative about *drawdown*, which does depend on order.

    Either way, a p95 drawdown far worse than the backtest's own is the signal
    that the backtest's smooth equity curve was a fortunate ordering.
    """
    if not trades:
        raise ValueError("monte carlo needs at least one closed trade")
    if method not in ("bootstrap", "shuffle"):
        raise ValueError("method must be 'bootstrap' or 'shuffle'")
    rng = random.Random(seed)
    returns = [t.return_pct for t in trades]
    n = len(returns)

    final_equities: List[float] = []
    drawdowns: List[float] = []
    for _ in range(trials):
        if method == "bootstrap":
            order = [returns[rng.randrange(n)] for _ in range(n)]
        else:
            order = returns[:]
            rng.shuffle(order)

        equity = starting_equity
        peak = equity
        worst = 0.0
        for ret in order:
            # Each trade risks the same fraction of equity it originally did.
            equity *= (1 + ret)
            peak = max(peak, equity)
            worst = max(worst, (peak - equity) / peak if peak > 0 else 0.0)
        final_equities.append(equity)
        drawdowns.append(worst)

    return MonteCarloResult(trials, final_equities, drawdowns, starting_equity, method)


# ----------------------------------------------------------------------
# parameter surface
# ----------------------------------------------------------------------

def parameter_surface(
    strategy_name: str,
    series: Dict[str, Sequence[Bar]],
    grid: Dict[str, list],
    config: Optional[EngineConfig] = None,
    *,
    metric: str = "sharpe",
) -> List[dict]:
    """Score every parameter combination, sorted best first.

    Read the spread, not the top row. A best result far above its neighbours is
    a spike, and spikes do not repeat out of sample.
    """
    config = config or EngineConfig()
    names = sorted(grid)
    rows = []
    for combo in itertools.product(*(grid[n] for n in names)):
        params = dict(zip(names, combo))
        try:
            run = Backtester(build_strategy(strategy_name, params), config).run(series)
        except (ValueError, KeyError):
            continue
        rows.append(
            {
                "params": params,
                "score": run.metrics.get(metric, 0.0),
                "return": run.metrics.get("total_return", 0.0),
                "drawdown": run.metrics.get("max_drawdown", 0.0),
                "trades": run.metrics.get("trades", 0),
            }
        )
    rows.sort(key=lambda r: r["score"], reverse=True)
    return rows


def plateau_score(rows: Sequence[dict], top_fraction: float = 0.2) -> float:
    """How close the best result is to the average of the top slice.

    Near 1.0 means a broad plateau, which is what a durable edge looks like.
    Near 0 means the best score is a lone spike surrounded by nothing.
    """
    if not rows:
        return 0.0
    scores = [r["score"] for r in rows]
    best = scores[0]
    if best <= 0:
        return 0.0
    cutoff = max(int(len(scores) * top_fraction), 1)
    return statistics.mean(scores[:cutoff]) / best
