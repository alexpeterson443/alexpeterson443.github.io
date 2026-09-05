import { loadDays, loadScores, buildState } from "../_lib/store.js";

export async function onRequestGet({ env }) {
  const [days, scores] = await Promise.all([loadDays(env), loadScores(env)]);
  return Response.json(await buildState(env, days, scores));
}
