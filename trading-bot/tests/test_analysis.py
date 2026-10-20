import unittest
from datetime import date

from tradingbot import analysis, data as data_mod
from tradingbot.core import Trade
from tradingbot.engine import EngineConfig
from tradingbot.risk import RiskConfig

CONFIG = EngineConfig(risk=RiskConfig(fraction=0.4, max_open_positions=2))


def series(symbols=("AAA", "BBB"), start=date(2012, 1, 1), end=date(2024, 12, 31)):
    return {s: data_mod.synthetic_bars(s, start, end, seed=11) for s in symbols}


def trade(entry, exit_price, qty=10, direction=1):
    return Trade("X", date(2024, 1, 1), entry, date(2024, 2, 1), exit_price, qty,
                 direction=direction)


class TestWalkForward(unittest.TestCase):
    # Computed once for the class: a walk forward run is expensive and every
    # assertion here inspects the same result.
    @classmethod
    def setUpClass(cls):
        cls.result = analysis.walk_forward(
            "sma_crossover", series(("AAA",), date(2016, 1, 1), date(2024, 12, 31)),
            {"fast": [10, 20], "slow": [50, 100]},
            CONFIG, train_days=378, test_days=126, warmup_days=100,
        )

    def test_it_produces_folds(self):
        self.assertGreater(len(self.result.folds), 3)

    def test_train_and_test_windows_never_overlap(self):
        for fold in self.result.folds:
            self.assertLess(fold.train_end, fold.test_start)

    def test_test_windows_advance_monotonically(self):
        starts = [f.test_start for f in self.result.folds]
        self.assertEqual(starts, sorted(starts))
        self.assertEqual(len(starts), len(set(starts)))

    def test_each_fold_chose_a_parameter_set_from_the_grid(self):
        for fold in self.result.folds:
            self.assertIn(fold.best_params["fast"], (10, 20))
            self.assertIn(fold.best_params["slow"], (50, 100))

    def test_consistency_is_a_fraction(self):
        self.assertGreaterEqual(self.result.consistency, 0.0)
        self.assertLessEqual(self.result.consistency, 1.0)

    def test_parameter_stability_is_a_fraction(self):
        self.assertGreater(self.result.parameter_stability, 0.0)
        self.assertLessEqual(self.result.parameter_stability, 1.0)

    def test_summary_has_the_headline_numbers(self):
        summary = self.result.summary()
        for key in ("folds", "total_return", "worst_fold", "consistency",
                    "parameter_stability"):
            self.assertIn(key, summary)

    def test_too_little_history_is_reported(self):
        short = {"AAA": data_mod.synthetic_bars("AAA", date(2024, 1, 1), date(2024, 3, 1))}
        with self.assertRaises(ValueError):
            analysis.walk_forward("sma_crossover", short, {"fast": [10], "slow": [50]},
                                  CONFIG, train_days=504, test_days=126)


class TestMonteCarlo(unittest.TestCase):
    def setUp(self):
        self.trades = [trade(100, 110), trade(100, 95), trade(100, 120), trade(100, 90)]

    def test_bootstrap_produces_a_spread_of_outcomes(self):
        result = analysis.monte_carlo(self.trades, 10_000, trials=500, method="bootstrap")
        summary = result.summary()
        self.assertNotAlmostEqual(summary["p05_return"], summary["p95_return"])

    def test_shuffle_ends_at_the_same_equity_every_time(self):
        """Compounding is commutative, so shuffling cannot change the final value.

        This is exactly why shuffle mode is only informative about drawdown.
        """
        result = analysis.monte_carlo(self.trades, 10_000, trials=200, method="shuffle")
        self.assertEqual(len(set(round(e, 6) for e in result.final_equities)), 1)

    def test_shuffle_still_varies_the_drawdown(self):
        result = analysis.monte_carlo(self.trades, 10_000, trials=200, method="shuffle")
        self.assertGreater(len(set(round(d, 6) for d in result.drawdowns)), 1)

    def test_it_is_reproducible_for_a_fixed_seed(self):
        a = analysis.monte_carlo(self.trades, 10_000, trials=100, seed=7)
        b = analysis.monte_carlo(self.trades, 10_000, trials=100, seed=7)
        self.assertEqual(a.final_equities, b.final_equities)

    def test_all_winning_trades_never_lose(self):
        winners = [trade(100, 110) for _ in range(5)]
        result = analysis.monte_carlo(winners, 10_000, trials=200)
        self.assertEqual(result.summary()["probability_of_loss"], 0.0)

    def test_all_losing_trades_always_lose(self):
        losers = [trade(100, 90) for _ in range(5)]
        result = analysis.monte_carlo(losers, 10_000, trials=200)
        self.assertEqual(result.summary()["probability_of_loss"], 1.0)

    def test_it_needs_at_least_one_trade(self):
        with self.assertRaises(ValueError):
            analysis.monte_carlo([], 10_000)

    def test_an_unknown_method_is_rejected(self):
        with self.assertRaises(ValueError):
            analysis.monte_carlo(self.trades, 10_000, method="vibes")

    def test_percentiles_are_ordered(self):
        result = analysis.monte_carlo(self.trades, 10_000, trials=500)
        summary = result.summary()
        self.assertLessEqual(summary["p05_return"], summary["median_return"])
        self.assertLessEqual(summary["median_return"], summary["p95_return"])


class TestParameterSurface(unittest.TestCase):
    def test_it_scores_every_valid_combination(self):
        rows = analysis.parameter_surface(
            "sma_crossover", series(("AAA",)), {"fast": [10, 20], "slow": [50, 100]}, CONFIG
        )
        self.assertEqual(len(rows), 4)

    def test_results_are_sorted_best_first(self):
        rows = analysis.parameter_surface(
            "sma_crossover", series(("AAA",)), {"fast": [5, 10, 20], "slow": [50, 100]}, CONFIG
        )
        scores = [r["score"] for r in rows]
        self.assertEqual(scores, sorted(scores, reverse=True))

    def test_invalid_combinations_are_skipped(self):
        rows = analysis.parameter_surface(
            "sma_crossover", series(("AAA",)), {"fast": [50], "slow": [50]}, CONFIG
        )
        self.assertEqual(rows, [])

    def test_a_flat_surface_scores_near_one(self):
        rows = [{"score": 1.0}, {"score": 1.0}, {"score": 1.0}, {"score": 1.0}]
        self.assertAlmostEqual(analysis.plateau_score(rows), 1.0)

    def test_a_lone_spike_scores_low(self):
        rows = [{"score": 10.0}, {"score": 0.1}, {"score": 0.1}, {"score": 0.1},
                {"score": 0.1}, {"score": 0.1}, {"score": 0.1}, {"score": 0.1},
                {"score": 0.1}, {"score": 0.1}]
        self.assertLess(analysis.plateau_score(rows, top_fraction=0.5), 0.5)

    def test_an_empty_surface_scores_zero(self):
        self.assertEqual(analysis.plateau_score([]), 0.0)


if __name__ == "__main__":
    unittest.main()
