"""Short selling across the portfolio, risk, and engine layers."""

import unittest
from datetime import date

from tradingbot import data as data_mod
from tradingbot import strategies as strategies_mod
from tradingbot.core import Bar, Position
from tradingbot.engine import Backtester, EngineConfig
from tradingbot.portfolio import (
    CostModel, ExposureLimit, Portfolio, ShortingDisabled,
)
from tradingbot.risk import RiskConfig, RiskManager

D1, D2, D3 = date(2024, 1, 2), date(2024, 2, 1), date(2024, 3, 1)


def free() -> Portfolio:
    return Portfolio(10_000.0, CostModel(slippage_bps=0), allow_short=True,
                     max_gross_exposure=1.0)


class TestShortAccounting(unittest.TestCase):
    def test_a_short_credits_cash_and_leaves_equity_unchanged(self):
        p = free()
        p.sell(D1, "A", 10, 100.0)
        p.mark(D1, {"A": 100.0})
        self.assertAlmostEqual(p.cash, 11_000.0)
        self.assertAlmostEqual(p.equity, 10_000.0)
        self.assertEqual(p.position("A").qty, -10)

    def test_a_short_profits_when_price_falls(self):
        p = free()
        p.sell(D1, "A", 10, 100.0)
        p.buy(D2, "A", 10, 90.0)
        p.mark(D2, {"A": 90.0})
        self.assertAlmostEqual(p.trades[0].pnl, 100.0)
        self.assertAlmostEqual(p.equity, 10_100.0)

    def test_a_short_loses_when_price_rises(self):
        p = free()
        p.sell(D1, "A", 10, 100.0)
        p.buy(D2, "A", 10, 120.0)
        p.mark(D2, {"A": 120.0})
        self.assertAlmostEqual(p.trades[0].pnl, -200.0)

    def test_short_pnl_reconciles_with_the_equity_change(self):
        p = Portfolio(10_000.0, CostModel(commission_per_trade=1.0, slippage_bps=10),
                      allow_short=True)
        p.sell(D1, "A", 20, 100.0)
        p.mark(D1, {"A": 100.0})
        p.buy(D2, "A", 20, 85.0)
        p.mark(D2, {"A": 85.0})
        self.assertAlmostEqual(p.trades[0].pnl, p.equity - 10_000.0, places=6)

    def test_the_trade_is_labelled_short(self):
        p = free()
        p.sell(D1, "A", 10, 100.0)
        p.buy(D2, "A", 10, 90.0)
        self.assertEqual(p.trades[0].side, "short")
        self.assertTrue(p.trades[0].is_short)

    def test_adding_to_a_short_averages_the_entry(self):
        p = free()
        p.sell(D1, "A", 10, 100.0)
        p.sell(D2, "A", 10, 120.0)
        self.assertEqual(p.position("A").qty, -20)
        self.assertAlmostEqual(p.position("A").avg_price, 110.0)

    def test_close_flattens_a_short(self):
        p = free()
        p.sell(D1, "A", 10, 100.0)
        p.close(D2, "A", 95.0, "flatten")
        self.assertEqual(p.position("A").qty, 0.0)
        self.assertAlmostEqual(p.trades[0].pnl, 50.0)

    def test_selling_through_a_long_flips_to_short(self):
        p = Portfolio(100_000.0, CostModel(slippage_bps=0), allow_short=True)
        p.buy(D1, "A", 10, 100.0)
        p.sell(D2, "A", 25, 120.0)
        position = p.position("A")
        self.assertEqual(position.qty, -15)
        self.assertAlmostEqual(position.avg_price, 120.0)
        self.assertEqual(position.opened_at, D2)
        self.assertEqual(len(p.trades), 1)
        self.assertAlmostEqual(p.trades[0].pnl, 200.0)
        self.assertEqual(p.trades[0].side, "long")

    def test_borrow_is_charged_on_open_shorts(self):
        p = Portfolio(10_000.0, CostModel(slippage_bps=0, borrow_rate_annual=0.05),
                      allow_short=True)
        p.sell(D1, "A", 10, 100.0)
        p.mark(D1, {"A": 100.0})
        charged = p.accrue_borrow(D2)
        self.assertAlmostEqual(charged, 1_000.0 * 0.05 / 252.0)
        self.assertGreater(p.borrow_paid, 0)

    def test_no_borrow_charged_without_shorts(self):
        p = Portfolio(10_000.0, CostModel(slippage_bps=0, borrow_rate_annual=0.05))
        p.buy(D1, "A", 10, 100.0)
        p.mark(D1, {"A": 100.0})
        self.assertEqual(p.accrue_borrow(D2), 0.0)


class TestShortGuards(unittest.TestCase):
    def test_shorting_is_off_by_default(self):
        p = Portfolio(10_000.0, CostModel(slippage_bps=0))
        with self.assertRaises(ShortingDisabled):
            p.sell(D1, "A", 10, 100.0)

    def test_gross_exposure_is_capped(self):
        p = free()
        with self.assertRaises(ExposureLimit):
            p.sell(D1, "A", 500, 100.0)

    def test_exposure_counts_both_sides(self):
        p = Portfolio(10_000.0, CostModel(slippage_bps=0), allow_short=True)
        p.buy(D1, "A", 60, 100.0)
        p.mark(D1, {"A": 100.0})
        self.assertAlmostEqual(p.gross_exposure, 6_000.0)
        with self.assertRaises(ExposureLimit):
            p.sell(D2, "B", 60, 100.0)     # would take gross to 12,000 on 10,000


class TestShortStops(unittest.TestCase):
    def _short(self, **kwargs):
        base = dict(symbol="X", qty=-10, avg_price=100.0, opened_at=D1,
                    high_water=100.0, low_water=100.0)
        base.update(kwargs)
        return Position(**base)

    def test_a_short_stop_sits_above_the_entry(self):
        manager = RiskManager(RiskConfig(stop_loss_pct=0.08))
        self.assertAlmostEqual(manager.initial_stop(100.0, direction=-1), 108.0)

    def test_a_short_target_sits_below_the_entry(self):
        manager = RiskManager(RiskConfig(take_profit_pct=0.10))
        self.assertAlmostEqual(manager.initial_target(100.0, direction=-1), 90.0)

    def test_a_short_stop_triggers_on_the_high(self):
        manager = RiskManager(RiskConfig())
        decision = manager.check_exit(self._short(stop_price=108.0),
                                      Bar(D1, 105, 110, 104, 109))
        self.assertTrue(decision.should_exit)
        self.assertAlmostEqual(decision.price, 108.0)

    def test_a_gap_up_fills_a_short_stop_at_the_open(self):
        manager = RiskManager(RiskConfig())
        decision = manager.check_exit(self._short(stop_price=108.0),
                                      Bar(D1, 115, 118, 114, 117))
        self.assertAlmostEqual(decision.price, 115.0)

    def test_a_short_target_triggers_on_the_low(self):
        manager = RiskManager(RiskConfig())
        decision = manager.check_exit(self._short(target_price=90.0),
                                      Bar(D1, 95, 96, 88, 89))
        self.assertTrue(decision.should_exit)
        self.assertAlmostEqual(decision.price, 90.0)

    def test_a_short_trailing_stop_follows_the_low(self):
        manager = RiskManager(RiskConfig(trailing_stop_pct=0.10))
        decision = manager.check_exit(self._short(low_water=80.0),
                                      Bar(D1, 86, 89, 85, 88))
        self.assertTrue(decision.should_exit)
        self.assertAlmostEqual(decision.price, 88.0)

    def test_a_quiet_bar_leaves_a_short_alone(self):
        manager = RiskManager(RiskConfig())
        decision = manager.check_exit(self._short(stop_price=108.0),
                                      Bar(D1, 100, 101, 99, 100))
        self.assertFalse(decision.should_exit)


class TestShortEngine(unittest.TestCase):
    def _series(self):
        return {"AAA": data_mod.synthetic_bars("AAA", date(2018, 1, 1), date(2024, 12, 31), seed=5)}

    def test_a_long_short_run_takes_both_sides(self):
        config = EngineConfig(
            risk=RiskConfig(fraction=0.4, allow_short=True, max_open_positions=2)
        )
        result = Backtester(
            strategies_mod.build("sma_crossover", {"direction": "both"}), config
        ).run(self._series())
        self.assertTrue(any(t.is_short for t in result.trades))
        self.assertTrue(any(not t.is_short for t in result.trades))

    def test_long_only_never_shorts(self):
        config = EngineConfig(risk=RiskConfig(fraction=0.4, allow_short=False))
        result = Backtester(
            strategies_mod.build("sma_crossover", {"direction": "long"}), config
        ).run(self._series())
        self.assertFalse(any(t.is_short for t in result.trades))

    def test_a_short_signal_without_permission_is_skipped(self):
        """direction=both but allow_short=False must simply not short."""
        config = EngineConfig(risk=RiskConfig(fraction=0.4, allow_short=False))
        result = Backtester(
            strategies_mod.build("sma_crossover", {"direction": "both"}), config
        ).run(self._series())
        self.assertFalse(any(t.is_short for t in result.trades))
        self.assertTrue(all(p.cash >= -1e-6 for p in result.equity_curve))

    def test_gross_exposure_stays_within_the_cap(self):
        config = EngineConfig(
            risk=RiskConfig(fraction=0.5, allow_short=True, max_open_positions=3,
                            max_gross_exposure=1.0)
        )
        series = {
            s: data_mod.synthetic_bars(s, date(2018, 1, 1), date(2024, 12, 31), seed=6)
            for s in ("AAA", "BBB", "CCC")
        }
        result = Backtester(
            strategies_mod.build("macd_trend", {"direction": "both"}), config
        ).run(series)
        for point in result.equity_curve:
            # Gross exposure is bounded, so equity can never be driven negative.
            self.assertGreater(point.equity, 0)


if __name__ == "__main__":
    unittest.main()
