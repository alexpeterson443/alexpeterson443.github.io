# Bowling Streak

A private daily streak tracker. Tap **I bowled today** once a day, or log a game,
which also counts as bowling that day. Games can be logged for any past day, with
or without a score. The page shows your high score, average, and games per day. There is no
password: the site opens only through the private link (`/?key=<ACCESS_KEY>`).
The key stays in the address so bookmarks and home screen icons keep working, and
the page also sets a one year cookie and remembers the key on the device.
Everyone else sees a 404.
The streak started on **Friday, August 28, 2026** and the
first week is pre seeded as verified. Days roll over at midnight Central time.

Runs on Cloudflare Pages with Pages Functions for the API and a KV namespace for
storage, so the streak is the same on your phone and laptop.

**Live:** https://bowling-streak.pages.dev (Pages project `bowling-streak`, KV namespace `BOWLING_STREAK`).

## What is in here

```
public/            static site (index.html, app.js, style.css)
functions/
  _middleware.js   private link gate for every route
  api/state.js     GET  -> streak stats
  api/checkin.js   POST {date?} verify today (or yesterday), DELETE {date} undo
  manifest.webmanifest.js  web app manifest; start_url carries the key when fetched through the private link
  api/score.js     POST {score?, date?} log a game (verifies that day; null score = not noted), DELETE {date, index}
  _lib/scores.js   score stats (unit tested)
  _lib/streak.js   pure date + streak math (unit tested)
  _lib/store.js    KV read/write and first run seeding
test/              node --test
wrangler.toml      Pages config, KV binding, START_DATE, TIMEZONE
```

## Deploy (about 5 minutes)

Prereqs: a free Cloudflare account and Node 18+.

```bash
cd bowling
npm install
npx wrangler login

# 1. The KV namespace (BOWLING_STREAK) already exists and its id is in wrangler.toml.

# 2. Set the secret key (any long random string), then deploy
npx wrangler pages secret put ACCESS_KEY --project-name bowling-streak
npm run deploy -- --branch main
```

Open `https://<site>.pages.dev/?key=<ACCESS_KEY>` in Safari itself (not an in app
browser), then Share > Add to Home Screen. It installs as a full screen app with
its own icon, and the launch address keeps the key so it always opens unlocked.

Redeploy after any change with `npm run deploy`.

### Optional: use a custom domain

In the Cloudflare dashboard: Workers & Pages > bowling-streak > Custom domains.

### Optional: swap the private link for Cloudflare Access

To require your email login before the page loads, go to Zero Trust > Access >
Applications, add a self hosted app for the `pages.dev` domain, and allow only your
email. Free for up to 50 users.

## Local development

```bash
echo 'ACCESS_KEY=dev' > .dev.vars
npm run dev                       # http://localhost:8788/?key=dev
npm test
```

`wrangler pages dev` uses a local KV emulator, so local check ins never touch prod.

## Config

| Setting          | Where          | Purpose                                  |
| ---------------- | -------------- | ---------------------------------------- |
| `START_DATE`     | wrangler.toml  | First day of the challenge               |
| `TIMEZONE`       | wrangler.toml  | Day boundary (America/Chicago)           |
| `ACCESS_KEY`     | secret         | Key in the private link                  |

Seeded days (Aug 28 to Sep 3) live in `functions/_lib/store.js` and are written to
KV only the very first time the API runs with an empty namespace.
