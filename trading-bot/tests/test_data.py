import os
import tempfile
import unittest
from datetime import date

from tradingbot import data
from tradingbot.core import Bar


class TestSyntheticProvider(unittest.TestCase):
    def test_is_reproducible_for_the_same_seed(self):
        first = data.synthetic_bars("AAA", date(2023, 1, 1), date(2023, 6, 1), seed=5)
        second = data.synthetic_bars("AAA", date(2023, 1, 1), date(2023, 6, 1), seed=5)
        self.assertEqual([b.close for b in first], [b.close for b in second])

    def test_different_symbols_get_different_series(self):
        a = data.synthetic_bars("AAA", date(2023, 1, 1), date(2023, 6, 1), seed=5)
        b = data.synthetic_bars("BBB", date(2023, 1, 1), date(2023, 6, 1), seed=5)
        self.assertNotEqual([x.close for x in a], [x.close for x in b])

    def test_skips_weekends(self):
        bars = data.synthetic_bars("AAA", date(2024, 1, 1), date(2024, 2, 1))
        self.assertTrue(all(b.ts.weekday() < 5 for b in bars))

    def test_bars_are_internally_consistent(self):
        for bar in data.synthetic_bars("AAA", date(2023, 1, 1), date(2023, 6, 1), seed=1):
            self.assertGreaterEqual(bar.high, max(bar.open, bar.close))
            self.assertLessEqual(bar.low, min(bar.open, bar.close))
            self.assertGreater(bar.low, 0)


class TestCsvRoundTrip(unittest.TestCase):
    def setUp(self):
        self.dir = tempfile.mkdtemp()
        self.bars = data.synthetic_bars("AAA", date(2023, 1, 1), date(2023, 6, 1), seed=2)
        self.path = os.path.join(self.dir, "AAA.csv")
        data.write_csv_bars(self.path, self.bars)

    def test_round_trip_preserves_bars(self):
        restored = data.read_csv_bars(self.path)
        self.assertEqual(len(restored), len(self.bars))
        self.assertAlmostEqual(restored[0].close, self.bars[0].close)

    def test_loads_through_the_csv_provider(self):
        bars = data.load_bars("AAA", "2023-01-01", "2023-06-01", provider="csv", csv_dir=self.dir)
        self.assertEqual(len(bars), len(self.bars))

    def test_date_range_is_clipped(self):
        bars = data.load_bars("AAA", "2023-03-01", "2023-04-01", provider="csv", csv_dir=self.dir)
        self.assertTrue(all(date(2023, 3, 1) <= b.ts <= date(2023, 4, 1) for b in bars))

    def test_missing_file_is_reported_clearly(self):
        with self.assertRaises(data.DataError):
            data.load_bars("NOPE", "2023-01-01", "2023-06-01", provider="csv", csv_dir=self.dir)

    def test_headers_are_matched_case_insensitively(self):
        path = os.path.join(self.dir, "UPPER.csv")
        with open(path, "w", encoding="utf-8") as handle:
            handle.write("Date,Open,High,Low,Close,Volume\n2024-01-02,10,11,9,10.5,1000\n")
        self.assertEqual(len(data.read_csv_bars(path)), 1)

    def test_missing_columns_are_reported(self):
        path = os.path.join(self.dir, "BAD.csv")
        with open(path, "w", encoding="utf-8") as handle:
            handle.write("date,close\n2024-01-02,10\n")
        with self.assertRaises(data.DataError):
            data.read_csv_bars(path)


class TestValidation(unittest.TestCase):
    def test_unknown_provider_is_rejected(self):
        with self.assertRaises(data.DataError):
            data.load_bars("AAA", "2023-01-01", "2023-06-01", provider="crystal_ball")

    def test_inverted_date_range_is_rejected(self):
        with self.assertRaises(data.DataError):
            data.load_bars("AAA", "2023-06-01", "2023-01-01", provider="synthetic")

    def test_bar_rejects_high_below_low(self):
        with self.assertRaises(ValueError):
            Bar(date(2024, 1, 1), 10, 5, 9, 10)

    def test_bar_rejects_a_negative_price(self):
        with self.assertRaises(ValueError):
            Bar(date(2024, 1, 1), -1, 10, 0.5, 5)


class TestAlignment(unittest.TestCase):
    def test_align_returns_the_union_of_dates(self):
        series = {
            "AAA": data.synthetic_bars("AAA", date(2023, 1, 1), date(2023, 3, 1), seed=1),
            "BBB": data.synthetic_bars("BBB", date(2023, 2, 1), date(2023, 4, 1), seed=1),
        }
        dates, lookup = data.align(series)
        self.assertEqual(dates[0], series["AAA"][0].ts)
        self.assertEqual(dates[-1], series["BBB"][-1].ts)
        self.assertEqual(set(lookup), {"AAA", "BBB"})


if __name__ == "__main__":
    unittest.main()
