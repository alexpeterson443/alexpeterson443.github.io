"""Human readable output: a terminal summary and a standalone HTML report."""

from __future__ import annotations

import html
import math
from typing import List, Optional, Sequence

from .core import BacktestResult, EquityPoint

SPARK = "▁▂▃▄▅▆▇█"


def _pct(value: Optional[float], places: int = 2) -> str:
    if value is None:
        return "n/a"
    if isinstance(value, float) and math.isinf(value):
        return "inf"
    return f"{value * 100:.{places}f}%"


def _money(value: Optional[float]) -> str:
    if value is None:
        return "n/a"
    return f"${value:,.2f}"


def _ratio(value: Optional[float]) -> str:
    if value is None:
        return "n/a"
    if isinstance(value, float) and math.isinf(value):
        return "inf"
    return f"{value:.2f}"


def sparkline(values: Sequence[float], width: int = 60) -> str:
    """Compress an equity curve into a single line of block characters."""
    if not values:
        return ""
    step = max(len(values) // width, 1)
    sampled = values[::step][:width]
    low, high = min(sampled), max(sampled)
    if high - low < 1e-12:
        return SPARK[0] * len(sampled)
    scale = len(SPARK) - 1
    return "".join(SPARK[int((v - low) / (high - low) * scale)] for v in sampled)


def text_report(result: BacktestResult, *, show_trades: int = 10) -> str:
    """Render the full backtest summary for a terminal."""
    m = result.metrics
    lines: List[str] = []
    rule = "=" * 68

    lines.append(rule)
    lines.append(f"  {result.strategy}")
    lines.append(f"  {', '.join(result.symbols)}   {m.get('start')} to {m.get('end')}")
    lines.append(rule)

    equity = [p.equity for p in result.equity_curve]
    if equity:
        lines.append("")
        lines.append("  " + sparkline(equity))
        lines.append(f"  {_money(equity[0])}{' ' * 44}{_money(equity[-1])}")

    lines.append("")
    lines.append("  RETURNS")
    lines.append(f"    Starting equity      {_money(m.get('starting_equity')):>16}")
    lines.append(f"    Ending equity        {_money(m.get('ending_equity')):>16}")
    lines.append(f"    Total return         {_pct(m.get('total_return')):>16}")
    lines.append(f"    CAGR                 {_pct(m.get('cagr')):>16}")
    if "benchmark_return" in m:
        lines.append(f"    Buy and hold         {_pct(m.get('benchmark_return')):>16}")
        lines.append(f"    Excess vs benchmark  {_pct(m.get('excess_return')):>16}")

    lines.append("")
    lines.append("  RISK")
    lines.append(f"    Max drawdown         {_pct(m.get('max_drawdown')):>16}")
    lines.append(f"    Drawdown length      {str(m.get('max_drawdown_days', 0)) + ' days':>16}")
    lines.append(f"    Recovered            {str(m.get('drawdown_recovered')):>16}")
    lines.append(f"    Annual volatility    {_pct(m.get('annual_volatility')):>16}")
    lines.append(f"    Sharpe ratio         {_ratio(m.get('sharpe')):>16}")
    lines.append(f"    Sortino ratio        {_ratio(m.get('sortino')):>16}")
    lines.append(f"    Calmar ratio         {_ratio(m.get('calmar')):>16}")
    lines.append(f"    Time in market       {_pct(m.get('exposure'), 1):>16}")

    lines.append("")
    lines.append("  TRADES")
    lines.append(f"    Closed trades        {str(m.get('trades', 0)):>16}")
    lines.append(f"    Win rate             {_pct(m.get('win_rate'), 1):>16}")
    lines.append(f"    Profit factor        {_ratio(m.get('profit_factor')):>16}")
    lines.append(f"    Expectancy per trade {_money(m.get('expectancy')):>16}")
    lines.append(f"    Average win          {_money(m.get('avg_win')):>16}")
    lines.append(f"    Average loss         {_money(m.get('avg_loss')):>16}")
    lines.append(f"    Best / worst trade   {_money(m.get('best'))} / {_money(m.get('worst'))}")
    lines.append(f"    Avg days held        {_ratio(m.get('avg_days_held')):>16}")
    lines.append(f"    Costs paid           {_money(m.get('total_costs')):>16}")

    if result.halted_on:
        lines.append("")
        lines.append(f"  !! TRADING HALTED on {result.halted_on}: {result.halt_reason}")

    if show_trades and result.trades:
        lines.append("")
        lines.append(f"  LAST {min(show_trades, len(result.trades))} TRADES")
        header = f"    {'symbol':<8}{'entry':<12}{'exit':<12}{'qty':>8}{'pnl':>12}  reason"
        lines.append(header)
        for trade in result.trades[-show_trades:]:
            lines.append(
                f"    {trade.symbol:<8}{trade.entry_ts.isoformat():<12}{trade.exit_ts.isoformat():<12}"
                f"{trade.qty:>8g}{trade.pnl:>12,.2f}  {trade.exit_reason[:24]}"
            )

    lines.append("")
    lines.append(rule)
    return "\n".join(lines)


# ----------------------------------------------------------------------
# HTML report
# ----------------------------------------------------------------------

def _svg_curve(
    curve: Sequence[EquityPoint],
    benchmark: Optional[Sequence[EquityPoint]] = None,
    width: int = 900,
    height: int = 320,
) -> str:
    """Inline SVG line chart. No chart library, no network request."""
    if len(curve) < 2:
        return "<p>Not enough data to plot.</p>"

    pad = 44
    series = [[p.equity for p in curve]]
    if benchmark and len(benchmark) >= 2:
        series.append([p.equity for p in benchmark])
    low = min(min(s) for s in series)
    high = max(max(s) for s in series)
    span = (high - low) or 1.0

    def path_for(values: Sequence[float]) -> str:
        n = len(values)
        points = []
        for i, value in enumerate(values):
            x = pad + (width - 2 * pad) * (i / (n - 1))
            y = height - pad - (height - 2 * pad) * ((value - low) / span)
            points.append(f"{x:.1f},{y:.1f}")
        return "M " + " L ".join(points)

    grid = []
    for frac in (0, 0.25, 0.5, 0.75, 1.0):
        y = height - pad - (height - 2 * pad) * frac
        value = low + span * frac
        grid.append(f'<line x1="{pad}" y1="{y:.1f}" x2="{width - pad}" y2="{y:.1f}" class="grid"/>')
        grid.append(f'<text x="{pad - 8}" y="{y + 4:.1f}" class="axis" text-anchor="end">${value:,.0f}</text>')

    bench_path = ""
    if len(series) > 1:
        bench_path = f'<path d="{path_for(series[1])}" class="bench"/>'

    return f"""<svg viewBox="0 0 {width} {height}" width="100%" role="img" aria-label="Equity curve">
  {''.join(grid)}
  {bench_path}
  <path d="{path_for(series[0])}" class="equity"/>
  <text x="{pad}" y="{height - 12}" class="axis">{curve[0].ts}</text>
  <text x="{width - pad}" y="{height - 12}" class="axis" text-anchor="end">{curve[-1].ts}</text>
</svg>"""


def html_report(
    result: BacktestResult,
    benchmark: Optional[Sequence[EquityPoint]] = None,
    title: str = "Backtest report",
) -> str:
    """A single self contained HTML file. Open it straight in a browser."""
    m = result.metrics
    cards = [
        ("Total return", _pct(m.get("total_return")), m.get("total_return", 0) >= 0),
        ("CAGR", _pct(m.get("cagr")), m.get("cagr", 0) >= 0),
        ("Max drawdown", _pct(m.get("max_drawdown")), False),
        ("Sharpe", _ratio(m.get("sharpe")), m.get("sharpe", 0) >= 1),
        ("Win rate", _pct(m.get("win_rate"), 1), m.get("win_rate", 0) >= 0.5),
        ("Profit factor", _ratio(m.get("profit_factor")), m.get("profit_factor", 0) >= 1),
        ("Trades", str(m.get("trades", 0)), True),
        ("Costs paid", _money(m.get("total_costs")), False),
    ]
    card_html = "".join(
        f'<div class="card"><div class="label">{html.escape(label)}</div>'
        f'<div class="value {"good" if good else "bad"}">{html.escape(value)}</div></div>'
        for label, value, good in cards
    )

    rows = "".join(
        f"<tr><td>{html.escape(t.symbol)}</td><td>{t.entry_ts}</td><td>{t.exit_ts}</td>"
        f"<td>{t.qty:g}</td><td>${t.entry_price:,.2f}</td><td>${t.exit_price:,.2f}</td>"
        f'<td class="{"good" if t.is_win else "bad"}">${t.pnl:,.2f}</td>'
        f"<td>{html.escape(t.exit_reason[:40])}</td></tr>"
        for t in result.trades[-100:]
    ) or '<tr><td colspan="8">No closed trades.</td></tr>'

    halt = ""
    if result.halted_on:
        halt = f'<p class="halt">Trading halted on {result.halted_on}: {html.escape(result.halt_reason)}</p>'

    return f"""<!doctype html>
<html lang="en"><head><meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>{html.escape(title)}</title>
<style>
  :root {{ color-scheme: light dark; --bg:#0f1115; --panel:#171a21; --ink:#e6e8ee;
           --muted:#8b93a7; --good:#3fb950; --bad:#f85149; --line:#2a2f3a; }}
  body {{ margin:0; padding:32px; background:var(--bg); color:var(--ink);
          font:15px/1.55 ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, sans-serif; }}
  h1 {{ font-size:22px; margin:0 0 4px; }}
  .sub {{ color:var(--muted); margin-bottom:24px; }}
  .cards {{ display:grid; grid-template-columns:repeat(auto-fit,minmax(150px,1fr)); gap:12px; margin-bottom:24px; }}
  .card {{ background:var(--panel); border:1px solid var(--line); border-radius:10px; padding:14px 16px; }}
  .label {{ color:var(--muted); font-size:12px; text-transform:uppercase; letter-spacing:.04em; }}
  .value {{ font-size:22px; font-weight:600; margin-top:4px; }}
  .good {{ color:var(--good); }} .bad {{ color:var(--bad); }}
  .panel {{ background:var(--panel); border:1px solid var(--line); border-radius:10px; padding:16px; margin-bottom:24px; overflow-x:auto; }}
  svg .equity {{ fill:none; stroke:var(--good); stroke-width:2; }}
  svg .bench {{ fill:none; stroke:var(--muted); stroke-width:1.5; stroke-dasharray:5 4; }}
  svg .grid {{ stroke:var(--line); stroke-width:1; }}
  svg .axis {{ fill:var(--muted); font-size:11px; }}
  table {{ border-collapse:collapse; width:100%; font-size:13px; }}
  th,td {{ text-align:left; padding:7px 10px; border-bottom:1px solid var(--line); white-space:nowrap; }}
  th {{ color:var(--muted); font-weight:600; }}
  .halt {{ color:var(--bad); font-weight:600; }}
  .legend {{ color:var(--muted); font-size:12px; margin-top:8px; }}
</style></head><body>
<h1>{html.escape(result.strategy)}</h1>
<div class="sub">{html.escape(', '.join(result.symbols))} &middot; {m.get('start')} to {m.get('end')} &middot; {m.get('days', 0)} bars</div>
{halt}
<div class="cards">{card_html}</div>
<div class="panel">{_svg_curve(result.equity_curve, benchmark)}
  <div class="legend">Solid line: strategy equity. Dashed line: equal weight buy and hold.</div>
</div>
<div class="panel">
<table><thead><tr><th>Symbol</th><th>Entry</th><th>Exit</th><th>Qty</th>
<th>Entry px</th><th>Exit px</th><th>P&amp;L</th><th>Reason</th></tr></thead>
<tbody>{rows}</tbody></table>
</div>
<p class="sub">Simulated results on historical data. Past performance does not predict future returns.</p>
</body></html>"""
