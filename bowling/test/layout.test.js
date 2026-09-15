import test from "node:test";
import assert from "node:assert/strict";
import {
  WIDGETS, WIDGET_IDS, DEFAULT_PINNED, DEFAULT_COLLAPSED, normalizeLayout, isLayoutInput,
} from "../functions/_lib/layout.js";

test("the catalogue has unique ids and a title for each card", () => {
  assert.equal(new Set(WIDGET_IDS).size, WIDGET_IDS.length);
  assert.ok(WIDGETS.every((w) => typeof w.title === "string" && w.title.length));
  assert.ok(DEFAULT_PINNED.every((id) => WIDGET_IDS.includes(id)));
  assert.ok(DEFAULT_COLLAPSED.every((id) => WIDGET_IDS.includes(id)));
  // Anything pinned is an answer, so it must not also arrive folded shut.
  assert.deepEqual(DEFAULT_PINNED.filter((id) => DEFAULT_COLLAPSED.includes(id)), []);
});

test("the reconstruction card is in the catalogue and opens by default", () => {
  assert.ok(WIDGET_IDS.includes("inside"));
  // It answers a question he asked outright, so it is not folded away.
  assert.equal(DEFAULT_COLLAPSED.includes("inside"), false);
});

test("no stored arrangement means the catalogue order and nothing marked as his", () => {
  const l = normalizeLayout(null);
  assert.deepEqual(l.order, WIDGET_IDS);
  assert.deepEqual(l.pinned, DEFAULT_PINNED);
  // The reference cards arrive folded so the dashboard reads in one screen.
  assert.deepEqual(l.collapsed, DEFAULT_COLLAPSED);
  assert.equal(l.custom, false, "until he arranges it the app may lead with what matters tonight");
  assert.equal(normalizeLayout("nonsense").custom, false);
  assert.equal(normalizeLayout([]).custom, false);
});

test("his order is kept and anything missing from it is appended", () => {
  // A layout saved before a card existed must not leave that card invisible.
  const l = normalizeLayout({ order: ["games", "hours"], pinned: ["games"], custom: true });
  assert.deepEqual(l.order.slice(0, 2), ["games", "hours"]);
  assert.equal(l.order.length, WIDGET_IDS.length);
  assert.deepEqual([...l.order].sort(), [...WIDGET_IDS].sort());
  assert.deepEqual(l.pinned, ["games"]);
  assert.equal(l.custom, true);
});

test("an order he never chose does not outlive the defaults", () => {
  // Folding a card saves the whole layout with custom false. If that stored
  // order were honoured, one fold would freeze the automatic ordering and send
  // every card shipped afterwards to the bottom.
  const stale = normalizeLayout({
    order: ["games", "hours", "tonight"],
    pinned: ["tonight", "better"],
    collapsed: ["games"],
    custom: false,
  });
  assert.deepEqual(stale.order, WIDGET_IDS, "the catalogue order stands until he arranges it");
  assert.deepEqual(stale.collapsed, ["games"], "but the fold is still his");

  // Once he has arranged it, his order is the order.
  const his = normalizeLayout({ order: ["games", "hours"], custom: true });
  assert.deepEqual(his.order.slice(0, 2), ["games", "hours"]);

  // A record with no pinned or collapsed field is a fresh one, not an empty one.
  const bare = normalizeLayout({ custom: false });
  assert.deepEqual(bare.pinned, DEFAULT_PINNED);
  assert.deepEqual(bare.collapsed, DEFAULT_COLLAPSED);
  // An explicit empty list is a choice and is kept.
  assert.deepEqual(normalizeLayout({ pinned: [], collapsed: [], custom: true }).pinned, []);
});

test("reading is not arranging", () => {
  // Folding a card shut is remembered without claiming he has arranged the
  // dashboard, so the app may still lead with what matters tonight.
  const read = normalizeLayout({ order: [...WIDGET_IDS], collapsed: ["games"], custom: false });
  assert.deepEqual(read.collapsed, ["games"]);
  assert.equal(read.custom, false);
  assert.equal(normalizeLayout({ collapsed: ["games"], custom: true }).custom, true);
});

test("ids that are not cards are dropped rather than rendered", () => {
  const l = normalizeLayout({
    order: ["games", "not-a-card", "games", 7, null, "hours"],
    pinned: ["hours", "hours", "nope"],
    collapsed: ["history", "gone"],
    custom: true,
  });
  assert.deepEqual(l.order.slice(0, 2), ["games", "hours"], "unknown ids and duplicates go");
  assert.deepEqual(l.pinned, ["hours"]);
  assert.deepEqual(l.collapsed, ["history"]);
});

test("the endpoint only accepts lists of short strings", () => {
  assert.equal(isLayoutInput({ order: ["games"], pinned: [], collapsed: [] }), true);
  assert.equal(isLayoutInput({}), true, "a partial update is fine");
  assert.equal(isLayoutInput(null), false);
  assert.equal(isLayoutInput([]), false);
  assert.equal(isLayoutInput({ order: "games" }), false);
  assert.equal(isLayoutInput({ order: [1, 2] }), false);
  assert.equal(isLayoutInput({ pinned: ["x".repeat(41)] }), false);
  assert.equal(isLayoutInput({ order: Array(WIDGET_IDS.length + 1).fill("games") }), false);
  // Folding a card sends custom: false, so the flag has to be a real boolean.
  assert.equal(isLayoutInput({ custom: false }), true);
  assert.equal(isLayoutInput({ custom: "yes" }), false);
});
