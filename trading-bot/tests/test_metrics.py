import math
import unittest
from datetime import date, timedelta

from tradingbot import metrics
from tradingbot.core import EquityPoint, Trade


def curve(values, start=date(2024, 1, 1), step=1):
    return [EquityPoint(start + timedelta(days=i * step), v, 0.0) for i, v in enumerate(values)]


class TestReturns(unittest.TestCase):
    def test_total_return(self):
        self.assertAlmostEqual(metrics.total_return(curve([100, 150])), 0.5)

    def test_total_return_of_a_single_point_is_zero(self):
        self.assertEqual(metrics.total_return(curve([100])), 0.0)

    def test_cagr_of_exactly_ten_percent_a_year(self):
        points = [
            EquityPoint(date(2022, 1, 1) + timedelta(days=i), 1_000 * (1.10 ** (i / 365.25)), 0.0)
            for i in range(731)
        ]
        self.assertAlmostEqual(metrics.cagr(points), 0.10, places=6)

    def test_cagr_is_zero_over_no_elapsed_time(self):
        same_day = [EquityPoint(date(2024, 1, 1), 100, 0.0), EquityPoint(date(2024, 1, 1), 200, 0.0)]
        self.assertEqual(metrics.cagr(same_day), 0.0)

    def test_daily_returns_length_is_one_less_than_the_curve(self):
        self.assertEqual(len(metrics.daily_returns(curve([100, 110, 121]))), 2)


class TestRiskAdjusted(unittest.TestCase):
    def test_sharpe_of_a_constant_series_is_zero(self):
        self.assertEqual(metrics.sharpe([0.001] * 100), 0.0)

    def test_sharpe_of_too_few_points_is_zero(self):
        self.assertEqual(metrics.sharpe([0.01]), 0.0)

    def test_positive_drift_gives_a_positive_sharpe(self):
        returns = [0.01, -0.005, 0.012, -0.004, 0.008] * 20
        self.assertGreater(metrics.sharpe(returns), 0)

    def test_risk_free_rate_lowers_sharpe(self):
        returns = [0.001] * 50 + [0.002] * 50
        self.assertGreater(metrics.sharpe(returns, 0.0), metrics.sharpe(returns, 0.05))

    def test_sortino_ignores_upside_volatility(self):
        returns = [0.05, 0.001, 0.06, 0.001] * 20
        self.assertGreaterEqual(metrics.sortino(returns), metrics.sharpe(returns))

    def test_sortino_without_losses_is_infinite(self):
        self.assertTrue(math.isinf(metrics.sortino([0.01] * 10)))


class TestDrawdown(unittest.TestCase):
    def test_peak_to_trough_depth(self):
        result = metrics.max_drawdown(curve([100, 120, 90, 130]))
        self.assertAlmostEqual(result["max_drawdown"], 0.25)

    def test_records_the_peak_and_trough_dates(self):
        result = metrics.max_drawdown(curve([100, 120, 90, 130]))
        self.assertEqual(result["peak_date"], date(2024, 1, 2))
        self.assertEqual(result["trough_date"], date(2024, 1, 3))

    def test_recovery_is_detected(self):
        self.assertTrue(metrics.max_drawdown(curve([100, 120, 90, 130]))["recovered"])

    def test_an_unrecovered_drawdown_is_reported(self):
        self.assertFalse(metrics.max_drawdown(curve([100, 120, 90, 95]))["recovered"])

    def test_a_rising_curve_has_no_drawdown(self):
        self.assertEqual(metrics.max_drawdown(curve([100, 110, 120]))["max_drawdown"], 0.0)

    def test_empty_curve_is_handled(self):
        self.assertEqual(metrics.max_drawdown([])["max_drawdown"], 0.0)


class TestTradeStats(unittest.TestCase):
    def _trade(self, entry, exit_price, qty=10, costs=0.0):
        return Trade("X", date(2024, 1, 1), entry, date(2024, 2, 1), exit_price, qty, costs)

    def test_no_trades_produces_zeroes(self):
        self.assertEqual(metrics.trade_stats([])["trades"], 0)

    def test_win_rate(self):
        trades = [self._trade(100, 110), self._trade(100, 90), self._trade(100, 105)]
        self.assertAlmostEqual(metrics.trade_stats(trades)["win_rate"], 2 / 3)

    def test_profit_factor(self):
        trades = [self._trade(100, 110), self._trade(100, 95)]
        # 100 of profit against 50 of loss.
        self.assertAlmostEqual(metrics.trade_stats(trades)["profit_factor"], 2.0)

    def test_profit_factor_without_losses_is_infinite(self):
        self.assertTrue(math.isinf(metrics.trade_stats([self._trade(100, 110)])["profit_factor"]))

    def test_expectancy_is_the_mean_pnl(self):
        trades = [self._trade(100, 110), self._trade(100, 90)]
        self.assertAlmostEqual(metrics.trade_stats(trades)["expectancy"], 0.0)

    def test_costs_reduce_pnl(self):
        self.assertAlmostEqual(self._trade(100, 110, costs=25.0).pnl, 75.0)

    def test_return_pct_is_relative_to_the_basis(self):
        self.assertAlmostEqual(self._trade(100, 110).return_pct, 0.10)


class TestSummary(unittest.TestCase):
    def test_summary_contains_the_expected_keys(self):
        stats = metrics.summarize(curve([100, 110, 105, 120]), [])
        for key in ("total_return", "cagr", "sharpe", "max_drawdown", "exposure", "trades"):
            self.assertIn(key, stats)

    def test_benchmark_comparison_is_included(self):
        stats = metrics.summarize(curve([100, 110]), [], benchmark=curve([100, 105]))
        self.assertAlmostEqual(stats["excess_return"], 0.05)

    def test_exposure_counts_invested_days(self):
        points = [
            EquityPoint(date(2024, 1, 1), 100, 0.0),
            EquityPoint(date(2024, 1, 2), 100, 50.0),
        ]
        self.assertAlmostEqual(metrics.exposure(points), 0.5)


if __name__ == "__main__":
    unittest.main()
