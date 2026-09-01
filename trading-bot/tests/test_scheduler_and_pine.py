import re
import unittest
from datetime import datetime

from tradingbot import pine
from tradingbot.scheduler import Scheduler
from tradingbot.strategies import REGISTRY


class FakeJournal:
    def __init__(self):
        self.rows = []

    def record(self, **row):
        self.rows.append(row)


class FakeTrader:
    """Stands in for a Trader so the scheduler can be tested without a broker."""

    mode = "paper"

    def __init__(self, explode=False):
        self.calls = 0
        self.explode = explode
        self.journal = FakeJournal()

    def step(self, **kwargs):
        self.calls += 1
        if self.explode:
            raise RuntimeError("data provider fell over")
        return []


class TestSchedulerTiming(unittest.TestCase):
    def daily(self, **kwargs):
        return Scheduler(FakeTrader(), mode="daily", minutes_before_close=10, **kwargs)

    def test_it_fires_inside_the_window_before_the_close(self):
        self.assertTrue(self.daily().should_run_now(datetime(2026, 8, 31, 15, 55)))

    def test_it_does_not_fire_earlier_in_the_session(self):
        self.assertFalse(self.daily().should_run_now(datetime(2026, 8, 31, 12, 0)))

    def test_it_does_not_fire_at_a_weekend(self):
        self.assertFalse(self.daily().should_run_now(datetime(2026, 8, 29, 15, 55)))

    def test_it_does_not_fire_on_a_market_holiday(self):
        self.assertFalse(self.daily().should_run_now(datetime(2026, 12, 25, 15, 55)))

    def test_it_respects_an_early_close(self):
        # The half day closes at 1pm, so the window is 12:50 to 13:00.
        scheduler = self.daily()
        self.assertTrue(scheduler.should_run_now(datetime(2026, 11, 27, 12, 55)))
        self.assertFalse(scheduler.should_run_now(datetime(2026, 11, 27, 15, 55)))

    def test_it_fires_only_once_a_day(self):
        scheduler = self.daily()
        moment = datetime(2026, 8, 31, 15, 55)
        self.assertTrue(scheduler.should_run_now(moment))
        scheduler._last_run_day = moment.date()
        self.assertFalse(scheduler.should_run_now(moment))

    def test_interval_mode_fires_whenever_the_market_is_open(self):
        scheduler = Scheduler(FakeTrader(), mode="interval", interval_minutes=30)
        self.assertTrue(scheduler.should_run_now(datetime(2026, 8, 31, 10, 0)))
        self.assertFalse(scheduler.should_run_now(datetime(2026, 8, 31, 20, 0)))

    def test_sleep_never_returns_a_negative_wait(self):
        scheduler = self.daily()
        for moment in (datetime(2026, 8, 31, 9, 0), datetime(2026, 8, 31, 15, 59),
                       datetime(2026, 8, 29, 3, 0), datetime(2026, 12, 25, 12, 0)):
            self.assertGreater(scheduler.seconds_until_next(moment), 0)

    def test_a_weekend_wait_reaches_at_least_to_monday(self):
        scheduler = self.daily()
        wait = scheduler.seconds_until_next(datetime(2026, 8, 29, 12, 0))
        self.assertGreater(wait / 3600, 24)

    def test_invalid_modes_are_rejected(self):
        with self.assertRaises(ValueError):
            Scheduler(FakeTrader(), mode="whenever")
        with self.assertRaises(ValueError):
            Scheduler(FakeTrader(), mode="interval", interval_minutes=0)


class TestRunImmediately(unittest.TestCase):
    """--run-now exists so a new config can be verified without waiting."""

    def test_it_fires_even_when_the_market_is_shut(self):
        scheduler = Scheduler(FakeTrader(), mode="daily", run_immediately=True)
        self.assertTrue(scheduler.should_run_now(datetime(2026, 12, 25, 3, 0)))

    def test_the_override_is_consumed_after_one_cycle(self):
        trader = FakeTrader()
        scheduler = Scheduler(trader, mode="daily", run_immediately=True, max_cycles=1)
        scheduler.seconds_until_next = lambda moment=None: 0.0
        scheduler.run()
        self.assertEqual(trader.calls, 1)
        self.assertFalse(scheduler._pending_immediate)

    def test_a_forced_cycle_does_not_consume_the_day_slot(self):
        """Firing at startup must not stop the real scheduled run later that day."""
        trader = FakeTrader()
        scheduler = Scheduler(trader, mode="daily", run_immediately=True, max_cycles=1)
        scheduler.seconds_until_next = lambda moment=None: 0.0
        scheduler.run()
        self.assertIsNone(scheduler._last_run_day)
        self.assertTrue(scheduler.should_run_now(datetime(2026, 8, 31, 15, 55)))

    def test_without_the_override_a_shut_market_is_skipped(self):
        scheduler = Scheduler(FakeTrader(), mode="daily", run_immediately=False)
        self.assertFalse(scheduler.should_run_now(datetime(2026, 12, 25, 3, 0)))


class TestSchedulerLoop(unittest.TestCase):
    def test_max_cycles_stops_the_loop(self):
        trader = FakeTrader()
        scheduler = Scheduler(trader, mode="interval", interval_minutes=1, max_cycles=2)
        # Force every check to be a firing moment, and every sleep to be instant.
        scheduler.should_run_now = lambda moment=None: True
        scheduler.seconds_until_next = lambda moment=None: 0.0
        scheduler.run()
        self.assertEqual(trader.calls, 2)
        self.assertEqual(scheduler.cycles, 2)

    def test_a_failing_cycle_does_not_kill_the_loop(self):
        """A data outage must not end an unattended run."""
        trader = FakeTrader(explode=True)
        scheduler = Scheduler(trader, mode="interval", interval_minutes=1, max_cycles=3)
        scheduler.should_run_now = lambda moment=None: True
        scheduler.seconds_until_next = lambda moment=None: 0.0
        scheduler.run()
        self.assertEqual(trader.calls, 3)
        self.assertEqual(len(trader.journal.rows), 3)
        self.assertEqual(trader.journal.rows[0]["status"], "error")


class TestPineExport(unittest.TestCase):
    def test_every_registered_strategy_has_a_template(self):
        for name in REGISTRY:
            with self.subTest(strategy=name):
                self.assertIn(name, pine._BODIES)

    def test_unknown_strategies_are_rejected(self):
        with self.assertRaises(ValueError):
            pine.generate("nonexistent")

    def test_scripts_declare_pine_version_6(self):
        for name, script in pine.generate_all().items():
            with self.subTest(strategy=name):
                self.assertTrue(script.startswith("//@version=6"))

    def test_scripts_declare_a_strategy(self):
        for name, script in pine.generate_all().items():
            with self.subTest(strategy=name):
                self.assertIn("strategy(", script)

    def test_execution_timing_matches_the_python_engine(self):
        """process_orders_on_close=false fills on the next bar's open."""
        for name, script in pine.generate_all().items():
            with self.subTest(strategy=name):
                self.assertIn("process_orders_on_close=false", script)

    def test_brackets_and_parentheses_are_balanced(self):
        for name, script in pine.generate_all().items():
            with self.subTest(strategy=name):
                self.assertEqual(script.count("("), script.count(")"))
                self.assertEqual(script.count("["), script.count("]"))

    def test_no_tabs_are_emitted(self):
        """Pine rejects tab indentation."""
        for name, script in pine.generate_all().items():
            with self.subTest(strategy=name):
                self.assertNotIn("\t", script)

    def test_every_script_defines_a_stance(self):
        for name, script in pine.generate_all().items():
            with self.subTest(strategy=name):
                self.assertRegex(script, re.compile(r"^stance\s*=", re.MULTILINE))

    def test_every_script_has_the_risk_and_execution_block(self):
        for name, script in pine.generate_all().items():
            with self.subTest(strategy=name):
                self.assertIn("strategy.entry", script)
                self.assertIn("strategy.exit", script)
                self.assertIn("stopPct", script)

    def test_direction_control_is_present(self):
        for name, script in pine.generate_all().items():
            with self.subTest(strategy=name):
                self.assertIn("allowShort", script)
                self.assertIn("allowLong", script)

    def test_strategy_calls_are_not_nested_in_user_functions(self):
        """Pine restricts strategy calls inside user defined functions."""
        for name, script in pine.generate_all().items():
            with self.subTest(strategy=name):
                self.assertNotIn("=>", script)

    def test_parameter_defaults_match_the_python_strategy(self):
        script = pine.generate("sma_crossover")
        defaults = REGISTRY["sma_crossover"].defaults()
        self.assertIn(f'input.int({defaults["fast"]}, "Fast SMA"', script)
        self.assertIn(f'input.int({defaults["slow"]}, "Slow SMA"', script)

    def test_macd_defaults_match(self):
        script = pine.generate("macd_trend")
        defaults = REGISTRY["macd_trend"].defaults()
        self.assertIn(f'input.int({defaults["fast"]},  "MACD fast"', script)
        self.assertIn(f'input.int({defaults["trend_filter"]}, "Trend filter SMA', script)

    def test_generate_all_covers_the_registry(self):
        self.assertEqual(set(pine.generate_all()), set(REGISTRY))


if __name__ == "__main__":
    unittest.main()
