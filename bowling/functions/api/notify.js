import { loadPrefs, savePrefs } from "../_lib/store.js";
import { validatePrefs } from "../_lib/notify.js";

// GET /api/notify            -> which notifications are on, and the heads up time
// PUT /api/notify {headsup?, lastcall?, weekly?, at?} -> change some of them
//
// These are his choices, not this device's: the phone and the iPad each decide
// whether to receive pushes at all (/api/push), and both get the same kinds.
export async function onRequestGet({ env }) {
  return Response.json(await loadPrefs(env));
}

export async function onRequestPut({ request, env }) {
  const body = await request.json().catch(() => null);
  const { prefs, errors } = validatePrefs(body, await loadPrefs(env));
  if (errors.length) return Response.json({ error: errors[0], errors }, { status: 400 });
  return Response.json(await savePrefs(env, prefs));
}
