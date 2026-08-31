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
from typing import List, Optional

from . import arbitrage as arb_mod
from . import models as models_mod
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
