import test from "node:test";
import assert from "node:assert/strict";
import { WIDGETS, WIDGET_IDS, DEFAULT_PINNED, normalizeLayout, isLayoutInput } from "../functions/_lib/layout.js";

test("the catalogue has unique ids and a title for each card", () => {
  assert.equal(new Set(WIDGET_IDS).size, WIDGET_IDS.length);
  assert.ok(WIDGETS.every((w) => typeof w.title === "string" && w.title.length));
  assert.ok(DEFAULT_PINNED.every((id) => WIDGET_IDS.includes(id)));
});

test("no stored arrangement means the catalogue order and nothing marked as his", () => {
  const l = normalizeLayout(null);
  assert.deepEqual(l.order, WIDGET_IDS);
  assert.deepEqual(l.pinned, DEFAULT_PINNED);
  assert.deepEqual(l.collapsed, []);
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

test("ids that are not cards are dropped rather than rendered", () => {
  const l = normalizeLayout({
    order: ["games", "not-a-card", "games", 7, null, "hours"],
    pinned: ["hours", "hours", "nope"],
    collapsed: ["history", "gone"],
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
});
