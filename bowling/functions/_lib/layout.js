// The widget catalogue and the arrangement he has chosen.
//
// Every card below the score form is a widget: it can be pinned to the top,
// dragged into any order, and folded shut. The arrangement lives in KV rather
// than on the device so the phone and the iPad agree.
//
// The catalogue is the source of truth for what exists. A stored arrangement is
// filtered against it and any widget missing from it is appended, so shipping a
// new card never leaves it invisible behind an old saved layout, and removing
// one never leaves a dead id in his order.

export const WIDGETS = [
  { id: "tonight", title: "Tonight" },
  { id: "better", title: "Am I getting better?" },
  { id: "focus", title: "What to work on" },
  { id: "numbers", title: "My numbers" },
  { id: "chart", title: "Every game" },
  { id: "warmup", title: "Game by game of the night" },
  { id: "games", title: "Game log" },
  { id: "hours", title: "Alley hours" },
  { id: "history", title: "Streak history" },
];

export const WIDGET_IDS = WIDGETS.map((w) => w.id);

/** What sits at the top before he has moved anything: what to do, and whether it is working. */
export const DEFAULT_PINNED = ["tonight", "better"];

/**
 * Cards that arrive folded.
 *
 * These four are references rather than answers, and unfolded they turn the app
 * into a page he has to hunt through. Folded, each still shows its headline
 * figure in the header, so the whole dashboard reads in one screen and opens
 * only where he taps.
 */
export const DEFAULT_COLLAPSED = ["chart", "warmup", "games", "history"];

const known = (list) => {
  const out = [];
  if (!Array.isArray(list)) return out;
  for (const id of list) {
    if (typeof id === "string" && WIDGET_IDS.includes(id) && !out.includes(id)) out.push(id);
  }
  return out;
};

/**
 * A stored arrangement made safe to render.
 *
 * `custom` records whether he has actually arranged it himself. Until he has,
 * the app is free to lead with whatever matters tonight; the moment he drags a
 * card his order wins and nothing reorders itself under him again.
 */
export function normalizeLayout(raw) {
  if (!raw || typeof raw !== "object" || Array.isArray(raw)) {
    return { order: [...WIDGET_IDS], pinned: [...DEFAULT_PINNED], collapsed: [...DEFAULT_COLLAPSED], custom: false };
  }
  const order = known(raw.order);
  for (const id of WIDGET_IDS) if (!order.includes(id)) order.push(id);
  return {
    order,
    pinned: known(raw.pinned),
    collapsed: known(raw.collapsed),
    custom: raw.custom === true,
  };
}

/** True when the body is a shape the layout endpoint will accept. */
export function isLayoutInput(body) {
  if (!body || typeof body !== "object" || Array.isArray(body)) return false;
  if ("custom" in body && typeof body.custom !== "boolean") return false;
  for (const field of ["order", "pinned", "collapsed"]) {
    if (field in body && !Array.isArray(body[field])) return false;
    if (Array.isArray(body[field])) {
      if (body[field].length > WIDGET_IDS.length) return false;
      if (body[field].some((v) => typeof v !== "string" || v.length > 40)) return false;
    }
  }
  return true;
}
