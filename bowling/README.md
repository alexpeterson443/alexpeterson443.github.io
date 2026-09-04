# Bowling Streak

A daily streak tracker. Tap **I bowled today** once a day. There is no login: anyone
with the link can see and tap it.
The streak started on **Friday, August 28, 2026** (the day after move in) and the
first week is pre seeded as verified. Days roll over at midnight Central time.

Runs on Cloudflare Pages with Pages Functions for the API and a KV namespace for
storage, so the streak is the same on your phone and laptop.

**Live:** https://bowling-streak.pages.dev (Pages project `bowling-streak`, KV namespace `BOWLING_STREAK`).

## What is in here

```
public/            static site (index.html, app.js, style.css)
functions/
  api/state.js     GET  -> streak stats
  api/checkin.js   POST {date?} verify today (or yesterday), DELETE {date} undo
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

# 2. Deploy
npm run deploy -- --branch main
```

Wrangler prints a `*.pages.dev` URL. Add it to your home screen from Safari's share
sheet for an app like feel.

Redeploy after any change with `npm run deploy`.

### Optional: use a custom domain

In the Cloudflare dashboard: Workers & Pages > bowling-streak > Custom domains.

### Optional: make it private with Cloudflare Access

To require your email login before the page loads, go to Zero Trust > Access >
Applications, add a self hosted app for the `pages.dev` domain, and allow only your
email. Free for up to 50 users.

## Local development

```bash
npm run dev                       # http://localhost:8788
npm test
```

`wrangler pages dev` uses a local KV emulator, so local check ins never touch prod.

## Config

| Setting          | Where          | Purpose                                  |
| ---------------- | -------------- | ---------------------------------------- |
| `START_DATE`     | wrangler.toml  | First day of the challenge               |
| `TIMEZONE`       | wrangler.toml  | Day boundary (America/Chicago)           |

Seeded days (Aug 28 to Sep 3) live in `functions/_lib/store.js` and are written to
KV only the very first time the API runs with an empty namespace.
