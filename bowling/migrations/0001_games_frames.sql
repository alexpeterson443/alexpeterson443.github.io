-- Frame level data, game identity and per night notes.
--
-- Additive only. The KV record `scores` stays the store for game totals and the
-- streak reads nothing from here. The `live` table from before is untouched.
-- Every statement is IF NOT EXISTS, so running this twice is harmless.

-- One row per game, mirroring the KV totals in the same order. Games logged
-- before this existed get a row the first time their night is synced, with no
-- lane and no timestamp: those were never recorded and are not invented.
CREATE TABLE IF NOT EXISTS games (
  id        TEXT PRIMARY KEY,
  date      TEXT NOT NULL,                  -- YYYY-MM-DD, the KV key; one date is one session
  position  INTEGER NOT NULL CHECK (position >= 1),   -- game of the night, 1 based
  score     INTEGER NOT NULL CHECK (score BETWEEN 0 AND 300),
  lane      INTEGER CHECK (lane BETWEEN 1 AND 99),
  logged_at INTEGER,                        -- ms since epoch; NULL for games from before this
  UNIQUE (date, position)
);

-- Ten rows for a game entered frame by frame, none for a game entered as a
-- total. A game is frame backed only when all ten are present.
-- Strike, spare and open are generated from the pins, never stored twice.
CREATE TABLE IF NOT EXISTS frames (
  game_id      TEXT NOT NULL REFERENCES games(id) ON DELETE CASCADE,
  frame_number INTEGER NOT NULL CHECK (frame_number BETWEEN 1 AND 10),
  ball1_pins   INTEGER NOT NULL CHECK (ball1_pins BETWEEN 0 AND 10),
  ball2_pins   INTEGER CHECK (ball2_pins BETWEEN 0 AND 10),
  ball3_pins   INTEGER CHECK (ball3_pins IS NULL OR (ball3_pins BETWEEN 0 AND 10 AND frame_number = 10)),
  leave        TEXT,                        -- pins standing after ball 1, e.g. '7' or '3-10'
  is_strike    INTEGER GENERATED ALWAYS AS (ball1_pins = 10) VIRTUAL,
  is_spare     INTEGER GENERATED ALWAYS AS (ball1_pins < 10 AND ball1_pins + ifnull(ball2_pins, 0) = 10) VIRTUAL,
  is_open      INTEGER GENERATED ALWAYS AS (ball1_pins < 10 AND ball1_pins + ifnull(ball2_pins, 0) < 10) VIRTUAL,
  PRIMARY KEY (game_id, frame_number)
);

-- One row per night, only for nights something was noted about.
CREATE TABLE IF NOT EXISTS sessions (
  date TEXT PRIMARY KEY,
  pain INTEGER CHECK (pain BETWEEN 0 AND 3)   -- leg, 0 none to 3 bad; entered at the end of the night
);

CREATE INDEX IF NOT EXISTS games_by_date ON games (date, position);
