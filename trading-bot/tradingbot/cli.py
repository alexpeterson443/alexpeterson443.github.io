"""Command line interface.

    python run.py strategies
    python run.py backtest --symbols AAPL,MSFT --strategy sma_crossover
    python run.py optimize --symbols AAPL --strategy sma_crossover --grid fast=5,10,20 slow=50,100
    python run.py signals  --symbols AAPL,MSFT --strategy macd_trend
    python run.py paper    --symbols AAPL,MSFT --strategy macd_trend --state paper_state.json
    python run.py fetch    --symbols AAPL --out data/
"""

from __future__ import annotations

import argparse
import itertools
import json
import os
import sys
from datetime import date, timedelta
from typing import Dict, List, Optional

from . import data as data_mod
from . import report as report_mod
from . import strategies as strategies_mod
from .broker import BrokerError, PaperBroker, build_broker
from .engine import Backtester, EngineConfig
from .live import Trader
from .portfolio import CostModel
from .risk import RiskConfig, SizingMode

DISCLAIMER = (
    "This is educational software. It simulates trading and, at most, sends orders to a "
    "paper account. It is not investment advice, and backtested results routinely fail to "
    "repeat in live markets."
)


# ----------------------------------------------------------------------
# argument helpers
# ----------------------------------------------------------------------

def _symbols(value: str) -> List[str]:
    out = [s.strip().upper() for s in value.replace(" ", ",").split(",") if s.strip()]
    if not out:
        raise argparse.ArgumentTypeError("supply at least one symbol")
    return out


def _params(pairs: Optional[List[str]]) -> Dict[str, float]:
    """Parse ``fast=20 slow=50`` into a typed dictionary."""
    out: Dict[str, float] = {}
    for pair in pairs or []:
        if "=" not in pair:
            raise argparse.ArgumentTypeError(f"expected name=value, got {pair!r}")
        key, _, raw = pair.partition("=")
        out[key.strip()] = _coerce(raw.strip())
    return out


def _coerce(text: str):
    for cast in (int, float):
        try:
            return cast(text)
        except ValueError:
            continue
    lowered = text.lower()
    if lowered in ("none", "null", ""):
        return None
    if lowered in ("true", "false"):
        return lowered == "true"
    return text


def _grid(pairs: List[str]) -> Dict[str, list]:
    """Parse ``fast=5,10,20`` into ``{'fast': [5, 10, 20]}``."""
    out: Dict[str, list] = {}
    for pair in pairs:
        if "=" not in pair:
            raise argparse.ArgumentTypeError(f"expected name=v1,v2,..., got {pair!r}")
        key, _, raw = pair.partition("=")
        values = [_coerce(v.strip()) for v in raw.split(",") if v.strip()]
        if not values:
            raise argparse.ArgumentTypeError(f"no values supplied for {key!r}")
        out[key.strip()] = values
    return out


def _risk_from_args(args) -> RiskConfig:
    config = RiskConfig(
        sizing=args.sizing,
        fraction=args.fraction,
        risk_per_trade=args.risk_per_trade,
        atr_stop_mult=args.atr_stop_mult,
        max_position_pct=args.max_position_pct,
        max_open_positions=args.max_positions,
        stop_loss_pct=args.stop_loss,
        take_profit_pct=args.take_profit,
        trailing_stop_pct=args.trailing_stop,
        max_drawdown_pct=args.max_drawdown,
    )
    config.validate()
    return config


def _engine_from_args(args) -> EngineConfig:
    return EngineConfig(
        starting_cash=args.cash,
        costs=CostModel(
            commission_per_trade=args.commission,
            slippage_bps=args.slippage_bps,
        ),
        risk=_risk_from_args(args),
        fractional=args.fractional,
        risk_free_rate=args.risk_free_rate,
        verbose=args.verbose,
    )


def _load(args) -> Dict[str, list]:
    return data_mod.load_universe(
        args.symbols,
        args.start,
        args.end,
        provider=args.provider,
        csv_dir=args.csv_dir,
        seed=args.seed,
    )


# ----------------------------------------------------------------------
# commands
# ----------------------------------------------------------------------

def cmd_strategies(args) -> int:
    print("Available strategies:\n")
    print("\n".join(strategies_mod.catalog()))
    print("\nPass parameters with --param, for example: --param fast=10 slow=40")
    return 0


def cmd_backtest(args) -> int:
    series = _load(args)
    strategy = strategies_mod.build(args.strategy, _params(args.param))
    engine = Backtester(strategy, _engine_from_args(args))
    result = engine.run(series)

    print(report_mod.text_report(result, show_trades=args.show_trades))
    print(f"\n  Note: {DISCLAIMER}\n")

    if args.html:
        all_dates = sorted({bar.ts for bars in series.values() for bar in bars})
        page = report_mod.html_report(
            result, engine._benchmark_curve(all_dates), title=f"{strategy.describe()} backtest"
        )
        os.makedirs(os.path.dirname(os.path.abspath(args.html)) or ".", exist_ok=True)
        with open(args.html, "w", encoding="utf-8") as handle:
            handle.write(page)
        print(f"  HTML report written to {args.html}")

    if args.json:
        payload = {
            "strategy": result.strategy,
            "symbols": result.symbols,
            "metrics": {k: (v.isoformat() if isinstance(v, date) else v)
                        for k, v in result.metrics.items()},
            "trades": [
                {"symbol": t.symbol, "entry": t.entry_ts.isoformat(), "exit": t.exit_ts.isoformat(),
                 "qty": t.qty, "entry_price": round(t.entry_price, 4),
                 "exit_price": round(t.exit_price, 4), "pnl": round(t.pnl, 2),
                 "reason": t.exit_reason}
                for t in result.trades
            ],
        }
        with open(args.json, "w", encoding="utf-8") as handle:
            json.dump(payload, handle, indent=2)
        print(f"  JSON results written to {args.json}")
    return 0


def cmd_optimize(args) -> int:
    """Grid search with an out of sample holdout.

    A parameter set that only shines in sample is the signature of curve
    fitting, so both columns are printed and the ranking uses the holdout.
    """
    series = _load(args)
    grid = _grid(args.grid)
    names = sorted(grid)
    combos = list(itertools.product(*(grid[n] for n in names)))
    if not combos:
        print("empty grid", file=sys.stderr)
        return 2

    all_dates = sorted({bar.ts for bars in series.values() for bar in bars})
    split_at = all_dates[int(len(all_dates) * args.split)]
    in_sample = {s: [b for b in bars if b.ts <= split_at] for s, bars in series.items()}
    out_sample = {s: [b for b in bars if b.ts > split_at] for s, bars in series.items()}
    engine_config = _engine_from_args(args)

    print(f"Grid searching {len(combos)} combinations of {', '.join(names)}")
    print(f"In sample through {split_at}, out of sample after.\n")

    rows = []
    for combo in combos:
        params = dict(zip(names, combo))
        try:
            strategy_in = strategies_mod.build(args.strategy, params)
            strategy_out = strategies_mod.build(args.strategy, params)
        except ValueError as exc:
            print(f"  skipped {params}: {exc}")
            continue
        try:
            r_in = Backtester(strategy_in, engine_config).run(in_sample)
            r_out = Backtester(strategy_out, engine_config).run(out_sample)
        except (ValueError, KeyError) as exc:
            print(f"  skipped {params}: {exc}")
            continue
        rows.append({
            "params": params,
            "in_return": r_in.metrics["total_return"],
            "in_sharpe": r_in.metrics["sharpe"],
            "out_return": r_out.metrics["total_return"],
            "out_sharpe": r_out.metrics["sharpe"],
            "out_dd": r_out.metrics["max_drawdown"],
            "out_trades": r_out.metrics["trades"],
        })

    if not rows:
        print("no valid parameter combinations", file=sys.stderr)
        return 2

    key = "out_sharpe" if args.rank == "sharpe" else "out_return"
    rows.sort(key=lambda r: r[key], reverse=True)

    label_width = max(len(", ".join(f"{k}={v}" for k, v in r["params"].items())) for r in rows) + 2
    print(f"  {'params':<{label_width}}{'in ret':>9}{'in shrp':>9}{'out ret':>9}{'out shrp':>10}{'out dd':>9}{'trades':>8}")
    print("  " + "-" * (label_width + 54))
    for row in rows[: args.top]:
        label = ", ".join(f"{k}={v}" for k, v in row["params"].items())
        print(f"  {label:<{label_width}}{row['in_return']:>8.1%}{row['in_sharpe']:>9.2f}"
              f"{row['out_return']:>9.1%}{row['out_sharpe']:>10.2f}{row['out_dd']:>8.1%}{row['out_trades']:>8}")

    best = rows[0]
    print(f"\n  Best on the holdout: {best['params']}")
    if best["in_return"] > 0 and best["out_return"] < 0:
        print("  Warning: this setting made money in sample and lost it out of sample. That is overfitting.")
    print(f"\n  Note: {DISCLAIMER}\n")
    return 0


def cmd_signals(args) -> int:
    """Print what the strategy would do right now, without sending anything."""
    broker = PaperBroker(args.cash, CostModel(slippage_bps=args.slippage_bps))
    trader = Trader(
        strategies_mod.build(args.strategy, _params(args.param)),
        broker,
        args.symbols,
        risk=_risk_from_args(args),
        provider=args.provider,
        csv_dir=args.csv_dir,
        lookback_days=args.lookback,
        state_path=args.state,
        dry_run=True,
    )
    series = trader.fetch()
    intents = trader.plan(series)
    print(f"\nSignals for {', '.join(args.symbols)} using {trader.strategy.describe()}")
    print(f"Data through {max(bars[-1].ts for bars in series.values())}\n")
    if not intents:
        print("  No action. Nothing meets the entry or exit rules.")
    for intent in intents:
        print(f"  {intent['side'].value.upper():<5} {intent['qty']:>6g} {intent['symbol']:<6}"
              f" near {intent['price']:>9.2f}   {intent['reason']}")
    print(f"\n  Note: {DISCLAIMER}\n")
    return 0


def cmd_paper(args) -> int:
    try:
        broker = (
            build_broker("alpaca")
            if args.broker == "alpaca"
            else PaperBroker(args.cash, CostModel(slippage_bps=args.slippage_bps))
        )
    except BrokerError as exc:
        print(f"broker error: {exc}", file=sys.stderr)
        return 2

    trader = Trader(
        strategies_mod.build(args.strategy, _params(args.param)),
        broker,
        args.symbols,
        risk=_risk_from_args(args),
        provider=args.provider,
        csv_dir=args.csv_dir,
        lookback_days=args.lookback,
        state_path=args.state,
        dry_run=args.dry_run,
    )
    print(f"\nPaper session: {trader.strategy.describe()} on {', '.join(args.symbols)}")
    print(f"Broker: {broker.describe()}{'  [DRY RUN]' if args.dry_run else ''}\n")
    trader.step()
    print(f"\n{json.dumps(trader.status(), indent=2, default=str)}")
    print(f"\n  Note: {DISCLAIMER}\n")
    return 0


def cmd_fetch(args) -> int:
    series = _load(args)
    os.makedirs(args.out, exist_ok=True)
    for symbol, bars in series.items():
        path = os.path.join(args.out, f"{symbol}.csv")
        data_mod.write_csv_bars(path, bars)
        print(f"  {symbol:<8}{len(bars):>6} bars  {bars[0].ts} to {bars[-1].ts}  ->  {path}")
    return 0


# ----------------------------------------------------------------------
# parser
# ----------------------------------------------------------------------

def build_parser() -> argparse.ArgumentParser:
    today = date.today()
    parser = argparse.ArgumentParser(
        prog="tradingbot",
        description="Backtesting and paper trading bot. No live money, by design.",
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog=DISCLAIMER,
    )
    subparsers = parser.add_subparsers(dest="command", required=True)

    def add_data_args(sub, default_days: int = 365 * 5):
        sub.add_argument("--symbols", type=_symbols, required=True, help="comma separated tickers")
        sub.add_argument("--start", default=(today - timedelta(days=default_days)).isoformat())
        sub.add_argument("--end", default=today.isoformat())
        sub.add_argument("--provider", default="yahoo", choices=data_mod.PROVIDERS)
        sub.add_argument("--csv-dir", default=None, help="directory of SYMBOL.csv files")
        sub.add_argument("--seed", type=int, default=None, help="seed for the synthetic provider")

    def add_risk_args(sub):
        sub.add_argument("--cash", type=float, default=10_000.0)
        sub.add_argument("--sizing", default=SizingMode.FIXED_FRACTION, choices=SizingMode.ALL)
        sub.add_argument("--fraction", type=float, default=0.2, help="equity fraction per position")
        sub.add_argument("--risk-per-trade", type=float, default=0.01, help="for atr_risk sizing")
        sub.add_argument("--atr-stop-mult", type=float, default=2.0)
        sub.add_argument("--max-position-pct", type=float, default=0.35)
        sub.add_argument("--max-positions", type=int, default=5)
        sub.add_argument("--stop-loss", type=float, default=0.08, help="fraction, or 0 to disable")
        sub.add_argument("--take-profit", type=float, default=None)
        sub.add_argument("--trailing-stop", type=float, default=None)
        sub.add_argument("--max-drawdown", type=float, default=0.25, help="kill switch, 0 to disable")
        sub.add_argument("--commission", type=float, default=0.0)
        sub.add_argument("--slippage-bps", type=float, default=5.0)
        sub.add_argument("--fractional", action="store_true", help="allow fractional shares")
        sub.add_argument("--risk-free-rate", type=float, default=0.0)

    def add_strategy_args(sub):
        sub.add_argument("--strategy", default="sma_crossover", choices=sorted(strategies_mod.REGISTRY))
        sub.add_argument("--param", nargs="*", default=[], metavar="NAME=VALUE")

    listing = subparsers.add_parser("strategies", help="list strategies and their parameters")
    listing.set_defaults(func=cmd_strategies)

    backtest = subparsers.add_parser("backtest", help="run a strategy over history")
    add_data_args(backtest)
    add_strategy_args(backtest)
    add_risk_args(backtest)
    backtest.add_argument("--html", default=None, help="write an HTML report to this path")
    backtest.add_argument("--json", default=None, help="write raw results to this path")
    backtest.add_argument("--show-trades", type=int, default=10)
    backtest.add_argument("--verbose", action="store_true")
    backtest.set_defaults(func=cmd_backtest)

    optimize = subparsers.add_parser("optimize", help="grid search with an out of sample holdout")
    add_data_args(optimize)
    add_strategy_args(optimize)
    add_risk_args(optimize)
    optimize.add_argument("--grid", nargs="+", required=True, metavar="NAME=V1,V2,V3")
    optimize.add_argument("--split", type=float, default=0.7, help="in sample fraction")
    optimize.add_argument("--top", type=int, default=15)
    optimize.add_argument("--rank", default="sharpe", choices=("sharpe", "return"))
    optimize.add_argument("--verbose", action="store_true")
    optimize.set_defaults(func=cmd_optimize)

    signals = subparsers.add_parser("signals", help="show today's signals, send nothing")
    signals.add_argument("--symbols", type=_symbols, required=True)
    signals.add_argument("--provider", default="yahoo", choices=data_mod.PROVIDERS)
    signals.add_argument("--csv-dir", default=None)
    signals.add_argument("--lookback", type=int, default=400, help="calendar days of history")
    signals.add_argument("--state", default=None, help="paper state file to read positions from")
    add_strategy_args(signals)
    add_risk_args(signals)
    signals.set_defaults(func=cmd_signals)

    paper = subparsers.add_parser("paper", help="run one paper trading cycle")
    paper.add_argument("--symbols", type=_symbols, required=True)
    paper.add_argument("--provider", default="yahoo", choices=data_mod.PROVIDERS)
    paper.add_argument("--csv-dir", default=None)
    paper.add_argument("--lookback", type=int, default=400)
    paper.add_argument("--broker", default="paper", choices=("paper", "alpaca"))
    paper.add_argument("--state", default="paper_state.json")
    paper.add_argument("--dry-run", action="store_true", help="log intended orders only")
    add_strategy_args(paper)
    add_risk_args(paper)
    paper.set_defaults(func=cmd_paper)

    fetch = subparsers.add_parser("fetch", help="download history to CSV")
    add_data_args(fetch)
    fetch.add_argument("--out", default="data", help="output directory")
    fetch.set_defaults(func=cmd_fetch)

    return parser


def main(argv: Optional[List[str]] = None) -> int:
    parser = build_parser()
    args = parser.parse_args(argv)

    # argparse cannot express "0 means disabled", so normalise here.
    for name in ("stop_loss", "take_profit", "trailing_stop", "max_drawdown"):
        if getattr(args, name, None) == 0:
            setattr(args, name, None)

    try:
        return args.func(args)
    except (data_mod.DataError, BrokerError, ValueError) as exc:
        print(f"error: {exc}", file=sys.stderr)
        return 1
    except KeyboardInterrupt:
        print("\ninterrupted", file=sys.stderr)
        return 130
