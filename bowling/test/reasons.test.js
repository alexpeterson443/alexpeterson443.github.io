import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { EXCUSE_REASONS } from "../functions/_lib/streak.js";

// Every reason the server takes has to be offered in each picker on the page,
// or a new one ships half done (Not enough time first went out without a chip
// in the trip picker).
const html = readFileSync(new URL("../public/index.html", import.meta.url), "utf8");
const app = readFileSync(new URL("../public/app.js", import.meta.url), "utf8");
const css = readFileSync(new URL("../public/style.css", import.meta.url), "utf8");

for (const cls of ["excuse", "trip-reason", "fix-reason", "excuse-yesterday"]) {
  test(`the ${cls} picker offers every reason`, () => {
    for (const reason of EXCUSE_REASONS) {
      const pill = new RegExp(`class="pill ${cls}[^"]*" data-reason="${reason}"`);
      assert.match(html, pill, `${cls} is missing ${reason}`);
    }
  });
}

test("every reason has its own copy and colour", () => {
  for (const reason of EXCUSE_REASONS) {
    assert.match(app, new RegExp(`\\n  ${reason}: \\{ status:`), `no copy for ${reason}`);
    // "closed" is the base pause style, so it has no class of its own.
    if (reason === "closed") continue;
    assert.match(css, new RegExp(`\\.cell\\.excused\\.${reason} `), `no grid colour for ${reason}`);
    assert.match(css, new RegExp(`\\.status\\.paused\\.${reason} `), `no status colour for ${reason}`);
  }
});
