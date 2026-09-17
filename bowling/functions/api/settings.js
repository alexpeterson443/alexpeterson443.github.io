import { loadSettings, saveSettings, loadDays, loadScores, buildState, configFor } from "../_lib/store.js";
import { validateSettings, applySettings, settingsView, mergeHours, pruneDefaults } from "../_lib/settings.js";
import { todayIn } from "../_lib/streak.js";

// GET    /api/settings          -> what is in force, what wrangler.toml says, what he has changed
// PUT    /api/settings {...}    -> change some of it; a field set to null goes back to the deploy value
// DELETE /api/settings          -> put all of it back
//
// These were vars in wrangler.toml, so changing the alley's closing time meant
// a laptop and a terminal. They are now a KV record laid over the deploy time
// config, which leaves anything he has never touched exactly as it was.
//
// The calendar feed is a credential for his calendar, so it can be written
// here but is never read back whole: the view carries only its last characters.
export async function onRequestGet({ env }) {
  return Response.json(settingsView(env, await loadSettings(env)));
}

export async function onRequestPut({ request, env }) {
  const body = await request.json().catch(() => null);
  const tz = (await configFor(env)).TIMEZONE || "America/Chicago";
  const { clean, errors } = validateSettings(body, todayIn(tz));
  if (errors.length) return Response.json({ error: errors[0], errors }, { status: 400 });

  const previous = await loadSettings(env);
  // An hours patch names only the days he touched, so it is filled out against
  // what is in force before it replaces the stored table.
  if (clean.HOURS) clean.HOURS = mergeHours(settingsView(env, previous).effective.hours, clean.HOURS);
  // Anything that ends up identical to wrangler.toml is not an override, and
  // storing it as one would both misreport what he has changed and freeze that
  // field against a later deploy.
  const saved = await saveSettings(env, pruneDefaults(env, applySettings(previous, clean)));
  // The state comes back with it, because a changed timezone or start date
  // moves the streak itself and the screen should not have to ask twice.
  const cfg = await configFor(env);
  return Response.json({
    ...settingsView(env, saved),
    state: await buildState(cfg, await loadDays(cfg), await loadScores(cfg)),
  });
}

export async function onRequestDelete({ env }) {
  const saved = await saveSettings(env, {});
  const cfg = await configFor(env);
  return Response.json({
    ...settingsView(env, saved),
    state: await buildState(cfg, await loadDays(cfg), await loadScores(cfg)),
  });
}
