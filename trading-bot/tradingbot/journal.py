"""Append only audit trail.

Every order the bot sends is written to a CSV before anything else happens to
it. When a live run does something you did not expect, this file is the record
of what it actually did, as opposed to what you remember telling it to do.
"""

from __future__ import annotations

import csv
import os
from datetime import datetime
from typing import Dict, List, Optional

FIELDS = [
    "timestamp", "mode", "symbol", "side", "qty", "price", "notional",
    "strategy", "reason", "status", "equity", "cash", "note",
]


class Journal:
    """CSV trade log. Opened, appended, and closed on every write."""

    def __init__(self, path: Optional[str] = None):
        self.path = path

    @property
    def enabled(self) -> bool:
        return bool(self.path)

    def _ensure_header(self) -> None:
        if not self.path:
            return
        directory = os.path.dirname(os.path.abspath(self.path))
        os.makedirs(directory or ".", exist_ok=True)
        if not os.path.exists(self.path) or os.path.getsize(self.path) == 0:
            with open(self.path, "w", newline="", encoding="utf-8") as handle:
                csv.DictWriter(handle, fieldnames=FIELDS).writeheader()

    def record(self, **row) -> None:
        """Append one row. Unknown keys are dropped rather than raising.

        Journalling must never be the reason a trading run dies, so this
        swallows write errors after reporting them.
        """
        if not self.path:
            return
        entry = {field: "" for field in FIELDS}
        entry["timestamp"] = datetime.now().isoformat(timespec="seconds")
        for key, value in row.items():
            if key in entry:
                entry[key] = value
        if entry["notional"] == "" and entry["qty"] != "" and entry["price"] != "":
            try:
                entry["notional"] = round(float(entry["qty"]) * float(entry["price"]), 2)
            except (TypeError, ValueError):
                pass
        try:
            self._ensure_header()
            with open(self.path, "a", newline="", encoding="utf-8") as handle:
                csv.DictWriter(handle, fieldnames=FIELDS).writerow(entry)
        except OSError as exc:
            print(f"warning: could not write to journal {self.path}: {exc}")

    def read(self) -> List[Dict[str, str]]:
        if not self.path or not os.path.exists(self.path):
            return []
        with open(self.path, newline="", encoding="utf-8") as handle:
            return list(csv.DictReader(handle))

    def summary(self) -> Dict[str, object]:
        rows = self.read()
        filled = [r for r in rows if r.get("status") == "filled"]
        return {
            "path": self.path,
            "entries": len(rows),
            "filled": len(filled),
            "first": rows[0]["timestamp"] if rows else None,
            "last": rows[-1]["timestamp"] if rows else None,
            "symbols": sorted({r["symbol"] for r in filled if r.get("symbol")}),
        }
