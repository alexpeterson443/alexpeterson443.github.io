import { loadDays, loadScores, buildState, configFor } from "../_lib/store.js";

export async function onRequestGet({ env }) {
  // Everything downstream reads the config, not the bare env, so a setting he
  // changed on the settings screen is in force here too.
  const cfg = await configFor(env);
  const [days, scores] = await Promise.all([loadDays(cfg), loadScores(cfg)]);
  return Response.json(await buildState(cfg, days, scores));
}
