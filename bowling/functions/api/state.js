import { loadDays, buildState } from "../_lib/store.js";

export async function onRequestGet({ env }) {
  const days = await loadDays(env);
  return Response.json(buildState(env, days));
}
