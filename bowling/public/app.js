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
  $("subtitle").textContent = `Started ${prettyDate(s.start)} · ${prettyDate(s.today)}`;

  const status = $("status");
  const verify = $("verify");
  // The one line that has to be readable without scrolling.
  const lead = $("lead");
  const plan = s.coach && s.coach.window;
  lead.hidden = !(plan && plan.short);
  if (!lead.hidden) {
    lead.textContent = plan.short;
    lead.className = "lead" + (plan.open ? " now" : "");
  }
  const hint = $("form-hint");
  verify.disabled = false;
  verify.classList.remove("done");

  // Once the day is logged the form is not what he came for, so it folds away
  // behind a single button and gives the screen back to the cards. `formOpen`
  // is his intent: without it the minute by minute refresh would fold a form he
  // is halfway through typing into.
  const settled = s.verifiedToday && !readOutbox().length;
  if (!settled) formOpen = false;
  $("score-form").hidden = settled && !formOpen;
  $("add-game").hidden = !settled || formOpen;

  if (s.verifiedToday) {
    status.className = "status ok";
    // What that game actually did, rather than a pat on the back. A game under
    // the average pulled it down and the pill says so.
    status.textContent = lastGameLine(s) || "Today is locked in.";
    verify.textContent = "Add game";
    verify.classList.add("done");
    hint.textContent = s.scoresToday && s.scoresToday.length
      ? `Today: ${s.scoresToday.join(", ")}`
      : "";
  } else if (s.excusedToday) {
    status.className = `status paused ${s.excuseToday || "closed"}`;
    status.textContent = excuseCopy(s.excuseToday).status(s.current);
    verify.textContent = "I bowled";
    hint.textContent = "Bowled after all? Enter the score and today counts.";
  } else {
    verify.textContent = "I bowled";
    hint.textContent = "";
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
    ? `${sc.games} game${sc.games === 1 ? "" : "s"}`
    : "Nothing logged yet";
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
  renderTonight(s);
  renderBetter(s.coach);
  renderFocus(s.coach);
  renderNumbers(s);
  renderInside(s.frames);
  renderChartCard(s.progress);
  drawWarmup(s.progress, s.coach);
  applyLayout(s);

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
  if ($("excuses").hidden) {
    $("excuse-pills").hidden = true;
    $("excuses-toggle").classList.remove("open");
  }
  $("unexcuse").hidden = !s.excusedToday;
  $("unexcuse").closest(".undo-row").hidden = !s.excusedToday;
  $("unexcuse").textContent = excuseCopy(s.excuseToday).undo;
  const closure = $("closure-hint");
  closure.hidden = !(cal.configured && cal.closureToday && !s.verifiedToday && !s.excusedToday);
  if (!closure.hidden) closure.textContent = `📌 ${cal.closureToday} on your calendar. If the lanes are shut, tap Alley closed below.`;

  // Alley hours: where today sits, and the week's table.
  const hours = s.hours;
  const hoursNow = $("hours-now");
  // Only when it says something the countdown above it does not.
  hoursNow.hidden = !hours;
  if (hours) {
    hoursNow.className = "hint hours-now";
    const unsettled = !s.verifiedToday && !s.excusedToday;
    if (hours.closedToday) {
      hoursNow.textContent = "The alley is closed all day today.";
      hoursNow.classList.add("warn");
    } else if (hours.beforeOpen) {
      // The countdown above already points at last call, so this line carries
      // the one fact it does not: when the doors actually open.
      hoursNow.hidden = !unsettled;
      hoursNow.textContent = `Opens ${hours.opensAt}.`;
    } else if (hours.open && hours.lastCallPassed) {
      // Still open, but too late to start a game. Only a problem if the day
      // still needs one.
      hoursNow.textContent = unsettled
        ? `Too late to start a game. The alley stopped at ${hours.lastCallAt}.`
        : `Alley open until ${hours.closesAt}.`;
      if (unsettled) hoursNow.classList.add("warn");
    } else if (hours.open) {
      // The countdown right above already carries the time remaining, so this
      // line only earns its space when the deadline is close.
      const soon = (hours.msUntilLastCall ?? 0) < 2 * 3_600_000 && unsettled;
      hoursNow.hidden = !soon;
      hoursNow.textContent = `Last game goes on by ${hours.lastCallAt}.`;
      if (soon) hoursNow.classList.add("warn");
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
    $("hours-today").textContent = hours.closedToday ? "Closed today" : hours.todayLabel;
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
  $("history-meta").textContent = `${s.total} day${s.total === 1 ? "" : "s"}`;

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
  const nextDay = hours && hours.next
    ? (hours.next.today ? "today" : hours.next.tomorrow ? "tomorrow" : hours.next.day)
    : null;
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
// Whether he has deliberately opened the score form on a day already logged.
let formOpen = false;
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
    // Mid session he bowls three in a row, so the form stays open and focused
    // while the lanes are open: type, tap, type, tap. Once they are shut the
    // next game is not coming tonight and the form folds away again.
    const live = state && state.hours && state.hours.open && !state.hours.lastCallPassed;
    formOpen = !!live;
    input.value = "";
    $("score-date").value = (state && state.today) || todayLocal();
    $("ball").classList.add("spin");
    setTimeout(() => $("ball").classList.remove("spin"), 900);
    renderPending();
    if (formOpen) input.focus();
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

function openForm() {
  formOpen = true;
  $("score-form").hidden = false;
  $("add-game").hidden = true;
}

$("add-game").addEventListener("click", () => {
  openForm();
  $("score").focus();
});

$("verify-yesterday").addEventListener("click", () => {
  openForm();
  $("score-date").value = state.yesterday;
  $("score").focus();
  $("score").scrollIntoView({ behavior: "smooth", block: "center" });
});

$("excuses-toggle").addEventListener("click", () => {
  const pills = $("excuse-pills");
  pills.hidden = !pills.hidden;
  $("excuses-toggle").classList.toggle("open", !pills.hidden);
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
 * The chart card: recent form against the lifetime average, then every game.
 *
 * Drawn as SVG geometry rather than positioned elements. The CSP sets no
 * style-src so it falls back to default-src, which refuses a style attribute
 * written with setAttribute; CSSOM writes such as el.style.transform are not
 * refused, which is what makes the drag below possible.
 */
function renderChartCard(p) {
  const card = widget("chart");
  if (!card) return;
  const empty = !p || !p.games;
  card.hidden = empty;
  if (empty) return;

  $("chart-meta").textContent = p.recentAverage === null ? `${p.games} games` : `Last 10: ${p.recentAverage}`;
  $("form-avg").textContent = p.recentAverage ?? "–";
  card.querySelector(".form-now small").textContent =
    p.window < 10 ? `last ${p.window} games` : "last 10 games";

  const delta = $("form-delta");
  if (p.delta === null || p.games < 3) {
    delta.hidden = true;
  } else {
    delta.hidden = false;
    delta.className = "delta" + (p.delta > 0 ? " up" : p.delta < 0 ? " down" : "");
    delta.textContent = p.delta === 0
      ? `level with your ${p.average} average`
      : `${p.delta > 0 ? "+" : ""}${p.delta} on your ${p.average} average`;
  }

  drawChart(p);
}

/**
 * My numbers, each with a caption saying what it is.
 *
 * The old panel showed "±24" under the words "pin spread", which meant nothing
 * unless you already knew. Every row here says what the number measures and
 * which direction is good.
 */
function renderNumbers(s) {
  const p = s.progress;
  const sc = s.scores;
  const rows = [];

  rows.push({ label: "Average", value: sc.average ?? "–", caption: p.games ? `across all ${p.games} games` : "no games yet" });
  if (sc.high !== null) rows.push({ label: "Best game", value: sc.high, caption: prettyDate(sc.highDate) });
  if (p.best) rows.push({ label: "Best three in a row", value: p.best.total, caption: `${prettyDate(p.best.date)}, ${Math.round(p.best.total / 3)} a game` });
  if (p.spread !== null) {
    rows.push({
      label: "Game to game swing", value: `${p.spread} pins`,
      caption: "how far your games usually sit from each other. Smaller means you can repeat it.",
    });
  }
  rows.push({ label: "Days bowled", value: s.total, caption: `longest run ${s.longest} day${s.longest === 1 ? "" : "s"}` });

  const list = $("metrics");
  list.innerHTML = "";
  for (const r of rows) {
    const li = document.createElement("li");
    const label = document.createElement("span");
    label.className = "m-label";
    label.textContent = r.label;
    const value = document.createElement("span");
    value.className = "m-value";
    value.textContent = r.value;
    const caption = document.createElement("span");
    caption.className = "m-caption";
    caption.textContent = r.caption;
    li.append(label, value, caption);
    list.appendChild(li);
  }
  $("numbers-meta").textContent = sc.average === null ? "" : `Avg ${sc.average}`;

  renderTargets(s.coach);
}

/** The plain answer card. Words first, the statistics behind a Why? button. */
function renderBetter(c) {
  const card = widget("better");
  if (!card) return;
  const b = c && c.better;
  card.hidden = !b;
  if (!b) return;

  $("better-answer").textContent = b.answer;
  $("better-answer").className = "answer " + b.state;
  $("better-because").textContent = b.because;
  // Folded, the header is all he sees, so it carries the answer rather than a
  // count he can get anywhere else.
  $("better-games").textContent = {
    improving: "Improving", declining: "Sliding", flat: "Not yet", early: "Too early",
  }[b.state] || "";

  const more = $("better-more");
  const detail = $("better-detail");
  more.hidden = !b.detail;
  detail.textContent = b.detail || "";
  if (!b.detail) detail.hidden = true;

  const list = $("better-signals");
  list.innerHTML = "";
  for (const sig of b.signals) {
    const li = document.createElement("li");
    li.className = `signal ${sig.direction}`;
    const label = document.createElement("span");
    label.className = "s-label";
    label.textContent = sig.label;
    const value = document.createElement("span");
    value.className = "s-value";
    value.textContent = sig.value;
    const note = document.createElement("span");
    note.className = "s-detail";
    note.textContent = sig.detail;
    li.append(label, value, note);
    list.appendChild(li);
  }
}

/** The one thing to work on, with the rest of the observations under it. */
function renderFocus(c) {
  const card = widget("focus");
  if (!card) return;
  const focus = c && c.focus;
  const items = (c && c.insights) || [];
  card.hidden = !focus && !items.length;
  if (card.hidden) return;

  const title = $("focus-title");
  const text = $("focus-text");
  if (focus) {
    title.hidden = false;
    title.textContent = focus.title;
    title.className = "answer small " + focus.tone;
    text.textContent = focus.text;
    $("focus-meta").textContent = items.length ? `+${items.length} more` : "";
  } else {
    $("focus-meta").textContent = "";
    title.hidden = true;
    text.textContent = "Nothing in your log points at one thing to fix right now.";
  }

  const list = $("insights");
  list.innerHTML = "";
  for (const item of items) {
    const li = document.createElement("li");
    li.className = `insight ${item.tone}`;
    const head = document.createElement("strong");
    head.textContent = item.title;
    const body = document.createElement("span");
    body.textContent = item.text;
    li.append(head, body);
    list.appendChild(li);
  }
}

/** The example that makes the point, taken from his own log rather than guessed. */
function worstLine(f) {
  const worst = f.named.find((g) => g.label === "Your worst game");
  return worst && worst.marks === 0
    ? `a ${worst.score} game is ten open frames whichever way you split it.`
    : "a low game is open frames whichever way you split it.";
}

/**
 * What the games were made of, worked backwards from the totals.
 *
 * Marks lead because marks are what a total actually pins down. The strike to
 * spare split is in the explanation rather than the headline, because the score
 * genuinely does not decide it and a number there would be invented.
 */
function renderInside(f) {
  const card = widget("inside");
  if (!card) return;
  card.hidden = !f || !f.enough;
  if (card.hidden) return;

  const t = f.typical;
  const marks = (n) => `${n} mark${n === 1 ? "" : "s"}`;
  $("inside-meta").textContent = `${t.marks} a game`;
  $("inside-answer").textContent =
    `Your ${f.average} average is about ${marks(t.marks)} and ${t.opens} open frames a game.`;
  $("inside-worth").textContent = f.pinsPerMark
    ? `Every extra mark is worth about ${f.pinsPerMark} pins, so one more spare a night is ${f.pinsPerMark} pins on your average.`
    : "";

  const list = $("inside-games");
  list.innerHTML = "";
  for (const g of f.named) {
    const li = document.createElement("li");
    li.className = "signal";
    const label = document.createElement("span");
    label.className = "s-label";
    label.textContent = `${g.label}, ${g.score}`;
    const value = document.createElement("span");
    value.className = "s-value";
    value.textContent = marks(g.marks);
    const note = document.createElement("span");
    note.className = "s-detail";
    note.textContent = g.firm
      ? `${g.opens} open frames.`
      : `${g.opens} open frames, give or take a mark either way.`;
    li.append(label, value, note);
    list.appendChild(li);
  }

  $("inside-detail").textContent =
    `Nothing here was recorded, it was worked out. A total does not say how it happened, so the app finds the scoring rates that would produce your ${f.average} average and reads each game back off them. `
    + `Marks hold up under that: ${worstLine(f)} `
    + `The split itself does not: your totals fit anything from ${f.split.strikeLow}% to ${f.split.strikeHigh}% of first balls striking, with ${f.split.spareLow}% to ${f.split.spareHigh}% of the rest picked up, and a total cannot choose between those. `
    + `One more thing it shows: a bowler with fixed rates would swing about ${f.swing.bowling} pins from game to game. You swing ${f.swing.yours}. The difference is which night it is, not how you bowl.`;
}

/** Concrete targets, sitting under My numbers. */
function renderTargets(c) {
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

function drawWarmup(p, coach) {
  const box = widget("warmup");
  if (!box) return;
  const rows = p.session.rows;
  if (rows.length < 2) { box.hidden = true; return; }
  box.hidden = false;
  // The gap the server vouches for, measured across seats he has actually
  // bowled repeatedly. Thin seats are still drawn, just not trusted.
  const warm = coach && coach.warmup;

  const el = $("warmup-chart");
  el.innerHTML = "";
  const W = 320, rowH = 20, gap = 6, labelW = 46, valW = 26;
  const H = rows.length * rowH + (rows.length - 1) * gap;
  el.setAttribute("viewBox", `0 0 ${W} ${H}`);
  el.setAttribute("height", H);

  // Bars carry magnitude, so the scale runs from zero.
  const top = Math.max(...rows.map((r) => r.average));
  const trackW = W - labelW - valW;
  // Only a seat with real repetition can hold the best average; a game bowled
  // twice sitting on top is a sample size, not a finding.
  const solid = rows.filter((r) => r.sessions >= 3);
  const solidTop = solid.length ? Math.max(...solid.map((r) => r.average)) : null;

  rows.forEach((r, i) => {
    const yTop = i * (rowH + gap);
    const mid = yTop + rowH / 2;
    el.appendChild(svg("text", { class: "bar-label", x: 0, y: mid + 3.5 }, `Game ${r.game}`));
    el.appendChild(svg("rect", {
      class: "bar-track", x: labelW, y: yTop + 4, width: trackW, height: rowH - 8, rx: 5,
    }));
    el.appendChild(svg("rect", {
      class: "bar-fill" + (r.sessions < 3 ? " thin" : r.average === solidTop ? " top" : ""),
      x: labelW, y: yTop + 4, width: Math.max(4, (r.average / top) * trackW), height: rowH - 8, rx: 5,
    }));
    el.appendChild(svg("text", { class: "bar-value", x: W, y: mid + 3.5, "text-anchor": "end" },
      String(r.average)));
  });

  const thin = rows.some((r) => r.sessions < 3);
  $("warmup-gap").textContent = warm && warm.gap > 0 ? `+${warm.gap} by game ${warm.to.game}` : "";
  const note = !warm
    ? "Not enough repeat games at each position to compare them yet."
    : warm.gap > 8
      ? `You warm up ${warm.gap} pins between game ${warm.from.game} and game ${warm.to.game}. Practice balls before game one turn that into scoring games.`
      : `Game ${warm.from.game} holds up against game ${warm.to.game}. No warm up tax.`;
  $("warmup-note").textContent = thin
    ? `${note} Faded bars are positions you have bowled fewer than three times.`
    : note;
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
 * Tonight: the prompt for this hour and how the last few games are going.
 * The block with no fixed content at all.
 */
function renderTonight(s) {
  const c = s.coach;
  const panel = widget("tonight");
  if (!panel) return;
  if (!c) { panel.hidden = true; return; }
  panel.hidden = false;

  // The accent follows form, so the app looks different when he is bowling
  // differently. A data attribute against fixed rules, not a style attribute,
  // which the CSP does refuse.
  document.body.dataset.form = c.form.state;

  const chip = $("form-chip");
  chip.hidden = !FORM_LABEL[c.form.state];
  chip.className = `form-chip ${c.form.state}`;
  chip.textContent = FORM_LABEL[c.form.state] || "";

  const plan = $("session-window");
  plan.hidden = !(c.window && c.window.sentence);
  if (!plan.hidden) {
    plan.textContent = c.window.sentence;
    plan.className = "plan" + (c.window.open ? " now" : "");
  }

  $("session-read").textContent = c.session.text;

  const formRead = $("form-read");
  formRead.hidden = !c.form.text;
  if (c.form.text) formRead.textContent = c.form.text;
}

// ---------- widgets ----------
//
// Every card below the score form is a widget: pin it to the top, drag it into
// any order, fold it shut. The arrangement lives on the server so the phone and
// the iPad agree, with a copy on the device so a cold offline launch still
// opens in the order he left it.
//
// Until he arranges it himself the app is free to lead with whatever matters
// tonight. The moment he moves a card that stops: his order wins and nothing
// reshuffles under him again, which is the difference between a dashboard and
// a dashboard you can trust.

const LAYOUT_STORE = "bowl_layout";
const FALLBACK_ORDER = ["tonight", "better", "focus", "numbers", "chart", "warmup", "games", "hours", "history"];
const FALLBACK_COLLAPSED = ["chart", "warmup", "games", "history"];

let layout = null;
let editing = false;
let layoutTimer = null;
let layoutDirty = false;

const widget = (id) => document.querySelector(`[data-widget="${id}"]`);
const zone = (name) => $(`zone-${name}`);
const placedCards = () => [...document.querySelectorAll(".zone [data-widget]")];

function storedLayout() {
  try {
    const raw = JSON.parse(localStorage.getItem(LAYOUT_STORE) || "null");
    return raw && Array.isArray(raw.order) ? raw : null;
  } catch { return null; }
}

function keepLayout(l) {
  try { localStorage.setItem(LAYOUT_STORE, JSON.stringify(l)); } catch {}
}

/**
 * What to lead with when he has not arranged the cards himself.
 *
 * With the day still open and the lanes shut or closing, where the lanes are up
 * to matters more than any statistic. Once the day is settled the numbers lead.
 */
function suggestedOrder(s, base) {
  if (!s) return base;
  const h = s.hours;
  const unsettled = !s.verifiedToday && !s.excusedToday;
  const running = unsettled && h && (
    h.closedToday || !h.open || h.lastCallPassed ||
    (h.msUntilLastCall !== null && h.msUntilLastCall < 3 * 3_600_000)
  );
  const lead = [];
  if (running) lead.push("hours");
  lead.push("tonight");
  if (s.coach && s.coach.focus) lead.push("focus");
  lead.push("better");
  return [...lead, ...base.filter((id) => !lead.includes(id))];
}

/** Move every card into its zone, in order. */
function applyLayout(s) {
  const incoming = (s && s.layout) || layout || storedLayout();
  layout = {
    order: [...FALLBACK_ORDER],
    pinned: [],
    collapsed: [...FALLBACK_COLLAPSED],
    custom: false,
    ...(incoming || {}),
  };
  // Anything the server has never heard of still has to appear somewhere.
  for (const id of FALLBACK_ORDER) if (!layout.order.includes(id)) layout.order.push(id);

  const order = layout.custom ? layout.order : suggestedOrder(s, layout.order);
  const pinnedZone = zone("pinned");
  const restZone = zone("rest");

  for (const id of order) {
    const el = widget(id);
    if (!el) continue;
    // appendChild moves an existing node, so walking the order in sequence is
    // all the sorting this needs.
    (layout.pinned.includes(id) ? pinnedZone : restZone).appendChild(el);
    el.classList.toggle("folded", layout.collapsed.includes(id));
    const pin = el.querySelector(".w-pin");
    if (pin) {
      const on = layout.pinned.includes(id);
      pin.classList.toggle("on", on);
      pin.setAttribute("aria-label", on ? "Unpin card" : "Pin card");
    }
  }

  const anyPinned = layout.pinned.some((id) => {
    const el = widget(id);
    return el && !el.hidden;
  });
  pinnedZone.hidden = !anyPinned && !editing;
  pinnedZone.classList.toggle("empty", !anyPinned);
}

/** Read the arrangement back off the DOM after he has changed it. */
function captureLayout(custom = true) {
  const order = [];
  const pinned = [];
  const collapsed = [];
  for (const el of placedCards()) {
    const id = el.dataset.widget;
    order.push(id);
    if (el.closest(".zone").dataset.zone === "pinned") pinned.push(id);
    if (el.classList.contains("folded")) collapsed.push(id);
  }
  layout = { order, pinned, collapsed, custom };
  keepLayout(layout);
  return layout;
}

/** Send it up, coalescing a flurry of drags into one write. */
function persistLayout() {
  clearTimeout(layoutTimer);
  layoutTimer = setTimeout(async () => {
    try {
      const saved = await api("/api/layout", { method: "PUT", body: JSON.stringify(layout) });
      layout = saved;
      keepLayout(layout);
      layoutDirty = false;
    } catch {
      // The arrangement is already on the device, so this is worth a retry
      // later rather than an error in his face.
      layoutDirty = true;
    }
  }, 400);
}

function setEditing(on) {
  if (!layout) return;
  editing = on;
  document.body.classList.toggle("editing", on);
  $("edit-toggle").textContent = on ? "Done" : "Edit";
  $("edit-note").hidden = !on;
  zone("pinned").hidden = !layout.pinned.some((id) => {
    const el = widget(id);
    return el && !el.hidden;
  }) && !on;
}

$("edit-toggle").addEventListener("click", () => setEditing(!editing));

// Back to the app deciding. Useful precisely because arranging it himself is
// otherwise permanent.
$("layout-reset").addEventListener("click", async () => {
  clearTimeout(layoutTimer);
  try {
    layout = await api("/api/layout", { method: "DELETE" });
    keepLayout(layout);
    layoutDirty = false;
    applyLayout(state);
  } catch {
    $("subtitle").textContent = "Could not reset the order. Check your connection.";
  }
});

document.addEventListener("click", (e) => {
  const pin = e.target.closest(".w-pin");
  if (pin && layout) {
    const el = pin.closest("[data-widget]");
    const id = el.dataset.widget;
    const next = layout.pinned.includes(id)
      ? layout.pinned.filter((x) => x !== id)
      : [...layout.pinned, id];
    // Pinning is an arrangement, so it counts as his order from here on.
    layout = { ...layout, pinned: next, custom: true };
    applyLayout(null);
    captureLayout();
    persistLayout();
    return;
  }
  // The chevron is the affordance, but the whole header is the target: on a
  // phone a 30px button is a miss waiting to happen.
  const head = editing ? null : e.target.closest(".w-head");
  if (head && layout) {
    head.closest("[data-widget]").classList.toggle("folded");
    captureLayout(layout.custom);
    persistLayout();
    return;
  }
  const more = e.target.closest(".more");
  if (more) {
    const detail = $(more.dataset.target);
    if (!detail) return;
    detail.hidden = !detail.hidden;
    more.textContent = detail.hidden ? (more.dataset.open || "Why?") : "Hide";
  }
});

// ---------- drag ----------
//
// The card follows the finger through a transform while the list reorders live
// underneath it. Each reorder changes the card's own layout position, so the
// shift it causes is measured and folded back into the transform; without that
// the card would jump by its own height every time it swapped places.

let drag = null;

function setDragTranslate(px) {
  drag.translate = px;
  // A CSSOM write. The CSP refuses setAttribute("style", ...) but not this.
  drag.el.style.transform = `translateY(${px}px)`;
}

/** Where the card would sit with no transform applied. */
function dragLayoutTop() {
  return drag.el.getBoundingClientRect().top - drag.translate;
}

function reorderTo(y) {
  const el = drag.el;

  // An empty zone has no card to aim at, so the zone itself is the target.
  // This is the only way to pin the very first card by dragging.
  for (const z of [zone("pinned"), zone("rest")]) {
    if (z.hidden || z.querySelector("[data-widget]:not(.dragging)")) continue;
    const r = z.getBoundingClientRect();
    if (y >= r.top && y <= r.bottom && el.parentNode !== z) { z.appendChild(el); return; }
  }

  const others = placedCards().filter((c) => c !== el);
  for (const c of others) {
    const r = c.getBoundingClientRect();
    if (y < r.top + r.height / 2) {
      if (c !== el.nextElementSibling) c.parentNode.insertBefore(el, c);
      return;
    }
  }
  const last = others[others.length - 1];
  const host = last ? last.parentNode : zone("rest");
  if (el.parentNode !== host || el.nextElementSibling !== null) host.appendChild(el);
}

/** Keep dragging usable on a long list by nudging the page at the edges. */
function edgeScroll(y) {
  const margin = 90;
  if (y < margin) window.scrollBy(0, -Math.ceil((margin - y) / 6));
  else if (y > window.innerHeight - margin) window.scrollBy(0, Math.ceil((y - (window.innerHeight - margin)) / 6));
}

document.addEventListener("pointerdown", (e) => {
  if (!editing || e.button !== 0) return;
  const grip = e.target.closest(".w-grip");
  if (!grip) return;
  const el = grip.closest("[data-widget]");
  if (!el) return;
  e.preventDefault();
  grip.setPointerCapture(e.pointerId);
  drag = { el, grip, pointerId: e.pointerId, startY: e.clientY, shift: 0, translate: 0, moved: false };
  el.classList.add("dragging");
  document.body.classList.add("dragging-now");
});

document.addEventListener("pointermove", (e) => {
  if (!drag || e.pointerId !== drag.pointerId) return;
  e.preventDefault();
  drag.moved = true;
  setDragTranslate(e.clientY - drag.startY + drag.shift);

  const before = dragLayoutTop();
  reorderTo(e.clientY);
  const after = dragLayoutTop();
  if (after !== before) {
    // The list moved the card; cancel that out so it stays under the finger.
    drag.shift -= after - before;
    setDragTranslate(e.clientY - drag.startY + drag.shift);
  }
  edgeScroll(e.clientY);
});

function endDrag() {
  if (!drag) return;
  const { el, moved } = drag;
  el.style.transform = "";
  el.classList.remove("dragging");
  document.body.classList.remove("dragging-now");
  drag = null;
  if (!moved) return;
  captureLayout();
  applyLayout(null);
  persistLayout();
}

document.addEventListener("pointerup", endDrag);
document.addEventListener("pointercancel", endDrag);

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
  if (layoutDirty) persistLayout();
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
