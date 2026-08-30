"""Run the trading loop on a schedule.

Two modes:

* ``daily`` wakes up once per trading day, a set number of minutes before the
  close, decides, and goes back to sleep. This is the right mode for a daily
  bar strategy: it acts on the session it can still trade in.
* ``interval`` runs every N minutes while the market is open, for intraday
  strategies.

Both sleep in short slices so a Ctrl-C is responded to immediately rather than
at the end of a long sleep, and both skip weekends and market holidays without
waking the data provider at all.
"""

from __future__ import annotations

import signal
import time
from datetime import datetime, timedelta
from typing import Optional

from . import market_calendar as cal
from .live import Trader

# Never sleep longer than this in one go, so shutdown stays responsive.
SLEEP_SLICE = 5.0


class Scheduler:
    """Runs a :class:`Trader` repeatedly until stopped."""

    def __init__(
        self,
        trader: Trader,
        *,
        mode: str = "daily",
        minutes_before_close: int = 10,
        interval_minutes: int = 60,
        max_cycles: Optional[int] = None,
        run_immediately: bool = False,
    ):
        if mode not in ("daily", "interval"):
            raise ValueError("mode must be 'daily' or 'interval'")
        if interval_minutes < 1:
            raise ValueError("interval_minutes must be at least 1")
        self.trader = trader
        self.mode = mode
        self.minutes_before_close = minutes_before_close
        self.interval_minutes = interval_minutes
        self.max_cycles = max_cycles
        # Fire one cycle at startup regardless of the clock, so a new config can
        # be verified without waiting for the next session.
        self.run_immediately = run_immediately
        self._pending_immediate = run_immediately
        self.cycles = 0
        self.running = False
        self._last_run_day = None

    # ------------------------------------------------------------------

    def install_signal_handlers(self) -> None:
        """Stop cleanly on Ctrl-C or a termination signal."""
        def handler(signum, frame):
            print(f"\nreceived signal {signum}, finishing the current cycle and stopping")
            self.running = False

        for sig in (signal.SIGINT, signal.SIGTERM):
            try:
                signal.signal(sig, handler)
            except (ValueError, OSError):
                pass    # not the main thread, which is fine

    def _sleep(self, seconds: float) -> None:
        """Sleep in slices so shutdown is responsive."""
        deadline = time.monotonic() + max(seconds, 0)
        while self.running and time.monotonic() < deadline:
            time.sleep(min(SLEEP_SLICE, deadline - time.monotonic()))

    # ------------------------------------------------------------------

    def should_run_now(self, moment: Optional[datetime] = None) -> bool:
        """Whether this exact moment is a cycle boundary."""
        moment = moment or cal.now_eastern()
        if self._pending_immediate:
            return True
        if not cal.is_trading_day(moment.date()):
            return False
        if not cal.is_market_open(moment):
            return False
        if self.mode == "interval":
            return True
        # Daily mode fires once, inside the window before the close.
        if self._last_run_day == moment.date():
            return False
        left = cal.minutes_until_close(moment)
        return left is not None and left <= self.minutes_before_close

    def seconds_until_next(self, moment: Optional[datetime] = None) -> float:
        """How long to sleep before the next check."""
        moment = moment or cal.now_eastern()
        if self.mode == "interval":
            if cal.is_market_open(moment):
                return self.interval_minutes * 60.0
            wake = cal.next_session_open(moment)
            return max((wake - moment).total_seconds(), 30.0)

        session = cal.session_times(moment.date())
        if session and self._last_run_day != moment.date():
            close_at = datetime.combine(moment.date(), session[1])
            target = close_at - timedelta(minutes=self.minutes_before_close)
            if moment < target:
                return max((target - moment).total_seconds(), 30.0)
        # Either already run today or the market is shut, so wait for tomorrow.
        wake = cal.next_session_open(moment)
        session = cal.session_times(wake.date())
        if session:
            close_at = datetime.combine(wake.date(), session[1])
            target = close_at - timedelta(minutes=self.minutes_before_close)
            return max((target - moment).total_seconds(), 30.0)
        return 3600.0

    # ------------------------------------------------------------------

    def run(self) -> int:
        """Loop until stopped or ``max_cycles`` is reached. Returns cycles run."""
        self.running = True
        self.install_signal_handlers()
        print(f"Scheduler started in {self.mode} mode. {cal.describe()}")
        if self.run_immediately:
            print("Running one cycle immediately, then following the schedule.")
        if self.mode == "daily":
            print(f"Will trade {self.minutes_before_close} minutes before each close.")
        else:
            print(f"Will trade every {self.interval_minutes} minutes while open.")
        print("Press Ctrl-C to stop.\n")

        while self.running:
            now = cal.now_eastern()
            if self.should_run_now(now):
                forced = self._pending_immediate
                self._pending_immediate = False
                self.cycles += 1
                if not forced:
                    self._last_run_day = now.date()
                print(f"--- cycle {self.cycles} at {now:%Y-%m-%d %H:%M} ET ---")
                try:
                    self.trader.step(force=True)
                except Exception as exc:          # keep the loop alive
                    print(f"cycle failed: {type(exc).__name__}: {exc}")
                    self.trader.journal.record(
                        mode=self.trader.mode, status="error",
                        note=f"{type(exc).__name__}: {exc}"[:200],
                    )
                if self.max_cycles and self.cycles >= self.max_cycles:
                    print(f"reached max_cycles={self.max_cycles}, stopping")
                    break

            wait = self.seconds_until_next()
            if self.running and wait > SLEEP_SLICE:
                wake_at = datetime.now() + timedelta(seconds=wait)
                print(f"sleeping {wait / 60:.0f} minutes, next check around "
                      f"{wake_at:%H:%M} local")
            self._sleep(wait)

        print(f"\nScheduler stopped after {self.cycles} cycle(s).")
        return self.cycles
