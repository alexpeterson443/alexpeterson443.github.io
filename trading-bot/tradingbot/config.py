"""Configuration files.

A live bot is run from a schedule, not from a shell prompt, so the settings
belong in a file that can be reviewed and version controlled rather than in a
command line you retype from memory at 4pm.

Precedence, lowest to highest: built in defaults, then the config file, then
explicit command line flags. A flag left at its default never overrides the
file, which is what makes ``--config`` useful at all.
"""

from __future__ import annotations

import json
import os
from typing import Any, Dict, List, Optional

# Keys the loader understands. Anything else in the file is a typo, and a typo
# in a risk limit is exactly the kind of silence that costs money.
KNOWN_KEYS = {
    "symbols", "start", "end", "provider", "csv_dir", "interval",
    "strategy", "params",
    "cash", "sizing", "fraction", "dollars", "risk_per_trade", "atr_stop_mult",
    "max_position_pct", "max_positions", "cash_buffer_pct",
    "stop_loss", "take_profit", "trailing_stop", "max_drawdown", "max_daily_loss",
    "commission", "slippage_bps", "fractional", "risk_free_rate",
    "allow_short", "broker", "state", "journal", "lookback",
    "notify_webhook", "notify_email", "confirm_live",
}


class ConfigError(RuntimeError):
    pass


def load(path: str) -> Dict[str, Any]:
    """Read and validate a JSON config file."""
    if not os.path.exists(path):
        raise ConfigError(f"no config file at {path}")
    try:
        with open(path, encoding="utf-8") as handle:
            payload = json.load(handle)
    except json.JSONDecodeError as exc:
        raise ConfigError(f"{path} is not valid JSON: {exc}") from exc
    if not isinstance(payload, dict):
        raise ConfigError(f"{path} must contain a JSON object")

    # Keys starting with an underscore are comments by convention.
    cleaned = {k: v for k, v in payload.items() if not k.startswith("_")}
    unknown = set(cleaned) - KNOWN_KEYS
    if unknown:
        raise ConfigError(
            f"{path} has unrecognised setting(s): {', '.join(sorted(unknown))}.\n"
            f"Valid settings: {', '.join(sorted(KNOWN_KEYS))}"
        )
    _validate(cleaned, path)
    return cleaned


def _validate(config: Dict[str, Any], path: str) -> None:
    symbols = config.get("symbols")
    if symbols is not None:
        if not isinstance(symbols, list) or not all(isinstance(s, str) for s in symbols):
            raise ConfigError(f"{path}: 'symbols' must be a list of strings")
        config["symbols"] = [s.upper() for s in symbols]

    if "params" in config and not isinstance(config["params"], dict):
        raise ConfigError(f"{path}: 'params' must be an object")

    for key in ("cash", "fraction", "risk_per_trade", "max_position_pct",
                "slippage_bps", "commission"):
        if key in config and not isinstance(config[key], (int, float)):
            raise ConfigError(f"{path}: '{key}' must be a number")

    for key in ("fractional", "allow_short", "confirm_live"):
        if key in config and not isinstance(config[key], bool):
            raise ConfigError(f"{path}: '{key}' must be true or false")


def apply(args, config: Dict[str, Any], parser=None, argv: Optional[List[str]] = None) -> None:
    """Overlay config values onto parsed arguments, without beating explicit flags.

    A flag counts as explicit when it appears in ``argv``. Anything else on the
    namespace is argparse's default and yields to the file.
    """
    explicit = _explicit_flags(argv if argv is not None else [])

    for key, value in config.items():
        target = _ARG_ALIASES.get(key, key)
        if not hasattr(args, target):
            continue
        if target in explicit:
            continue
        setattr(args, target, value)


# Config keys whose matching argparse destination has a different name.
_ARG_ALIASES = {
    "state": "state",
    "journal": "journal",
}


def _explicit_flags(argv: List[str]) -> set:
    """Argparse destinations that the user actually typed on the command line."""
    out = set()
    for token in argv:
        if not token.startswith("--"):
            continue
        name = token[2:].split("=", 1)[0]
        out.add(name.replace("-", "_"))
    return out


def example() -> str:
    """The documented starter config, so ``init-config`` and the docs cannot drift."""
    return json.dumps(
        {
            "_comment": "Settings for the trading bot. Command line flags override these.",
            "symbols": ["AAPL", "MSFT", "NVDA", "SPY"],
            "start": "2015-01-01",
            "provider": "yahoo",
            "strategy": "macd_trend",
            "params": {"fast": 12, "slow": 26, "signal": 9, "trend_filter": 200},
            "cash": 10000,
            "sizing": "atr_risk",
            "risk_per_trade": 0.01,
            "atr_stop_mult": 2.0,
            "max_position_pct": 0.25,
            "max_positions": 4,
            "stop_loss": 0.08,
            "trailing_stop": 0.15,
            "max_drawdown": 0.20,
            "commission": 0.0,
            "slippage_bps": 5.0,
            "allow_short": False,
            "broker": "paper",
            "state": "paper_state.json",
            "journal": "journal.csv",
        },
        indent=2,
    )
