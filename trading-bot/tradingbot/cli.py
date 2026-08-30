"""Command line interface.

    python3 run.py strategies
    python3 run.py backtest    --symbols AAPL,MSFT --strategy macd_trend
    python3 run.py optimize    --symbols AAPL --grid fast=5,10,20 slow=50,100
    python3 run.py walkforward --symbols AAPL --grid fast=5,10,20 slow=50,100
    python3 run.py montecarlo  --symbols AAPL --strategy macd_trend
    python3 run.py signals     --symbols AAPL,MSFT --strategy macd_trend
    python3 run.py paper       --symbols AAPL,MSFT --strategy macd_trend
    python3 run.py run         --config config.json
    python3 run.py status
    python3 run.py pine        --strategy macd_trend --out pine/
"""

from __future__ import annotations

import argparse
import itertools
import json
import os
import sys
from datetime import date, timedelta
from typing import Dict, List, Optional

from . import analysis as analysis_mod
from . import config as config_mod
from . import data as data_mod
from . import market_calendar as cal
from . import pine as pine_mod
from . import report as report_mod
from . import strategies as strategies_mod
from .broker import BrokerError, PaperBroker, build_broker
from .engine import Backtester, EngineConfig
from .journal import Journal
from .live import Trader
from .notify import Notifier
from .portfolio import CostModel
from .risk import RiskConfig, SizingMode
from .scheduler import Scheduler

DISCLAIMER = (
    "Educational software. Backtested results routinely fail to repeat in live markets, "
    "and automated trading on a small account has a high base rate of loss."
)

LIVE_WARNING = """
!! LIVE TRADING MODE !!
Real orders against real money. Before this runs:
  - the risk limits below are the only thing between a bug and your balance
  - under $25,000 you are subject to pattern day trader restrictions
  - every order is capped at --max-order-notional and --max-daily-orders
"""


# ----------------------------------------------------------------------
# argument helpers
# ----------------------------------------------------------------------

def _symbols(value: str) -> List[str]:
    out = [s.strip().upper() for s in value.replace(" ", ",").split(",") if s.strip()]
    if not out:
        raise argparse.ArgumentTypeError("supply at least one symbol")
    return out


def _params(pairs) -> Dict[str, object]:
    """Parse ``fast=20 slow=50`` into a typed dictionary."""
    if isinstance(pairs, dict):
        return dict(pairs)
    out: Dict[str, object] = {}
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
        allow_short=getattr(args, "allow_short", False),
        max_gross_exposure=getattr(args, "max_gross_exposure", 1.0),
    )
    config.validate()
    return config


def _engine_from_args(args) -> EngineConfig:
    return EngineConfig(
        starting_cash=args.cash,
        costs=CostModel(
            commission_per_trade=args.commission,
            slippage_bps=args.slippage_bps,
            borrow_rate_annual=getattr(args, "borrow_rate", 0.0),
        ),
        risk=_risk_from_args(args),
        fractional=args.fractional,
        risk_free_rate=args.risk_free_rate,
        verbose=getattr(args, "verbose", False),
    )


def _strategy_params(args) -> Dict[str, object]:
    params = _params(args.param)
    if getattr(args, "direction", None):
        params.setdefault("direction", args.direction)
    return params


def _load(args) -> Dict[str, list]:
    return data_mod.load_universe(
        args.symbols, args.start, args.end,
        provider=args.provider, csv_dir=args.csv_dir,
        seed=args.seed, interval=getattr(args, "interval", "1d"),
    )


# ----------------------------------------------------------------------
# commands
# ----------------------------------------------------------------------

def cmd_strategies(args) -> int:
    print("Available strategies:\n")
    print("\n".join(strategies_mod.catalog()))
    print("\nPass parameters with --param, for example: --param fast=10 slow=40")
    print("Set --direction long|short|both to choose which sides a strategy may take.")
    return 0


def cmd_backtest(args) -> int:
    series = _load(args)
    strategy = strategies_mod.build(args.strategy, _strategy_params(args))
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
                {"symbol": t.symbol, "side": t.side,
                 "entry": t.entry_ts.isoformat(), "exit": t.exit_ts.isoformat(),
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
    """Grid search with an out of sample holdout."""
    series = _load(args)
    grid = _grid(args.grid)
    all_dates = sorted({bar.ts for bars in series.values() for bar in bars})
    split_at = all_dates[int(len(all_dates) * args.split)]
    in_sample = {s: [b for b in bars if b.ts <= split_at] for s, bars in series.items()}
    out_sample = {s: [b for b in bars if b.ts > split_at] for s, bars in series.items()}
    engine_config = _engine_from_args(args)

    names = sorted(grid)
    combos = list(itertools.product(*(grid[n] for n in names)))
    print(f"Grid searching {len(combos)} combinations of {', '.join(names)}")
    print(f"In sample through {split_at}, out of sample after.\n")

    rows = []
    for combo in combos:
        params = dict(zip(names, combo))
        params.setdefault("direction", getattr(args, "direction", "long"))
        try:
            r_in = Backtester(strategies_mod.build(args.strategy, params), engine_config).run(in_sample)
            r_out = Backtester(strategies_mod.build(args.strategy, params), engine_config).run(out_sample)
        except (ValueError, KeyError) as exc:
            print(f"  skipped {params}: {exc}")
            continue
        rows.append({
            "params": {k: v for k, v in params.items() if k != "direction"},
            "in_return": r_in.metrics["total_return"], "in_sharpe": r_in.metrics["sharpe"],
            "out_return": r_out.metrics["total_return"], "out_sharpe": r_out.metrics["sharpe"],
            "out_dd": r_out.metrics["max_drawdown"], "out_trades": r_out.metrics["trades"],
        })

    if not rows:
        print("no valid parameter combinations", file=sys.stderr)
        return 2

    key = "out_sharpe" if args.rank == "sharpe" else "out_return"
    rows.sort(key=lambda r: r[key], reverse=True)
    width = max(len(", ".join(f"{k}={v}" for k, v in r["params"].items())) for r in rows) + 2
    print(f"  {'params':<{width}}{'in ret':>9}{'in shrp':>9}{'out ret':>9}{'out shrp':>10}{'out dd':>9}{'trades':>8}")
    print("  " + "-" * (width + 54))
    for row in rows[: args.top]:
        label = ", ".join(f"{k}={v}" for k, v in row["params"].items())
        print(f"  {label:<{width}}{row['in_return']:>8.1%}{row['in_sharpe']:>9.2f}"
              f"{row['out_return']:>9.1%}{row['out_sharpe']:>10.2f}{row['out_dd']:>8.1%}{row['out_trades']:>8}")

    best = rows[0]
    print(f"\n  Best on the holdout: {best['params']}")
    if best["in_return"] > 0 and best["out_return"] < 0:
        print("  Warning: this setting made money in sample and lost it out of sample. That is overfitting.")
    print(f"\n  Note: {DISCLAIMER}\n")
    return 0


def cmd_walkforward(args) -> int:
    """Rolling refit, scored only on windows never used for fitting."""
    series = _load(args)
    grid = _grid(args.grid)
    strategy = strategies_mod.build(args.strategy, _strategy_params(args))
    try:
        result = analysis_mod.walk_forward(
            args.strategy, series, grid, _engine_from_args(args),
            train_days=args.train_days, test_days=args.test_days,
            metric=args.rank, warmup_days=strategy.warmup,
        )
    except ValueError as exc:
        print(f"error: {exc}", file=sys.stderr)
        return 1

    if not result.folds:
        print("no folds could be scored, try a shorter --train-days", file=sys.stderr)
        return 2

    print(f"\nWalk forward: {args.strategy} on {', '.join(args.symbols)}")
    print(f"Train {args.train_days} days, test {args.test_days} days, {len(result.folds)} folds\n")
    print(f"  {'fold':<6}{'test window':<26}{'return':>9}{'sharpe':>9}{'dd':>8}{'trades':>8}  params")
    print("  " + "-" * 88)
    for fold in result.folds:
        window = f"{fold.test_start} to {fold.test_end}"
        params = ", ".join(f"{k}={v}" for k, v in sorted(fold.best_params.items()))
        print(f"  {fold.index:<6}{window:<26}{fold.test_return:>8.1%}{fold.test_sharpe:>9.2f}"
              f"{fold.test_drawdown:>8.1%}{fold.test_trades:>8}  {params}")

    summary = result.summary()
    print(f"\n  Compounded out of sample return   {summary['total_return']:>10.2%}")
    print(f"  Median fold                       {summary['median_fold_return']:>10.2%}")
    print(f"  Worst fold                        {summary['worst_fold']:>10.2%}")
    print(f"  Profitable folds                  {result.positive_folds}/{len(result.folds)}"
          f"  ({summary['consistency']:.0%})")
    print(f"  Parameter stability               {summary['parameter_stability']:>10.0%}")
    print("\n  Consistency below 50 percent means the strategy is not reliably profitable.")
    print("  Parameter stability below 50 percent means the best settings keep moving,")
    print("  which is what curve fitting looks like from the outside.")
    print(f"\n  Note: {DISCLAIMER}\n")
    return 0


def cmd_montecarlo(args) -> int:
    """Resample the trade sequence to show how much of the result was luck."""
    series = _load(args)
    strategy = strategies_mod.build(args.strategy, _strategy_params(args))
    result = Backtester(strategy, _engine_from_args(args)).run(series)
    if not result.trades:
        print("the backtest produced no closed trades, nothing to resample", file=sys.stderr)
        return 2

    mc = analysis_mod.monte_carlo(
        result.trades, args.cash, trials=args.trials, method=args.method, seed=args.seed or 42
    )
    summary = mc.summary()
    print(f"\nMonte Carlo: {strategy.describe()} on {', '.join(args.symbols)}")
    print(f"{args.trials} {args.method} resamples of {len(result.trades)} trades\n")
    print(f"  Actual backtest return            {result.metrics['total_return']:>10.2%}")
    print(f"  Actual backtest drawdown          {result.metrics['max_drawdown']:>10.2%}")
    print()
    print(f"  Median resampled return           {summary['median_return']:>10.2%}")
    print(f"  5th percentile                    {summary['p05_return']:>10.2%}")
    print(f"  95th percentile                   {summary['p95_return']:>10.2%}")
    print(f"  Probability of losing money       {summary['probability_of_loss']:>10.1%}")
    print()
    print(f"  Median resampled drawdown         {summary['median_drawdown']:>10.2%}")
    print(f"  95th percentile drawdown          {summary['p95_drawdown']:>10.2%}")
    print(f"  Worst resampled drawdown          {summary['worst_drawdown']:>10.2%}")

    if summary["p95_drawdown"] > result.metrics["max_drawdown"] * 1.5:
        print("\n  The backtest's drawdown was well inside the range this strategy can")
        print("  produce. Size positions for the 95th percentile, not the backtest.")
    if args.method == "shuffle":
        print("\n  Note: compounding is commutative, so every shuffle ends at the same")
        print("  equity by construction. Only the drawdown column is meaningful here.")
    print(f"\n  Note: {DISCLAIMER}\n")
    return 0


def cmd_signals(args) -> int:
    """Print what the strategy would do right now, without sending anything."""
    broker = PaperBroker(args.cash, CostModel(slippage_bps=args.slippage_bps),
                         allow_short=getattr(args, "allow_short", False))
    trader = Trader(
        strategies_mod.build(args.strategy, _strategy_params(args)),
        broker, args.symbols,
        risk=_risk_from_args(args), provider=args.provider, csv_dir=args.csv_dir,
        interval=getattr(args, "interval", "1d"),
        lookback_days=args.lookback, state_path=args.state, dry_run=True,
    )
    series = trader.fetch()
    intents = trader.plan(series)
    print(f"\nSignals for {', '.join(args.symbols)} using {trader.strategy.describe()}")
    print(f"Data through {max(bars[-1].ts for bars in series.values())}")
    print(f"{cal.describe()}\n")
    if not intents:
        print("  No action. Nothing meets the entry or exit rules.")
    for intent in intents:
        print(f"  {intent['side'].value.upper():<5} {intent['qty']:>6g} {intent['symbol']:<6}"
              f" near {intent['price']:>9.2f}   {intent['reason']}")
    print(f"\n  Note: {DISCLAIMER}\n")
    return 0


def _make_trader(args) -> Trader:
    if args.broker == "alpaca-live":
        print(LIVE_WARNING)
        broker = build_broker(
            "alpaca-live", confirm=args.confirm,
            max_order_notional=args.max_order_notional, max_daily_orders=args.max_daily_orders,
        )
    elif args.broker == "alpaca":
        broker = build_broker("alpaca")
    else:
        broker = PaperBroker(
            args.cash, CostModel(commission_per_trade=args.commission,
                                 slippage_bps=args.slippage_bps),
            allow_short=getattr(args, "allow_short", False),
        )
    return Trader(
        strategies_mod.build(args.strategy, _strategy_params(args)),
        broker, args.symbols,
        risk=_risk_from_args(args), provider=args.provider, csv_dir=args.csv_dir,
        interval=getattr(args, "interval", "1d"),
        lookback_days=args.lookback, state_path=args.state,
        journal_path=args.journal, dry_run=args.dry_run,
        notifier=Notifier(args.notify_webhook, args.notify_email),
        require_market_open=args.market_hours_only,
    )


def cmd_paper(args) -> int:
    try:
        trader = _make_trader(args)
    except BrokerError as exc:
        print(f"broker error: {exc}", file=sys.stderr)
        return 2
    print(f"\nSession: {trader.strategy.describe()} on {', '.join(args.symbols)}")
    print(f"Broker: {trader.broker.describe()}  [{trader.mode}]")
    print(f"{cal.describe()}\n")
    trader.step()
    print(f"\n{json.dumps(trader.status(), indent=2, default=str)}")
    print(f"\n  Note: {DISCLAIMER}\n")
    return 0


def cmd_run(args) -> int:
    """Run the trading loop on a schedule until stopped."""
    try:
        trader = _make_trader(args)
    except BrokerError as exc:
        print(f"broker error: {exc}", file=sys.stderr)
        return 2
    scheduler = Scheduler(
        trader, mode=args.schedule, minutes_before_close=args.minutes_before_close,
        interval_minutes=args.every, max_cycles=args.max_cycles,
        run_immediately=args.run_now,
    )
    print(f"\n{trader.strategy.describe()} on {', '.join(args.symbols)}")
    print(f"Broker: {trader.broker.describe()}  [{trader.mode}]\n")
    scheduler.run()
    return 0


def cmd_status(args) -> int:
    print(f"\n{cal.describe()}")
    print(f"Eastern time now: {cal.now_eastern():%Y-%m-%d %H:%M:%S}")
    if args.state and os.path.exists(args.state):
        with open(args.state, encoding="utf-8") as handle:
            state = json.load(handle)
        print(f"\nSaved state: {args.state}")
        print(f"  saved at        {state.get('saved_at')}")
        print(f"  strategy        {state.get('strategy')}")
        print(f"  cash            {state.get('cash', 0):,.2f}")
        positions = state.get("positions") or {}
        print(f"  open positions  {len(positions)}")
        for symbol, position in positions.items():
            side = "short" if position["qty"] < 0 else "long"
            print(f"    {symbol:<6} {side:<6} {position['qty']:>8g} @ {position['avg_price']:.2f}"
                  f"  stop {position.get('stop_price')}")
        if state.get("halted"):
            print(f"  HALTED: {state.get('halt_reason')}")
    elif args.state:
        print(f"\nNo saved state at {args.state} yet.")

    if args.journal and os.path.exists(args.journal):
        summary = Journal(args.journal).summary()
        print(f"\nJournal: {args.journal}")
        print(f"  entries {summary['entries']}, filled {summary['filled']}")
        print(f"  first   {summary['first']}")
        print(f"  last    {summary['last']}")
        print(f"  symbols {', '.join(summary['symbols']) or 'none'}")
    print()
    return 0


def cmd_fetch(args) -> int:
    series = _load(args)
    os.makedirs(args.out, exist_ok=True)
    for symbol, bars in series.items():
        path = os.path.join(args.out, f"{symbol}.csv")
        data_mod.write_csv_bars(path, bars)
        print(f"  {symbol:<8}{len(bars):>6} bars  {bars[0].ts} to {bars[-1].ts}  ->  {path}")
    return 0


def cmd_init_config(args) -> int:
    if os.path.exists(args.out) and not args.force:
        print(f"{args.out} already exists. Pass --force to overwrite.", file=sys.stderr)
        return 1
    with open(args.out, "w", encoding="utf-8") as handle:
        handle.write(config_mod.example() + "\n")
    print(f"Wrote {args.out}. Edit it, then run any command with --config {args.out}")
    return 0


def cmd_pine(args) -> int:
    os.makedirs(args.out, exist_ok=True)
    names = [args.strategy] if args.strategy != "all" else sorted(strategies_mod.REGISTRY)
    written = []
    for name in names:
        script = pine_mod.generate(name)
        path = os.path.join(args.out, f"{name}.pine")
        with open(path, "w", encoding="utf-8") as handle:
            handle.write(script)
        written.append(path)
        print(f"  {name:<22} -> {path}")
    print(f"\n{len(written)} Pine Script strategies written.")
    print(pine_mod.INSTRUCTIONS)
    return 0


# ----------------------------------------------------------------------
# parser
# ----------------------------------------------------------------------

def build_parser() -> argparse.ArgumentParser:
    today = date.today()
    parser = argparse.ArgumentParser(
        prog="tradingbot",
        description="Backtesting, analysis, and automated trading. Paper by default.",
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog=DISCLAIMER,
    )
    subparsers = parser.add_subparsers(dest="command", required=True)

    def add_config(sub):
        sub.add_argument("--config", default=None, help="JSON config file; flags override it")

    def add_data_args(sub, default_days: int = 365 * 5):
        sub.add_argument("--symbols", type=_symbols, help="comma separated tickers")
        sub.add_argument("--start", default=(today - timedelta(days=default_days)).isoformat())
        sub.add_argument("--end", default=today.isoformat())
        sub.add_argument("--provider", default="yahoo", choices=data_mod.PROVIDERS)
        sub.add_argument("--interval", default="1d", choices=data_mod.INTERVALS)
        sub.add_argument("--csv-dir", default=None, help="directory of SYMBOL.csv files")
        sub.add_argument("--seed", type=int, default=None, help="seed for the synthetic provider")

    def add_risk_args(sub):
        sub.add_argument("--cash", type=float, default=10_000.0)
        sub.add_argument("--sizing", default=SizingMode.FIXED_FRACTION, choices=SizingMode.ALL)
        sub.add_argument("--fraction", type=float, default=0.2)
        sub.add_argument("--risk-per-trade", type=float, default=0.01)
        sub.add_argument("--atr-stop-mult", type=float, default=2.0)
        sub.add_argument("--max-position-pct", type=float, default=0.35)
        sub.add_argument("--max-positions", type=int, default=5)
        sub.add_argument("--max-gross-exposure", type=float, default=1.0)
        sub.add_argument("--stop-loss", type=float, default=0.08, help="fraction, 0 disables")
        sub.add_argument("--take-profit", type=float, default=None)
        sub.add_argument("--trailing-stop", type=float, default=None)
        sub.add_argument("--max-drawdown", type=float, default=0.25, help="kill switch, 0 disables")
        sub.add_argument("--commission", type=float, default=0.0)
        sub.add_argument("--slippage-bps", type=float, default=5.0)
        sub.add_argument("--borrow-rate", type=float, default=0.0, help="annual short borrow cost")
        sub.add_argument("--fractional", action="store_true")
        sub.add_argument("--allow-short", action="store_true",
                         help="permit short positions, which carry unlimited loss exposure")
        sub.add_argument("--risk-free-rate", type=float, default=0.0)

    def add_strategy_args(sub):
        sub.add_argument("--strategy", default="sma_crossover", choices=sorted(strategies_mod.REGISTRY))
        sub.add_argument("--param", nargs="*", default=[], metavar="NAME=VALUE")
        sub.add_argument("--direction", default="long", choices=("long", "short", "both"))

    def add_live_args(sub):
        sub.add_argument("--symbols", type=_symbols)
        sub.add_argument("--provider", default="yahoo", choices=data_mod.PROVIDERS)
        sub.add_argument("--interval", default="1d", choices=data_mod.INTERVALS)
        sub.add_argument("--csv-dir", default=None)
        sub.add_argument("--seed", type=int, default=None)
        sub.add_argument("--lookback", type=int, default=400, help="calendar days of history")
        sub.add_argument("--broker", default="paper",
                         choices=("paper", "alpaca", "alpaca-live"))
        sub.add_argument("--confirm", default="",
                         help="required phrase for alpaca-live: TRADE REAL MONEY")
        sub.add_argument("--max-order-notional", type=float, default=1_000.0,
                         help="live mode cap on any single order")
        sub.add_argument("--max-daily-orders", type=int, default=20,
                         help="live mode cap on orders per day")
        sub.add_argument("--state", default="paper_state.json")
        sub.add_argument("--journal", default="journal.csv")
        sub.add_argument("--notify-webhook", default=None)
        sub.add_argument("--notify-email", default=None)
        sub.add_argument("--market-hours-only", action="store_true",
                         help="skip the cycle unless the market is actually open")
        sub.add_argument("--dry-run", action="store_true", help="log intended orders only")

    listing = subparsers.add_parser("strategies", help="list strategies and their parameters")
    listing.set_defaults(func=cmd_strategies)

    backtest = subparsers.add_parser("backtest", help="run a strategy over history")
    add_config(backtest); add_data_args(backtest); add_strategy_args(backtest); add_risk_args(backtest)
    backtest.add_argument("--html", default=None)
    backtest.add_argument("--json", default=None)
    backtest.add_argument("--show-trades", type=int, default=10)
    backtest.add_argument("--verbose", action="store_true")
    backtest.set_defaults(func=cmd_backtest)

    optimize = subparsers.add_parser("optimize", help="grid search with an out of sample holdout")
    add_config(optimize); add_data_args(optimize); add_strategy_args(optimize); add_risk_args(optimize)
    optimize.add_argument("--grid", nargs="+", required=True, metavar="NAME=V1,V2,V3")
    optimize.add_argument("--split", type=float, default=0.7)
    optimize.add_argument("--top", type=int, default=15)
    optimize.add_argument("--rank", default="sharpe", choices=("sharpe", "return"))
    optimize.set_defaults(func=cmd_optimize)

    walk = subparsers.add_parser("walkforward", help="rolling refit, scored out of sample only")
    add_config(walk); add_data_args(walk); add_strategy_args(walk); add_risk_args(walk)
    walk.add_argument("--grid", nargs="+", required=True, metavar="NAME=V1,V2,V3")
    walk.add_argument("--train-days", type=int, default=504)
    walk.add_argument("--test-days", type=int, default=126)
    walk.add_argument("--rank", default="sharpe", choices=("sharpe", "total_return"))
    walk.set_defaults(func=cmd_walkforward)

    mc = subparsers.add_parser("montecarlo", help="resample trades to size the role of luck")
    add_config(mc); add_data_args(mc); add_strategy_args(mc); add_risk_args(mc)
    mc.add_argument("--trials", type=int, default=2_000)
    mc.add_argument("--method", default="bootstrap", choices=("bootstrap", "shuffle"))
    mc.set_defaults(func=cmd_montecarlo)

    signals = subparsers.add_parser("signals", help="show today's signals, send nothing")
    add_config(signals); add_live_args(signals); add_strategy_args(signals); add_risk_args(signals)
    signals.set_defaults(func=cmd_signals)

    paper = subparsers.add_parser("paper", help="run one trading cycle")
    add_config(paper); add_live_args(paper); add_strategy_args(paper); add_risk_args(paper)
    paper.set_defaults(func=cmd_paper)

    run = subparsers.add_parser("run", help="run continuously on a schedule")
    add_config(run); add_live_args(run); add_strategy_args(run); add_risk_args(run)
    run.add_argument("--schedule", default="daily", choices=("daily", "interval"))
    run.add_argument("--minutes-before-close", type=int, default=10)
    run.add_argument("--every", type=int, default=60, help="minutes, for interval mode")
    run.add_argument("--max-cycles", type=int, default=None)
    run.add_argument("--run-now", action="store_true",
                     help="fire one cycle immediately at startup, to verify a config")
    run.set_defaults(func=cmd_run)

    status = subparsers.add_parser("status", help="market status, saved state, journal")
    add_config(status)
    status.add_argument("--state", default="paper_state.json")
    status.add_argument("--journal", default="journal.csv")
    status.set_defaults(func=cmd_status)

    fetch = subparsers.add_parser("fetch", help="download history to CSV")
    add_config(fetch); add_data_args(fetch)
    fetch.add_argument("--out", default="data")
    fetch.set_defaults(func=cmd_fetch)

    init = subparsers.add_parser("init-config", help="write a starter config file")
    init.add_argument("--out", default="config.json")
    init.add_argument("--force", action="store_true")
    init.set_defaults(func=cmd_init_config)

    pine = subparsers.add_parser("pine", help="export strategies as TradingView Pine Script")
    pine.add_argument("--strategy", default="all",
                      choices=["all"] + sorted(strategies_mod.REGISTRY))
    pine.add_argument("--out", default="pine")
    pine.set_defaults(func=cmd_pine)

    return parser


def main(argv: Optional[List[str]] = None) -> int:
    argv = list(sys.argv[1:] if argv is None else argv)
    parser = build_parser()
    args = parser.parse_args(argv)

    # Config file first, then explicit flags win over it.
    if getattr(args, "config", None):
        try:
            config_mod.apply(args, config_mod.load(args.config), parser, argv)
        except config_mod.ConfigError as exc:
            print(f"config error: {exc}", file=sys.stderr)
            return 1

    if hasattr(args, "symbols") and not args.symbols:
        print("error: --symbols is required (or set 'symbols' in your config file)",
              file=sys.stderr)
        return 1
    if isinstance(getattr(args, "symbols", None), str):
        args.symbols = _symbols(args.symbols)

    # argparse cannot express "0 means disabled", so normalise here.
    for name in ("stop_loss", "take_profit", "trailing_stop", "max_drawdown"):
        if getattr(args, name, None) == 0:
            setattr(args, name, None)

    try:
        return args.func(args)
    except (data_mod.DataError, BrokerError, config_mod.ConfigError, ValueError) as exc:
        print(f"error: {exc}", file=sys.stderr)
        return 1
    except KeyboardInterrupt:
        print("\ninterrupted", file=sys.stderr)
        return 130
