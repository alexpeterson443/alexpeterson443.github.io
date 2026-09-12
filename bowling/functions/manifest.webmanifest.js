import { keyMatches } from "./_lib/auth.js";

// Web app manifest. When fetched through the private link (?key=...) the
// start_url carries the key so a home screen install always opens unlocked.
export async function onRequestGet({ request, env }) {
  const key = new URL(request.url).searchParams.get("key");
  const unlocked = key !== null && (await keyMatches(env, key));
  const manifest = {
    name: "Bowling Streak",
    short_name: "Bowling",
    description: "Daily bowling streak and scores",
    display: "standalone",
    orientation: "portrait",
    background_color: "#0b0d14",
    theme_color: "#0b0d14",
    scope: "/",
    icons: [
      { src: "/icon-180.png", sizes: "180x180", type: "image/png" },
      { src: "/icon-512.png", sizes: "512x512", type: "image/png", purpose: "any maskable" },
    ],
  };
  if (unlocked) manifest.start_url = `/?key=${encodeURIComponent(key)}`;
  return Response.json(manifest, {
    headers: { "Content-Type": "application/manifest+json", "Cache-Control": "no-store" },
  });
}
