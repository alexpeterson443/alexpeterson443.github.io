#!/usr/bin/env python3
"""Entry point. Run ``python run.py --help`` to see the commands."""

import sys

from tradingbot.cli import main

if __name__ == "__main__":
    sys.exit(main())
