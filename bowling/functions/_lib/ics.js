// Minimal iCalendar (.ics) reader: enough for personal Google and iCloud feeds.
// Handles timed and all day events, TZID/UTC/floating times, DTEND or DURATION,
// DAILY and WEEKLY RRULE (INTERVAL, COUNT, UNTIL, BYDAY), EXDATE, and
// RECURRENCE-ID overrides. MONTHLY and YEARLY rules yield only their first
// occurrence, which is fine for a bowling schedule.

const DAY_MS = 86_400_000;
const WEEKDAYS = ["SU", "MO", "TU", "WE", "TH", "FR", "SA"];

/** Offset of `tz` from UTC at `date`, in ms (positive east of UTC). */
export function tzOffsetMs(date, tz) {
  const p = new Intl.DateTimeFormat("en-US", {
    timeZone: tz, hourCycle: "h23",
    year: "numeric", month: "2-digit", day: "2-digit",
    hour: "2-digit", minute: "2-digit", second: "2-digit",
  }).formatToParts(date);
  const g = (t) => Number(p.find((x) => x.type === t).value);
  const asUtc = Date.UTC(g("year"), g("month") - 1, g("day"), g("hour"), g("minute"), g("second"));
  return asUtc - Math.floor(date.getTime() / 1000) * 1000;
}

/** Wall clock parts in `tz` -> UTC ms. */
export function zonedToUtc({ y, mo, d, h = 0, mi = 0, s = 0 }, tz) {
  const naive = Date.UTC(y, mo - 1, d, h, mi, s);
  let guess = naive - tzOffsetMs(new Date(naive), tz);
  guess = naive - tzOffsetMs(new Date(guess), tz);
  return guess;
}

function unfold(text) {
  return text.replace(/\r\n/g, "\n").replace(/\n[ \t]/g, "").split("\n");
}

function parseLine(line) {
  const idx = line.indexOf(":");
  if (idx < 0) return null;
  const head = line.slice(0, idx);
  const value = line.slice(idx + 1);
  const [name, ...paramParts] = head.split(";");
  const params = {};
  for (const p of paramParts) {
    const [k, v] = p.split("=");
    if (k) params[k.toUpperCase()] = v;
  }
  return { name: name.toUpperCase(), params, value };
}

/** Parse an ICS date or date-time value into { utc, allDay, parts, tz }. */
function parseDateValue(value, params, defaultTz) {
  const m = value.match(/^(\d{4})(\d{2})(\d{2})(?:T(\d{2})(\d{2})(\d{2})?(Z)?)?$/);
  if (!m) return null;
  const parts = { y: +m[1], mo: +m[2], d: +m[3], h: +(m[4] || 0), mi: +(m[5] || 0), s: +(m[6] || 0) };
  const allDay = params.VALUE === "DATE" || !m[4];
  if (allDay) return { utc: Date.UTC(parts.y, parts.mo - 1, parts.d), allDay: true, parts, tz: null };
  if (m[7] === "Z") return { utc: Date.UTC(parts.y, parts.mo - 1, parts.d, parts.h, parts.mi, parts.s), allDay: false, parts, tz: "UTC" };
  const tz = params.TZID || defaultTz;
  return { utc: zonedToUtc(parts, tz), allDay: false, parts, tz };
}

function parseDuration(v) {
  const m = v.match(/^(-)?P(?:(\d+)W)?(?:(\d+)D)?(?:T(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?)?$/);
  if (!m) return null;
  const ms = ((+m[2] || 0) * 7 + (+m[3] || 0)) * DAY_MS + (+m[4] || 0) * 3600_000 + (+m[5] || 0) * 60_000 + (+m[6] || 0) * 1000;
  return m[1] ? -ms : ms;
}

function parseRRule(v) {
  const r = {};
  for (const part of v.split(";")) {
    const [k, val] = part.split("=");
    r[k.toUpperCase()] = val;
  }
  return r;
}

/** Parse the raw VEVENT blocks. */
export function parseEvents(text, defaultTz = "UTC") {
  const events = [];
  let cur = null;
  for (const raw of unfold(text)) {
    if (raw === "BEGIN:VEVENT") { cur = { exdates: [] }; continue; }
    if (raw === "END:VEVENT") { if (cur) events.push(cur); cur = null; continue; }
    if (!cur) continue;
    const p = parseLine(raw);
    if (!p) continue;
    switch (p.name) {
      case "UID": cur.uid = p.value; break;
      case "SUMMARY": cur.summary = unescape(p.value); break;
      case "LOCATION": cur.location = unescape(p.value); break;
      case "DESCRIPTION": cur.description = unescape(p.value); break;
      case "STATUS": cur.status = p.value.toUpperCase(); break;
      case "DTSTART": cur.start = parseDateValue(p.value, p.params, defaultTz); break;
      case "DTEND": cur.end = parseDateValue(p.value, p.params, defaultTz); break;
      case "DURATION": cur.duration = parseDuration(p.value); break;
      case "RRULE": cur.rrule = parseRRule(p.value); break;
      case "EXDATE":
        for (const v of p.value.split(",")) {
          const d = parseDateValue(v, p.params, defaultTz);
          if (d) cur.exdates.push(d.utc);
        }
        break;
      case "RECURRENCE-ID": cur.recurrenceId = parseDateValue(p.value, p.params, defaultTz)?.utc; break;
    }
  }
  return events.filter((e) => e.start);
}

function unescape(v) {
  return v.replace(/\\n/gi, "\n").replace(/\\,/g, ",").replace(/\;/g, ";").replace(/\\\\/g, "\\");
}

function durationOf(e) {
  if (e.end) return Math.max(0, e.end.utc - e.start.utc);
  if (e.duration != null) return e.duration;
  return e.start.allDay ? DAY_MS : 3600_000;
}

/** Shift wall clock parts by whole days, keeping the same local time in tz. */
function occurrenceAt(e, dayOffset) {
  const { parts } = e.start;
  const base = Date.UTC(parts.y, parts.mo - 1, parts.d + dayOffset);
  const dt = new Date(base);
  const p = { y: dt.getUTCFullYear(), mo: dt.getUTCMonth() + 1, d: dt.getUTCDate(), h: parts.h, mi: parts.mi, s: parts.s };
  if (e.start.allDay) return Date.UTC(p.y, p.mo - 1, p.d);
  if (e.start.tz === "UTC") return Date.UTC(p.y, p.mo - 1, p.d, p.h, p.mi, p.s);
  return zonedToUtc(p, e.start.tz);
}

/**
 * Expand every event into concrete occurrences overlapping [fromMs, toMs].
 * Returns [{ uid, summary, location, description, start, end, allDay }].
 */
export function expandOccurrences(events, fromMs, toMs) {
  const overridden = new Set(events.filter((e) => e.recurrenceId != null).map((e) => `${e.uid}|${e.recurrenceId}`));
  const out = [];

  const push = (e, startMs) => {
    const endMs = startMs + durationOf(e);
    if (endMs < fromMs || startMs > toMs) return;
    if (e.status === "CANCELLED") return;
    out.push({
      uid: e.uid, summary: e.summary || "", location: e.location || "", description: e.description || "",
      start: startMs, end: endMs, allDay: !!e.start.allDay,
    });
  };

  for (const e of events) {
    if (!e.rrule || e.recurrenceId != null) { push(e, e.start.utc); continue; }

    const r = e.rrule;
    const freq = r.FREQ;
    const interval = Math.max(1, +(r.INTERVAL || 1));
    const count = r.COUNT ? +r.COUNT : Infinity;
    const until = r.UNTIL ? parseDateValue(r.UNTIL, {}, e.start.tz || "UTC")?.utc ?? Infinity : Infinity;
    const startDow = new Date(Date.UTC(e.start.parts.y, e.start.parts.mo - 1, e.start.parts.d)).getUTCDay();

    if (freq !== "DAILY" && freq !== "WEEKLY") { push(e, e.start.utc); continue; }

    const byDays = freq === "WEEKLY" && r.BYDAY
      ? r.BYDAY.split(",").map((d) => WEEKDAYS.indexOf(d.slice(-2))).filter((i) => i >= 0).sort()
      : [startDow];

    let produced = 0;
    for (let iter = 0; iter < 2000 && produced < count; iter++) {
      // Day offsets for this iteration (one day for DAILY, a week's worth for WEEKLY).
      const offsets = freq === "DAILY"
        ? [iter * interval]
        : byDays.map((dow) => iter * interval * 7 + ((dow - startDow + 7) % 7));
      let beyond = false;
      for (const off of offsets) {
        if (off < 0) continue;
        const startMs = occurrenceAt(e, off);
        if (startMs < e.start.utc) continue;
        if (startMs > until) { beyond = true; break; }
        if (produced >= count) break;
        produced++;
        if (startMs > toMs) { beyond = true; break; }
        if (e.exdates.includes(startMs)) continue;
        if (overridden.has(`${e.uid}|${startMs}`)) continue;
        push(e, startMs);
      }
      if (beyond) break;
    }
  }
  return out.sort((a, b) => a.start - b.start);
}
