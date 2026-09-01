"""Notifications for a bot you are not watching.

Two sinks, both standard library: an HTTP webhook (Slack, Discord, or anything
that accepts a JSON POST) and plain SMTP email. Both fail quietly, because a
notification outage must never take the trading loop down with it.
"""

from __future__ import annotations

import json
import os
import smtplib
import urllib.error
import urllib.request
from email.message import EmailMessage
from typing import List, Optional


class Notifier:
    """Fans a message out to whichever sinks are configured."""

    def __init__(self, webhook_url: Optional[str] = None, email_to: Optional[str] = None,
                 timeout: float = 10.0):
        self.webhook_url = webhook_url or os.environ.get("TRADINGBOT_WEBHOOK") or None
        self.email_to = email_to or os.environ.get("TRADINGBOT_EMAIL_TO") or None
        self.timeout = timeout
        self.errors: List[str] = []

    @property
    def enabled(self) -> bool:
        return bool(self.webhook_url or self.email_to)

    def send(self, subject: str, body: str) -> bool:
        """Deliver to every configured sink. Returns True if any succeeded."""
        delivered = False
        if self.webhook_url:
            delivered |= self._webhook(subject, body)
        if self.email_to:
            delivered |= self._email(subject, body)
        return delivered

    # ------------------------------------------------------------------

    def _webhook(self, subject: str, body: str) -> bool:
        payload = json.dumps({"text": f"*{subject}*\n{body}"}).encode()
        request = urllib.request.Request(
            self.webhook_url, data=payload, method="POST",
            headers={"Content-Type": "application/json"},
        )
        try:
            with urllib.request.urlopen(request, timeout=self.timeout) as response:
                return 200 <= response.status < 300
        except (urllib.error.URLError, urllib.error.HTTPError, OSError, TimeoutError) as exc:
            self.errors.append(f"webhook failed: {exc}")
            return False

    def _email(self, subject: str, body: str) -> bool:
        """Send through SMTP using credentials from the environment.

        Set TRADINGBOT_SMTP_HOST, TRADINGBOT_SMTP_USER, TRADINGBOT_SMTP_PASSWORD,
        and optionally TRADINGBOT_SMTP_PORT. For Gmail this must be an app
        password, never your account password.
        """
        host = os.environ.get("TRADINGBOT_SMTP_HOST")
        user = os.environ.get("TRADINGBOT_SMTP_USER")
        password = os.environ.get("TRADINGBOT_SMTP_PASSWORD")
        port = int(os.environ.get("TRADINGBOT_SMTP_PORT", "587"))
        if not all((host, user, password)):
            self.errors.append("email requested but SMTP settings are incomplete")
            return False

        message = EmailMessage()
        message["Subject"] = f"[tradingbot] {subject}"
        message["From"] = user
        message["To"] = self.email_to
        message.set_content(body)
        try:
            with smtplib.SMTP(host, port, timeout=self.timeout) as server:
                server.starttls()
                server.login(user, password)
                server.send_message(message)
            return True
        except (smtplib.SMTPException, OSError, TimeoutError) as exc:
            self.errors.append(f"email failed: {exc}")
            return False

    def describe(self) -> str:
        sinks = []
        if self.webhook_url:
            sinks.append("webhook")
        if self.email_to:
            sinks.append(f"email to {self.email_to}")
        return ", ".join(sinks) if sinks else "none"
