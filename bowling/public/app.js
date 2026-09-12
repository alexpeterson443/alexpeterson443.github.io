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

// ---------- outbox ----------
//
// A game is written to this device before it is sent anywhere. The alley is in
// a basement and the signal there is unreliable, so a save that depends on the
// network is a save that loses games. Everything logged here survives a failed
// request, a closed tab, and a dead battery, and is flushed whenever the app is
// on screen and online. The server treats each id as write once, so replaying
// the queue can never double log a game.

const OUTBOX = "bowl_outbox";

function newId() {
  // crypto.randomUUID needs Safari 15.4; this works everywhere and is unique
  // enough for one bowler's queue.
  return `g-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;
}

function readOutbox() {
  try {
    const raw = JSON.parse(localStorage.getItem(OUTBOX) || "[]");
    return Array.isArray(raw) ? raw.filter((e) => e && typeof e.id === "string") : [];
  } catch { return []; }
}

function writeOutbox(list) {
  try { localStorage.setItem(OUTBOX, JSON.stringify(list)); return true; }
  catch { return false; }
}

function queueGame(date, score) {
  const entry = { id: newId(), date, score, at: Date.now() };
  const stored = writeOutbox([...readOutbox(), entry]);
  // If storage is unavailable the game only exists in this request, so the
  // caller has to be told it is not safe yet.
  return { entry, stored };
}

let flushing = false;

/**
 * Send everything queued, oldest first. Stops at the first network failure so
 * games keep their order; drops anything the server refuses outright, since
 * retrying that forever would wedge the queue behind it.
 */
async function flushOutbox() {
  if (flushing || busy) return null;
  const queue = readOutbox();
  if (!queue.length) return null;
  flushing = true;
  let latest = null;
  let rejected = null;
  try {
    for (const entry of queue) {
      try {
        latest = await api("/api/score", {
          method: "POST",
          body: JSON.stringify({ id: entry.id, date: entry.date, score: entry.score }),
        });
      } catch (e) {
        if (e.status && e.status >= 400 && e.status < 500 && e.status !== 401) {
          rejected = `${entry.score} on ${prettyDate(entry.date)} was refused: ${e.message}`;
        } else {
          break;   // network or server trouble: keep it queued and try later
        }
      }
      writeOutbox(readOutbox().filter((e) => e.id !== entry.id));
    }
  } finally {
    flushing = false;
  }
  if (latest) { state = latest; render(); }
  if (rejected) $("subtitle").textContent = rejected;
  else if (latest) renderPending();
  return latest;
}

/** How many games are still waiting to reach the server. */
function renderPending() {
  const n = readOutbox().length;
  const el = $("pending");
  if (!el) return;
  el.hidden = n === 0;
  if (n) el.textContent = `${n} game${n === 1 ? "" : "s"} saved on this device, waiting for signal.`;
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
  if (!res.ok) {
    const err = new Error((await res.json().catch(() => ({}))).error || res.statusText);
    err.status = res.status;
    throw err;
  }
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

// The site timezone, mirrored on the client so a game can be logged before the
// server has ever answered. Falls back to the device clock if Intl refuses.
const TZ = "America/Chicago";
function todayLocal() {
  try {
    return new Intl.DateTimeFormat("en-CA", {
      timeZone: TZ, year: "numeric", month: "2-digit", day: "2-digit",
    }).format(new Date());
  } catch {
    const d = new Date();
    const pad = (n) => String(n).padStart(2, "0");
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
  }
}

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
    // What that game actually did, rather than a pat on the back. A game under
    // the average pulled it down and the pill says so.
    status.textContent = lastGameLine(s) || "Today is locked in.";
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

  renderPending();
  renderProgress(s.progress);
  renderTonight(s);
  renderInsights(s.coach);
  rankPanels(s);

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
    sub.textContent = state ? "Can't reach the server. Showing what was loaded before." : "Offline. You can still log a game; it will sync later.";
    if (state) sub.classList.add("retry");
    // No state means a cold offline launch. Seed the form so a game can still
    // be logged, and show anything already waiting on this device.
    if (!state) {
      const d = $("score-date");
      if (!d.value) d.value = todayLocal();
      d.max = todayLocal();
      renderPending();
    }
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

$("score-form").addEventListener("submit", async (e) => {
  e.preventDefault();
  const input = $("score");
  if (input.value === "") { input.focus(); return; }
  const score = Number(input.value);
  if (!Number.isInteger(score) || score < 0 || score > 300) return;
  const date = $("score-date").value || (state && state.today) || todayLocal();
  const button = $("verify");

  // Queue first. Once it is on the device the game cannot be lost, so the form
  // clears immediately and the network becomes someone else's problem.
  const { stored } = queueGame(date, score);
  if (stored) {
    input.value = "";
    $("score-date").value = (state && state.today) || todayLocal();
    $("ball").classList.add("spin");
    setTimeout(() => $("ball").classList.remove("spin"), 900);
    renderPending();
  }

  button.disabled = true;
  try {
    const sent = await flushOutbox();
    if (!sent && !stored) {
      // No storage and no network: the only copy is still in the box.
      $("subtitle").textContent = "Could not save that. Check your connection and try again.";
      return;
    }
    if (!sent) $("subtitle").textContent = "Saved on this device. It will sync when you have signal.";
  } finally {
    button.disabled = false;
    renderPending();
  }
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
  // A series is a fixed three game block, so the totals are comparable.
  $("fact-best").textContent = p.best ? p.best.total : "–";
  panel.querySelector("#fact-best + small").textContent = p.best
    ? `best 3 on ${prettyDate(p.best.date).replace(/^\w+, /, "")}`
    : "best 3 games";
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

  // Dots carry their own verdict: over or under the lifetime average, with the
  // last three ringed so current form is visible without reading the numbers.
  const recentFrom = p.games - 3;
  p.series.forEach((g) => {
    const isBest = g.score === best;
    const side = p.average === null ? "" : g.score >= p.average ? " over" : " under";
    el.appendChild(svg("circle", {
      class: "game-dot" + (isBest ? " best" : side) + (g.n > recentFrom ? " recent" : ""),
      cx: x(g.n), cy: y(g.score), r: isBest ? 3.4 : 2.6,
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
    + `Filled dots beat your ${p.average} average, hollow ones did not, and the last three are ringed. `
    + `The line through them is your rolling average, the dashed one your lifetime. Scale ${lo} to ${hi}.`;
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

// ---------- the adaptive layer ----------
//
// The server decides what is true; this decides what gets said and where it
// sits. Everything here is driven off `state.coach`, which is recomputed from
// the log on every request, so the same screen reads differently after a good
// night than after a bad one, and differently again at 9 PM than at noon.

const FORM_LABEL = { hot: "Hot", cold: "Cold", steady: "Steady", unknown: "" };

/** One line on the most recent game, for the status pill. */
function lastGameLine(s) {
  const last = s.coach && s.coach.last;
  if (!last || last.date !== s.today) return null;
  const rank = last.isBest
    ? "Best game you have bowled"
    : `${ordinal(last.rank)} best of ${last.of}`;
  if (last.moved === null) return `${last.score}. ${rank}.`;
  const moved = last.moved > 0
    ? `average up to ${last.average}`
    : last.moved < 0
      ? `average down to ${last.average}`
      : `average holds at ${last.average}`;
  return `${last.score}. ${rank}, ${moved}.`;
}

function ordinal(n) {
  const rest = n % 100;
  if (rest >= 11 && rest <= 13) return `${n}th`;
  return `${n}${["th", "st", "nd", "rd"][n % 10] || "th"}`;
}

/**
 * The Tonight panel: form, the prompt for this hour, and the one thing worth
 * acting on. This is the block that has no fixed content at all.
 */
function renderTonight(s) {
  const c = s.coach;
  const panel = $("tonight");
  if (!c) { panel.hidden = true; return; }
  panel.hidden = false;

  // The accent follows form, so the app looks different when he is bowling
  // differently. Set as an attribute because the CSP blocks inline styles.
  document.body.dataset.form = c.form.state;

  const chip = $("form-chip");
  chip.hidden = !FORM_LABEL[c.form.state];
  chip.className = `form-chip ${c.form.state}`;
  chip.textContent = FORM_LABEL[c.form.state] || "";

  $("session-read").textContent = c.session.text;

  const formRead = $("form-read");
  formRead.hidden = !c.form.text;
  if (c.form.text) formRead.textContent = c.form.text;

  const focus = $("focus");
  focus.hidden = !c.focus;
  if (c.focus) {
    focus.className = `focus ${c.focus.tone}`;
    $("focus-title").textContent = c.focus.title;
    $("focus-text").textContent = c.focus.text;
  }
}

/** Ranked observations and the targets that follow from them. */
function renderInsights(c) {
  const list = $("insights");
  list.innerHTML = "";
  for (const item of (c && c.insights) || []) {
    const li = document.createElement("li");
    li.className = `insight ${item.tone}`;
    const head = document.createElement("strong");
    head.textContent = item.title;
    const body = document.createElement("span");
    body.textContent = item.text;
    li.append(head, body);
    list.appendChild(li);
  }

  const targets = (c && c.milestones) || [];
  $("targets").hidden = !targets.length;
  const rows = $("target-list");
  rows.innerHTML = "";
  for (const t of targets) {
    const li = document.createElement("li");
    const label = document.createElement("strong");
    label.textContent = t.label;
    const body = document.createElement("span");
    body.textContent = t.text;
    li.append(label, body);
    rows.appendChild(li);
  }
}

/**
 * Which panel gets the top of its column.
 *
 * With the day running out the lanes matter more than the statistics, so Alley
 * hours climbs; once the day is settled the numbers lead. Ordering is applied
 * through a data attribute against fixed CSS rules, never an inline style.
 */
function rankPanels(s) {
  const side = {
    progress: $("progress"),
    scores: document.querySelector(".scores"),
    hours: document.querySelector(".hours"),
    history: document.querySelector(".history"),
  };
  const h = s.hours;
  const unsettled = !s.verifiedToday && !s.excusedToday;
  const running = unsettled && h && (
    h.closedToday || !h.open || h.lastCallPassed ||
    (h.msUntilLastCall !== null && h.msUntilLastCall < 3 * 3_600_000)
  );

  const order = [];
  if (running) order.push("hours");
  if (s.progress && s.progress.games) order.push("progress");
  order.push("scores");
  if (!order.includes("hours")) order.push("hours");
  if (!order.includes("progress")) order.push("progress");
  order.push("history");

  order.forEach((key, i) => {
    if (side[key]) side[key].dataset.rank = String(i + 1);
  });
}

// Keep the stats current without a manual reload. The page can sit open on the
// home screen for hours, and a game logged on another device would otherwise
// never show up here.
const REFRESH_MS = 60_000;
setInterval(() => {
  if (document.visibilityState === "visible" && !busy) flushOutbox().then((sent) => { if (!sent) load({ quiet: true }); });
}, REFRESH_MS);

document.addEventListener("visibilitychange", () => {
  if (document.visibilityState !== "visible") return;
  flushOutbox().then((sent) => { if (!sent) load({ quiet: true }); });
});

// Restored from the back/forward cache, so the DOM is whatever it was hours ago.
window.addEventListener("pageshow", (e) => {
  if (e.persisted) load({ quiet: true });
});

// Signal is back: send anything the basement swallowed.
window.addEventListener("online", () => {
  flushOutbox().then((sent) => { if (!sent) load({ quiet: true }); });
});

// Keep a copy of the shell so the app opens in the basement, where there is no
// signal and the gated HTML cannot be re-fetched.
if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    navigator.serviceWorker.register("/sw.js").catch(() => {});
  });
}

renderPending();
load().then(() => flushOutbox());
