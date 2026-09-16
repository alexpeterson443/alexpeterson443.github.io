import { loadSubs, saveSubs } from "../_lib/store.js";
import { isSubscription } from "../_lib/push.js";

// POST   /api/push {endpoint} -> this device wants the evening reminder
// DELETE /api/push {endpoint} -> it does not, or not any more
//
// Only the endpoint is kept. Payload encryption would need the device's keys
// too, and these pushes carry no payload: the service worker fetches the state
// itself once it is woken. Nothing stored here can be read by the push service.
//
// The middleware has already checked the link, so anything arriving here is his.
export async function onRequestPost({ request, env }) {
  const body = await request.json().catch(() => null);
  if (!isSubscription(body)) {
    return Response.json({ error: "expected a push subscription with an https endpoint" }, { status: 400 });
  }
  const subs = await loadSubs(env);
  // Keyed by endpoint, so re-subscribing the same device replaces its record
  // rather than earning it two notifications every evening.
  const kept = subs.filter((s) => s.endpoint !== body.endpoint);
  kept.push({ endpoint: body.endpoint, since: new Date().toISOString() });
  return Response.json({ devices: (await saveSubs(env, kept)).length, on: true });
}

export async function onRequestDelete({ request, env }) {
  const body = await request.json().catch(() => null);
  const endpoint = body && typeof body.endpoint === "string" ? body.endpoint : null;
  const subs = await loadSubs(env);
  // No endpoint named means "stop reminding me anywhere", which is the only
  // sensible reading of a request from a device that has lost its own.
  const kept = endpoint ? subs.filter((s) => s.endpoint !== endpoint) : [];
  return Response.json({ devices: (await saveSubs(env, kept)).length, on: false });
}
