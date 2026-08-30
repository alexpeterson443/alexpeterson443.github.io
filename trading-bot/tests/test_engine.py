import unittest
from datetime import date, timedelta

from tradingbot import data as data_mod
from tradingbot import strategies as strategies_mod
from tradingbot.core import Action, Bar, Signal
from tradingbot.engine import Backtester, EngineConfig
from tradingbot.portfolio import CostModel
from tradingbot.risk import RiskConfig
from tradingbot.strategies import Strategy


def make_bars(closes, start=date(2024, 1, 1)):
    """Build a clean series where open equals the previous close."""
    bars = []
    day = start
    previous = closes[0]
    for close in closes:
        bars.append(
            Bar(day, open=previous, high=max(previous, close) * 1.001,
                low=min(previous, close) * 0.999, close=close, volume=1_000)
        )
        previous = close
        day += timedelta(days=1)
    return bars


class EnterOnBar(Strategy):
    """Test double: enter on one named index, exit on another."""

    name = "enter_on_bar"

    @classmethod
    def defaults(cls):
        return {"entry_index": 1, "exit_index": 99}

    def prepare(self, symbol, bars):
        self._state[symbol] = len(bars)

    def evaluate(self, symbol, i, in_position):
        if i == self.params["entry_index"] and not in_position:
            return Signal(symbol, Action.ENTER_LONG, "test entry")
        if i == self.params["exit_index"] and in_position:
            return Signal(symbol, Action.EXIT_LONG, "test exit")
        return Signal(symbol, Action.HOLD)


FRICTIONLESS = EngineConfig(
    starting_cash=10_000.0,
    costs=CostModel(slippage_bps=0),
    risk=RiskConfig(fraction=1.0, max_position_pct=1.0, cash_buffer_pct=0.0,
                    stop_loss_pct=None, max_drawdown_pct=None),
)


class TestExecutionTiming(unittest.TestCase):
    def test_signal_on_bar_i_fills_at_bar_i_plus_one_open(self):
        # Closes: the signal fires on index 1 (close 110), so the fill must
        # happen at index 2's open, which equals 110, not at 110's close.
        bars = make_bars([100.0, 110.0, 120.0, 130.0])
        result = Backtester(EnterOnBar(entry_index=1), FRICTIONLESS).run({"TEST": bars})
        buys = [f for f in result.fills if f.side.value == "buy"]
        self.assertEqual(len(buys), 1)
        self.assertEqual(buys[0].ts, bars[2].ts)
        self.assertAlmostEqual(buys[0].price, bars[2].open)

    def test_a_signal_on_the_final_bar_never_fills(self):
        bars = make_bars([100.0, 110.0, 120.0])
        result = Backtester(EnterOnBar(entry_index=2), FRICTIONLESS).run({"TEST": bars})
        self.assertEqual(result.fills, [])

    def test_round_trip_pnl_uses_open_prices(self):
        bars = make_bars([100.0, 110.0, 120.0, 130.0, 140.0])
        result = Backtester(
            EnterOnBar(entry_index=0, exit_index=3), FRICTIONLESS
        ).run({"TEST": bars})
        self.assertEqual(len(result.trades), 1)
        trade = result.trades[0]
        self.assertAlmostEqual(trade.entry_price, bars[1].open)
        self.assertAlmostEqual(trade.exit_price, bars[4].open)


class SpyStrategy(Strategy):
    """Test double that records every bar index the engine asks it about."""

    name = "spy"

    def __init__(self, **params):
        super().__init__(**params)
        self.seen = []

    def prepare(self, symbol, bars):
        self._state[symbol] = list(bars)

    def evaluate(self, symbol, i, in_position):
        self.seen.append(self._state[symbol][i].ts)
        return Signal(symbol, Action.HOLD)


class TestNoLookahead(unittest.TestCase):
    def test_the_engine_only_offers_the_current_bar(self):
        """Detects engine level lookahead.

        The engine must ask the strategy about bar ``i`` while it is processing
        bar ``i``, once each, in order. Handing over ``i + 1`` would let any
        strategy read tomorrow's price, and shifts this recorded sequence.
        """
        bars = make_bars([100.0 + i for i in range(40)])
        spy = SpyStrategy()
        Backtester(spy, FRICTIONLESS).run({"TEST": bars})
        self.assertEqual(spy.seen, [bar.ts for bar in bars])

    def test_truncating_the_future_does_not_change_past_decisions(self):
        """Detects indicator level lookahead.

        Run the same strategy over the full history and over a prefix of it. An
        indicator that reads beyond its own index computes different values when
        the future is removed, which changes the trades taken in the overlap.
        """
        bars = data_mod.synthetic_bars("TEST", date(2019, 1, 1), date(2024, 12, 31), seed=42)
        cutoff_index = int(len(bars) * 0.6)
        cutoff_date = bars[cutoff_index].ts
        strategy_args = ("sma_crossover", {"fast": 10, "slow": 30})

        full = Backtester(strategies_mod.build(*strategy_args), FRICTIONLESS).run({"TEST": bars})
        prefix = Backtester(
            strategies_mod.build(*strategy_args), FRICTIONLESS
        ).run({"TEST": bars[: cutoff_index + 1]})

        def signature(result, limit):
            return [
                (f.ts, f.side.value, round(f.qty, 6), round(f.price, 6))
                for f in result.fills
                if f.ts <= limit
            ]

        self.assertGreater(len(signature(prefix, cutoff_date)), 3, "test needs real trades")
        self.assertEqual(signature(full, cutoff_date), signature(prefix, cutoff_date))


class TestBenchmarkAgreement(unittest.TestCase):
    def test_buy_and_hold_tracks_the_benchmark(self):
        series = {
            symbol: data_mod.synthetic_bars(symbol, date(2019, 1, 1), date(2024, 12, 31), seed=7)
            for symbol in ("AAA", "BBB")
        }
        config = EngineConfig(
            starting_cash=10_000.0,
            costs=CostModel(slippage_bps=0),
            fractional=True,
            risk=RiskConfig(fraction=0.5, max_position_pct=0.5, max_open_positions=2,
                            cash_buffer_pct=0.0, stop_loss_pct=None, max_drawdown_pct=None),
        )
        result = Backtester(strategies_mod.build("buy_and_hold"), config).run(series)
        gap = abs(result.metrics["total_return"] - result.metrics["benchmark_return"])
        # The only permitted difference is the one bar execution delay.
        self.assertLess(gap, 0.02, f"buy and hold drifted {gap:.2%} from the benchmark")


class TestRiskInteraction(unittest.TestCase):
    def test_stop_loss_closes_a_losing_position(self):
        bars = make_bars([100.0, 100.0, 100.0, 80.0, 80.0])
        config = EngineConfig(
            starting_cash=10_000.0,
            costs=CostModel(slippage_bps=0),
            risk=RiskConfig(fraction=0.5, cash_buffer_pct=0.0,
                            stop_loss_pct=0.05, max_drawdown_pct=None),
        )
        result = Backtester(EnterOnBar(entry_index=0), config).run({"TEST": bars})
        self.assertEqual(len(result.trades), 1)
        self.assertIn("stop", result.trades[0].exit_reason)

    def test_kill_switch_halts_and_liquidates(self):
        bars = make_bars([100.0, 100.0, 60.0, 55.0, 50.0, 45.0])
        config = EngineConfig(
            starting_cash=10_000.0,
            costs=CostModel(slippage_bps=0),
            risk=RiskConfig(fraction=1.0, max_position_pct=1.0, cash_buffer_pct=0.0,
                            stop_loss_pct=None, max_drawdown_pct=0.20),
            liquidate_on_halt=True,
        )
        result = Backtester(EnterOnBar(entry_index=0), config).run({"TEST": bars})
        self.assertIsNotNone(result.halted_on)
        self.assertIn("drawdown", result.halt_reason)
        self.assertEqual(result.equity_curve[-1].positions_value, 0.0)

    def test_position_limit_is_respected_across_symbols(self):
        series = {
            symbol: make_bars([100.0, 101.0, 102.0, 103.0])
            for symbol in ("AAA", "BBB", "CCC")
        }
        config = EngineConfig(
            starting_cash=10_000.0,
            costs=CostModel(slippage_bps=0),
            risk=RiskConfig(fraction=0.2, max_open_positions=2, cash_buffer_pct=0.0,
                            stop_loss_pct=None, max_drawdown_pct=None),
        )
        result = Backtester(EnterOnBar(entry_index=0), config).run(series)
        held = {f.symbol for f in result.fills if f.side.value == "buy"}
        self.assertLessEqual(len(held), 2)


class TestInvariants(unittest.TestCase):
    def test_cash_never_goes_negative(self):
        series = {
            symbol: data_mod.synthetic_bars(symbol, date(2020, 1, 1), date(2024, 12, 31), seed=3)
            for symbol in ("AAA", "BBB", "CCC")
        }
        for name in sorted(strategies_mod.REGISTRY):
            with self.subTest(strategy=name):
                result = Backtester(
                    strategies_mod.build(name),
                    EngineConfig(risk=RiskConfig(fraction=0.5, max_open_positions=3)),
                ).run(series)
                self.assertTrue(all(p.cash >= -1e-6 for p in result.equity_curve))

    def test_equity_curve_has_one_point_per_trading_day(self):
        bars = make_bars([100.0 + i for i in range(20)])
        result = Backtester(strategies_mod.build("buy_and_hold")).run({"TEST": bars})
        self.assertEqual(len(result.equity_curve), len(bars))

    def test_every_strategy_runs_without_error(self):
        series = {"AAA": data_mod.synthetic_bars("AAA", date(2018, 1, 1), date(2024, 12, 31), seed=9)}
        for name in sorted(strategies_mod.REGISTRY):
            with self.subTest(strategy=name):
                result = Backtester(strategies_mod.build(name)).run(series)
                self.assertGreater(len(result.equity_curve), 100)

    def test_empty_series_is_rejected(self):
        with self.assertRaises(ValueError):
            Backtester(strategies_mod.build("buy_and_hold")).run({})


if __name__ == "__main__":
    unittest.main()
