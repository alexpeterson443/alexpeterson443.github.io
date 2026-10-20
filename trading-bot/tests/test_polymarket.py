"""Polymarket package tests.

Everything here runs offline against constructed books and markets. The live
API is exercised by hand, never by the suite, so CI does not depend on a third
party staying up or on a market still existing.
"""

import json
import os
import tempfile
import unittest
from datetime import datetime, timedelta, timezone

from tradingbot.polymarket.arbitrage import ArbOpportunity, find_pair_arbitrage, summarise
from tradingbot.polymarket.book import (
    max_size_within, round_to_tick, slippage_curve, walk_book, walk_book_notional,
)
from tradingbot.polymarket.models import REGISTRY, build
from tradingbot.polymarket.paper import InsufficientCash, PaperBook
from tradingbot.polymarket.sizing import (
    SizingConfig, annualised_return, expected_value, kelly_fraction, position_size,
)
from tradingbot.polymarket.types import Level, Market, OrderBook, parse_iso


def market(**kwargs) -> Market:
    base = dict(
        id="1", question="Will it happen?", slug="will-it", condition_id="0xabc",
        token_ids=["yes-token", "no-token"], outcomes=["Yes", "No"],
        outcome_prices=[0.40, 0.60],
    )
    base.update(kwargs)
    return Market(**base)


def book(asks=(), bids=(), token="t") -> OrderBook:
    return OrderBook(
        token_id=token,
        asks=[Level(p, s) for p, s in asks],
        bids=[Level(p, s) for p, s in bids],
    )


class TestMarketParsing(unittest.TestCase):
    def test_gamma_json_string_fields_are_decoded(self):
        """Gamma returns several arrays as JSON encoded strings."""
        m = Market.from_gamma({
            "id": 7, "question": "q", "slug": "s", "conditionId": "0x1",
            "clobTokenIds": '["aaa", "bbb"]', "outcomes": '["Yes", "No"]',
            "outcomePrices": '["0.25", "0.75"]',
        })
        self.assertEqual(m.token_ids, ["aaa", "bbb"])
        self.assertEqual(m.outcomes, ["Yes", "No"])
        self.assertAlmostEqual(m.outcome_prices[0], 0.25)

    def test_malformed_json_fields_do_not_raise(self):
        m = Market.from_gamma({"id": 1, "clobTokenIds": "not json", "outcomes": None})
        self.assertEqual(m.token_ids, [])
        self.assertEqual(m.outcomes, [])

    def test_missing_numeric_fields_default_safely(self):
        m = Market.from_gamma({"id": 1, "volumeNum": None, "bestBid": "oops"})
        self.assertEqual(m.volume, 0.0)
        self.assertIsNone(m.best_bid)

    def test_token_lookup_is_case_insensitive(self):
        m = market()
        self.assertEqual(m.token_for("yes"), "yes-token")
        self.assertEqual(m.token_for("NO"), "no-token")
        self.assertIsNone(m.token_for("maybe"))

    def test_tradeable_requires_every_flag(self):
        self.assertTrue(market().is_tradeable)
        self.assertFalse(market(closed=True).is_tradeable)
        self.assertFalse(market(accepting_orders=False).is_tradeable)
        self.assertFalse(market(order_book_enabled=False).is_tradeable)
        self.assertFalse(market(token_ids=["only-one"]).is_tradeable)

    def test_days_to_resolution(self):
        m = market(end_date=datetime.now(timezone.utc) + timedelta(days=10))
        self.assertAlmostEqual(m.days_to_resolution, 10.0, places=1)

    def test_longshot_detection(self):
        self.assertTrue(market(outcome_prices=[0.03, 0.97]).is_longshot)
        self.assertFalse(market(outcome_prices=[0.50, 0.50]).is_longshot)

    def test_iso_parsing_is_timezone_aware(self):
        parsed = parse_iso("2026-06-01T00:00:00Z")
        self.assertIsNotNone(parsed.tzinfo)
        self.assertEqual(parsed.year, 2026)

    def test_iso_parsing_handles_garbage(self):
        self.assertIsNone(parse_iso("not a date"))
        self.assertIsNone(parse_iso(None))


class TestOrderBook(unittest.TestCase):
    def test_levels_are_sorted_for_a_taker(self):
        parsed = OrderBook.from_api({
            "asset_id": "t",
            "asks": [{"price": "0.60", "size": "10"}, {"price": "0.55", "size": "10"}],
            "bids": [{"price": "0.40", "size": "10"}, {"price": "0.50", "size": "10"}],
        })
        self.assertAlmostEqual(parsed.asks[0].price, 0.55)   # cheapest ask first
        self.assertAlmostEqual(parsed.bids[0].price, 0.50)   # highest bid first

    def test_zero_size_levels_are_dropped(self):
        parsed = OrderBook.from_api({
            "asset_id": "t", "asks": [{"price": "0.6", "size": "0"}], "bids": [],
        })
        self.assertEqual(parsed.asks, [])

    def test_mid_and_spread(self):
        b = book(asks=[(0.60, 10)], bids=[(0.50, 10)])
        self.assertAlmostEqual(b.mid, 0.55)
        self.assertAlmostEqual(b.spread, 0.10)

    def test_a_one_sided_book_has_no_mid(self):
        self.assertIsNone(book(asks=[(0.6, 10)]).mid)

    def test_depth_stops_at_the_band(self):
        b = book(asks=[(0.50, 100), (0.52, 100), (0.80, 999)])
        self.assertAlmostEqual(b.depth("buy", within=0.05), 200)

    def test_notional_depth_weights_by_price(self):
        b = book(asks=[(0.50, 100)])
        self.assertAlmostEqual(b.notional_depth("buy", 0.05), 50.0)


class TestBookWalking(unittest.TestCase):
    def test_a_single_level_fill(self):
        fill = walk_book(book(asks=[(0.50, 100)]), "buy", 40)
        self.assertAlmostEqual(fill.average_price, 0.50)
        self.assertAlmostEqual(fill.cost, 20.0)
        self.assertTrue(fill.filled_completely)

    def test_walking_multiple_levels_averages_them(self):
        fill = walk_book(book(asks=[(0.50, 100), (0.60, 100)]), "buy", 200)
        self.assertAlmostEqual(fill.average_price, 0.55)
        self.assertAlmostEqual(fill.cost, 110.0)
        self.assertEqual(fill.levels_consumed, 2)

    def test_a_partial_fill_is_reported_honestly(self):
        """The gap between quoted and achievable size is the whole point."""
        fill = walk_book(book(asks=[(0.50, 10)]), "buy", 1000)
        self.assertAlmostEqual(fill.shares, 10)
        self.assertFalse(fill.filled_completely)

    def test_an_empty_book_fills_nothing(self):
        self.assertTrue(walk_book(book(), "buy", 100).is_empty)

    def test_selling_walks_the_bids(self):
        fill = walk_book(book(bids=[(0.40, 100)]), "sell", 50)
        self.assertAlmostEqual(fill.average_price, 0.40)

    def test_zero_size_is_a_no_op(self):
        self.assertTrue(walk_book(book(asks=[(0.5, 10)]), "buy", 0).is_empty)

    def test_an_invalid_side_is_rejected(self):
        with self.assertRaises(ValueError):
            walk_book(book(), "sideways", 10)

    def test_notional_walk_respects_the_budget(self):
        fill = walk_book_notional(book(asks=[(0.50, 1000)]), "buy", 25.0)
        self.assertAlmostEqual(fill.shares, 50.0)
        self.assertAlmostEqual(fill.cost, 25.0)

    def test_notional_walk_crosses_levels(self):
        fill = walk_book_notional(book(asks=[(0.50, 100), (0.60, 100)]), "buy", 110.0)
        self.assertAlmostEqual(fill.shares, 200.0, places=6)

    def test_max_size_within_a_limit_price(self):
        b = book(asks=[(0.50, 100), (0.55, 100), (0.70, 100)])
        self.assertAlmostEqual(max_size_within(b, "buy", 0.55), 200)

    def test_slippage_grows_with_size(self):
        b = book(asks=[(0.50, 100), (0.60, 1000)])
        rows = slippage_curve(b, "buy", [50, 500])
        self.assertAlmostEqual(rows[0]["slippage"], 0.0)
        self.assertGreater(rows[1]["slippage"], 0.0)

    def test_tick_rounding_is_conservative(self):
        self.assertAlmostEqual(round_to_tick(0.5049, 0.01, side="buy"), 0.51)
        self.assertAlmostEqual(round_to_tick(0.5049, 0.01, side="sell"), 0.50)

    def test_tick_rounding_stays_inside_the_bounds(self):
        self.assertLess(round_to_tick(1.5, 0.01, side="buy"), 1.0)
        self.assertGreater(round_to_tick(0.0, 0.01, side="sell"), 0.0)


class TestKellySizing(unittest.TestCase):
    def test_the_kelly_formula(self):
        """f* = (p - c) / (1 - c)."""
        self.assertAlmostEqual(kelly_fraction(0.60, 0.50), 0.20)
        self.assertAlmostEqual(kelly_fraction(0.90, 0.80), 0.50)

    def test_no_edge_means_no_bet(self):
        self.assertEqual(kelly_fraction(0.50, 0.50), 0.0)
        self.assertEqual(kelly_fraction(0.40, 0.50), 0.0)

    def test_prices_outside_the_unit_interval_are_refused(self):
        self.assertEqual(kelly_fraction(0.6, 0.0), 0.0)
        self.assertEqual(kelly_fraction(0.6, 1.0), 0.0)

    def test_an_impossible_probability_raises(self):
        with self.assertRaises(ValueError):
            kelly_fraction(1.5, 0.5)

    def test_expected_value_per_dollar(self):
        self.assertAlmostEqual(expected_value(0.60, 0.50), 0.20)
        self.assertAlmostEqual(expected_value(0.50, 0.50), 0.0)

    def test_quarter_kelly_is_a_quarter_of_full(self):
        full = position_size(bankroll=1000, probability=0.60, price=0.50,
                             config=SizingConfig(kelly_fraction=1.0, max_position_pct=1.0))
        quarter = position_size(bankroll=1000, probability=0.60, price=0.50,
                                config=SizingConfig(kelly_fraction=0.25, max_position_pct=1.0))
        self.assertAlmostEqual(quarter["dollars"], full["dollars"] / 4, places=2)

    def test_position_cap_binds_before_kelly(self):
        result = position_size(bankroll=1000, probability=0.95, price=0.50,
                               config=SizingConfig(kelly_fraction=1.0, max_position_pct=0.05))
        self.assertAlmostEqual(result["dollars"], 50.0)
        self.assertEqual(result["binding_limit"], "max_position_pct")

    def test_thin_edges_are_rejected_with_a_reason(self):
        result = position_size(bankroll=1000, probability=0.505, price=0.50)
        self.assertEqual(result["dollars"], 0.0)
        self.assertIn("edge", result["reason"])

    def test_extreme_prices_are_refused(self):
        result = position_size(bankroll=1000, probability=0.999, price=0.99)
        self.assertEqual(result["dollars"], 0.0)
        self.assertIn("band", result["reason"])

    def test_book_depth_caps_the_size(self):
        result = position_size(bankroll=1000, probability=0.70, price=0.50,
                               available_shares=10)
        self.assertAlmostEqual(result["shares"], 10)
        self.assertEqual(result["binding_limit"], "order book depth")

    def test_max_loss_is_the_stake(self):
        """Unlike a short, a binary bet cannot lose more than it stakes."""
        result = position_size(bankroll=1000, probability=0.70, price=0.50)
        self.assertAlmostEqual(result["max_loss"], result["dollars"])

    def test_invalid_config_is_rejected(self):
        with self.assertRaises(ValueError):
            SizingConfig(kelly_fraction=2.0).validate()
        with self.assertRaises(ValueError):
            SizingConfig(min_price=0.9, max_price=0.1).validate()

    def test_annualising_rewards_short_holding_periods(self):
        """The same edge is worth far more if the capital comes back sooner."""
        quick = annualised_return(0.02, 0.98, 7)
        slow = annualised_return(0.02, 0.98, 730)
        self.assertGreater(quick, slow)
        self.assertGreater(quick, 1.0)
        self.assertLess(slow, 0.05)

    def test_annualising_a_zero_period_is_zero(self):
        self.assertEqual(annualised_return(0.02, 0.98, 0), 0.0)


class TestPairArbitrage(unittest.TestCase):
    def test_a_clean_arb_is_found(self):
        opportunity = find_pair_arbitrage(
            market(), book(asks=[(0.40, 100)]), book(asks=[(0.55, 100)])
        )
        self.assertAlmostEqual(opportunity.shares, 100)
        self.assertAlmostEqual(opportunity.pair_price, 0.95)
        self.assertAlmostEqual(opportunity.profit, 5.0)

    def test_no_arb_above_a_dollar(self):
        self.assertIsNone(find_pair_arbitrage(
            market(), book(asks=[(0.50, 100)]), book(asks=[(0.52, 100)])
        ))

    def test_the_walk_stops_when_the_edge_runs_out(self):
        opportunity = find_pair_arbitrage(
            market(),
            book(asks=[(0.40, 50), (0.48, 500)]),
            book(asks=[(0.55, 50), (0.55, 500)]),
        )
        self.assertAlmostEqual(opportunity.shares, 50)

    def test_the_thinner_side_limits_the_size(self):
        opportunity = find_pair_arbitrage(
            market(), book(asks=[(0.40, 30)]), book(asks=[(0.55, 500)])
        )
        self.assertAlmostEqual(opportunity.shares, 30)

    def test_levels_accumulate_while_profitable(self):
        opportunity = find_pair_arbitrage(
            market(), book(asks=[(0.40, 50), (0.42, 50)]), book(asks=[(0.50, 100)])
        )
        self.assertAlmostEqual(opportunity.shares, 100)
        self.assertAlmostEqual(opportunity.yes_avg_price, 0.41)

    def test_min_edge_is_respected(self):
        self.assertIsNone(find_pair_arbitrage(
            market(), book(asks=[(0.50, 100)]), book(asks=[(0.498, 100)]), min_edge=0.01
        ))

    def test_max_shares_caps_the_size(self):
        opportunity = find_pair_arbitrage(
            market(), book(asks=[(0.40, 1000)]), book(asks=[(0.55, 1000)]), max_shares=25
        )
        self.assertAlmostEqual(opportunity.shares, 25)

    def test_an_empty_book_yields_nothing(self):
        self.assertIsNone(find_pair_arbitrage(market(), book(), book(asks=[(0.5, 10)])))

    def test_payout_is_exactly_one_per_pair(self):
        opportunity = find_pair_arbitrage(
            market(), book(asks=[(0.40, 100)]), book(asks=[(0.55, 100)])
        )
        self.assertAlmostEqual(opportunity.payout, opportunity.shares)

    def test_annualising_uses_the_resolution_date(self):
        opportunity = ArbOpportunity(
            market=market(), shares=100, yes_cost=40.0, no_cost=55.0,
            yes_avg_price=0.40, no_avg_price=0.55, days_to_resolution=30,
        )
        self.assertGreater(opportunity.annualised, opportunity.return_pct)

    def test_summarise_handles_an_empty_list(self):
        self.assertEqual(summarise([])["count"], 0)


class TestModels(unittest.TestCase):
    def test_the_null_model_has_exactly_zero_edge(self):
        m = market(outcome_prices=[0.42, 0.58])
        self.assertAlmostEqual(build("market_price").estimate(m), 0.42)

    def test_the_null_model_prefers_the_book_mid(self):
        m = market(outcome_prices=[0.42, 0.58])
        estimate = build("market_price").estimate(m, book(asks=[(0.60, 1)], bids=[(0.50, 1)]))
        self.assertAlmostEqual(estimate, 0.55)

    def test_longshot_fade_shades_a_longshot_down(self):
        m = market(outcome_prices=[0.05, 0.95],
                   end_date=datetime.now(timezone.utc) + timedelta(days=30))
        self.assertLess(build("longshot_fade").estimate(m), 0.05)

    def test_longshot_fade_shades_a_favourite_up(self):
        m = market(outcome_prices=[0.92, 0.08],
                   end_date=datetime.now(timezone.utc) + timedelta(days=30))
        self.assertGreater(build("longshot_fade").estimate(m), 0.92)

    def test_longshot_fade_has_no_opinion_in_the_middle(self):
        m = market(outcome_prices=[0.50, 0.50],
                   end_date=datetime.now(timezone.utc) + timedelta(days=30))
        self.assertIsNone(build("longshot_fade").estimate(m))

    def test_longshot_fade_declines_near_resolution(self):
        m = market(outcome_prices=[0.05, 0.95],
                   end_date=datetime.now(timezone.utc) + timedelta(hours=2))
        self.assertIsNone(build("longshot_fade").estimate(m))

    def test_momentum_needs_enough_history(self):
        self.assertIsNone(build("momentum").estimate(market(), None, [(None, 0.5)] * 3))

    def test_momentum_extrapolates_a_rise(self):
        history = [(None, 0.40 + i * 0.01) for i in range(30)]
        self.assertGreater(build("momentum").estimate(market(), None, history), 0.69)

    def test_momentum_ignores_a_flat_series(self):
        self.assertIsNone(build("momentum").estimate(market(), None, [(None, 0.5)] * 30))

    def test_reversion_pulls_back_toward_the_mean(self):
        history = [(None, 0.40 + i * 0.01) for i in range(80)]
        estimate = build("reversion").estimate(market(), None, history)
        self.assertLess(estimate, history[-1][1])

    def test_momentum_and_reversion_disagree_by_construction(self):
        """They cannot both be right about the same series at the same time.

        The rise is kept gentle so neither estimate clamps at the ceiling,
        which would make them agree for the wrong reason.
        """
        history = [(None, 0.30 + i * 0.004) for i in range(80)]
        latest = history[-1][1]
        up = build("momentum").estimate(market(), None, history)
        back = build("reversion").estimate(market(), None, history)
        self.assertLess(max(up, back), 0.99, "fixture drifted into the clamp")
        self.assertGreater(up, latest)     # momentum projects the trend onward
        self.assertLess(back, latest)      # reversion gives part of it back
        self.assertGreater(up, back)

    def test_fixed_returns_the_supplied_number(self):
        self.assertAlmostEqual(build("fixed", {"probability": 0.7}).estimate(market()), 0.7)

    def test_every_estimate_is_a_probability(self):
        history = [(None, 0.01 + i * 0.012) for i in range(90)]
        for name in REGISTRY:
            model = build(name)
            for price in (0.01, 0.05, 0.5, 0.95, 0.99):
                m = market(outcome_prices=[price, 1 - price],
                           end_date=datetime.now(timezone.utc) + timedelta(days=30))
                estimate = model.estimate(m, None, history)
                if estimate is not None:
                    with self.subTest(model=name, price=price):
                        self.assertGreater(estimate, 0.0)
                        self.assertLess(estimate, 1.0)

    def test_unknown_models_and_parameters_are_rejected(self):
        with self.assertRaises(ValueError):
            build("crystal_ball")
        with self.assertRaises(ValueError):
            build("longshot_fade", {"nonsense": 1})

    def test_parameter_validation(self):
        with self.assertRaises(ValueError):
            build("fixed", {"probability": 1.5})
        with self.assertRaises(ValueError):
            build("reversion", {"recent": 99, "lookback": 10})


class TestPaperBook(unittest.TestCase):
    def setUp(self):
        self.book = PaperBook(500.0)

    def test_a_buy_commits_cash(self):
        self.book.buy(token_id="t", market_id="m", question="q", outcome="Yes",
                      shares=100, price=0.30)
        self.assertAlmostEqual(self.book.cash, 470.0)
        self.assertAlmostEqual(self.book.committed, 30.0)

    def test_a_winning_resolution_pays_one_per_share(self):
        self.book.buy(token_id="t", market_id="m", question="q", outcome="Yes",
                      shares=100, price=0.30)
        self.book.resolve("t", won=True)
        self.assertAlmostEqual(self.book.cash, 570.0)
        self.assertAlmostEqual(self.book.resolved[0].pnl, 70.0)

    def test_a_losing_resolution_pays_nothing(self):
        self.book.buy(token_id="t", market_id="m", question="q", outcome="Yes",
                      shares=100, price=0.30)
        self.book.resolve("t", won=False)
        self.assertAlmostEqual(self.book.cash, 470.0)
        self.assertAlmostEqual(self.book.resolved[0].pnl, -30.0)

    def test_loss_is_bounded_by_the_stake(self):
        self.book.buy(token_id="t", market_id="m", question="q", outcome="Yes",
                      shares=100, price=0.30)
        position = self.book.positions["t"]
        self.assertAlmostEqual(position.max_loss, 30.0)
        self.assertAlmostEqual(position.max_payout, 100.0)

    def test_overspending_is_refused(self):
        with self.assertRaises(InsufficientCash):
            self.book.buy(token_id="t", market_id="m", question="q", outcome="Yes",
                          shares=10_000, price=0.50)

    def test_prices_outside_the_unit_interval_are_refused(self):
        for bad in (0.0, 1.0, 1.5, -0.1):
            with self.assertRaises(ValueError):
                self.book.buy(token_id="t", market_id="m", question="q",
                              outcome="Yes", shares=1, price=bad)

    def test_adding_to_a_position_averages_the_entry(self):
        self.book.buy(token_id="t", market_id="m", question="q", outcome="Yes",
                      shares=100, price=0.30)
        self.book.buy(token_id="t", market_id="m", question="q", outcome="Yes",
                      shares=100, price=0.50)
        self.assertAlmostEqual(self.book.positions["t"].avg_price, 0.40)

    def test_selling_early_returns_the_proceeds(self):
        self.book.buy(token_id="t", market_id="m", question="q", outcome="Yes",
                      shares=100, price=0.30)
        proceeds = self.book.sell("t", 100, 0.45)
        self.assertAlmostEqual(proceeds, 45.0)
        self.assertNotIn("t", self.book.positions)

    def test_worst_case_equity_is_cash_alone(self):
        self.book.buy(token_id="t", market_id="m", question="q", outcome="Yes",
                      shares=100, price=0.30)
        self.assertAlmostEqual(self.book.worst_case_equity, 470.0)
        self.assertAlmostEqual(self.book.best_case_equity, 570.0)

    def test_equity_marks_at_a_supplied_price(self):
        self.book.buy(token_id="t", market_id="m", question="q", outcome="Yes",
                      shares=100, price=0.30)
        self.assertAlmostEqual(self.book.equity({"t": 0.50}), 520.0)

    def test_equity_falls_back_to_cost_without_a_price(self):
        self.book.buy(token_id="t", market_id="m", question="q", outcome="Yes",
                      shares=100, price=0.30)
        self.assertAlmostEqual(self.book.equity(), 500.0)

    def test_resolving_an_unknown_token_is_a_no_op(self):
        self.assertEqual(self.book.resolve("nope", won=True), 0.0)

    def test_state_round_trips(self):
        self.book.buy(token_id="t", market_id="m", question="q", outcome="Yes",
                      shares=100, price=0.30)
        with tempfile.TemporaryDirectory() as directory:
            path = os.path.join(directory, "pm.json")
            self.book.save(path)
            restored = PaperBook.load(path)
            self.assertAlmostEqual(restored.cash, self.book.cash)
            self.assertEqual(len(restored.positions), 1)
            self.assertAlmostEqual(restored.positions["t"].avg_price, 0.30)

    def test_saved_state_is_valid_json(self):
        with tempfile.TemporaryDirectory() as directory:
            path = os.path.join(directory, "pm.json")
            self.book.save(path)
            with open(path, encoding="utf-8") as handle:
                self.assertIn("positions", json.load(handle))

    def test_stats_report_the_realised_result(self):
        self.book.buy(token_id="a", market_id="m", question="q", outcome="Yes",
                      shares=100, price=0.30)
        self.book.resolve("a", won=True)
        self.book.buy(token_id="b", market_id="m", question="q", outcome="Yes",
                      shares=100, price=0.30)
        self.book.resolve("b", won=False)
        stats = self.book.stats()
        self.assertEqual(stats["resolved"], 2)
        self.assertAlmostEqual(stats["win_rate"], 0.5)
        self.assertAlmostEqual(stats["realised_pnl"], 40.0)

    def test_a_zero_bankroll_is_refused(self):
        with self.assertRaises(ValueError):
            PaperBook(0)


if __name__ == "__main__":
    unittest.main()
