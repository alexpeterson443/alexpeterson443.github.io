import unittest

from tradingbot import indicators as ind


class TestMovingAverages(unittest.TestCase):
    def test_sma_matches_manual_average(self):
        values = [1, 2, 3, 4, 5, 6]
        result = ind.sma(values, 3)
        self.assertEqual(result[:2], [None, None])
        self.assertAlmostEqual(result[2], 2.0)
        self.assertAlmostEqual(result[5], 5.0)

    def test_sma_length_matches_input(self):
        self.assertEqual(len(ind.sma([1, 2, 3], 2)), 3)

    def test_sma_all_none_when_too_short(self):
        self.assertEqual(ind.sma([1, 2], 5), [None, None])

    def test_ema_seeds_from_sma_then_decays(self):
        values = [10.0] * 10
        result = ind.ema(values, 5)
        self.assertIsNone(result[3])
        # A constant series has a constant EMA.
        self.assertAlmostEqual(result[9], 10.0)

    def test_ema_reacts_faster_than_sma(self):
        values = [10.0] * 20 + [20.0] * 5
        fast = ind.ema(values, 10)[-1]
        slow = ind.sma(values, 10)[-1]
        self.assertGreater(fast, slow)

    def test_period_must_be_positive(self):
        with self.assertRaises(ValueError):
            ind.sma([1, 2, 3], 0)


class TestRsi(unittest.TestCase):
    def test_monotonic_rise_pins_at_100(self):
        values = [float(i) for i in range(1, 40)]
        self.assertAlmostEqual(ind.rsi(values, 14)[-1], 100.0)

    def test_monotonic_fall_pins_at_zero(self):
        values = [float(i) for i in range(40, 1, -1)]
        self.assertAlmostEqual(ind.rsi(values, 14)[-1], 0.0)

    def test_stays_within_bounds(self):
        values = [100 + (i % 7) * 3 - (i % 5) * 2 for i in range(200)]
        for value in ind.rsi(values, 14):
            if value is not None:
                self.assertGreaterEqual(value, 0.0)
                self.assertLessEqual(value, 100.0)

    def test_alignment_is_preserved(self):
        values = [float(i) for i in range(50)]
        self.assertEqual(len(ind.rsi(values, 14)), len(values))


class TestAtr(unittest.TestCase):
    def test_true_range_uses_previous_close(self):
        highs = [10, 12]
        lows = [9, 11]
        closes = [9.5, 11.5]
        # Second bar gapped up, so the range measured from the prior close is 12 - 9.5.
        self.assertAlmostEqual(ind.true_range(highs, lows, closes)[1], 2.5)

    def test_atr_is_positive(self):
        highs = [10 + i for i in range(30)]
        lows = [9 + i for i in range(30)]
        closes = [9.5 + i for i in range(30)]
        self.assertGreater(ind.atr(highs, lows, closes, 14)[-1], 0)


class TestMacdAndBands(unittest.TestCase):
    def test_macd_histogram_is_line_minus_signal(self):
        values = [100 + i * 0.5 for i in range(120)]
        line, signal, hist = ind.macd(values)
        for a, b, c in zip(line, signal, hist):
            if None not in (a, b, c):
                self.assertAlmostEqual(c, a - b)

    def test_macd_rejects_inverted_periods(self):
        with self.assertRaises(ValueError):
            ind.macd([1.0] * 50, fast=26, slow=12)

    def test_bollinger_bands_straddle_the_middle(self):
        values = [100 + (i % 9) for i in range(60)]
        lower, mid, upper = ind.bollinger(values, 20, 2.0)
        for lo, md, up in zip(lower, mid, upper):
            if None not in (lo, md, up):
                self.assertLess(lo, md)
                self.assertLess(md, up)

    def test_constant_series_collapses_the_bands(self):
        lower, mid, upper = ind.bollinger([50.0] * 40, 20, 2.0)
        self.assertAlmostEqual(lower[-1], upper[-1])


class TestCrossovers(unittest.TestCase):
    def test_detects_a_cross_up(self):
        fast = [1.0, 3.0]
        slow = [2.0, 2.0]
        self.assertTrue(ind.crossed_above(fast, slow, 1))
        self.assertFalse(ind.crossed_below(fast, slow, 1))

    def test_detects_a_cross_down(self):
        fast = [3.0, 1.0]
        slow = [2.0, 2.0]
        self.assertTrue(ind.crossed_below(fast, slow, 1))

    def test_no_cross_when_already_above(self):
        self.assertFalse(ind.crossed_above([3.0, 4.0], [2.0, 2.0], 1))

    def test_none_values_never_signal(self):
        self.assertFalse(ind.crossed_above([None, 4.0], [2.0, 2.0], 1))

    def test_index_zero_never_signals(self):
        self.assertFalse(ind.crossed_above([1.0], [2.0], 0))


class TestChannels(unittest.TestCase):
    def test_highest_and_lowest(self):
        values = [5, 3, 8, 1, 9]
        self.assertEqual(ind.highest(values, 3)[4], 9)
        self.assertEqual(ind.lowest(values, 3)[4], 1)

    def test_roc_is_a_fraction(self):
        self.assertAlmostEqual(ind.roc([100.0, 110.0], 1)[1], 0.10)


if __name__ == "__main__":
    unittest.main()
