// Frame scoring, shared by the page and the server.
//
// A classic script rather than a module, because app.js is one: the page loads
// this first and reads it off `BowlFrames`, and the Pages Functions import it
// for that same side effect. One scorer, so the running score the phone shows
// at the alley can never disagree with what the server accepts.
//
// A frame is {b1, b2, b3, leave}: pins knocked down by each ball, and
// optionally which pins were left standing after the first, as "3-10".
// Strikes, spares and opens are never stored; they fall out of the pins.

(function (root) {
  "use strict";

  const isPins = (v) => Number.isInteger(v) && v >= 0 && v <= 10;
  const has = (v) => v !== null && v !== undefined;

  /** "3-10" -> [3, 10]; null for anything that is not a clean leave. */
  function parseLeave(text) {
    if (typeof text !== "string" || !/^(10|[1-9])(-(10|[1-9]))*$/.test(text)) return null;
    const pins = text.split("-").map(Number);
    if (new Set(pins).size !== pins.length) return null;
    return pins.sort((a, b) => a - b);
  }

  /** Pins standing, sorted, written the way a bowler says them. */
  function formatLeave(pins) {
    return [...pins].sort((a, b) => a - b).join("-");
  }

  /**
   * Why frame `i` (0 based) is not a legal frame, or null when it is.
   * `complete` false accepts a frame still being bowled, for the entry pad.
   */
  function frameError(i, f, complete = true) {
    if (!f || typeof f !== "object") return "missing";
    const { b1, b2, b3 } = f;
    const tenth = i === 9;
    if (!has(b1)) return complete ? "first ball missing" : null;
    if (!isPins(b1)) return "first ball must be 0 to 10 pins";
    // The leave describes the first ball, so it is checked before anything
    // that could end the frame early.
    if (has(f.leave) && f.leave !== "") {
      const pins = parseLeave(f.leave);
      if (!pins) return "leave must be pin numbers like 7 or 3-10";
      if (b1 === 10) return "a strike leaves nothing standing";
      if (pins.length !== 10 - b1) return `leave has ${pins.length} pins but ${10 - b1} were standing`;
    }

    if (!tenth) {
      if (b1 === 10) return has(b2) || has(b3) ? "a strike ends the frame" : null;
      if (has(b3)) return "only the 10th frame has a third ball";
      if (!has(b2)) return complete ? "second ball missing" : null;
      if (!isPins(b2) || b1 + b2 > 10) return `second ball can take at most ${10 - b1}`;
    } else {
      if (!has(b2)) return complete ? "second ball missing" : null;
      if (!isPins(b2)) return "second ball must be 0 to 10 pins";
      if (b1 < 10 && b1 + b2 > 10) return `second ball can take at most ${10 - b1}`;
      const bonus = b1 === 10 || b1 + b2 === 10;
      if (!bonus) {
        if (has(b3)) return "a third ball needs a strike or spare first";
      } else if (!has(b3)) {
        if (complete) return "third ball missing";
      } else {
        if (!isPins(b3)) return "third ball must be 0 to 10 pins";
        // After a strike then a non-strike, the third ball finishes that rack.
        if (b1 === 10 && b2 < 10 && b2 + b3 > 10) return `third ball can take at most ${10 - b2}`;
      }
    }

    return null;
  }

  /** Every ball in order, which is all the bonus arithmetic needs. */
  function rolls(frames) {
    const out = [];
    frames.forEach((f, i) => {
      if (!f || !has(f.b1)) return;
      out.push(f.b1);
      if (has(f.b2)) out.push(f.b2);
      if (i === 9 && has(f.b3)) out.push(f.b3);
    });
    return out;
  }

  /**
   * Cumulative score after each frame, null where a bonus ball has not been
   * thrown yet. Works on a game in progress, which is what the pad shows.
   */
  function running(frames) {
    const r = rolls(frames);
    const out = [];
    let at = 0;
    let total = 0;
    for (let i = 0; i < 10; i++) {
      const f = frames[i];
      if (!f || !has(f.b1)) { out.push(null); continue; }
      let add = null;
      if (i === 9) {
        const bonus = f.b1 === 10 || (has(f.b2) && f.b1 + f.b2 === 10);
        const done = has(f.b2) && (!bonus || has(f.b3));
        add = done ? f.b1 + f.b2 + (bonus ? f.b3 : 0) : null;
      } else if (f.b1 === 10) {
        add = at + 2 < r.length ? 10 + r[at + 1] + r[at + 2] : null;
        at += 1;
      } else if (has(f.b2)) {
        if (f.b1 + f.b2 === 10) add = at + 2 < r.length ? 10 + r[at + 2] : null;
        else add = f.b1 + f.b2;
        at += 2;
      } else {
        at += 1;
      }
      if (add === null || out.some((v, j) => j < i && v === null)) { out.push(null); continue; }
      total += add;
      out.push(total);
    }
    return out;
  }

  /** Strike, spare or open, from the first two balls of the frame. */
  function kind(f) {
    if (!f || !has(f.b1)) return null;
    if (f.b1 === 10) return "strike";
    if (!has(f.b2)) return null;
    return f.b1 + f.b2 === 10 ? "spare" : "open";
  }

  /**
   * A whole game, checked. Returns {score} or {error}. Ten frames exactly, every
   * frame legal, and the total is computed rather than trusted.
   */
  function scoreGame(frames) {
    if (!Array.isArray(frames) || frames.length !== 10) return { error: "a game has exactly 10 frames" };
    for (let i = 0; i < 10; i++) {
      const e = frameError(i, frames[i], true);
      if (e) return { error: `frame ${i + 1}: ${e}` };
    }
    const run = running(frames);
    return { score: run[9] };
  }

  /** Copy of a frame with only the fields that are stored. */
  function clean(f) {
    const out = { b1: f.b1, b2: has(f.b2) ? f.b2 : null, b3: has(f.b3) ? f.b3 : null };
    const pins = has(f.leave) && f.leave !== "" ? parseLeave(f.leave) : null;
    out.leave = pins ? formatLeave(pins) : null;
    return out;
  }

  root.BowlFrames = { frameError, running, kind, scoreGame, parseLeave, formatLeave, clean };
})(typeof globalThis !== "undefined" ? globalThis : this);
