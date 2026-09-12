import { loadLayout, saveLayout, clearLayout } from "../_lib/store.js";
import { isLayoutInput, normalizeLayout } from "../_lib/layout.js";

// GET    /api/layout                                       -> the arrangement he has saved
// PUT    /api/layout {order?, pinned?, collapsed?, custom?} -> save it
// DELETE /api/layout                                       -> back to the suggested order
//
// `custom` marks the arrangement as his own, which is what stops the app from
// reordering cards under him afterwards. The client decides: dragging and
// pinning are arranging, folding a card shut is only reading. It defaults to
// true so an older client that does not send it still claims its own layout.
export async function onRequestGet({ env }) {
  return Response.json(await loadLayout(env));
}

export async function onRequestPut({ request, env }) {
  const body = await request.json().catch(() => null);
  if (!isLayoutInput(body)) {
    return Response.json({ error: "expected order, pinned and collapsed as lists of widget ids" }, { status: 400 });
  }
  const custom = body.custom === undefined ? true : body.custom === true;
  return Response.json(await saveLayout(env, normalizeLayout({ ...body, custom })));
}

export async function onRequestDelete({ env }) {
  return Response.json(await clearLayout(env));
}
