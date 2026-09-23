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
  api/excuse.js    POST {reason?} pause today, or {from, to?, reason?} pause a run of days; DELETE {date} | {from, to?} undo
  api/score.js     POST {score, date?, id?} log a scored game (verifies that day), DELETE {date, index}
  api/layout.js    GET/PUT the card arrangement, DELETE back to automatic order
  api/push.js      POST/DELETE {endpoint} turn the evening reminder on or off for this device
  api/settings.js  GET/PUT the settings he can change without a deploy, DELETE back to wrangler.toml
  api/nudge.js     GET the evening reminder's reasoning, POST to act on it; the timer hook
  api/claude.js    GET the streak and scores as plain text, for Claude in a chat
  api/readkey.js   GET the read only link for Claude, POST to replace it
  _lib/readkey.js  the read only key: derived from ACCESS_KEY, GET on two endpoints only
  _lib/summary.js  the state written out as text (unit tested)
  _lib/live.js     the D1 copy that keeps Claude's link current (unit tested)
  _lib/scores.js   score stats (unit tested)
  _lib/progress.js rolling form, trend with its interval, warm up gap (unit tested)
  _lib/coach.js    what the numbers mean tonight, in plain words (unit tested)
  _lib/frames.js   works a total back into strikes, spares and open frames (unit tested)
  _lib/window.js   gaps between commitments where the lanes are open (unit tested)
  _lib/layout.js   the widget catalogue and his arrangement (unit tested)
  ping.js          public reachability check
  _lib/ics.js      iCalendar parser with recurrence (unit tested)
  _lib/calendar.js fetches the feed, caches it, finds bowling sessions
  _lib/hours.js    alley opening hours (unit tested)
  _lib/streak.js   pure date + streak math (unit tested)
  _lib/store.js    KV read/write, caching, and first run seeding
  _lib/nudge.js    whether tonight is worth a notification (unit tested)
  _lib/settings.js validates them and lays them over the deploy config (unit tested)
  _lib/nudge-run.js decides and sends; shared by the Worker and /api/nudge
  _lib/push.js     VAPID signing and sending (unit tested)
nudge/             the cron Worker that sends the evening reminder
icon/icon.svg      the app icon, drawn; the two PNGs are rendered from it
test/              node --test
public/sw.js       offline shell and the push handler
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

## Letting Claude see it

Settings > **Claude** shows a read only link:
`https://bowling-streak.pages.dev/api/claude?key=<read key>`. Paste it into any
Claude chat, or into a project's instructions or Claude's memory so every chat
has it, and ask how the streak is going. It returns the streak, today's status,
missed and paused days, average, high game, form, today's alley hours, and the
last 30 days of games as plain text. `/api/state` with the same key returns the
full JSON the app itself uses.

It is live. Every save of games, pauses, check ins and settings is also copied
to a D1 database (`bowling-streak-live`, binding `LIVE_DB`) with read replication
off, and the link reads from there. KV alone can serve a value up to 30 seconds
old to another data centre; D1 answers from its primary, so a game logged on the
phone is in Claude's very next fetch. KV stays the app's store, and a failed copy
never fails a save.

The read key is not the private link. It can only GET those two endpoints: it
cannot log a game, pause a day, read or change settings, open the page, or get
a session cookie. It is derived from `ACCESS_KEY`, so there is nothing extra to
set at deploy time. **New link** retires it and mints another without touching
the private link.

## Days you can't bowl

If you genuinely can't bowl, tap **Alley closed**, **Sick**, **Injured**, or
**Away** under the score form. The day is paused: it neither breaks nor extends
the streak, and shows in the history grid in blue (closed), purple (sick),
orange (injured), or pink (away). Those pills cover today or yesterday, and
**Undo** removes them.

Going home to see family is known in advance and covers several days, so
**Going away? Pause those days** takes a range instead. Pick the first and last
day, pick a reason, and the whole run is paused in one go. Dates in the future
are the point: a day paused in advance does nothing to the streak until it
arrives. A pause covers at most 60 days and reaches a year ahead. Runs you have
already booked are listed under the link, and tapping one undoes it.

A bowled day always wins over a pause, so marking a trip you end up bowling
through costs nothing. When the calendar has an all day event mentioning closed,
recess, holiday, break, or no classes, the page shows a hint but never pauses a
day on its own.

## Your dashboard

Everything below the score form is a card you arrange. **Edit** in the top right
reveals a star to pin a card to the top and a handle to drag it anywhere,
including in and out of the Pinned group. Tapping a card's header folds it shut,
and a folded card still shows its headline figure, so the whole dashboard reads
in one screen and opens where you tap. The arrangement is stored in KV rather
than on the device, so the phone and the iPad agree.

Until you arrange it yourself the app leads with whatever matters tonight: with
the day still open and the lanes shut or closing, Alley hours climbs above the
statistics. The moment you move or pin a card that stops, because a dashboard
that reshuffles under you is not one you can learn. **Back to automatic order**
hands it back.

## What it tells you

`_lib/coach.js` sits on top of the raw statistics and is allowed to say nothing.
Every observation carries a guard, so a thin log produces a short list. Nothing
flatters: a widening swing and worsening bad games are stated as plainly as a
personal best.

- **Tonight** has no fixed content. Before the lanes open it says what your
  first game of the night averages; mid session it says which game of the night
  is usually your best and that there is still time for it; past last call it
  says a game bowled earlier can still be logged.
- **Am I getting better?** answers in words, with the arithmetic behind a *Why?*
  button, and carries the signals that move in weeks rather than years: how
  steady you are, your worst game lately, your best game lately. Each is a
  number with a caption saying what it measures and which way is good.
- **What to work on** names the single highest value thing the log can prove,
  with the rest of the observations under it.
- A trend is only called when its 95% interval clears zero, and until then the
  card says how far off that is rather than drawing a hopeful arrow.

## When to go

With `CALENDAR_ICS_URL` set, the app subtracts today's commitments from the
alley's hours and shows the gaps where you are free and the lanes will still
seat a game, bounded by now at one end and last call at the other. Back to back
classes merge into one block and a gap under 45 minutes is not offered. A day
with nothing on the calendar gets no window, because "free until last call" is
the opening hours read back to you.

## What your games were made of

A total does not say how it happened: 118 could be five strikes and five open
frames, or no strikes and eight spares. `_lib/frames.js` works backwards. Two
rates describe almost any bowler, and each pair implies an exact distribution of
final scores, computed frame by frame rather than simulated. The rates that
reproduce your average are found, and every game is read back off them.

Marks, meaning strikes plus spares, are what a total really pins down: a 70 is
ten open frames whichever way you split it. The strike to spare split is not
determined by totals and the card says so instead of inventing a number. The
useful figure is that scores ladder up about eleven pins per mark, so one more
spare a night is a number you can check.

It also shows that your scores swing further than any fixed pair of rates can
produce, which means a good part of the variation is which night it is rather
than how you bowl. The fit takes a tenth of a second, so it is cached in KV
against a signature of the log and recomputed only when a game is logged.

## Screen sizes

One column edge to edge on a phone. From 521px it becomes a centred 600px card,
which covers iPad Split View and an iPad 12.9" in portrait. From 1100px it
splits into two columns, streak and score entry on the left and the cards you
arranged on the right, so an iPad 12.9" in landscape (1366 points) fills the
screen without scrolling. The card centres vertically when it is shorter than
the viewport, and starts at the top and scrolls when it is taller.

Older iPadOS is handled too: no `Object.hasOwn`, `:has()`, or
`crypto.randomUUID` on the critical path, and the history grid keeps a usable
size without `aspect-ratio`.

## A logged game is never lost

The alley is in the Union basement where the signal is unreliable, so a game is
written to the device before it is sent anywhere. The form clears the moment it
is queued and the queue flushes on load, on the refresh tick, on return from the
background, and when the network returns, so a game survives a failed request, a
closed tab, and a force quit. Each queued game carries an id and the server
records the ids it has accepted, so replaying the queue cannot double log. KV has
no compare and set, so the write reads itself back and reapplies if it did not
land. A service worker keeps the shell, and nothing else, so the app still opens
with no signal; today's date is derived on the client so a game can be typed
before the server has ever answered.

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

## Settings

The gear in the header opens a screen for the things that used to need a
laptop: the first day of the streak, the timezone, the alley's hours day by
day, how long before close the last game goes on, the calendar feed and the
word that marks a session in it.

They are stored as one KV record laid over the deploy time config rather than
replacing it. A field you never touch keeps coming from wrangler.toml and keeps
following it when you change it there. A field you set back to the deploy value
stops being an override, so the screen's count of what you have changed is
honest and a later deploy is not silently frozen out by a copy of its own old
value. **Put everything back** clears the record; it touches no games, pauses
or card order.

Everything in the app reads the merged config, including the reminder Worker,
so a change lands on every deadline, countdown and day boundary at once rather
than on the half of them that happened to be rewritten.

The calendar feed is the exception to reading settings back: it grants read
access to your calendar, so the API stores it but never returns it. The screen
is told only that one is set and which host it points at.

## The evening reminder

One notification, and only one: on a day that still has no game and no pause,
two hours before the lanes stop taking games. That is 7:45 PM on weekdays and
Saturday, 5:45 PM on Sunday. No score reminders, no milestones, nothing else.

Turn it on under **Alley hours**, on the device you want it on. The phone and
the iPad subscribe separately.

The decision is made on the server, before anything is sent, so a day you have
already settled never produces a notification at all. The push itself carries
no text: the service worker wakes, asks `/api/state` what the situation is, and
writes the wording then, which is also why it can say the right thing if you
logged a game in the meantime.

Pages Functions cannot be put on a timer, so something else has to knock every
quarter hour. Two things can, and both call the same code in
`_lib/nudge-run.js`, so they cannot drift apart:

- **`nudge/`**, a Worker on Cloudflare's own cron. The right answer: no third
  party, no extra hop, fires on the minute. Deploying it needs an API token
  with Workers permissions, and `VAPID_PRIVATE_JWK` set on the Worker.
- **`.github/workflows/bowl-nudge.yml`**, which POSTs to `/api/nudge` on a
  schedule. Needs only a `BOWL_ACCESS_KEY` repository secret, since the Pages
  project already holds the VAPID key. GitHub runs scheduled workflows late and
  occasionally skips one; the window is two hours wide, so that is survivable
  rather than ideal.

Either way the decision is made server side and the clock is checked before any
KV read, so the ticks that fall outside the window cost one pure function call.

```bash
# A key pair. The public half goes in public/app.js, the private half is a secret.
npx wrangler deploy -c nudge/wrangler.toml
npx wrangler secret put VAPID_PRIVATE_JWK -c nudge/wrangler.toml
npx wrangler secret put VAPID_SUBJECT     -c nudge/wrangler.toml   # mailto: for push services
npx wrangler secret put ACCESS_KEY        -c nudge/wrangler.toml   # same key as the site
```

The Worker also answers a GET, gated by the same access key, which reports
tonight's reasoning without waiting for the evening. `?send=1` on that URL
actually sends, for proving a device is reachable.

On iPhone this needs iOS 16.4 or newer **and** the app added to the Home
Screen. Safari in a tab cannot receive push at all; the toggle says so rather
than pretending to work.

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
| `VAPID_PRIVATE_JWK` | secret (nudge/) | Signs the evening reminder            |
| `VAPID_SUBJECT`  | secret (nudge/) | Contact address for push services     |

Seeded days (Aug 28 to Sep 3) live in `functions/_lib/store.js` and are written to
KV only the very first time the API runs with an empty namespace.
