import unittest
from datetime import date, datetime, timedelta

from tradingbot import market_calendar as cal


class TestHolidays(unittest.TestCase):
    def test_known_2026_holidays(self):
        expected = {
            date(2026, 1, 1),    # New Year's Day
            date(2026, 1, 19),   # MLK Day
            date(2026, 2, 16),   # Presidents Day
            date(2026, 4, 3),    # Good Friday
            date(2026, 5, 25),   # Memorial Day
            date(2026, 6, 19),   # Juneteenth
            date(2026, 7, 3),    # Independence Day observed, the 4th is a Saturday
            date(2026, 9, 7),    # Labor Day
            date(2026, 11, 26),  # Thanksgiving
            date(2026, 12, 25),  # Christmas
        }
        self.assertEqual(cal.holidays(2026), expected)

    def test_known_2025_holidays(self):
        days = cal.holidays(2025)
        self.assertIn(date(2025, 4, 18), days)    # Good Friday
        self.assertIn(date(2025, 11, 27), days)   # Thanksgiving
        self.assertIn(date(2025, 5, 26), days)    # Memorial Day

    def test_juneteenth_only_from_2022(self):
        self.assertNotIn(date(2021, 6, 18), cal.holidays(2021))
        self.assertIn(date(2022, 6, 20), cal.holidays(2022))

    def test_easter_matches_known_dates(self):
        for year, expected in [(2024, date(2024, 3, 31)), (2025, date(2025, 4, 20)),
                               (2026, date(2026, 4, 5)), (2027, date(2027, 3, 28))]:
            self.assertEqual(cal.easter(year), expected, f"Easter {year}")

    def test_a_saturday_holiday_is_observed_on_friday(self):
        # 4 July 2026 is a Saturday, so the market closes Friday the 3rd.
        self.assertIn(date(2026, 7, 3), cal.holidays(2026))
        self.assertFalse(cal.is_trading_day(date(2026, 7, 3)))

    def test_a_sunday_holiday_is_observed_on_monday(self):
        # 4 July 2027 is a Sunday, observed Monday the 5th.
        self.assertIn(date(2027, 7, 5), cal.holidays(2027))


class TestTradingDays(unittest.TestCase):
    def test_weekends_are_not_trading_days(self):
        self.assertFalse(cal.is_trading_day(date(2026, 8, 29)))   # Saturday
        self.assertFalse(cal.is_trading_day(date(2026, 8, 30)))   # Sunday

    def test_an_ordinary_weekday_is_a_trading_day(self):
        self.assertTrue(cal.is_trading_day(date(2026, 8, 31)))

    def test_next_and_previous_skip_closures(self):
        # The Friday before Christmas 2026, which falls on a Friday.
        self.assertEqual(cal.next_trading_day(date(2026, 12, 24)), date(2026, 12, 28))
        self.assertEqual(cal.previous_trading_day(date(2026, 12, 28)), date(2026, 12, 24))

    def test_trading_days_in_a_range_excludes_closures(self):
        days = cal.trading_days(date(2026, 11, 23), date(2026, 11, 27))
        self.assertNotIn(date(2026, 11, 26), days)      # Thanksgiving
        self.assertIn(date(2026, 11, 27), days)         # half day, still open

    def test_a_year_has_roughly_252_sessions(self):
        count = len(cal.trading_days(date(2026, 1, 1), date(2026, 12, 31)))
        self.assertGreater(count, 245)
        self.assertLess(count, 256)


class TestHalfDays(unittest.TestCase):
    def test_day_after_thanksgiving_closes_early(self):
        self.assertTrue(cal.is_half_day(date(2026, 11, 27)))

    def test_christmas_eve_on_a_weekday_closes_early(self):
        self.assertTrue(cal.is_half_day(date(2026, 12, 24)))

    def test_a_half_day_session_ends_at_one(self):
        self.assertEqual(cal.session_times(date(2026, 11, 27))[1], cal.HALF_DAY_CLOSE)

    def test_a_normal_session_ends_at_four(self):
        self.assertEqual(cal.session_times(date(2026, 8, 31))[1], cal.REGULAR_CLOSE)

    def test_a_closed_day_has_no_session(self):
        self.assertIsNone(cal.session_times(date(2026, 12, 25)))


class TestMarketHours(unittest.TestCase):
    def test_open_during_the_session(self):
        self.assertTrue(cal.is_market_open(datetime(2026, 8, 31, 10, 0)))

    def test_closed_before_the_open(self):
        self.assertFalse(cal.is_market_open(datetime(2026, 8, 31, 9, 0)))

    def test_closed_at_and_after_the_bell(self):
        self.assertFalse(cal.is_market_open(datetime(2026, 8, 31, 16, 0)))
        self.assertFalse(cal.is_market_open(datetime(2026, 8, 31, 16, 30)))

    def test_closed_on_a_holiday_during_normal_hours(self):
        self.assertFalse(cal.is_market_open(datetime(2026, 12, 25, 11, 0)))

    def test_half_day_closes_at_one(self):
        self.assertTrue(cal.is_market_open(datetime(2026, 11, 27, 12, 59)))
        self.assertFalse(cal.is_market_open(datetime(2026, 11, 27, 13, 1)))

    def test_minutes_until_close(self):
        self.assertEqual(cal.minutes_until_close(datetime(2026, 8, 31, 15, 30)), 30)

    def test_minutes_until_close_is_none_when_shut(self):
        self.assertIsNone(cal.minutes_until_close(datetime(2026, 8, 31, 20, 0)))

    def test_next_session_open_skips_the_weekend(self):
        # Friday evening rolls to Monday morning.
        nxt = cal.next_session_open(datetime(2026, 8, 28, 18, 0))
        self.assertEqual(nxt.date(), date(2026, 8, 31))
        self.assertEqual(nxt.time(), cal.REGULAR_OPEN)


class TestEasternTime(unittest.TestCase):
    def test_summer_is_four_hours_behind_utc(self):
        self.assertEqual(cal.eastern_offset(datetime(2026, 7, 1, 12)), timedelta(hours=-4))

    def test_winter_is_five_hours_behind_utc(self):
        self.assertEqual(cal.eastern_offset(datetime(2026, 1, 15, 12)), timedelta(hours=-5))

    def test_conversion_from_utc(self):
        # 14:00 UTC in July is 10:00 Eastern.
        self.assertEqual(cal.utc_to_eastern(datetime(2026, 7, 1, 14, 0)).hour, 10)

    def test_describe_mentions_the_reason_when_shut(self):
        self.assertIn("weekend", cal.describe(datetime(2026, 8, 29, 12, 0)))
        self.assertIn("holiday", cal.describe(datetime(2026, 12, 25, 12, 0)))


if __name__ == "__main__":
    unittest.main()
