import { loadLayout, saveLayout, clearLayout } from "../_lib/store.js";
import { isLayoutInput, normalizeLayout } from "../_lib/layout.js";

// GET    /api/layout                              -> the arrangement he has saved
// PUT    /api/layout {order?, pinned?, collapsed?} -> save it
// DELETE /api/layout                              -> back to the suggested order
//
// Saving marks the arrangement as his own, which is what stops the app from
// reordering cards under him afterwards.
export async function onRequestGet({ env }) {
  return Response.json(await loadLayout(env));
}

export async function onRequestPut({ request, env }) {
  const body = await request.json().catch(() => null);
  if (!isLayoutInput(body)) {
    return Response.json({ error: "expected order, pinned and collapsed as lists of widget ids" }, { status: 400 });
  }
  return Response.json(await saveLayout(env, normalizeLayout({ ...body, custom: true })));
}

export async function onRequestDelete({ env }) {
  return Response.json(await clearLayout(env));
}
