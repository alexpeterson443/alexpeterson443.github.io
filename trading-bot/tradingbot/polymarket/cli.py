"""Command line interface for the Polymarket side.

    python3 run.py pm models
    python3 run.py pm markets --search "fed" --limit 20
    python3 run.py pm book --slug some-market-slug
    python3 run.py pm arb --pages 2 --min-edge 0.005
    python3 run.py pm scan --model longshot_fade --bankroll 500
    python3 run.py pm paper --model fixed --param probability=0.7 --slug some-slug
"""

from __future__ import annotations

import argparse
import json
import os
import sys
import time
from typing import List, Optional

from . import arbitrage as arb_mod
from . import models as models_mod
from . import sniper as sniper_mod
from .api import PolymarketAPI, PolymarketError
from .book import slippage_curve
from .paper import InsufficientCash, PaperBook
from .sizing import SizingConfig
from .trader import Trader
from .types import Market

DISCLAIMER = (
    "Educational software. Prediction markets are closer to betting than to investing, "
    "the edge is small where it exists at all, and state level legality is contested."
)


def _params(pairs) -> dict:
    out = {}
    for pair in pairs or []:
        if "=" not in pair:
            raise argparse.ArgumentTypeError(f"expected name=value, got {pair!r}")
        key, _, raw = pair.partition("=")
        value = raw.strip()
        for cast in (int, float):
            try:
                value = cast(value)
                break
            except ValueError:
                continue
        out[key.strip()] = value
    return out


def _load_markets(api: PolymarketAPI, args) -> List[Market]:
    if getattr(args, "slug", None):
        market = api.market_by_slug(args.slug)
        if market is None:
            raise PolymarketError(f"no market found with slug {args.slug!r}")
        return [market]
    if getattr(args, "search", None):
        found = api.search(args.search, pages=args.pages)
    else:
        found = api.iter_markets(pages=args.pages, page_size=100, order=args.order)
    return [m for m in found if m.is_tradeable]


# ----------------------------------------------------------------------


def cmd_models(args) -> int:
    print("Probability models:\n")
    print("\n".join(models_mod.catalog()))
    print("\nEvery model is compared against market_price, whose edge is zero by")
    print("construction. A model that cannot beat it has no edge.")
    return 0


def cmd_markets(args) -> int:
    api = PolymarketAPI(cache_seconds=60)
    markets = _load_markets(api, args)[: args.limit]
    if not markets:
        print("no markets matched")
        return 0
    print(f"\n{len(markets)} markets\n")
    print(f"  {'YES':>6}{'liquidity':>13}{'24h vol':>12}{'days':>7}  question")
    print("  " + "-" * 96)
    for m in markets:
        price = f"{m.yes_price:.3f}" if m.yes_price is not None else "  n/a"
        days = f"{m.days_to_resolution:.0f}" if m.days_to_resolution is not None else "?"
        print(f"  {price:>6}{m.liquidity:>13,.0f}{m.volume_24h:>12,.0f}{days:>7}  {m.question[:60]}")
    print()
    return 0


def cmd_book(args) -> int:
    api = PolymarketAPI()
    markets = _load_markets(api, args)
    if not markets:
        print("no market matched", file=sys.stderr)
        return 1
    market = markets[0]
    print(f"\n{market.question}")
    print(f"  slug {market.slug}   tick {market.tick_size}   min order {market.min_order_size}")
    days = market.days_to_resolution
    print(f"  resolves {market.end_date}  ({days:.0f} days away)" if days else "")

    for outcome, token in (("Yes", market.yes_token), ("No", market.no_token)):
        book = api.book_or_none(token)
        if book is None or book.is_empty:
            print(f"\n  {outcome}: no order book")
            continue
        print(f"\n  {outcome}  bid {book.best_bid}  ask {book.best_ask}  "
              f"spread {book.spread}  mid {book.mid}")
        print(f"       depth within 5c: {book.depth('buy', 0.05):,.0f} shares "
              f"(${book.notional_depth('buy', 0.05):,.0f})")
        print(f"       {'size':>8}{'filled':>10}{'avg price':>12}{'slippage':>11}{'levels':>8}")
        for row in slippage_curve(book, "buy", [25, 100, 500, 2000, 10000]):
            flag = "" if row["complete"] else "  (partial)"
            print(f"       {row['size']:>8.0f}{row['filled']:>10.0f}{row['avg_price']:>12.4f}"
                  f"{row['slippage']:>+11.4f}{row['levels']:>8}{flag}")

    yes_book = api.book_or_none(market.yes_token)
    no_book = api.book_or_none(market.no_token)
    if yes_book and no_book and yes_book.best_ask and no_book.best_ask:
        pair = yes_book.best_ask + no_book.best_ask
        print(f"\n  YES ask + NO ask = {pair:.4f}"
              f"  {'ARBITRAGE' if pair < 1 else 'no arbitrage (above $1, as expected)'}")
    print(f"\n  Note: {DISCLAIMER}\n")
    return 0


def cmd_arb(args) -> int:
    api = PolymarketAPI(timeout=15, cache_seconds=60)
    markets = _load_markets(api, args)[: args.max_markets]
    print(f"\nScanning {len(markets)} live markets for YES + NO below $1 ...\n")
    found = arb_mod.scan(
        api, markets, min_edge=args.min_edge, min_profit=args.min_profit,
        max_capital=args.capital, max_days=args.max_days, progress=True,
    )
    if not found:
        print("\n  No arbitrage found.")
        print("  This is the expected result. Polymarket's books are tight and")
        print("  automated traders close these within milliseconds. If this ever")
        print("  prints an opportunity, check the resolution date before celebrating.")
    else:
        print(f"\n  {len(found)} opportunities, best annualised first:\n")
        for o in found[: args.top]:
            print("   ", o)
        summary = arb_mod.summarise(found)
        print(f"\n  total profit ${summary['total_profit']:,.2f} on "
              f"${summary['total_capital']:,.2f} of capital")
    print(f"\n  Note: {DISCLAIMER}\n")
    return 0


def cmd_scan(args) -> int:
    api = PolymarketAPI(timeout=15, cache_seconds=60)
    model = models_mod.build(args.model, _params(args.param))
    sizing = SizingConfig(
        kelly_fraction=args.kelly, max_position_pct=args.max_position_pct,
        min_edge=args.min_edge, min_position_dollars=args.min_dollars,
    )
    trader = Trader(api, model, bankroll=args.bankroll, sizing=sizing,
                    use_history=args.use_history)
    markets = _load_markets(api, args)[: args.max_markets]

    print(f"\n{model.describe()} over {len(markets)} live markets")
    print(f"bankroll ${args.bankroll:,.2f}, {args.kelly:g} Kelly, "
          f"min edge {args.min_edge:.3f}\n")
    candidates = trader.scan(markets, progress=True)

    if candidates:
        print(f"\n  {len(candidates)} candidates, best edge after slippage first:\n")
        for c in candidates[: args.top]:
            print("   ", c)
    else:
        print("\n  No candidates survived.")

    print("\n  Why markets were rejected:")
    for key, value in trader.skipped.items():
        if value:
            print(f"    {key:<16} {value}")
    if trader.last_sizing_reason:
        print(f"    last sizing reason: {trader.last_sizing_reason}")
    print(f"\n  Note: {DISCLAIMER}\n")
    return 0


def cmd_paper(args) -> int:
    api = PolymarketAPI(timeout=15, cache_seconds=60)
    book = PaperBook.load(args.state) if os.path.exists(args.state) else PaperBook(args.bankroll)
    model = models_mod.build(args.model, _params(args.param))
    sizing = SizingConfig(
        kelly_fraction=args.kelly, max_position_pct=args.max_position_pct,
        min_edge=args.min_edge, min_position_dollars=args.min_dollars,
    )
    trader = Trader(api, model, bankroll=book.cash, sizing=sizing,
                    use_history=args.use_history)
    markets = _load_markets(api, args)[: args.max_markets]

    print(f"\nPaper session: {model.describe()}")
    print(f"cash ${book.cash:,.2f}, {len(book.positions)} open positions\n")
    candidates = trader.scan(markets)

    placed = 0
    for candidate in candidates[: args.max_new]:
        if candidate.token_id in book.positions:
            continue
        try:
            book.buy(
                token_id=candidate.token_id, market_id=candidate.market.id,
                question=candidate.market.question, outcome=candidate.outcome,
                shares=candidate.shares, price=candidate.fill_price,
                end_date=str(candidate.market.end_date), model=model.name,
                estimated_probability=candidate.probability,
            )
            print(f"  BOUGHT {candidate}")
            placed += 1
        except (InsufficientCash, ValueError) as exc:
            print(f"  skipped: {exc}")

    if not placed:
        print("  No new positions. Nothing met the criteria.")
    book.save(args.state)
    print(f"\n{json.dumps(book.stats(), indent=2)}")
    print(f"\nstate saved to {args.state}")
    print(f"\n  Note: {DISCLAIMER}\n")
    return 0


def cmd_status(args) -> int:
    if not os.path.exists(args.state):
        print(f"no paper state at {args.state} yet")
        return 0
    book = PaperBook.load(args.state)
    print(f"\nPaper book: {args.state}")
    print(json.dumps(book.stats(), indent=2))
    if book.positions:
        api = PolymarketAPI(cache_seconds=60)
        print(f"\n  {'outcome':<5}{'shares':>10}{'entry':>8}{'now':>8}{'value':>10}  question")
        print("  " + "-" * 88)
        for position in book.positions.values():
            price = api.price(position.token_id, "sell") or position.avg_price
            print(f"  {position.outcome:<5}{position.shares:>10.1f}{position.avg_price:>8.3f}"
                  f"{price:>8.3f}{position.value_at(price):>10.2f}  {position.question[:44]}")
    print()
    return 0


def cmd_snipe_math(args) -> int:
    """The pitch's arithmetic, redone with the real fee and its own win rate."""
    S = sniper_mod
    rate = args.win_rate
    print("\nBreak even and expectancy for the 5 minute BTC snipe, fee = shares x 0.07 x p x (1-p)")
    print(f"assumed win rate {rate:.1%} (the pitch claims 10 of 12 = 83.3%)\n")
    print(f"  {'entry':>6}{'fee/share':>11}{'breakeven':>11}{'wins/loss':>11}{'EV/share':>11}  verdict")
    print("  " + "-" * 64)
    for p in (0.70, 0.75, 0.80, 0.85, 0.88, 0.90, 0.92, 0.95, 0.99):
        ev = S.expectancy(p, rate)
        verdict = "profitable" if ev > 0 else "LOSES"
        print(f"  {p:>6.2f}{S.fee_per_share(p):>11.4f}{S.breakeven_win_rate(p):>11.1%}"
              f"{S.wins_to_recover(p):>11.2f}{ev:>+11.4f}  {verdict}")
    print(f"\nThe pitch's daily table, {args.trades} trades a day at a ${args.stake:.2f} stake:\n")
    print(f"  {'entry':>6}{'daily':>10}{'monthly':>11}{'yearly':>12}  breakeven  edge")
    print("  " + "-" * 60)
    for p in (0.75, 0.80, 0.85, 0.88, 0.92):
        d = S.daily_projection(stake=args.stake, trades_per_day=args.trades, price=p, win_rate=rate)
        print(f"  {p:>6.2f}{d['daily']:>+10.2f}{d['monthly']:>+11.2f}{d['yearly']:>+12.2f}"
              f"  {d['breakeven_win_rate']:>8.1%}  {d['edge_vs_breakeven']:>+6.1%}")
    print("\n  The pitch's $48 a day is the 0.75 row. Its rules require 0.85 and above.")
    print("  At its own win rate, every price its ladder accepts has negative expectancy.")
    print("  Break even at 0.85 is 85.9 percent. 10 of 12 is 83.3. That gap is the whole story.")
    print(f"\n  Note: {DISCLAIMER}\n")
    return 0


def cmd_snipe_now(args) -> int:
    """Evaluate the live window once and show every gate."""
    api = PolymarketAPI(timeout=10)
    feed = sniper_mod.BtcFeed()
    current, following = sniper_mod.current_and_next(api)
    market = current or following
    if market is None:
        print("no live 5 minute BTC market found", file=sys.stderr)
        return 1
    start = sniper_mod.window_start() if current else sniper_mod.window_start() + 300
    left = sniper_mod.seconds_until_close(market)
    print(f"\n{market.question}")
    print(f"  {left:.0f}s to close   fees={market.fees_enabled} rate={market.fee_rate}   "
          f"twap lookback={sniper_mod.twap_lookback(market)}s")
    # Sample spot a few times so the TWAP estimate has something to average.
    for _ in range(3):
        feed.spot()
    up = api.book_or_none(market.token_for("Up") or "")
    down = api.book_or_none(market.token_for("Down") or "")
    decision = sniper_mod.evaluate(
        sniper_mod.SnipeRules(stake=args.stake, price_ceiling=None if args.no_ceiling else 0.80),
        seconds_left=left or 0, up_book=up, down_book=down,
        twap_now=feed.twap(sniper_mod.twap_lookback(market)),
        open_price=feed.open_price_for(start), atr_1m=feed.atr_1m(),
    )
    for book, name in ((up, "Up"), (down, "Down")):
        if book:
            print(f"  {name:<5} bid {book.best_bid}  ask {book.best_ask}  "
                  f"ask size {book.asks[0].size if book.asks else 0:.0f}")
    print()
    for gate in decision.gates:
        print(f"  [{'x' if gate.passed else ' '}] {gate.name:<9} {gate.detail}")
    print(f"\n  {decision.summary()}")
    print(f"\n  Note: {DISCLAIMER}\n")
    return 0


def cmd_snipe_watch(args) -> int:
    """Record live windows until stopped. This builds the dataset the pitch lacked."""
    api = PolymarketAPI(timeout=10)
    feed = sniper_mod.BtcFeed()
    rules = sniper_mod.SnipeRules(stake=args.stake, price_ceiling=None if args.no_ceiling else 0.80)
    recorder = sniper_mod.Recorder(api, feed, rules, out_dir=args.out)
    print(f"\nRecording 5 minute BTC windows to {args.out}/  (Ctrl-C to stop)")
    print(f"sampling every {args.every}s inside the final {args.window}s of each window\n")
    seen = 0
    try:
        while True:
            current, _ = sniper_mod.current_and_next(api)
            if current is None:
                time.sleep(10)
                continue
            left = sniper_mod.seconds_until_close(current) or 0
            if left > args.window:
                # Keep the TWAP estimate warm, then sleep up to the window.
                feed.spot()
                time.sleep(min(max(left - args.window, 2), 30))
                continue
            if left > 0:
                decision = recorder.snapshot(current, sniper_mod.window_start())
                if decision:
                    print(f"  T-{left:>5.0f}s  {decision.summary()}")
                time.sleep(args.every)
            else:
                for row in recorder.settle():
                    seen += 1
                    print(f"  RESOLVED {row['slug']} -> {row['winner']}   ({seen} windows so far)")
                time.sleep(5)
            if args.max_windows and seen >= args.max_windows:
                break
    except KeyboardInterrupt:
        print("\nstopped")
    for row in recorder.settle():
        print(f"  RESOLVED {row['slug']} -> {row['winner']}")
    print(json.dumps(recorder.report(), indent=2))
    return 0


def cmd_snipe_report(args) -> int:
    api = PolymarketAPI()
    recorder = sniper_mod.Recorder(api, sniper_mod.BtcFeed(), sniper_mod.SnipeRules(), out_dir=args.out)
    report = recorder.report()
    print(f"\nObserved results from {args.out}/  ({report['windows_resolved']} windows resolved)\n")
    if not report["rungs"]:
        print("  no resolved observations yet. Run: python3 run.py pm snipe watch")
        return 0
    print(f"  {'rung':<10}{'obs':>6}{'win rate':>10}{'median ask':>12}{'breakeven':>11}{'EV/share':>10}")
    print("  " + "-" * 60)
    for rung, r in report["rungs"].items():
        be = f"{r['breakeven_at_median_ask']:.1%}" if r["breakeven_at_median_ask"] else "-"
        ev = f"{r['expectancy_per_share']:+.4f}" if r["expectancy_per_share"] is not None else "-"
        print(f"  {rung:<10}{r['observations']:>6}{r['win_rate']:>10.1%}{r['median_ask']:>12.3f}{be:>11}{ev:>10}")
    print("\n  Win rate above breakeven at a rung means the snipe had an edge there, in this sample.")
    print("  Small samples lie. Fifty windows is a start; five hundred is an answer.")
    return 0


# ----------------------------------------------------------------------


def build_parser(parser: Optional[argparse.ArgumentParser] = None) -> argparse.ArgumentParser:
    parser = parser or argparse.ArgumentParser(prog="pm", description="Polymarket tools")
    subs = parser.add_subparsers(dest="pm_command", required=True)

    def add_selection(sub, default_pages=1):
        sub.add_argument("--slug", default=None, help="one market by its slug")
        sub.add_argument("--search", default=None, help="substring match on the question")
        sub.add_argument("--pages", type=int, default=default_pages,
                         help="pages of 100 markets to pull")
        sub.add_argument("--order", default="volume24hr",
                         choices=("volume24hr", "liquidityNum", "volumeNum"))

    def add_sizing(sub):
        sub.add_argument("--bankroll", type=float, default=500.0)
        sub.add_argument("--kelly", type=float, default=0.25,
                         help="fraction of full Kelly, 0.25 is a sane default")
        sub.add_argument("--max-position-pct", type=float, default=0.05)
        sub.add_argument("--min-edge", type=float, default=0.02)
        sub.add_argument("--min-dollars", type=float, default=1.0)

    listing = subs.add_parser("models", help="list probability models")
    listing.set_defaults(func=cmd_models)

    markets = subs.add_parser("markets", help="list or search live markets")
    add_selection(markets)
    markets.add_argument("--limit", type=int, default=30)
    markets.set_defaults(func=cmd_markets)

    book = subs.add_parser("book", help="order book and slippage curve for one market")
    add_selection(book)
    book.set_defaults(func=cmd_book)

    arb = subs.add_parser("arb", help="scan for YES plus NO below one dollar")
    add_selection(arb, default_pages=2)
    arb.add_argument("--min-edge", type=float, default=0.002)
    arb.add_argument("--min-profit", type=float, default=1.0)
    arb.add_argument("--capital", type=float, default=None)
    arb.add_argument("--max-days", type=float, default=None,
                     help="ignore markets resolving further out than this")
    arb.add_argument("--max-markets", type=int, default=150)
    arb.add_argument("--top", type=int, default=20)
    arb.set_defaults(func=cmd_arb)

    scan = subs.add_parser("scan", help="find sized candidates for a model")
    add_selection(scan)
    add_sizing(scan)
    scan.add_argument("--model", default="longshot_fade", choices=sorted(models_mod.REGISTRY))
    scan.add_argument("--param", nargs="*", default=[], metavar="NAME=VALUE")
    scan.add_argument("--use-history", action="store_true",
                      help="fetch price history, needed by momentum and reversion")
    scan.add_argument("--max-markets", type=int, default=80)
    scan.add_argument("--top", type=int, default=20)
    scan.set_defaults(func=cmd_scan)

    paper = subs.add_parser("paper", help="place simulated bets from a model")
    add_selection(paper)
    add_sizing(paper)
    paper.add_argument("--model", default="longshot_fade", choices=sorted(models_mod.REGISTRY))
    paper.add_argument("--param", nargs="*", default=[], metavar="NAME=VALUE")
    paper.add_argument("--use-history", action="store_true")
    paper.add_argument("--max-markets", type=int, default=60)
    paper.add_argument("--max-new", type=int, default=3)
    paper.add_argument("--state", default="pm_paper.json")
    paper.set_defaults(func=cmd_paper)

    status = subs.add_parser("status", help="show the paper book")
    status.add_argument("--state", default="pm_paper.json")
    status.set_defaults(func=cmd_status)

    snipe = subs.add_parser("snipe", help="5 minute BTC up/down sniping: math, live check, recorder")
    snipe_subs = snipe.add_subparsers(dest="snipe_command", required=True)

    math = snipe_subs.add_parser("math", help="break even and expectancy tables with real fees")
    math.add_argument("--win-rate", type=float, default=10 / 12)
    math.add_argument("--stake", type=float, default=2.0)
    math.add_argument("--trades", type=int, default=288)
    math.set_defaults(func=cmd_snipe_math)

    now = snipe_subs.add_parser("now", help="evaluate the live window once, every gate shown")
    now.add_argument("--stake", type=float, default=5.0)
    now.add_argument("--no-ceiling", action="store_true", help="drop the pitch's 0.80 ceiling")
    now.set_defaults(func=cmd_snipe_now)

    watch = snipe_subs.add_parser("watch", help="record live windows to CSV until stopped")
    watch.add_argument("--out", default="snipe_data")
    watch.add_argument("--every", type=float, default=5.0, help="seconds between samples")
    watch.add_argument("--window", type=float, default=90.0, help="start sampling this far out")
    watch.add_argument("--stake", type=float, default=5.0)
    watch.add_argument("--no-ceiling", action="store_true")
    watch.add_argument("--max-windows", type=int, default=None)
    watch.set_defaults(func=cmd_snipe_watch)

    report = snipe_subs.add_parser("report", help="observed win rate per ladder rung")
    report.add_argument("--out", default="snipe_data")
    report.set_defaults(func=cmd_snipe_report)

    return parser


def main(argv: Optional[List[str]] = None) -> int:
    args = build_parser().parse_args(argv)
    try:
        return args.func(args)
    except (PolymarketError, ValueError) as exc:
        print(f"error: {exc}", file=sys.stderr)
        return 1
    except KeyboardInterrupt:
        print("\ninterrupted", file=sys.stderr)
        return 130
