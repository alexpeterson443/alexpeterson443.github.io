"""US equity market calendar.

A live bot that does not know when the market is open will happily place orders
into a void on Thanksgiving. This module answers three questions without any
third party dependency:

* is the market open right now
* was a given date a trading day
* when is the next open and close

Times are US Eastern. The rules for US daylight saving time have been stable
since 2007 (second Sunday in March to first Sunday in November), so they are
implemented directly rather than pulled from a timezone database that a stock
macOS Python may or may not ship.
"""

from __future__ import annotations

from datetime import date, datetime, time, timedelta
from typing import List, Optional, Set, Tuple

REGULAR_OPEN = time(9, 30)
REGULAR_CLOSE = time(16, 0)
HALF_DAY_CLOSE = time(13, 0)


# ----------------------------------------------------------------------
# holiday rules
# ----------------------------------------------------------------------

def _nth_weekday(year: int, month: int, weekday: int, n: int) -> date:
    """The nth given weekday of a month. Monday is 0."""
    first = date(year, month, 1)
    offset = (weekday - first.weekday()) % 7
    return first + timedelta(days=offset + 7 * (n - 1))


def _last_weekday(year: int, month: int, weekday: int) -> date:
    """The last given weekday of a month."""
    if month == 12:
        following = date(year + 1, 1, 1)
    else:
        following = date(year, month + 1, 1)
    last = following - timedelta(days=1)
    return last - timedelta(days=(last.weekday() - weekday) % 7)


def easter(year: int) -> date:
    """Gregorian Easter Sunday, by the anonymous algorithm."""
    a = year % 19
    b, c = divmod(year, 100)
    d, e = divmod(b, 4)
    f = (b + 8) // 25
    g = (b - f + 1) // 3
    h = (19 * a + b - d - g + 15) % 30
    i, k = divmod(c, 4)
    l = (32 + 2 * e + 2 * i - h - k) % 7
    m = (a + 11 * h + 22 * l) // 451
    month, day = divmod(h + l - 7 * m + 114, 31)
    return date(year, month, day + 1)


def _observed(day: date) -> date:
    """Shift a holiday off a weekend the way the exchanges do."""
    if day.weekday() == 5:          # Saturday observed on Friday
        return day - timedelta(days=1)
    if day.weekday() == 6:          # Sunday observed on Monday
        return day + timedelta(days=1)
    return day


def holidays(year: int) -> Set[date]:
    """Full market holidays for a calendar year."""
    days = {
        _observed(date(year, 1, 1)),                      # New Year's Day
        _nth_weekday(year, 1, 0, 3),                      # Martin Luther King Jr Day
        _nth_weekday(year, 2, 0, 3),                      # Presidents Day
        easter(year) - timedelta(days=2),                 # Good Friday
        _last_weekday(year, 5, 0),                        # Memorial Day
        _observed(date(year, 7, 4)),                      # Independence Day
        _nth_weekday(year, 9, 0, 1),                      # Labor Day
        _nth_weekday(year, 11, 3, 4),                     # Thanksgiving
        _observed(date(year, 12, 25)),                    # Christmas
    }
    if year >= 2022:
        days.add(_observed(date(year, 6, 19)))            # Juneteenth
    return days


def half_days(year: int) -> Set[date]:
    """Sessions that close early, at 1pm Eastern."""
    days = set()
    days.add(_nth_weekday(year, 11, 3, 4) + timedelta(days=1))   # day after Thanksgiving

    christmas_eve = date(year, 12, 24)
    if christmas_eve.weekday() < 5:
        days.add(christmas_eve)

    july_4 = date(year, 7, 4)
    if july_4.weekday() in (1, 2, 3, 4):   # Tue to Fri gives an early close on the 3rd
        july_3 = date(year, 7, 3)
        if july_3.weekday() < 5:
            days.add(july_3)

    return {day for day in days if day not in holidays(year)}


# ----------------------------------------------------------------------
# sessions
# ----------------------------------------------------------------------

def is_trading_day(day: date) -> bool:
    return day.weekday() < 5 and day not in holidays(day.year)


def is_half_day(day: date) -> bool:
    return is_trading_day(day) and day in half_days(day.year)


def session_times(day: date) -> Optional[Tuple[time, time]]:
    """Open and close for a date, or ``None`` when the market is shut."""
    if not is_trading_day(day):
        return None
    return REGULAR_OPEN, (HALF_DAY_CLOSE if is_half_day(day) else REGULAR_CLOSE)


def previous_trading_day(day: date) -> date:
    current = day - timedelta(days=1)
    while not is_trading_day(current):
        current -= timedelta(days=1)
    return current


def next_trading_day(day: date) -> date:
    current = day + timedelta(days=1)
    while not is_trading_day(current):
        current += timedelta(days=1)
    return current


def trading_days(start: date, end: date) -> List[date]:
    out, current = [], start
    while current <= end:
        if is_trading_day(current):
            out.append(current)
        current += timedelta(days=1)
    return out


# ----------------------------------------------------------------------
# eastern time
# ----------------------------------------------------------------------

def _dst_bounds(year: int) -> Tuple[date, date]:
    """US daylight saving runs from the 2nd Sunday in March to the 1st in November."""
    return _nth_weekday(year, 3, 6, 2), _nth_weekday(year, 11, 6, 1)


def eastern_offset(moment: datetime) -> timedelta:
    """UTC offset for US Eastern at a given naive Eastern datetime."""
    start, end = _dst_bounds(moment.year)
    day = moment.date()
    if start < day < end:
        return timedelta(hours=-4)          # EDT
    if day == start:
        return timedelta(hours=-4) if moment.hour >= 2 else timedelta(hours=-5)
    if day == end:
        return timedelta(hours=-5) if moment.hour >= 2 else timedelta(hours=-4)
    return timedelta(hours=-5)              # EST


def utc_to_eastern(moment: datetime) -> datetime:
    """Convert a naive UTC datetime to naive US Eastern."""
    # Estimate with the standard offset, then correct once using the result.
    estimate = moment + timedelta(hours=-5)
    return moment + eastern_offset(estimate)


def now_eastern() -> datetime:
    return utc_to_eastern(datetime.utcnow())


def is_market_open(moment: Optional[datetime] = None) -> bool:
    """True when the regular session is open at the given Eastern time."""
    moment = moment or now_eastern()
    session = session_times(moment.date())
    if session is None:
        return False
    open_at, close_at = session
    return open_at <= moment.time() < close_at


def minutes_until_close(moment: Optional[datetime] = None) -> Optional[int]:
    """Minutes left in the session, or ``None`` when the market is shut."""
    moment = moment or now_eastern()
    session = session_times(moment.date())
    if session is None or not is_market_open(moment):
        return None
    close_at = datetime.combine(moment.date(), session[1])
    return int((close_at - moment).total_seconds() // 60)


def next_session_open(moment: Optional[datetime] = None) -> datetime:
    """The next regular session open, at or after the given moment."""
    moment = moment or now_eastern()
    session = session_times(moment.date())
    if session and moment.time() < session[0]:
        return datetime.combine(moment.date(), session[0])
    return datetime.combine(next_trading_day(moment.date()), REGULAR_OPEN)


def describe(moment: Optional[datetime] = None) -> str:
    """One line of human readable market status."""
    moment = moment or now_eastern()
    if is_market_open(moment):
        left = minutes_until_close(moment)
        early = " (early close)" if is_half_day(moment.date()) else ""
        return f"Market open, {left} minutes to close{early}."
    if not is_trading_day(moment.date()):
        reason = "weekend" if moment.date().weekday() >= 5 else "market holiday"
        return f"Market closed ({reason}). Next open {next_session_open(moment):%Y-%m-%d %H:%M} ET."
    return f"Market closed. Next open {next_session_open(moment):%Y-%m-%d %H:%M} ET."
