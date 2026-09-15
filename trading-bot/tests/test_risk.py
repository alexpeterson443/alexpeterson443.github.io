import unittest
from datetime import date

from tradingbot.core import Bar, Position
from tradingbot.risk import RiskConfig, RiskManager, SizingMode

DAY = date(2024, 5, 1)


class TestRiskConfigValidation(unittest.TestCase):
    def test_rejects_unknown_sizing_mode(self):
        with self.assertRaises(ValueError):
            RiskManager(RiskConfig(sizing="astrology"))

    def test_rejects_fraction_above_one(self):
        with self.assertRaises(ValueError):
            RiskManager(RiskConfig(fraction=1.5))

    def test_rejects_negative_position_count(self):
        with self.assertRaises(ValueError):
            RiskManager(RiskConfig(max_open_positions=0))

    def test_rejects_out_of_range_stop(self):
        with self.assertRaises(ValueError):
            RiskManager(RiskConfig(stop_loss_pct=1.5))


class TestSizing(unittest.TestCase):
    def test_fixed_fraction_uses_equity(self):
        manager = RiskManager(RiskConfig(fraction=0.2, cash_buffer_pct=0.0))
        self.assertEqual(manager.target_qty(equity=10_000, cash=10_000, price=50), 40)

    def test_fixed_dollar_ignores_equity(self):
        manager = RiskManager(
            RiskConfig(sizing=SizingMode.FIXED_DOLLAR, dollars=1_000, cash_buffer_pct=0.0)
        )
        self.assertEqual(manager.target_qty(equity=50_000, cash=50_000, price=100), 10)

    def test_atr_sizing_risks_the_configured_fraction(self):
        manager = RiskManager(
            RiskConfig(sizing=SizingMode.ATR_RISK, risk_per_trade=0.01,
                       atr_stop_mult=2.0, max_position_pct=1.0, cash_buffer_pct=0.0)
        )
        # Risk 100 dollars with a 5 dollar stop distance, so 20 shares.
        self.assertEqual(manager.target_qty(equity=10_000, cash=10_000, price=100, atr=2.5), 20)

    def test_atr_sizing_declines_without_a_volatility_estimate(self):
        manager = RiskManager(RiskConfig(sizing=SizingMode.ATR_RISK))
        self.assertEqual(manager.target_qty(equity=10_000, cash=10_000, price=100, atr=None), 0)

    def test_max_position_pct_caps_the_order(self):
        manager = RiskManager(RiskConfig(fraction=0.9, max_position_pct=0.25, cash_buffer_pct=0.0))
        self.assertEqual(manager.target_qty(equity=10_000, cash=10_000, price=100), 25)

    def test_available_cash_caps_the_order(self):
        manager = RiskManager(RiskConfig(fraction=0.5, cash_buffer_pct=0.0))
        self.assertEqual(manager.target_qty(equity=10_000, cash=300, price=100), 3)

    def test_cash_buffer_is_withheld(self):
        manager = RiskManager(RiskConfig(fraction=1.0, max_position_pct=1.0, cash_buffer_pct=0.10))
        self.assertEqual(manager.target_qty(equity=10_000, cash=10_000, price=100), 90)

    def test_position_limit_blocks_new_entries(self):
        manager = RiskManager(RiskConfig(max_open_positions=3))
        self.assertEqual(manager.target_qty(equity=10_000, cash=10_000, price=10, open_positions=3), 0)

    def test_halted_manager_sizes_to_zero(self):
        manager = RiskManager(RiskConfig())
        manager.check_halt(DAY, 5_000, 10_000)
        self.assertEqual(manager.target_qty(equity=5_000, cash=5_000, price=10), 0)


class TestStops(unittest.TestCase):
    def _position(self, **kwargs):
        base = dict(symbol="X", qty=10, avg_price=100.0, opened_at=DAY, high_water=100.0)
        base.update(kwargs)
        return Position(**base)

    def test_percent_stop_is_placed_below_entry(self):
        manager = RiskManager(RiskConfig(stop_loss_pct=0.08))
        self.assertAlmostEqual(manager.initial_stop(100.0), 92.0)

    def test_no_stop_when_disabled(self):
        manager = RiskManager(RiskConfig(stop_loss_pct=None))
        self.assertIsNone(manager.initial_stop(100.0))

    def test_atr_and_percent_stops_pick_the_tighter_one(self):
        manager = RiskManager(
            RiskConfig(sizing=SizingMode.ATR_RISK, stop_loss_pct=0.20, atr_stop_mult=2.0)
        )
        # Percent stop is 80, ATR stop is 95. The tighter stop wins.
        self.assertAlmostEqual(manager.initial_stop(100.0, atr=2.5), 95.0)

    def test_stop_triggers_when_the_low_touches_it(self):
        manager = RiskManager(RiskConfig())
        decision = manager.check_exit(
            self._position(stop_price=92.0), Bar(DAY, 95.0, 96.0, 91.0, 93.0)
        )
        self.assertTrue(decision.should_exit)
        self.assertAlmostEqual(decision.price, 92.0)

    def test_gap_down_fills_at_the_open_not_the_stop(self):
        manager = RiskManager(RiskConfig())
        decision = manager.check_exit(
            self._position(stop_price=92.0), Bar(DAY, 85.0, 86.0, 84.0, 85.5)
        )
        self.assertTrue(decision.should_exit)
        self.assertAlmostEqual(decision.price, 85.0)

    def test_target_triggers_when_the_high_touches_it(self):
        manager = RiskManager(RiskConfig())
        decision = manager.check_exit(
            self._position(target_price=110.0), Bar(DAY, 105.0, 112.0, 104.0, 111.0)
        )
        self.assertTrue(decision.should_exit)
        self.assertAlmostEqual(decision.price, 110.0)

    def test_stop_wins_when_a_bar_touches_both(self):
        manager = RiskManager(RiskConfig())
        decision = manager.check_exit(
            self._position(stop_price=92.0, target_price=110.0),
            Bar(DAY, 100.0, 115.0, 90.0, 108.0),
        )
        self.assertTrue(decision.should_exit)
        self.assertAlmostEqual(decision.price, 92.0)

    def test_trailing_stop_follows_the_high_water_mark(self):
        manager = RiskManager(RiskConfig(trailing_stop_pct=0.10))
        decision = manager.check_exit(
            self._position(high_water=120.0), Bar(DAY, 110.0, 111.0, 105.0, 106.0)
        )
        self.assertTrue(decision.should_exit)
        self.assertAlmostEqual(decision.price, 108.0)

    def test_quiet_bar_does_not_exit(self):
        manager = RiskManager(RiskConfig())
        decision = manager.check_exit(
            self._position(stop_price=92.0), Bar(DAY, 100.0, 102.0, 99.0, 101.0)
        )
        self.assertFalse(decision.should_exit)

    def test_closed_position_never_exits(self):
        manager = RiskManager(RiskConfig())
        self.assertFalse(manager.check_exit(Position("X"), Bar(DAY, 1, 2, 0.5, 1)).should_exit)


class TestKillSwitch(unittest.TestCase):
    def test_drawdown_beyond_the_limit_halts(self):
        manager = RiskManager(RiskConfig(max_drawdown_pct=0.25))
        self.assertIsNotNone(manager.check_halt(DAY, 7_000, 10_000))
        self.assertTrue(manager.halted)

    def test_drawdown_inside_the_limit_does_not_halt(self):
        manager = RiskManager(RiskConfig(max_drawdown_pct=0.25))
        self.assertIsNone(manager.check_halt(DAY, 9_000, 10_000))
        self.assertFalse(manager.halted)

    def test_daily_loss_limit_halts(self):
        manager = RiskManager(RiskConfig(max_drawdown_pct=None, max_daily_loss_pct=0.05))
        manager.check_halt(DAY, 10_000, 10_000)
        self.assertIsNotNone(manager.check_halt(DAY, 9_000, 10_000))

    def test_a_new_day_resets_the_daily_baseline(self):
        manager = RiskManager(RiskConfig(max_drawdown_pct=None, max_daily_loss_pct=0.05))
        manager.check_halt(date(2024, 5, 1), 10_000, 10_000)
        self.assertIsNone(manager.check_halt(date(2024, 5, 2), 9_000, 10_000))

    def test_resume_clears_the_halt(self):
        manager = RiskManager(RiskConfig(max_drawdown_pct=0.10))
        manager.check_halt(DAY, 5_000, 10_000)
        manager.resume()
        self.assertFalse(manager.halted)


if __name__ == "__main__":
    unittest.main()
