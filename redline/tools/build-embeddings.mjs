/**
 * Bakes MobileCLIP text embeddings for every car in the catalog into a small
 * int8 binary the app ships. Doing this here means the browser never has to
 * download the 61 MB text tower — only the 21 MB vision tower at runtime.
 *
 * Run from this directory:  npm i @huggingface/transformers && node build-embeddings.mjs
 */

import { AutoTokenizer, AutoModel, env } from '@huggingface/transformers';
import { writeFileSync, mkdirSync } from 'node:fs';
import { CARS } from '../js/catalog.js';

env.allowLocalModels = false;

const MODEL_ID = 'Xenova/mobileclip_s0';
const OUT_DIR = new URL('../ai/', import.meta.url).pathname;
const CTX = 77;

/** Chassis codes read better to CLIP without the brackets. */
const clean = (s) => s.replace(/\(([^)]+)\)/g, '$1').replace(/\s+/g, ' ').trim();

const TEMPLATES = [
  (c) => `a photo of a ${clean(c.name)}`,
  (c) => `a photo of a ${c.yearStart} ${clean(c.name)} car`,
  (c) => `${clean(c.name)}, a ${c.countryName} ${c.bodyLabel.toLowerCase()}`,
  (c) => `a ${c.bodyLabel.toLowerCase()} parked on the street, ${clean(c.make)} ${clean(c.model)}`,
];

const tokenizer = await AutoTokenizer.from_pretrained(MODEL_ID);
const model = await AutoModel.from_pretrained(MODEL_ID, {
  dtype: 'fp32',
  subfolder: 'onnx',
  model_file_name: 'text_model',
});

function l2(vec) {
  let n = 0;
  for (const v of vec) n += v * v;
  n = Math.sqrt(n) || 1;
  return vec.map((v) => v / n);
}

const DIM = 512;
const vectors = [];

for (let i = 0; i < CARS.length; i++) {
  const car = CARS[i];
  const prompts = TEMPLATES.map((t) => t(car));
  const inputs = tokenizer(prompts, { padding: 'max_length', max_length: CTX, truncation: true });
  const { text_embeds } = await model(inputs);
  const data = text_embeds.data;

  // average the normalised template embeddings, then re-normalise
  const acc = new Float64Array(DIM);
  for (let p = 0; p < prompts.length; p++) {
    const row = l2(Array.from(data.slice(p * DIM, (p + 1) * DIM)));
    for (let d = 0; d < DIM; d++) acc[d] += row[d];
  }
  vectors.push(l2(Array.from(acc)));

  if ((i + 1) % 40 === 0 || i === CARS.length - 1) {
    console.log(`  embedded ${i + 1}/${CARS.length}`);
  }
}

// int8 quantisation against a single global scale; rows are re-normalised on load
let maxAbs = 0;
for (const v of vectors) for (const x of v) maxAbs = Math.max(maxAbs, Math.abs(x));
const scale = maxAbs / 127;

const buf = new Int8Array(vectors.length * DIM);
for (let i = 0; i < vectors.length; i++) {
  for (let d = 0; d < DIM; d++) {
    buf[i * DIM + d] = Math.max(-127, Math.min(127, Math.round(vectors[i][d] / scale)));
  }
}

mkdirSync(OUT_DIR, { recursive: true });
writeFileSync(`${OUT_DIR}/car-embeddings.bin`, Buffer.from(buf.buffer));
writeFileSync(
  `${OUT_DIR}/car-embeddings.json`,
  JSON.stringify({ model: MODEL_ID, dim: DIM, count: vectors.length, scale, ids: CARS.map((c) => c.id) })
);

// sanity: nearest neighbours of a few rows should be plausibly related cars
const byId = new Map(CARS.map((c, i) => [c.id, i]));
for (const probe of ['f40', 'camry', 'r34', 'defender90']) {
  const a = vectors[byId.get(probe)];
  const sims = vectors
    .map((v, i) => [CARS[i].name, v.reduce((s, x, d) => s + x * a[d], 0)])
    .sort((x, y) => y[1] - x[1])
    .slice(1, 4)
    .map(([n, s]) => `${n} ${s.toFixed(2)}`);
  console.log(`  ${probe} → ${sims.join(' | ')}`);
}

console.log(`\nwrote ${vectors.length}×${DIM} int8 (${(buf.length / 1024).toFixed(0)} KB), scale=${scale.toExponential(3)}`);
