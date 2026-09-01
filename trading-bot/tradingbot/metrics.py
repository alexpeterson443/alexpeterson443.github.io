"""Performance statistics for an equity curve and a list of trades."""

from __future__ import annotations

import math
from typing import Dict, List, Optional, Sequence

from .core import EquityPoint, Trade

TRADING_DAYS = 252


def daily_returns(curve: Sequence[EquityPoint]) -> List[float]:
    out: List[float] = []
    for prev, current in zip(curve, curve[1:]):
        base = prev.equity
        out.append((current.equity - base) / base if base > 0 else 0.0)
    return out


def total_return(curve: Sequence[EquityPoint]) -> float:
    if len(curve) < 2 or curve[0].equity <= 0:
        return 0.0
    return curve[-1].equity / curve[0].equity - 1.0


def cagr(curve: Sequence[EquityPoint]) -> float:
    """Compound annual growth rate, using calendar days elapsed."""
    if len(curve) < 2 or curve[0].equity <= 0 or curve[-1].equity <= 0:
        return 0.0
    years = (curve[-1].ts - curve[0].ts).days / 365.25
    if years <= 0:
        return 0.0
    return (curve[-1].equity / curve[0].equity) ** (1 / years) - 1.0


def annual_volatility(returns: Sequence[float]) -> float:
    if len(returns) < 2:
        return 0.0
    mean = sum(returns) / len(returns)
    variance = sum((r - mean) ** 2 for r in returns) / (len(returns) - 1)
    return math.sqrt(variance) * math.sqrt(TRADING_DAYS)


def sharpe(returns: Sequence[float], risk_free_rate: float = 0.0) -> float:
    """Annualised Sharpe ratio. ``risk_free_rate`` is an annual figure."""
    if len(returns) < 2:
        return 0.0
    daily_rf = risk_free_rate / TRADING_DAYS
    excess = [r - daily_rf for r in returns]
    mean = sum(excess) / len(excess)
    variance = sum((r - mean) ** 2 for r in excess) / (len(excess) - 1)
    sd = math.sqrt(variance)
    # Guard against a constant return series, where floating point noise would
    # otherwise produce an absurd ratio instead of an undefined one.
    if sd < 1e-12:
        return 0.0
    return mean / sd * math.sqrt(TRADING_DAYS)


def sortino(returns: Sequence[float], risk_free_rate: float = 0.0) -> float:
    """Like Sharpe but only penalises downside deviation."""
    if len(returns) < 2:
        return 0.0
    daily_rf = risk_free_rate / TRADING_DAYS
    excess = [r - daily_rf for r in returns]
    downside = [r for r in excess if r < 0]
    if not downside:
        return float("inf") if sum(excess) > 0 else 0.0
    dd = math.sqrt(sum(r**2 for r in downside) / len(excess))
    if dd < 1e-12:
        return 0.0
    return (sum(excess) / len(excess)) / dd * math.sqrt(TRADING_DAYS)


def max_drawdown(curve: Sequence[EquityPoint]) -> Dict[str, object]:
    """Deepest peak to trough decline, with the dates and recovery length."""
    if not curve:
        return {"max_drawdown": 0.0, "peak_date": None, "trough_date": None, "days": 0, "recovered": True}
    peak = curve[0].equity
    peak_date = curve[0].ts
    worst = 0.0
    worst_peak_date = peak_date
    worst_trough_date = peak_date
    for point in curve:
        if point.equity > peak:
            peak = point.equity
            peak_date = point.ts
        drawdown = (peak - point.equity) / peak if peak > 0 else 0.0
        if drawdown > worst:
            worst = drawdown
            worst_peak_date = peak_date
            worst_trough_date = point.ts
    recovered = any(p.ts > worst_trough_date and p.equity >= _equity_at(curve, worst_peak_date) for p in curve)
    return {
        "max_drawdown": worst,
        "peak_date": worst_peak_date,
        "trough_date": worst_trough_date,
        "days": (worst_trough_date - worst_peak_date).days,
        "recovered": recovered,
    }


def _equity_at(curve: Sequence[EquityPoint], ts) -> float:
    for point in curve:
        if point.ts == ts:
            return point.equity
    return 0.0


def trade_stats(trades: Sequence[Trade]) -> Dict[str, float]:
    """Win rate, profit factor, expectancy, and the rest of the trade table."""
    if not trades:
        return {
            "trades": 0, "win_rate": 0.0, "profit_factor": 0.0, "expectancy": 0.0,
            "avg_win": 0.0, "avg_loss": 0.0, "best": 0.0, "worst": 0.0,
            "avg_days_held": 0.0, "gross_profit": 0.0, "gross_loss": 0.0,
        }
    wins = [t for t in trades if t.is_win]
    losses = [t for t in trades if not t.is_win]
    gross_profit = sum(t.pnl for t in wins)
    gross_loss = abs(sum(t.pnl for t in losses))
    return {
        "trades": len(trades),
        "win_rate": len(wins) / len(trades),
        "profit_factor": (gross_profit / gross_loss) if gross_loss else float("inf"),
        "expectancy": sum(t.pnl for t in trades) / len(trades),
        "avg_win": (gross_profit / len(wins)) if wins else 0.0,
        "avg_loss": (-gross_loss / len(losses)) if losses else 0.0,
        "best": max(t.pnl for t in trades),
        "worst": min(t.pnl for t in trades),
        "avg_days_held": sum(t.bars_held for t in trades) / len(trades),
        "gross_profit": gross_profit,
        "gross_loss": gross_loss,
    }


def exposure(curve: Sequence[EquityPoint]) -> float:
    """Fraction of days with any capital at work in the market."""
    if not curve:
        return 0.0
    invested = sum(1 for p in curve if p.positions_value > 0)
    return invested / len(curve)


def summarize(
    curve: Sequence[EquityPoint],
    trades: Sequence[Trade],
    *,
    risk_free_rate: float = 0.0,
    benchmark: Optional[Sequence[EquityPoint]] = None,
) -> Dict[str, object]:
    """Assemble the full statistics dictionary used by reports."""
    returns = daily_returns(curve)
    drawdown = max_drawdown(curve)
    annual = cagr(curve)
    stats: Dict[str, object] = {
        "start": curve[0].ts if curve else None,
        "end": curve[-1].ts if curve else None,
        "days": len(curve),
        "starting_equity": curve[0].equity if curve else 0.0,
        "ending_equity": curve[-1].equity if curve else 0.0,
        "total_return": total_return(curve),
        "cagr": annual,
        "annual_volatility": annual_volatility(returns),
        "sharpe": sharpe(returns, risk_free_rate),
        "sortino": sortino(returns, risk_free_rate),
        "max_drawdown": drawdown["max_drawdown"],
        "max_drawdown_days": drawdown["days"],
        "drawdown_peak": drawdown["peak_date"],
        "drawdown_trough": drawdown["trough_date"],
        "drawdown_recovered": drawdown["recovered"],
        "calmar": (annual / drawdown["max_drawdown"]) if drawdown["max_drawdown"] else 0.0,
        "exposure": exposure(curve),
        "best_day": max(returns) if returns else 0.0,
        "worst_day": min(returns) if returns else 0.0,
    }
    stats.update(trade_stats(trades))
    if benchmark:
        bench_return = total_return(benchmark)
        stats["benchmark_return"] = bench_return
        stats["benchmark_cagr"] = cagr(benchmark)
        stats["benchmark_max_drawdown"] = max_drawdown(benchmark)["max_drawdown"]
        stats["excess_return"] = stats["total_return"] - bench_return
    return stats
