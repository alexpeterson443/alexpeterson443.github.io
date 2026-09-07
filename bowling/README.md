# Bowling Streak

A private daily streak tracker. A day counts as bowled only when a game score is
logged for it. Scores can be entered for any day since the start date, which is
also how a forgotten day gets verified after the fact. The page shows your high score, average, and games per day. There is no
password: the site opens only through the private link (`/?key=<ACCESS_KEY>`).
The key stays in the address so bookmarks and home screen icons keep working, and
the page also sets a one year cookie and remembers the key on the device.
Everyone else sees a 404 (the API answers 401).
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
  manifest.webmanifest.js  web app manifest; start_url carries the key when fetched through the private link
  api/excuse.js    POST {date?, reason?} excuse today or yesterday (closed, sick, injured), DELETE {date} undo
  api/score.js     POST {score, date?} log a scored game (verifies that day), DELETE {date, index}
  _lib/scores.js   score stats (unit tested)
  ping.js          public reachability check
  _lib/ics.js      iCalendar parser with recurrence (unit tested)
  _lib/calendar.js fetches the feed, caches it, finds bowling sessions
  _lib/hours.js    alley opening hours (unit tested)
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

## Days you can't bowl

If you genuinely can't bowl, tap **Alley closed**, **Sick**, or **Injured** under
the score form. The day is excused: it neither breaks nor extends the streak, and
shows in the history grid in blue (closed), purple (sick), or orange (injured).
Like scores it can be applied to today or yesterday only, and **Undo** removes it.
A bowled day always wins over an excuse. When the calendar has an all day event
mentioning closed, recess, holiday, break, or no classes, the page shows a hint
but never excuses a day on its own.

## Keeping the numbers current

Average, high, days bowled, and the streak are recomputed on the server for
every state read, over every game on record rather than only the days the Games
list shows. The page refetches on load, once a minute while it is on screen,
when it comes back from the background or the back/forward cache, when the
network returns, and at midnight, so a game logged on another device shows up
without a manual reload. A refresh that fails in the background keeps the last
good numbers on screen rather than replacing them with an error.

The average is a whole number, dropping the remainder the way a league average
does.

## Alley hours

The alley opens Mon to Fri 10:00 AM to 10:00 PM, Sat 12:00 PM to 10:00 PM, and
Sun 12:00 PM to 8:00 PM. The alley stops putting games on 15 minutes before the
posted close, so the real deadline is 9:45 PM on weekdays and Saturday, 7:45 PM
on Sunday.

The page shows the week, highlights today, and says whether the alley is open,
when it opens, when the last game goes on, or when it next opens once it has
shut. Once the cut off passes it says so plainly, since the alley is still open
but will not start you a game. While the day is unsettled the countdown points
at last call rather than at midnight. Once the day is settled it switches to
the wait until the lanes open again, skipping any day the alley never opens,
rather than counting down to the midnight rollover. Logging a score stays
possible until midnight, so a game you bowled earlier can still be entered
afterwards.

The defaults live in `functions/_lib/hours.js`. Override them with the `HOURS`
var in wrangler.toml: JSON mapping `sun` through `sat` to `["HH:MM", "HH:MM"]`,
or `null` for a day the alley never opens. Days you leave out keep their
default, and anything that does not parse falls back rather than breaking the
page. `LAST_CALL_MINUTES` sets the cut off (default 15, 0 to 240); it never
lands before opening on a very short day. Times are wall clock in `TIMEZONE`,
so DST is handled.

## Calendar

Set the `CALENDAR_ICS_URL` secret to a private iCal feed and the page shows
whether bowling is on today's calendar, when it starts and ends, and the next
session. Any event whose title or location contains `CALENDAR_KEYWORD`
(default `bowl`) counts. The feed is cached for 10 minutes in KV.

- Google Calendar: Settings > your calendar > Integrate calendar > Secret address in iCal format.
- iCloud: Calendar app > tap the calendar's info button > Public Calendar > copy the `webcal://` link.

```bash
npx wrangler pages secret put CALENDAR_ICS_URL --project-name bowling-streak
npm run deploy -- --branch main
```

## Local development

```bash
printf 'ACCESS_KEY=devkey\n' > .dev.vars     # add CALENDAR_ICS_URL=... to test the calendar
npm run dev                                 # http://localhost:8788/?key=devkey
npm test
```

`wrangler pages dev` uses a local KV emulator, so local check ins never touch prod.

## Config

| Setting          | Where          | Purpose                                  |
| ---------------- | -------------- | ---------------------------------------- |
| `START_DATE`     | wrangler.toml  | First day of the challenge               |
| `TIMEZONE`       | wrangler.toml  | Day boundary (America/Chicago)           |
| `ACCESS_KEY`     | secret         | Key in the private link                  |
| `CALENDAR_ICS_URL` | secret       | Private iCal feed (optional)             |
| `CALENDAR_KEYWORD` | wrangler.toml | Word that marks a bowling event         |
| `HOURS`          | wrangler.toml  | Alley opening hours (optional override)  |
| `LAST_CALL_MINUTES` | wrangler.toml | Minutes before close that games stop  |

Seeded days (Aug 28 to Sep 3) live in `functions/_lib/store.js` and are written to
KV only the very first time the API runs with an empty namespace.
