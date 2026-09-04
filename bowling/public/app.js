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
  const k = storedKey();
  const url = k ? `${path}${path.includes("?") ? "&" : "?"}key=${encodeURIComponent(k)}` : path;
  const res = await fetch(url, {
    headers: { "Content-Type": "application/json" },
    ...opts,
  });
  if (res.status === 401) {
    $("subtitle").textContent = "This device is not linked. Open your private link again.";
    throw new Error("unauthorized");
  }
  if (!res.ok) throw new Error((await res.json().catch(() => ({}))).error || res.statusText);
  return res.json();
}

function fmtCountdown(ms) {
  const h = Math.floor(ms / 3_600_000);
  const m = Math.floor((ms % 3_600_000) / 60_000);
  return h > 0 ? `${h}h ${m}m` : `${m}m`;
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
  const undo = $("undo");
  verify.disabled = false;

  if (s.verifiedToday) {
    status.className = "status ok";
    status.textContent = "Today is locked in. Nice.";
    verify.textContent = "✓ Bowled today";
    verify.classList.add("done");
    verify.disabled = true;
    undo.hidden = false;
  } else {
    verify.textContent = "I bowled today";
    verify.classList.remove("done");
    undo.hidden = true;
    if (s.atRisk) {
      status.className = "status risk";
      status.textContent = "Not verified yet. Streak ends at midnight.";
    } else if (s.current === 0 && s.total > 0) {
      status.className = "status broken";
      status.textContent = "Streak broken. Start a new one today.";
    } else {
      status.className = "status";
      status.textContent = "Tap once you've bowled.";
    }
  }

  // Games per day and score summary.
  const sc = s.scores;
  const dateInput = $("score-date");
  dateInput.min = s.start;
  dateInput.max = s.today;
  if (!dateInput.value || dateInput.value > s.today || dateInput.value < s.start) dateInput.value = s.today;
  $("score-summary").textContent = sc.games
    ? `${sc.games} game${sc.games === 1 ? "" : "s"}` +
      (sc.scored ? ` · average ${sc.average} · best ${sc.high} on ${prettyDate(sc.highDate)}` : "")
    : "No games logged yet.";
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
      chip.addEventListener("click", async () => {
        const label = score === null ? "an unscored game" : `the ${score} game`;
        if (!confirm(`Remove ${label} on ${prettyDate(d.date)}?`)) return;
        state = await api("/api/score", { method: "DELETE", body: JSON.stringify({ date: d.date, index }) });
        render();
      });
      chips.appendChild(chip);
    });
    const count = document.createElement("span");
    count.className = "count";
    count.textContent = `${d.games} game${d.games === 1 ? "" : "s"}`;
    li.append(date, chips, count);
    games.appendChild(li);
  }

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
        if (!s.verifiedToday) status.textContent = "Your session is over. Did you bowl? Tap to verify.";
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
  const startDow = (new Date(s.start + "T00:00:00Z").getUTCDay() + 6) % 7; // Monday = 0
  for (let i = 0; i < startDow; i++) grid.appendChild(Object.assign(document.createElement("div"), { className: "cell", style: "background:none" }));

  let cursor = s.start;
  while (cursor <= s.today) {
    const c = document.createElement("div");
    c.className = "cell";
    c.textContent = Number(cursor.slice(8));
    c.title = prettyDate(cursor);
    if (hits.has(cursor)) c.classList.add("hit");
    else if (cursor < s.today) c.classList.add("miss");
    if (cursor === s.today) c.classList.add("today");
    grid.appendChild(c);
    const d = new Date(cursor + "T00:00:00Z");
    d.setUTCDate(d.getUTCDate() + 1);
    cursor = d.toISOString().slice(0, 10);
  }

  // Countdown to midnight (Central) that keeps ticking without more requests.
  clearInterval(timer);
  const deadline = Date.now() + s.msUntilMidnight;
  const tick = () => {
    const left = deadline - Date.now();
    if (left <= 0) return load();
    $("countdown").textContent = s.verifiedToday
      ? `Next day starts in ${fmtCountdown(left)}`
      : `${fmtCountdown(left)} left to verify today`;
  };
  tick();
  timer = setInterval(tick, 30_000);
}

async function load() {
  state = await api("/api/state");
  render();
}

$("verify").addEventListener("click", async () => {
  $("verify").disabled = true;
  $("ball").classList.add("spin");
  setTimeout(() => $("ball").classList.remove("spin"), 900);
  state = await api("/api/checkin", { method: "POST", body: "{}" });
  render();
});

$("undo").addEventListener("click", async () => {
  if (!confirm("Remove today's check in?")) return;
  state = await api("/api/checkin", { method: "DELETE", body: JSON.stringify({ date: state.today }) });
  render();
});

$("score-form").addEventListener("submit", async (e) => {
  e.preventDefault();
  const input = $("score");
  const score = input.value === "" ? null : Number(input.value);
  if (score !== null && (!Number.isInteger(score) || score < 0 || score > 300)) return;
  const date = $("score-date").value || state.today;
  state = await api("/api/score", { method: "POST", body: JSON.stringify({ score, date }) });
  input.value = "";
  $("ball").classList.add("spin");
  setTimeout(() => $("ball").classList.remove("spin"), 900);
  render();
});

$("verify-yesterday").addEventListener("click", async () => {
  state = await api("/api/checkin", { method: "POST", body: JSON.stringify({ date: state.yesterday }) });
  render();
});

document.addEventListener("visibilitychange", () => {
  if (document.visibilityState === "visible") load().catch(() => {});
});

load().catch((e) => ($("subtitle").textContent = e.message));
