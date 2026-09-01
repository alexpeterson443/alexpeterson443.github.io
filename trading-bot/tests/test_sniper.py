"""5 minute BTC snipe: arithmetic, rules, gates, and the recorder. All offline."""

import csv
import tempfile
import unittest
from datetime import datetime, timedelta, timezone

from tradingbot.polymarket import sniper as S
from tradingbot.polymarket.types import Level, Market, OrderBook


def book(asks=(), bids=()):
    return OrderBook(token_id="t", asks=[Level(p, s) for p, s in asks],
                     bids=[Level(p, s) for p, s in bids])


def market(seconds_left=30.0, **kwargs):
    base = dict(
        id="1", question="Bitcoin Up or Down", slug="btc-updown-5m-1788294900",
        condition_id="0x", token_ids=["up-tok", "down-tok"], outcomes=["Up", "Down"],
        outcome_prices=[0.5, 0.5],
        end_date=datetime.now(timezone.utc) + timedelta(seconds=seconds_left),
        fees_enabled=True, fee_rate=0.07, twap_lookback_seconds=60,
    )
    base.update(kwargs)
    return Market(**base)


class TestFeeArithmetic(unittest.TestCase):
    def test_fee_formula_matches_the_documented_example(self):
        """100 shares at 0.50 costs 1.75 USDC, per Polymarket's own worked example."""
        self.assertAlmostEqual(S.taker_fee(100, 0.50), 1.75)

    def test_fee_is_symmetric_and_peaks_at_a_half(self):
        self.assertAlmostEqual(S.fee_per_share(0.30), S.fee_per_share(0.70))
        self.assertGreater(S.fee_per_share(0.50), S.fee_per_share(0.85))
        self.assertGreater(S.fee_per_share(0.85), S.fee_per_share(0.99))

    def test_fee_is_zero_at_the_boundaries(self):
        self.assertEqual(S.taker_fee(10, 0.0), 0.0)
        self.assertEqual(S.taker_fee(10, 1.0), 0.0)
        self.assertEqual(S.taker_fee(0, 0.5), 0.0)

    def test_breakeven_without_fees_is_the_price(self):
        for p in (0.6, 0.75, 0.85, 0.92):
            self.assertAlmostEqual(S.breakeven_win_rate(p, rate=0.0), p)

    def test_fees_raise_the_breakeven(self):
        self.assertGreater(S.breakeven_win_rate(0.85), 0.85)

    def test_the_pitch_loses_at_its_own_prices(self):
        """Its claimed 83.3 percent win rate versus its required 0.85 entry."""
        claimed = 10 / 12
        self.assertLess(S.expectancy(0.85, claimed), 0.0)
        self.assertLess(S.expectancy(0.92, claimed), 0.0)

    def test_the_pitch_only_works_at_a_price_its_rules_forbid(self):
        claimed = 10 / 12
        self.assertGreater(S.expectancy(0.75, claimed), 0.0)
        self.assertLess(0.75, S.SnipeRules().ladder[2][1])   # below every ladder floor

    def test_wins_to_recover_matches_the_pitch_before_fees(self):
        """The pitch says 5.67 at 0.85 and 9 at 0.90, fee free."""
        self.assertAlmostEqual(S.wins_to_recover(0.85, rate=0.0), 0.85 / 0.15, places=2)
        self.assertAlmostEqual(S.wins_to_recover(0.90, rate=0.0), 9.0, places=6)

    def test_wins_to_recover_is_infinite_when_fees_eat_the_gain(self):
        """Fee exceeds the gain once rate * p >= 1; at 0.999 that needs rate > 1.001."""
        self.assertEqual(S.wins_to_recover(0.999, rate=1.5), float("inf"))
        self.assertLess(S.wins_to_recover(0.999, rate=0.5), float("inf"))

    def test_daily_projection_reproduces_the_pitch_at_75_cents(self):
        """The $48 a day figure is 24 cycles of 12 trades netting one "stake" each.

        The pitch's "$2 bet" is two shares, a two dollar payout, which at 75
        cents costs $1.50. Fed the same dollars, this reproduces its number
        exactly. Fed a literal $2 of capital it gives $64, because $2 buys 2.67
        shares. The pitch never says which it means; it is the payout.
        """
        d = S.daily_projection(stake=1.50, trades_per_day=288, price=0.75, win_rate=10 / 12, rate=0.0)
        self.assertAlmostEqual(d["daily"], 48.0, places=6)
        self.assertAlmostEqual(d["shares"], 2.0)

    def test_daily_projection_is_negative_at_the_required_entry(self):
        d = S.daily_projection(stake=2.0, trades_per_day=288, price=0.85, win_rate=10 / 12)
        self.assertLess(d["daily"], 0.0)


class TestLadder(unittest.TestCase):
    def setUp(self):
        self.rules = S.SnipeRules()

    def test_outside_the_ladder_has_no_floor(self):
        self.assertIsNone(self.rules.minimum_price(90))

    def test_each_rung_from_the_pitch(self):
        self.assertAlmostEqual(self.rules.minimum_price(55), 0.92)
        self.assertAlmostEqual(self.rules.minimum_price(40), 0.88)
        self.assertAlmostEqual(self.rules.minimum_price(20), 0.85)
        self.assertAlmostEqual(self.rules.minimum_price(10), 0.0)

    def test_boundaries_belong_to_the_tighter_rung(self):
        self.assertAlmostEqual(self.rules.minimum_price(45), 0.88)
        self.assertAlmostEqual(self.rules.minimum_price(30), 0.85)
        self.assertAlmostEqual(self.rules.minimum_price(15), 0.0)


class TestGates(unittest.TestCase):
    def go_inputs(self, **over):
        base = dict(
            seconds_left=20.0,
            up_book=book(asks=[(0.86, 500)], bids=[(0.85, 500)]),
            down_book=book(asks=[(0.15, 500)], bids=[(0.14, 500)]),
            twap_now=77_500.0, open_price=77_400.0, atr_1m=30.0,
        )
        base.update(over)
        return base

    def test_every_gate_passing_is_a_go(self):
        rules = S.SnipeRules(price_ceiling=None)
        d = S.evaluate(rules, **self.go_inputs())
        self.assertTrue(d.go, d.summary())
        self.assertEqual(d.side, "Up")
        self.assertAlmostEqual(d.price, 0.86)

    def test_the_pitch_ceiling_blocks_its_own_ladder(self):
        """Tab 2 says never above 0.80; tab 1 says 0.85 and up. Both cannot hold."""
        d = S.evaluate(S.SnipeRules(), **self.go_inputs())
        self.assertFalse(d.go)
        self.assertIn("ceiling", d.reason)

    def test_clock_gate(self):
        d = S.evaluate(S.SnipeRules(price_ceiling=None), **self.go_inputs(seconds_left=70))
        self.assertFalse(d.go)
        self.assertIn("clock", d.reason)

    def test_distance_gate(self):
        d = S.evaluate(S.SnipeRules(price_ceiling=None),
                       **self.go_inputs(twap_now=77_410.0))      # 10 away, need 45
        self.assertFalse(d.go)
        self.assertIn("distance", d.reason)

    def test_price_gate_uses_the_ladder(self):
        d = S.evaluate(S.SnipeRules(price_ceiling=None),
                       **self.go_inputs(seconds_left=40,
                                        up_book=book(asks=[(0.86, 500)])))   # floor is 0.88 here
        self.assertFalse(d.go)
        self.assertIn("price", d.reason)

    def test_leading_side_follows_the_twap_sign(self):
        d = S.evaluate(S.SnipeRules(price_ceiling=None),
                       **self.go_inputs(twap_now=77_300.0,
                                        down_book=book(asks=[(0.86, 500)])))
        self.assertEqual(d.side, "Down")

    def test_missing_data_is_a_clean_skip(self):
        d = S.evaluate(S.SnipeRules(), **self.go_inputs(twap_now=None))
        self.assertFalse(d.go)
        self.assertIn("missing", d.reason)

    def test_no_ask_is_a_skip_not_a_crash(self):
        """The observed live state at T-100s: Up bid 0.99, no asks at all."""
        d = S.evaluate(S.SnipeRules(price_ceiling=None),
                       **self.go_inputs(up_book=book(bids=[(0.99, 3000)])))
        self.assertFalse(d.go)
        self.assertIn("price", d.reason)

    def test_thin_book_blocks_on_depth(self):
        d = S.evaluate(S.SnipeRules(price_ceiling=None, stake=100.0),
                       **self.go_inputs(up_book=book(asks=[(0.86, 5)])))
        self.assertFalse(d.go)
        self.assertIn("depth", [g.name for g in d.gates if not g.passed])

    def test_min_order_size_is_respected(self):
        d = S.evaluate(S.SnipeRules(price_ceiling=None, stake=1.0), **self.go_inputs())
        self.assertGreaterEqual(d.shares, S.MIN_ORDER_SHARES)

    def test_every_gate_is_reported_even_after_a_failure(self):
        d = S.evaluate(S.SnipeRules(price_ceiling=None), **self.go_inputs(seconds_left=70))
        self.assertGreaterEqual(len(d.gates), 3)


class TestWindows(unittest.TestCase):
    def test_window_start_floors_to_five_minutes(self):
        self.assertEqual(S.window_start(1788294999), 1788294900)
        self.assertEqual(S.window_start(1788294900), 1788294900)

    def test_slug_shape_matches_the_live_pattern(self):
        self.assertEqual(S.window_slug(1788294900), "btc-updown-5m-1788294900")

    def test_lookback_reads_the_market_config(self):
        self.assertEqual(S.twap_lookback(market(twap_lookback_seconds=30)), 30)
        self.assertEqual(S.twap_lookback(market(twap_lookback_seconds=None)), S.TWAP_LOOKBACK_SECONDS)

    def test_market_parses_crypto_config_from_gamma(self):
        m = Market.from_gamma({
            "id": 1, "clobTokenIds": '["a","b"]', "outcomes": '["Up","Down"]',
            "feesEnabled": True, "feeSchedule": {"rate": 0.07, "exponent": 1},
            "cryptoMarketConfig": {"twapLookbackSeconds": 60, "asset": "btc"},
            "eventStartTime": "2026-09-02T20:25:00Z",
        })
        self.assertTrue(m.fees_enabled)
        self.assertAlmostEqual(m.fee_rate, 0.07)
        self.assertEqual(m.twap_lookback_seconds, 60)
        self.assertEqual(m.event_start.hour, 20)


class TestTwapEstimate(unittest.TestCase):
    def test_twap_weights_by_time_held(self):
        feed = S.BtcFeed()
        now = 1_000_000.0
        # 100 held for 30s, then 200 held for 10s: (100*30 + 200*10) / 40 = 125
        feed._ticks = [(now - 40, 100.0), (now - 10, 200.0), (now, 300.0)]
        import time as _t
        real = _t.time
        _t.time = lambda: now
        try:
            self.assertAlmostEqual(feed.twap(lookback=60), 125.0)
        finally:
            _t.time = real

    def test_single_tick_returns_itself(self):
        feed = S.BtcFeed()
        import time as _t
        real = _t.time
        _t.time = lambda: 1_000_000.0
        try:
            feed._ticks = [(1_000_000.0 - 5, 123.0)]
            self.assertAlmostEqual(feed.twap(), 123.0)
            feed._ticks = []
            self.assertIsNone(feed.twap())
        finally:
            _t.time = real


class FakeApi:
    """Serves canned books and a canned market, never touches the network."""

    def __init__(self, up_book, down_book, market_after=None):
        self.up_book, self.down_book, self.market_after = up_book, down_book, market_after

    def book_or_none(self, token):
        return {"up-tok": self.up_book, "down-tok": self.down_book}.get(token)

    def market_by_slug(self, slug):
        return self.market_after


class FakeFeed(S.BtcFeed):
    def __init__(self, spot=77_500.0, twap_=77_500.0, open_=77_400.0, atr=30.0):
        super().__init__()
        self._spot, self._twap, self._open, self._atr = spot, twap_, open_, atr

    def spot(self):
        return self._spot

    def twap(self, lookback=60):
        return self._twap

    def open_price_for(self, start_ts):
        return self._open

    def atr_1m(self, period=14):
        return self._atr


class TestRecorder(unittest.TestCase):
    def setUp(self):
        self.dir = tempfile.mkdtemp()
        self.api = FakeApi(book(asks=[(0.86, 500)], bids=[(0.85, 500)]),
                           book(asks=[(0.15, 500)], bids=[(0.14, 500)]))
        self.rec = S.Recorder(self.api, FakeFeed(), S.SnipeRules(price_ceiling=None), out_dir=self.dir)

    def rows(self, path):
        with open(path, newline="", encoding="utf-8") as h:
            return list(csv.DictReader(h))

    def test_headers_are_written_once(self):
        self.rec.snapshot(market(20), 1788294900)
        self.rec.snapshot(market(15), 1788294900)
        with open(self.rec.snapshots_path, encoding="utf-8") as h:
            self.assertEqual(h.read().count("recorded_at"), 1)

    def test_a_snapshot_records_every_field(self):
        d = self.rec.snapshot(market(20), 1788294900)
        row = self.rows(self.rec.snapshots_path)[0]
        self.assertEqual(row["leading"], "Up")
        self.assertEqual(row["decision"], "GO")
        self.assertEqual(row["up_ask"], "0.86")
        self.assertEqual(float(row["distance"]), 100.0)
        self.assertTrue(d.go)

    def test_a_blocked_snapshot_names_the_gate(self):
        self.rec.snapshot(market(70), 1788294900)
        row = self.rows(self.rec.snapshots_path)[0]
        self.assertEqual(row["decision"], "SKIP")
        self.assertIn("clock", row["blocked_by"])

    def test_settle_waits_for_the_oracle(self):
        self.rec.snapshot(market(20), int(__import__("time").time()))
        self.assertEqual(self.rec.settle(), [])

    def test_settle_reads_the_final_price(self):
        old_start = int(__import__("time").time()) - 400
        self.api.market_after = market(outcome_prices=[0.995, 0.005])
        self.rec.snapshot(market(20), old_start)
        settled = self.rec.settle()
        self.assertEqual(len(settled), 1)
        self.assertEqual(settled[0]["winner"], "Up")
        self.assertEqual(self.rows(self.rec.resolutions_path)[0]["winner"], "Up")

    def test_settle_falls_back_to_the_last_leader_when_gamma_drops_the_market(self):
        """Gamma deletes resolved windows within minutes. This is the observed case."""
        old_start = int(__import__("time").time()) - 400
        self.api.market_after = None
        self.rec.snapshot(market(20), old_start)
        settled = self.rec.settle()
        self.assertEqual(settled[0]["winner"], "Up")

    def test_report_joins_snapshots_to_resolutions(self):
        old_start = int(__import__("time").time()) - 400
        self.api.market_after = market(outcome_prices=[0.995, 0.005])
        self.rec.snapshot(market(20), old_start)
        self.rec.snapshot(market(10), old_start)
        self.rec.settle()
        report = self.rec.report()
        self.assertEqual(report["windows_resolved"], 1)
        rung = report["rungs"]["d_30-15s"]
        self.assertEqual(rung["observations"], 1)
        self.assertEqual(rung["win_rate"], 1.0)
        self.assertAlmostEqual(rung["median_ask"], 0.86)

    def test_report_on_empty_data_is_empty(self):
        self.assertEqual(self.rec.report()["rungs"], {})


if __name__ == "__main__":
    unittest.main()
