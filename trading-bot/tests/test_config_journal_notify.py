import json
import os
import tempfile
import unittest

from tradingbot import config as config_mod
from tradingbot.journal import Journal
from tradingbot.notify import Notifier


class TestConfig(unittest.TestCase):
    def setUp(self):
        self.dir = tempfile.mkdtemp()
        self.path = os.path.join(self.dir, "config.json")

    def write(self, payload):
        with open(self.path, "w", encoding="utf-8") as handle:
            handle.write(payload if isinstance(payload, str) else json.dumps(payload))
        return self.path

    def test_the_shipped_example_loads(self):
        """The documented starter config must actually be valid."""
        self.write(config_mod.example())
        loaded = config_mod.load(self.path)
        self.assertEqual(loaded["strategy"], "macd_trend")

    def test_underscore_keys_are_treated_as_comments(self):
        self.write({"_comment": "hi", "symbols": ["AAPL"]})
        self.assertNotIn("_comment", config_mod.load(self.path))

    def test_symbols_are_upper_cased(self):
        self.write({"symbols": ["aapl", "msft"]})
        self.assertEqual(config_mod.load(self.path)["symbols"], ["AAPL", "MSFT"])

    def test_a_typo_in_a_setting_is_rejected(self):
        """A silent typo in a risk limit is exactly what must not happen."""
        self.write({"symbols": ["AAPL"], "max_drawdwn": 0.2})
        with self.assertRaises(config_mod.ConfigError) as ctx:
            config_mod.load(self.path)
        self.assertIn("max_drawdwn", str(ctx.exception))

    def test_malformed_json_is_reported(self):
        self.write("{not json")
        with self.assertRaises(config_mod.ConfigError):
            config_mod.load(self.path)

    def test_a_missing_file_is_reported(self):
        with self.assertRaises(config_mod.ConfigError):
            config_mod.load(os.path.join(self.dir, "absent.json"))

    def test_a_non_object_is_rejected(self):
        self.write("[1, 2, 3]")
        with self.assertRaises(config_mod.ConfigError):
            config_mod.load(self.path)

    def test_wrong_types_are_rejected(self):
        self.write({"symbols": "AAPL"})
        with self.assertRaises(config_mod.ConfigError):
            config_mod.load(self.path)
        self.write({"cash": "lots"})
        with self.assertRaises(config_mod.ConfigError):
            config_mod.load(self.path)
        self.write({"allow_short": "yes"})
        with self.assertRaises(config_mod.ConfigError):
            config_mod.load(self.path)


class FakeArgs:
    def __init__(self, **kwargs):
        for key, value in kwargs.items():
            setattr(self, key, value)


class TestConfigPrecedence(unittest.TestCase):
    def test_config_fills_an_untouched_default(self):
        args = FakeArgs(cash=10_000.0, fraction=0.2)
        config_mod.apply(args, {"cash": 5_000.0}, argv=[])
        self.assertEqual(args.cash, 5_000.0)

    def test_an_explicit_flag_beats_the_config(self):
        args = FakeArgs(cash=250.0, fraction=0.2)
        config_mod.apply(args, {"cash": 5_000.0}, argv=["--cash", "250"])
        self.assertEqual(args.cash, 250.0)

    def test_dashes_in_flags_map_to_underscores(self):
        args = FakeArgs(max_positions=9)
        config_mod.apply(args, {"max_positions": 3}, argv=["--max-positions", "9"])
        self.assertEqual(args.max_positions, 9)

    def test_equals_form_is_recognised_as_explicit(self):
        args = FakeArgs(cash=250.0)
        config_mod.apply(args, {"cash": 5_000.0}, argv=["--cash=250"])
        self.assertEqual(args.cash, 250.0)

    def test_settings_the_command_does_not_have_are_ignored(self):
        args = FakeArgs(cash=10_000.0)
        config_mod.apply(args, {"nonexistent_option": 1}, argv=[])
        self.assertFalse(hasattr(args, "nonexistent_option"))


class TestJournal(unittest.TestCase):
    def setUp(self):
        self.dir = tempfile.mkdtemp()
        self.path = os.path.join(self.dir, "journal.csv")

    def test_a_disabled_journal_writes_nothing(self):
        journal = Journal(None)
        self.assertFalse(journal.enabled)
        journal.record(symbol="AAPL")       # must not raise
        self.assertEqual(journal.read(), [])

    def test_rows_round_trip(self):
        journal = Journal(self.path)
        journal.record(mode="paper", symbol="AAPL", side="buy", qty=10, price=150.0,
                       status="filled")
        rows = journal.read()
        self.assertEqual(len(rows), 1)
        self.assertEqual(rows[0]["symbol"], "AAPL")

    def test_notional_is_computed(self):
        journal = Journal(self.path)
        journal.record(symbol="AAPL", qty=10, price=150.0)
        self.assertEqual(float(journal.read()[0]["notional"]), 1_500.0)

    def test_it_appends_rather_than_overwriting(self):
        journal = Journal(self.path)
        for i in range(3):
            journal.record(symbol=f"S{i}", status="filled")
        self.assertEqual(len(journal.read()), 3)

    def test_the_header_is_written_once(self):
        journal = Journal(self.path)
        journal.record(symbol="A")
        journal.record(symbol="B")
        with open(self.path, encoding="utf-8") as handle:
            self.assertEqual(handle.read().count("timestamp"), 1)

    def test_unknown_keys_are_dropped_not_raised(self):
        journal = Journal(self.path)
        journal.record(symbol="AAPL", nonsense="ignored")
        self.assertEqual(journal.read()[0]["symbol"], "AAPL")

    def test_summary_counts_filled_rows(self):
        journal = Journal(self.path)
        journal.record(symbol="AAPL", status="filled")
        journal.record(symbol="MSFT", status="rejected")
        summary = journal.summary()
        self.assertEqual(summary["entries"], 2)
        self.assertEqual(summary["filled"], 1)
        self.assertEqual(summary["symbols"], ["AAPL"])

    def test_a_write_failure_does_not_raise(self):
        """Journalling must never be the reason a trading run dies."""
        journal = Journal(os.path.join(self.dir, "nope", "deep", "j.csv"))
        os.makedirs(os.path.join(self.dir, "nope"), exist_ok=True)
        open(os.path.join(self.dir, "nope", "deep"), "w").close()   # a file, not a dir
        journal.record(symbol="AAPL")       # must not raise


class TestNotifier(unittest.TestCase):
    def test_it_is_disabled_without_any_sink(self):
        notifier = Notifier()
        notifier.webhook_url = None
        notifier.email_to = None
        self.assertFalse(notifier.enabled)
        self.assertEqual(notifier.describe(), "none")

    def test_a_webhook_enables_it(self):
        self.assertTrue(Notifier(webhook_url="https://example.invalid/hook").enabled)

    def test_sending_with_no_sink_reports_failure_without_raising(self):
        notifier = Notifier()
        notifier.webhook_url = None
        notifier.email_to = None
        self.assertFalse(notifier.send("subject", "body"))

    def test_an_unreachable_webhook_fails_quietly(self):
        notifier = Notifier(webhook_url="http://127.0.0.1:1/nope", timeout=0.5)
        self.assertFalse(notifier.send("subject", "body"))
        self.assertTrue(notifier.errors)

    def test_email_without_smtp_settings_fails_quietly(self):
        saved = {k: os.environ.pop(k, None)
                 for k in ("TRADINGBOT_SMTP_HOST", "TRADINGBOT_SMTP_USER",
                           "TRADINGBOT_SMTP_PASSWORD")}
        try:
            notifier = Notifier(email_to="someone@example.invalid")
            self.assertFalse(notifier.send("subject", "body"))
            self.assertIn("SMTP", notifier.errors[-1])
        finally:
            for key, value in saved.items():
                if value is not None:
                    os.environ[key] = value


if __name__ == "__main__":
    unittest.main()
