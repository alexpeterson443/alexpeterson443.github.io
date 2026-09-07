const $ = (id) => document.getElementById(id);
let state = null;
let timer = null;

// Remember the private link key on this device as a backup to the cookie.
const KEY_STORE = "bowl_key";
const urlKey = new URLSearchParams(location.search).get("key");
if (urlKey) {
  try { localStorage.setItem(KEY_STORE, urlKey); } catch {}
}
// Point the manifest at the keyed version so Add to Home Screen keeps the key.
if (urlKey) {
  $("manifest").href = `/manifest.webmanifest?key=${encodeURIComponent(urlKey)}`;
}

function storedKey() {
  try { return urlKey || localStorage.getItem(KEY_STORE); } catch { return urlKey; }
}

async function api(path, opts = {}) {
  // The cookie normally carries the session; the key header is the fallback
  // for browsers with a separate or blocked cookie jar. Never put it in the URL.
  const k = storedKey();
  const res = await fetch(path, {
    ...opts,
    headers: { "Content-Type": "application/json", ...(k ? { "X-Access-Key": k } : {}) },
  });
  if (res.status === 401) {
    $("subtitle").textContent = "This device is not linked. Open your private link again.";
    throw new Error("unauthorized");
  }
  if (!res.ok) throw new Error((await res.json().catch(() => ({}))).error || res.statusText);
  return res.json();
}

function fmtCountdown(ms) {
  const d = Math.floor(ms / 86_400_000);
  const h = Math.floor(ms / 3_600_000);
  const m = Math.floor((ms % 3_600_000) / 60_000);
  if (d > 0) return `${d}d ${h % 24}h`;
  return h > 0 ? `${h}h ${m}m` : `${m}m`;
}

// Copy for each excuse reason: status line, confirm prompt, undo label, grid title.
const EXCUSES = {
  closed: { status: (n) => `Alley closed today. Streak paused at ${n}.`, confirm: "Mark today as closed?", undo: "Undo closed day", title: "alley closed" },
  sick: { status: (n) => `Sick day. Rest up, streak paused at ${n}.`, confirm: "Mark today as a sick day?", undo: "Undo sick day", title: "sick" },
  injured: { status: (n) => `Injured. Heal up, streak paused at ${n}.`, confirm: "Mark today as an injured day?", undo: "Undo injured day", title: "injured" },
};
const excuseCopy = (reason) => EXCUSES[reason] || EXCUSES.closed;

function prettyDate(iso) {
  const [y, m, d] = iso.split("-").map(Number);
  return new Date(Date.UTC(y, m - 1, d)).toLocaleDateString("en-US", {
    weekday: "short", month: "short", day: "numeric", timeZone: "UTC",
  });
}

function render() {
  const s = state;
  $("streak").textContent = s.current;
  $("total").textContent = s.total;
  $("longest").textContent = s.longest;
  $("high").textContent = s.scores.high ?? "–";
  $("subtitle").textContent = `Started ${prettyDate(s.start)} · ${prettyDate(s.today)}`;

  const status = $("status");
  const verify = $("verify");
  const hint = $("form-hint");
  verify.disabled = false;
  verify.classList.remove("done");

  if (s.verifiedToday) {
    status.className = "status ok";
    status.textContent = "Today is locked in. Nice.";
    verify.textContent = "Add game";
    verify.classList.add("done");
    hint.textContent = s.scoresToday && s.scoresToday.length
      ? `Today: ${s.scoresToday.join(", ")}. Log another game if you bowl more.`
      : "Log another game if you bowl more.";
  } else if (s.excusedToday) {
    status.className = `status paused ${s.excuseToday || "closed"}`;
    status.textContent = excuseCopy(s.excuseToday).status(s.current);
    verify.textContent = "I bowled";
    hint.textContent = "Bowled after all? Enter the score and today counts.";
  } else {
    verify.textContent = "I bowled";
    hint.textContent = "Enter a game score to verify today.";
    if (s.atRisk) {
      status.className = "status risk";
      status.textContent = "Not verified yet. Streak ends at midnight.";
    } else if (s.current === 0 && s.total > 0) {
      status.className = "status broken";
      status.textContent = "Streak broken. Start a new one today.";
    } else {
      status.className = "status";
      status.textContent = "Log your first game to start.";
    }
  }

  // Games per day and score summary.
  const sc = s.scores;
  const dateInput = $("score-date");
  dateInput.min = s.start;
  dateInput.max = s.today;
  if (!dateInput.value || dateInput.value > s.today || dateInput.value < s.start) dateInput.value = s.today;
  $("score-summary").textContent = sc.games
    ? `${sc.games} game${sc.games === 1 ? "" : "s"}` + (sc.scored ? ` · best on ${prettyDate(sc.highDate)}` : "")
    : "Nothing logged yet";
  $("avg").textContent = sc.average ?? "–";
  $("high").textContent = sc.high ?? "–";
  const games = $("games");
  games.innerHTML = "";
  for (const d of sc.days) {
    const li = document.createElement("li");
    const date = document.createElement("span");
    date.className = "date";
    date.textContent = prettyDate(d.date);
    const chips = document.createElement("span");
    chips.className = "chips";
    d.scores.forEach((score, index) => {
      const chip = document.createElement("button");
      chip.type = "button";
      chip.className = "chip" + (score === null ? " unknown" : score === sc.high ? " best" : "");
      chip.textContent = score === null ? "?" : score;
      chip.title = "Tap to remove";
      chip.addEventListener("click", () => {
        const label = score === null ? "an unscored game" : `the ${score} game`;
        if (!confirm(`Remove ${label} on ${prettyDate(d.date)}?`)) return;
        act(chip, () => api("/api/score", { method: "DELETE", body: JSON.stringify({ date: d.date, index }) }));
      });
      chips.appendChild(chip);
    });
    const count = document.createElement("span");
    count.className = "count";
    count.textContent = `${d.games} game${d.games === 1 ? "" : "s"}`;
    li.append(date, chips, count);
    games.appendChild(li);
  }

  renderProgress(s.progress);

  // Calendar: what the schedule says about bowling.
  const cal = s.calendar || { configured: false };
  const calEl = $("calendar");
  calEl.hidden = !cal.configured;
  calEl.className = "calendar small";
  if (cal.configured) {
    if (cal.error && !cal.today.length && !cal.next) {
      calEl.textContent = "📅 Calendar unavailable right now";
    } else if (cal.today.length) {
      const t = cal.today[0];
      const where = t.location ? ` · ${t.location}` : "";
      const more = cal.today.length > 1 ? ` (+${cal.today.length - 1} more)` : "";
      if (t.inProgress) {
        calEl.classList.add("live");
        calEl.textContent = `🎳 You're bowling now · until ${t.time.split(" to ")[1]}${where}`;
      } else if (t.ended) {
        calEl.classList.add("today");
        calEl.textContent = `📅 Today's session ended · ${t.time}${where}${more}`;
        if (!s.verifiedToday && !s.excusedToday) status.textContent = "Your session is over. Enter your score to verify.";
      } else {
        calEl.classList.add("today");
        calEl.textContent = `📅 Bowling today · ${t.time}${where}${more}`;
      }
    } else if (cal.next) {
      calEl.textContent = `📅 Next on calendar: ${prettyDate(cal.next.date)} · ${cal.next.allDay ? "all day" : cal.next.time.split(" to ")[0]}`;
    } else {
      calEl.textContent = "📅 No bowling on your calendar in the next 3 weeks";
    }
  }

  // Excuses (closed, sick, injured): offered only while today is unresolved.
  $("excuses").hidden = s.verifiedToday || s.excusedToday;
  if (!$("score").matches(":focus")) $("score-date").value = s.today;
  $("unexcuse").hidden = !s.excusedToday;
  $("unexcuse").closest(".undo-row").hidden = !s.excusedToday;
  $("unexcuse").textContent = excuseCopy(s.excuseToday).undo;
  const closure = $("closure-hint");
  closure.hidden = !(cal.configured && cal.closureToday && !s.verifiedToday && !s.excusedToday);
  if (!closure.hidden) closure.textContent = `📌 ${cal.closureToday} on your calendar. If the lanes are shut, tap Alley closed below.`;

  // Alley hours: where today sits, and the week's table.
  const hours = s.hours;
  const hoursNow = $("hours-now");
  hoursNow.hidden = !hours;
  if (hours) {
    hoursNow.className = "hint hours-now";
    const unsettled = !s.verifiedToday && !s.excusedToday;
    if (hours.closedToday) {
      hoursNow.textContent = "The alley is closed all day today.";
      hoursNow.classList.add("warn");
    } else if (hours.beforeOpen) {
      hoursNow.textContent = `Alley opens at ${hours.opensAt}. Last game goes on by ${hours.lastCallAt}.`;
    } else if (hours.open && hours.lastCallPassed) {
      // Still open, but too late to start a game. Only a problem if the day
      // still needs one.
      hoursNow.textContent = unsettled
        ? `Too late to start a game. The alley stopped at ${hours.lastCallAt}.`
        : `Alley open until ${hours.closesAt}.`;
      if (unsettled) hoursNow.classList.add("warn");
    } else if (hours.open) {
      // The countdown right above already carries the time remaining.
      hoursNow.textContent = `Alley open until ${hours.closesAt}. Last game by ${hours.lastCallAt}.`;
      if ((hours.msUntilLastCall ?? 0) < 2 * 3_600_000 && unsettled) hoursNow.classList.add("warn");
    } else {
      const next = hours.next;
      hoursNow.textContent = next
        ? `Alley closed for today. Opens ${next.tomorrow ? "tomorrow" : next.day} at ${next.opens}.`
        : "Alley closed for today.";
      if (unsettled) hoursNow.classList.add("warn");
    }

    $("hours-note").textContent = hours.lastCallMinutes
      ? `Last game goes on ${hours.lastCallMinutes} minutes before close.`
      : "";
    $("hours-today").textContent = hours.closedToday ? "Closed today" : `Today ${hours.todayLabel}`;
    const week = $("hours-week");
    week.innerHTML = "";
    for (const row of hours.week) {
      const li = document.createElement("li");
      if (row.days.includes(hours.today)) li.className = "now";
      const days = document.createElement("span");
      days.className = "days";
      days.textContent = row.label;
      const time = document.createElement("span");
      time.className = "time";
      time.textContent = row.hours;
      li.append(days, time);
      week.appendChild(li);
    }
  }

  const yesterdayMissed = s.missed.includes(s.yesterday);
  $("yesterday-hint").hidden = !yesterdayMissed;

  // Calendar grid: week rows starting Monday, from the start date to today.
  const grid = $("grid");
  grid.innerHTML = "";
  for (const w of ["M", "T", "W", "T", "F", "S", "S"]) {
    const c = document.createElement("div");
    c.className = "cell weekday";
    c.textContent = w;
    grid.appendChild(c);
  }
  const hits = new Set(s.days);
  const excusedDays = s.excuseReasons || Object.fromEntries((s.excused || []).map((d) => [d, "closed"]));
  const startDow = (new Date(s.start + "T00:00:00Z").getUTCDay() + 6) % 7; // Monday = 0
  for (let i = 0; i < startDow; i++) grid.appendChild(Object.assign(document.createElement("div"), { className: "cell blank" }));

  let cursor = s.start;
  while (cursor <= s.today) {
    const c = document.createElement("div");
    c.className = "cell";
    c.textContent = Number(cursor.slice(8));
    c.title = prettyDate(cursor);
    if (hits.has(cursor)) c.classList.add("hit");
    else if (Object.prototype.hasOwnProperty.call(excusedDays, cursor)) {
      c.classList.add("excused", excusedDays[cursor]);
      c.title += ` · ${excuseCopy(excusedDays[cursor]).title}`;
    } else if (cursor < s.today) c.classList.add("miss");
    if (cursor === s.today) c.classList.add("today");
    grid.appendChild(c);
    const d = new Date(cursor + "T00:00:00Z");
    d.setUTCDate(d.getUTCDate() + 1);
    cursor = d.toISOString().slice(0, 10);
  }

  // Countdown to midnight (Central) that keeps ticking without more requests.
  clearInterval(timer);
  const deadline = Date.now() + s.msUntilMidnight;
  // While today is still open the real deadline is the alley closing, which
  // comes before midnight; the page still reloads at midnight.
  const closeAt = hours && hours.msUntilLastCall !== null ? Date.now() + hours.msUntilLastCall : null;
  const openAt = hours && hours.msUntilNextOpen !== null ? Date.now() + hours.msUntilNextOpen : null;
  const nextDay = hours && hours.next ? (hours.next.tomorrow ? "tomorrow" : hours.next.day) : null;
  const tick = () => {
    const left = deadline - Date.now();
    if (left <= 0) { clearInterval(timer); return load(); }
    const settled = s.verifiedToday || s.excusedToday;
    const toClose = closeAt === null ? 0 : closeAt - Date.now();
    const toOpen = openAt === null ? 0 : openAt - Date.now();
    $("countdown").textContent = settled
      // Once today is settled the wait that matters is the lanes opening again,
      // not the day rolling over at midnight.
      ? toOpen > 0
        ? `Lanes open ${nextDay} in ${fmtCountdown(toOpen)}`
        : `Next day starts in ${fmtCountdown(left)}`
      : toClose > 0
        ? `${fmtCountdown(toClose)} before last call`
        : `${fmtCountdown(left)} left to verify today`;
  };
  tick();
  timer = setInterval(tick, 30_000);
}

async function load({ quiet = false } = {}) {
  try {
    state = await api("/api/state");
    render();
  } catch (e) {
    if (e.message === "unauthorized") return;
    // A background refresh that fails should not nag: the numbers on screen
    // are still the last good ones and the next tick will try again.
    if (quiet && state) return;
    const sub = $("subtitle");
    sub.textContent = state ? "Can't reach the server. Showing what was loaded before." : "Can't reach the server. Tap here to retry.";
    sub.classList.add("retry");
  }
}
$("subtitle").addEventListener("click", () => {
  if ($("subtitle").classList.contains("retry")) {
    $("subtitle").classList.remove("retry");
    $("subtitle").textContent = "Loading…";
    load();
  }
});

// Run one action at a time; on failure keep the last good state on screen.
let busy = false;
async function act(button, fn) {
  if (busy) return;
  busy = true;
  if (button) button.disabled = true;
  try {
    state = await fn();
    render();
  } catch (e) {
    if (e.message !== "unauthorized") {
      $("subtitle").textContent = "That didn't save. Check your connection and try again.";
      if (button) button.disabled = false;
    }
  } finally {
    busy = false;
  }
}

$("score-form").addEventListener("submit", (e) => {
  e.preventDefault();
  const input = $("score");
  if (input.value === "") { input.focus(); return; }
  const score = Number(input.value);
  if (!Number.isInteger(score) || score < 0 || score > 300) return;
  const date = $("score-date").value || state.today;
  const button = $("verify");
  act(button, async () => {
    const next = await api("/api/score", { method: "POST", body: JSON.stringify({ score, date }) });
    input.value = "";
    $("score-date").value = next.today;
    $("ball").classList.add("spin");
    setTimeout(() => $("ball").classList.remove("spin"), 900);
    button.disabled = false;
    return next;
  });
});

$("verify-yesterday").addEventListener("click", () => {
  $("score-date").value = state.yesterday;
  $("score").focus();
  $("score").scrollIntoView({ behavior: "smooth", block: "center" });
});

for (const button of document.querySelectorAll(".excuse")) {
  const reason = button.dataset.reason;
  button.addEventListener("click", () => {
    if (!confirm(`${excuseCopy(reason).confirm} It won't break the streak, and it won't count either.`)) return;
    act(button, () => api("/api/excuse", { method: "POST", body: JSON.stringify({ reason }) }));
  });
}

$("unexcuse").addEventListener("click", () => {
  act($("unexcuse"), () => api("/api/excuse", { method: "DELETE", body: JSON.stringify({ date: state.today }) }));
});

for (const button of document.querySelectorAll(".excuse-yesterday")) {
  const reason = button.dataset.reason;
  button.addEventListener("click", () => {
    act(button, () => api("/api/excuse", { method: "POST", body: JSON.stringify({ date: state.yesterday, reason }) }));
  });
}

// ---------- progress ----------

const SVG_NS = "http://www.w3.org/2000/svg";

function svg(tag, attrs, text) {
  const el = document.createElementNS(SVG_NS, tag);
  for (const [k, v] of Object.entries(attrs)) el.setAttribute(k, v);
  if (text !== undefined) el.textContent = text;
  return el;
}

/**
 * The progress panel. Everything here is either a plain count or a claim the
 * server already checked against the scatter in the log, so nothing on screen
 * asserts a trend the data cannot support.
 *
 * Drawn as SVG geometry rather than positioned elements: the CSP has no
 * style-src, so it falls back to default-src and any inline style is blocked.
 */
function renderProgress(p) {
  const panel = $("progress");
  if (!p || !p.games) { panel.hidden = true; return; }
  panel.hidden = false;

  $("progress-window").textContent = `${p.games} game${p.games === 1 ? "" : "s"} on record`;
  $("form-avg").textContent = p.recentAverage ?? "–";
  panel.querySelector(".form-now small").textContent =
    p.window < 10 ? `last ${p.window} games` : "last 10 games";

  // Recent form against the lifetime average: the number that actually moves.
  const delta = $("form-delta");
  if (p.delta === null || p.games < 3) {
    delta.hidden = true;
  } else {
    delta.hidden = false;
    delta.className = "delta" + (p.delta > 0 ? " up" : p.delta < 0 ? " down" : "");
    delta.textContent = p.delta === 0
      ? `level with your ${p.average} average`
      : `${p.delta > 0 ? "+" : ""}${p.delta} vs your ${p.average} average`;
  }

  const verdict = $("verdict");
  verdict.textContent = p.verdict.text;
  verdict.className = "verdict " + p.verdict.state;

  drawChart(p);
  drawWarmup(p);

  $("fact-spread").textContent = p.spread === null ? "–" : `±${p.spread}`;
  $("fact-best").textContent = p.best ? p.best.total : "–";
  panel.querySelector("#fact-best + small").textContent = p.best
    ? `best ${p.best.games} game${p.best.games === 1 ? "" : "s"}`
    : "best series";
}

function drawChart(p) {
  const el = $("chart");
  el.innerHTML = "";

  const W = 320, H = 132;
  const L = 26, R = 6, T = 8, B = 16;
  const plotW = W - L - R;
  const plotH = H - T - B;

  const values = p.series.map((g) => g.score);
  const lo = Math.max(0, Math.floor((Math.min(...values) - 10) / 20) * 20);
  const hi = Math.min(300, Math.ceil((Math.max(...values) + 10) / 20) * 20);
  const span = hi - lo || 1;

  const x = (n) => L + (p.games === 1 ? plotW / 2 : ((n - 1) / (p.games - 1)) * plotW);
  const y = (v) => T + plotH - ((v - lo) / span) * plotH;

  // Recessive grid: three references, nothing more.
  for (const v of [lo, lo + span / 2, hi]) {
    el.appendChild(svg("line", { class: "grid-line", x1: L, x2: W - R, y1: y(v), y2: y(v) }));
    el.appendChild(svg("text", { class: "axis-label", x: L - 5, y: y(v) + 3, "text-anchor": "end" },
      String(Math.round(v))));
  }

  // Lifetime average, so recent games read against it at a glance.
  if (p.average !== null) {
    el.appendChild(svg("line", { class: "mean-line", x1: L, x2: W - R, y1: y(p.average), y2: y(p.average) }));
  }

  // The rolling average is the signal; the dots behind it are the noise it smooths.
  if (p.games > 1) {
    const d = p.rolling.map((v, i) => `${i ? "L" : "M"}${x(i + 1).toFixed(1)} ${y(v).toFixed(1)}`).join(" ");
    el.appendChild(svg("path", { class: "roll-line", d }));
  }

  const best = Math.max(...values);
  const tip = svg("g", { class: "tip", hidden: "hidden" });
  const tipBg = svg("rect", { class: "tip-bg", rx: 5, height: 15, x: 0, y: 0, width: 0 });
  const tipText = svg("text", { class: "tip-text", x: 0, y: 0, "text-anchor": "middle" });
  tip.append(tipBg, tipText);

  p.series.forEach((g) => {
    const isBest = g.score === best;
    el.appendChild(svg("circle", {
      class: "game-dot" + (isBest ? " best" : ""), cx: x(g.n), cy: y(g.score), r: isBest ? 3.4 : 2.6,
    }));
    // Hit target deliberately larger than the mark.
    const hit = svg("rect", { class: "game-hit", x: x(g.n) - 7, y: T, width: 14, height: plotH });
    const show = () => {
      const label = `${prettyDate(g.date)} · game ${g.game} · ${g.score}`;
      const w = label.length * 4.3 + 12;
      // Keep the bubble inside the frame at both ends of the series.
      const cx = Math.min(W - R - w / 2, Math.max(L + w / 2, x(g.n)));
      const top = Math.max(0, y(g.score) - 21);
      tipText.setAttribute("x", cx);
      tipText.setAttribute("y", top + 10.5);
      tipText.textContent = label;
      tipBg.setAttribute("x", cx - w / 2);
      tipBg.setAttribute("y", top);
      tipBg.setAttribute("width", w);
      tip.removeAttribute("hidden");
    };
    hit.addEventListener("pointerenter", show);
    hit.addEventListener("pointerdown", show);
    hit.addEventListener("pointerleave", () => tip.setAttribute("hidden", "hidden"));
    el.appendChild(hit);
  });
  el.appendChild(tip);

  $("chart-caption").textContent = `Every game since ${prettyDate(p.series[0].date)}. `
    + `The violet line is your rolling average, the dashed line your ${p.average} lifetime. Scale ${lo} to ${hi}.`;
}

function drawWarmup(p) {
  const box = $("warmup");
  const rows = p.session.rows;
  if (rows.length < 2) { box.hidden = true; return; }
  box.hidden = false;

  const el = $("warmup-chart");
  el.innerHTML = "";
  const W = 320, rowH = 20, gap = 6, labelW = 46, valW = 26;
  const H = rows.length * rowH + (rows.length - 1) * gap;
  el.setAttribute("viewBox", `0 0 ${W} ${H}`);
  el.setAttribute("height", H);

  // Bars carry magnitude, so the scale runs from zero.
  const top = Math.max(...rows.map((r) => r.average));
  const trackW = W - labelW - valW;
  const best = rows.filter((r) => r.average === top);

  rows.forEach((r, i) => {
    const yTop = i * (rowH + gap);
    const mid = yTop + rowH / 2;
    el.appendChild(svg("text", { class: "bar-label", x: 0, y: mid + 3.5 }, `Game ${r.game}`));
    el.appendChild(svg("rect", {
      class: "bar-track", x: labelW, y: yTop + 4, width: trackW, height: rowH - 8, rx: 5,
    }));
    el.appendChild(svg("rect", {
      class: "bar-fill" + (best.includes(r) ? " top" : ""),
      x: labelW, y: yTop + 4, width: Math.max(4, (r.average / top) * trackW), height: rowH - 8, rx: 5,
    }));
    el.appendChild(svg("text", { class: "bar-value", x: W, y: mid + 3.5, "text-anchor": "end" },
      String(r.average)));
  });

  $("warmup-gap").textContent = p.session.gap > 0 ? `+${p.session.gap} by the last game` : "";
  $("warmup-note").textContent = p.session.gap > 8
    ? `You warm up ${p.session.gap} pins into the night. Practice balls before game one turn that into scoring games.`
    : "Your first game holds up against your last. No warm up tax.";
}

// Keep the stats current without a manual reload. The page can sit open on the
// home screen for hours, and a game logged on another device would otherwise
// never show up here.
const REFRESH_MS = 60_000;
setInterval(() => {
  if (document.visibilityState === "visible" && !busy) load({ quiet: true });
}, REFRESH_MS);

document.addEventListener("visibilitychange", () => {
  if (document.visibilityState === "visible") load({ quiet: true });
});

// Restored from the back/forward cache, so the DOM is whatever it was hours ago.
window.addEventListener("pageshow", (e) => {
  if (e.persisted) load({ quiet: true });
});

window.addEventListener("online", () => load({ quiet: true }));

load();
