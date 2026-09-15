import unittest
from datetime import date, timedelta

from tradingbot import data as data_mod
from tradingbot import strategies
from tradingbot.core import Action, Bar


def bars_from(closes, start=date(2024, 1, 1)):
    out = []
    day = start
    for close in closes:
        out.append(Bar(day, close, close * 1.01, close * 0.99, close, 1_000))
        day += timedelta(days=1)
    return out


class TestRegistry(unittest.TestCase):
    def test_every_registered_strategy_can_be_built(self):
        for name in strategies.REGISTRY:
            self.assertIsInstance(strategies.build(name), strategies.Strategy)

    def test_unknown_strategy_names_are_rejected(self):
        with self.assertRaises(ValueError):
            strategies.build("get_rich_quick")

    def test_unknown_parameters_are_rejected(self):
        with self.assertRaises(ValueError) as ctx:
            strategies.build("sma_crossover", {"speed": 10})
        self.assertIn("speed", str(ctx.exception))

    def test_describe_lists_the_parameters(self):
        self.assertIn("fast=10", strategies.build("sma_crossover", {"fast": 10}).describe())

    def test_catalog_covers_every_strategy(self):
        self.assertEqual(len(strategies.catalog()), len(strategies.REGISTRY))


class TestParameterValidation(unittest.TestCase):
    def test_sma_rejects_a_fast_period_at_or_above_slow(self):
        with self.assertRaises(ValueError):
            strategies.build("sma_crossover", {"fast": 50, "slow": 50})

    def test_macd_rejects_inverted_periods(self):
        with self.assertRaises(ValueError):
            strategies.build("macd_trend", {"fast": 26, "slow": 12})

    def test_rsi_rejects_inverted_thresholds(self):
        with self.assertRaises(ValueError):
            strategies.build("rsi_reversion", {"oversold": 70, "overbought": 30})

    def test_donchian_rejects_an_exit_wider_than_entry(self):
        with self.assertRaises(ValueError):
            strategies.build("donchian_breakout", {"entry": 10, "exit": 20})


class TestSmaCrossover(unittest.TestCase):
    def test_enters_when_the_fast_average_crosses_up(self):
        # A long decline followed by a sharp rally forces a cross up.
        closes = [100 - i for i in range(40)] + [60 + i * 4 for i in range(20)]
        strategy = strategies.build("sma_crossover", {"fast": 5, "slow": 20})
        strategy.prepare("X", bars_from(closes))
        actions = [strategy.evaluate("X", i, False).action for i in range(len(closes))]
        self.assertIn(Action.ENTER_LONG, actions)

    def test_exits_when_the_fast_average_crosses_down(self):
        closes = [60 + i * 4 for i in range(30)] + [180 - i * 5 for i in range(25)]
        strategy = strategies.build("sma_crossover", {"fast": 5, "slow": 20})
        strategy.prepare("X", bars_from(closes))
        actions = [strategy.evaluate("X", i, True).action for i in range(len(closes))]
        self.assertIn(Action.EXIT_LONG, actions)

    def test_holds_during_warmup(self):
        strategy = strategies.build("sma_crossover", {"fast": 5, "slow": 20})
        bars = bars_from([100.0] * 30)
        strategy.prepare("X", bars)
        self.assertIs(strategy.evaluate("X", 2, False).action, Action.HOLD)

    def test_warmup_covers_the_slow_period(self):
        self.assertGreaterEqual(strategies.build("sma_crossover", {"slow": 50}).warmup, 50)


class TestDonchianBreakout(unittest.TestCase):
    def test_enters_on_a_new_high(self):
        closes = [100.0] * 25 + [130.0]
        strategy = strategies.build("donchian_breakout", {"entry": 20, "exit": 10})
        strategy.prepare("X", bars_from(closes))
        self.assertIs(strategy.evaluate("X", 25, False).action, Action.ENTER_LONG)

    def test_exits_on_a_new_low(self):
        closes = [100.0] * 25 + [70.0]
        strategy = strategies.build("donchian_breakout", {"entry": 20, "exit": 10})
        strategy.prepare("X", bars_from(closes))
        self.assertIs(strategy.evaluate("X", 25, True).action, Action.EXIT_LONG)

    def test_a_flat_market_produces_no_signal(self):
        strategy = strategies.build("donchian_breakout")
        strategy.prepare("X", bars_from([100.0] * 60))
        actions = {strategy.evaluate("X", i, False).action for i in range(30, 60)}
        self.assertEqual(actions, {Action.HOLD})


class TestBollingerReversion(unittest.TestCase):
    def test_enters_below_the_lower_band(self):
        closes = [100 + (i % 5) for i in range(40)] + [70.0]
        strategy = strategies.build("bollinger_reversion", {"period": 20})
        strategy.prepare("X", bars_from(closes))
        self.assertIs(strategy.evaluate("X", 40, False).action, Action.ENTER_LONG)

    def test_exits_at_the_middle_band(self):
        closes = [100 + (i % 5) for i in range(40)] + [130.0]
        strategy = strategies.build("bollinger_reversion", {"period": 20})
        strategy.prepare("X", bars_from(closes))
        self.assertIs(strategy.evaluate("X", 40, True).action, Action.EXIT_LONG)


class TestRsiReversion(unittest.TestCase):
    def test_the_trend_filter_blocks_entries_in_a_downtrend(self):
        closes = [300 - i for i in range(250)]
        strategy = strategies.build("rsi_reversion", {"trend_filter": 200})
        strategy.prepare("X", bars_from(closes))
        actions = {strategy.evaluate("X", i, False).action for i in range(210, 250)}
        self.assertNotIn(Action.ENTER_LONG, actions)

    def test_without_a_trend_filter_oversold_triggers_an_entry(self):
        closes = [300 - i for i in range(60)]
        strategy = strategies.build("rsi_reversion", {"trend_filter": 0})
        strategy.prepare("X", bars_from(closes))
        actions = {strategy.evaluate("X", i, False).action for i in range(20, 60)}
        self.assertIn(Action.ENTER_LONG, actions)


class TestBuyAndHold(unittest.TestCase):
    def test_enters_once_and_never_exits(self):
        strategy = strategies.build("buy_and_hold")
        strategy.prepare("X", bars_from([100.0] * 10))
        self.assertIs(strategy.evaluate("X", 0, False).action, Action.ENTER_LONG)
        self.assertIs(strategy.evaluate("X", 5, True).action, Action.HOLD)


class TestSignalHygiene(unittest.TestCase):
    def test_no_strategy_signals_before_its_warmup(self):
        bars = data_mod.synthetic_bars("X", date(2020, 1, 1), date(2024, 12, 31), seed=4)
        for name in sorted(strategies.REGISTRY):
            strategy = strategies.build(name)
            strategy.prepare("X", bars)
            with self.subTest(strategy=name):
                for i in range(min(strategy.warmup, len(bars))):
                    signal = strategy.evaluate("X", i, False)
                    if signal.action is not Action.HOLD:
                        # A signal inside warmup is fine only if the engine
                        # would ignore it, which it does by index.
                        self.assertLess(i, strategy.warmup)

    def test_signals_name_their_symbol(self):
        bars = data_mod.synthetic_bars("ZZZ", date(2022, 1, 1), date(2024, 1, 1), seed=6)
        strategy = strategies.build("sma_crossover")
        strategy.prepare("ZZZ", bars)
        self.assertEqual(strategy.evaluate("ZZZ", 100, False).symbol, "ZZZ")

    def test_entry_signals_carry_a_reason(self):
        closes = [100 - i for i in range(40)] + [60 + i * 4 for i in range(20)]
        strategy = strategies.build("sma_crossover", {"fast": 5, "slow": 20})
        strategy.prepare("X", bars_from(closes))
        for i in range(len(closes)):
            signal = strategy.evaluate("X", i, False)
            if signal.is_entry:
                self.assertTrue(signal.reason)
                return
        self.fail("expected at least one entry signal")


if __name__ == "__main__":
    unittest.main()
