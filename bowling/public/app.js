const $ = (id) => document.getElementById(id);
let state = null;
let timer = null;

// Remember the private link key on this device as a backup to the cookie.
const KEY_STORE = "bowl_key";
const urlKey = new URLSearchParams(location.search).get("key");
if (urlKey) {
  try { localStorage.setItem(KEY_STORE, urlKey); } catch {}
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

  // Games list and score summary.
  const sc = s.scores;
  $("score-summary").textContent = sc.games
    ? `${sc.games} game${sc.games === 1 ? "" : "s"} · average ${sc.average} · best ${sc.high} on ${prettyDate(sc.highDate)}`
    : "No games logged yet.";
  const games = $("games");
  games.innerHTML = "";
  for (const g of sc.list) {
    const li = document.createElement("li");
    const score = document.createElement("span");
    score.className = "score" + (g.score === sc.high ? " best" : "");
    score.textContent = g.score;
    const date = document.createElement("span");
    date.className = "date";
    date.textContent = prettyDate(g.date);
    const del = document.createElement("button");
    del.type = "button";
    del.className = "link";
    del.textContent = "remove";
    del.addEventListener("click", async () => {
      if (!confirm(`Remove the ${g.score} game?`)) return;
      state = await api("/api/score", { method: "DELETE", body: JSON.stringify({ date: g.date, index: g.index }) });
      render();
    });
    li.append(score, date, del);
    games.appendChild(li);
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
  const score = Number(input.value);
  if (!Number.isInteger(score) || score < 0 || score > 300) return;
  state = await api("/api/score", { method: "POST", body: JSON.stringify({ score }) });
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
