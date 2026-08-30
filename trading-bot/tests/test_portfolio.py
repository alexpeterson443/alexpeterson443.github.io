import unittest
from datetime import date

from tradingbot.portfolio import CostModel, InsufficientFunds, Portfolio

DAY1 = date(2024, 1, 2)
DAY2 = date(2024, 3, 1)


class TestCostModel(unittest.TestCase):
    def test_slippage_hurts_in_both_directions(self):
        costs = CostModel(slippage_bps=10)
        from tradingbot.core import Side

        self.assertGreater(costs.fill_price(Side.BUY, 100.0), 100.0)
        self.assertLess(costs.fill_price(Side.SELL, 100.0), 100.0)

    def test_commission_components_add_up(self):
        costs = CostModel(commission_per_trade=1.0, commission_per_share=0.005, commission_bps=10)
        # 1.00 flat + 10 * 0.005 + 0.001 * 10 * 100
        self.assertAlmostEqual(costs.commission(10, 100.0), 1.0 + 0.05 + 1.0)

    def test_minimum_commission_is_respected(self):
        costs = CostModel(commission_per_share=0.001, min_commission=1.0)
        self.assertAlmostEqual(costs.commission(10, 50.0), 1.0)

    def test_zero_cost_model_charges_nothing(self):
        self.assertEqual(CostModel(slippage_bps=0).commission(100, 50.0), 0.0)


class TestPortfolio(unittest.TestCase):
    def setUp(self):
        self.portfolio = Portfolio(10_000.0, CostModel(slippage_bps=0))

    def test_starting_cash_must_be_positive(self):
        with self.assertRaises(ValueError):
            Portfolio(0)

    def test_buy_reduces_cash_and_opens_a_position(self):
        self.portfolio.buy(DAY1, "AAPL", 10, 100.0)
        self.assertAlmostEqual(self.portfolio.cash, 9_000.0)
        self.assertTrue(self.portfolio.is_long("AAPL"))
        self.assertEqual(self.portfolio.position("AAPL").qty, 10)

    def test_cannot_spend_more_cash_than_held(self):
        with self.assertRaises(InsufficientFunds):
            self.portfolio.buy(DAY1, "AAPL", 1_000, 100.0)

    def test_shares_are_whole_unless_fractional_is_enabled(self):
        self.portfolio.buy(DAY1, "AAPL", 10.7, 100.0)
        self.assertEqual(self.portfolio.position("AAPL").qty, 10)

    def test_fractional_shares_are_kept_when_enabled(self):
        portfolio = Portfolio(10_000.0, CostModel(slippage_bps=0), fractional=True)
        portfolio.buy(DAY1, "AAPL", 10.5, 100.0)
        self.assertAlmostEqual(portfolio.position("AAPL").qty, 10.5)

    def test_averaging_up_recomputes_the_basis(self):
        self.portfolio.buy(DAY1, "AAPL", 10, 100.0)
        self.portfolio.buy(DAY1, "AAPL", 10, 120.0)
        self.assertAlmostEqual(self.portfolio.position("AAPL").avg_price, 110.0)

    def test_selling_closes_the_position_and_records_a_trade(self):
        self.portfolio.buy(DAY1, "AAPL", 10, 100.0)
        self.portfolio.sell(DAY2, "AAPL", 10, 130.0, "target")
        self.assertFalse(self.portfolio.is_long("AAPL"))
        self.assertEqual(len(self.portfolio.trades), 1)
        self.assertAlmostEqual(self.portfolio.trades[0].pnl, 300.0)

    def test_cannot_sell_more_than_held(self):
        self.portfolio.buy(DAY1, "AAPL", 10, 100.0)
        self.portfolio.sell(DAY2, "AAPL", 999, 110.0)
        self.assertEqual(self.portfolio.trades[0].qty, 10)
        self.assertFalse(self.portfolio.is_long("AAPL"))

    def test_selling_nothing_is_a_no_op(self):
        self.assertIsNone(self.portfolio.sell(DAY2, "AAPL", 5, 100.0))
        self.assertEqual(self.portfolio.trades, [])

    def test_trade_pnl_reconciles_with_the_equity_change(self):
        """The most important invariant in the whole accounting layer."""
        portfolio = Portfolio(10_000.0, CostModel(commission_per_trade=1.0, slippage_bps=10))
        qty = portfolio.affordable_qty(100.0, 5_000.0)
        portfolio.buy(DAY1, "AAPL", qty, 100.0)
        portfolio.mark(DAY1, {"AAPL": 100.0})
        portfolio.sell(DAY2, "AAPL", qty, 120.0)
        portfolio.mark(DAY2, {"AAPL": 120.0})
        self.assertAlmostEqual(portfolio.trades[0].pnl, portfolio.equity - 10_000.0, places=6)

    def test_affordable_qty_leaves_room_for_costs(self):
        portfolio = Portfolio(1_000.0, CostModel(commission_per_trade=5.0, slippage_bps=0))
        qty = portfolio.affordable_qty(100.0, 1_000.0)
        portfolio.buy(DAY1, "AAPL", qty, 100.0)  # must not raise
        self.assertGreaterEqual(portfolio.cash, 0.0)

    def test_marking_builds_the_equity_curve(self):
        self.portfolio.buy(DAY1, "AAPL", 10, 100.0)
        self.portfolio.mark(DAY1, {"AAPL": 100.0})
        self.portfolio.mark(DAY2, {"AAPL": 150.0})
        self.assertEqual(len(self.portfolio.equity_curve), 2)
        self.assertAlmostEqual(self.portfolio.equity, 10_500.0)

    def test_marking_without_a_price_is_an_error(self):
        self.portfolio.buy(DAY1, "AAPL", 10, 100.0)
        with self.assertRaises(KeyError):
            self.portfolio.mark(DAY1, {})

    def test_marking_tracks_the_high_water_mark(self):
        self.portfolio.buy(DAY1, "AAPL", 10, 100.0)
        self.portfolio.mark(DAY1, {"AAPL": 130.0})
        self.portfolio.mark(DAY2, {"AAPL": 110.0})
        self.assertAlmostEqual(self.portfolio.position("AAPL").high_water, 130.0)

    def test_equity_includes_positions_before_any_marking(self):
        """Regression: equity used to read the last marked point.

        A portfolio restored from saved state has an empty equity curve, so it
        reported cash alone and every position it held was invisible. That
        understated equity and mis-sized every order that followed.
        """
        self.portfolio.buy(DAY1, "AAPL", 10, 100.0)
        self.assertEqual(self.portfolio.equity_curve, [])
        self.assertAlmostEqual(self.portfolio.equity, 10_000.0)

    def test_equity_follows_the_latest_known_price(self):
        self.portfolio.buy(DAY1, "AAPL", 10, 100.0)
        self.portfolio.update_prices({"AAPL": 150.0})
        self.assertAlmostEqual(self.portfolio.equity, 10_500.0)

    def test_equity_reacts_to_a_cash_change_without_remarking(self):
        self.portfolio.buy(DAY1, "AAPL", 10, 100.0)
        self.portfolio.mark(DAY1, {"AAPL": 100.0})
        self.portfolio.cash -= 1_000.0
        self.assertAlmostEqual(self.portfolio.equity, 9_000.0)

    def test_peak_equity_accounts_for_the_live_value(self):
        self.portfolio.buy(DAY1, "AAPL", 10, 100.0)
        self.portfolio.mark(DAY1, {"AAPL": 100.0})
        self.portfolio.update_prices({"AAPL": 200.0})
        self.assertAlmostEqual(self.portfolio.peak_equity, 11_000.0)

    def test_costs_are_reported(self):
        portfolio = Portfolio(10_000.0, CostModel(commission_per_trade=2.0, slippage_bps=10))
        portfolio.buy(DAY1, "AAPL", 10, 100.0)
        self.assertGreater(portfolio.total_costs, 2.0)


if __name__ == "__main__":
    unittest.main()
