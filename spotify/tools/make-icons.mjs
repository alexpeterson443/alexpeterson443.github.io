/* Renders the home-screen icons from SVG with headless Chromium, so the PNGs
   in this folder can always be rebuilt from source instead of being mystery
   binaries. Run from the repo root:

     node spotify/tools/make-icons.mjs

   Needs playwright available (it is preinstalled in this repo's dev image);
   nothing at runtime depends on it. */
import { createRequire } from "module";
import { writeFileSync, readFileSync } from "fs";
import { dirname, join } from "path";
import { fileURLToPath } from "url";

const require = createRequire(import.meta.url);
let chromium;
try {
  ({ chromium } = require("playwright"));
} catch (err) {
  console.error("This script needs playwright: npm i -D playwright");
  process.exit(1);
}

const HERE = dirname(fileURLToPath(import.meta.url));
const OUT = join(HERE, "..");

const BG = "#121211";
const BARS = [
  { x: 14, h: 18, fill: "#3fc48f" },
  { x: 28, h: 32, fill: "#3fc48f" },
  { x: 42, h: 12, fill: "#3fc48f" },
  { x: 56, h: 24, fill: "#3987e5" }
];

/* `rounded` draws the app tile itself; a maskable icon instead bleeds to the
   edges and keeps the bars inside the circle Android crops to. */
function svg({ rounded, inset }) {
  const scale = 1 - inset * 2;
  const bars = BARS.map(bar => {
    const x = 32 + (bar.x - 32) * scale;
    const bottom = 32 + (48 - 32) * scale;
    const h = bar.h * scale;
    return `<path d="M${x.toFixed(2)} ${bottom.toFixed(2)}V${(bottom - h).toFixed(2)}" stroke="${bar.fill}"/>`;
  }).join("");
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64">
  <rect width="64" height="64" rx="${rounded ? 14 : 0}" fill="${BG}"/>
  <g fill="none" stroke-width="${(6 * scale).toFixed(2)}" stroke-linecap="round">${bars}</g>
</svg>`;
}

const JOBS = [
  { file: "icon-192.png", size: 192, rounded: true, inset: 0 },
  { file: "icon-512.png", size: 512, rounded: true, inset: 0 },
  { file: "icon-maskable-512.png", size: 512, rounded: false, inset: 0.14 },
  /* iOS rounds the corners itself and refuses transparency. */
  { file: "apple-touch-icon.png", size: 180, rounded: false, inset: 0.08 }
];

/* PLAYWRIGHT_BROWSERS_PATH usually finds the binary; PW_CHROMIUM overrides. */
const browser = await chromium.launch(
  process.env.PW_CHROMIUM ? { executablePath: process.env.PW_CHROMIUM } : {}
);
for (const job of JOBS) {
  const page = await browser.newPage({ viewport: { width: job.size, height: job.size } });
  await page.setContent(
    `<body style="margin:0;background:${BG}">` +
    `<div style="width:${job.size}px;height:${job.size}px">${svg(job)}</div></body>`
  );
  await page.locator("svg").evaluate((node, size) => {
    node.setAttribute("width", size);
    node.setAttribute("height", size);
  }, job.size);
  writeFileSync(join(OUT, job.file), await page.screenshot({ omitBackground: false }));
  await page.close();
  console.log("wrote", job.file, job.size + "px");
}
await browser.close();

/* The shipped icon.svg is the same artwork, so keep them in step. */
const source = readFileSync(join(OUT, "icon.svg"), "utf8");
if (!source.includes("#3fc48f")) console.warn("icon.svg no longer matches the generator's colours");
