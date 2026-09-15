import json
import os
import tempfile
import unittest
from datetime import date

from tradingbot import data as data_mod
from tradingbot import strategies
from tradingbot.broker import AlpacaPaperBroker, BrokerError, PaperBroker, build_broker
from tradingbot.core import Order, OrderType, Side
from tradingbot.live import Trader
from tradingbot.portfolio import CostModel
from tradingbot.risk import RiskConfig


class TestOrderValidation(unittest.TestCase):
    def test_quantity_must_be_positive(self):
        with self.assertRaises(ValueError):
            Order("AAPL", Side.BUY, 0)

    def test_limit_orders_need_a_limit_price(self):
        with self.assertRaises(ValueError):
            Order("AAPL", Side.BUY, 10, OrderType.LIMIT)

    def test_stop_orders_need_a_stop_price(self):
        with self.assertRaises(ValueError):
            Order("AAPL", Side.SELL, 10, OrderType.STOP)


class TestPaperBroker(unittest.TestCase):
    def setUp(self):
        self.broker = PaperBroker(10_000.0, CostModel(slippage_bps=0))

    def test_a_buy_fills_and_appears_in_positions(self):
        receipt = self.broker.submit(Order("AAPL", Side.BUY, 10), 100.0)
        self.assertEqual(receipt["status"], "filled")
        self.assertEqual(self.broker.positions()["AAPL"], 10)

    def test_cash_falls_by_the_notional(self):
        self.broker.submit(Order("AAPL", Side.BUY, 10), 100.0)
        self.assertAlmostEqual(self.broker.cash(), 9_000.0)

    def test_selling_flat_returns_nothing(self):
        self.assertIsNone(self.broker.submit(Order("AAPL", Side.SELL, 10), 100.0))

    def test_is_long_reflects_holdings(self):
        self.assertFalse(self.broker.is_long("AAPL"))
        self.broker.submit(Order("AAPL", Side.BUY, 1), 100.0)
        self.assertTrue(self.broker.is_long("AAPL"))

    def test_unknown_broker_kind_is_rejected(self):
        with self.assertRaises(ValueError):
            build_broker("robinhood")


class TestAlpacaGuards(unittest.TestCase):
    def test_a_live_endpoint_is_refused(self):
        with self.assertRaises(BrokerError) as ctx:
            AlpacaPaperBroker("key", "secret", base_url="https://api.alpaca.markets")
        self.assertIn("paper", str(ctx.exception))

    def test_missing_credentials_are_reported(self):
        saved = {k: os.environ.pop(k, None) for k in ("ALPACA_API_KEY_ID", "ALPACA_API_SECRET_KEY")}
        try:
            with self.assertRaises(BrokerError):
                AlpacaPaperBroker()
        finally:
            for key, value in saved.items():
                if value is not None:
                    os.environ[key] = value

    def test_the_default_host_is_the_paper_host(self):
        broker = AlpacaPaperBroker("key", "secret")
        self.assertIn("paper-api", broker.base_url)


class TestTrader(unittest.TestCase):
    def setUp(self):
        self.dir = tempfile.mkdtemp()
        for symbol in ("AAA", "BBB"):
            data_mod.write_csv_bars(
                os.path.join(self.dir, f"{symbol}.csv"),
                data_mod.synthetic_bars(symbol, date(2023, 1, 1), date(2024, 12, 31), seed=8),
            )
        self.state = os.path.join(self.dir, "state.json")
        self.risk = RiskConfig(fraction=0.4, max_open_positions=2)

    def _trader(self, **kwargs):
        options = dict(
            risk=self.risk, provider="csv", csv_dir=self.dir,
            lookback_days=900, state_path=self.state,
        )
        options.update(kwargs)
        return Trader(
            strategies.build("buy_and_hold"), PaperBroker(10_000.0), ["AAA", "BBB"], **options
        )

    def test_a_cycle_opens_positions(self):
        trader = self._trader()
        trader.step(as_of=date(2024, 12, 31))
        self.assertTrue(trader.broker.positions())

    def test_state_survives_a_restart(self):
        first = self._trader()
        first.step(as_of=date(2024, 12, 31))
        expected_cash = first.broker.cash()
        expected_positions = first.broker.positions()

        second = self._trader()
        self.assertAlmostEqual(second.broker.cash(), expected_cash)
        self.assertEqual(second.broker.positions(), expected_positions)

    def test_state_file_is_valid_json(self):
        trader = self._trader()
        trader.step(as_of=date(2024, 12, 31))
        with open(self.state, encoding="utf-8") as handle:
            payload = json.load(handle)
        self.assertIn("positions", payload)
        self.assertIn("cash", payload)

    def test_dry_run_sends_nothing(self):
        trader = self._trader(dry_run=True, state_path=None)
        trader.step(as_of=date(2024, 12, 31))
        self.assertEqual(trader.broker.positions(), {})

    def test_plan_is_side_effect_free(self):
        trader = self._trader(state_path=None)
        series = trader.fetch(as_of=date(2024, 12, 31))
        before = trader.broker.cash()
        trader.plan(series)
        self.assertEqual(trader.broker.cash(), before)

    def test_status_reports_the_broker_and_strategy(self):
        status = self._trader(state_path=None).status()
        self.assertIn("PaperBroker", status["broker"])
        self.assertIn("buy_and_hold", status["strategy"])

    def test_a_halt_plans_liquidation(self):
        trader = self._trader(state_path=None)
        trader.step(as_of=date(2024, 12, 31))
        trader.risk.config.max_drawdown_pct = 0.001
        trader.broker.portfolio.cash *= 0.4  # force a large paper loss
        series = trader.fetch(as_of=date(2024, 12, 31))
        intents = trader.plan(series)
        self.assertTrue(all(i["side"] is Side.SELL for i in intents))
        self.assertTrue(trader.risk.halted)


if __name__ == "__main__":
    unittest.main()
