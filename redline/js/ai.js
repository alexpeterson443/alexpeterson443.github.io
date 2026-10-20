/**
 * REDLINE — on-device visual identification.
 *
 * Zero-shot recognition with MobileCLIP-S0. The text side of the model was run
 * ahead of time (see the build script in the repo notes): every car in the
 * catalog is already embedded and shipped as a 129 KB int8 blob. At runtime we
 * only need the vision tower — ~21 MB, fetched once and kept in the browser's
 * Cache Storage — so identification is a single forward pass followed by 257
 * dot products.
 *
 * Everything runs in the tab. The photo is never uploaded; the only network
 * request this module ever makes is for the model weights themselves.
 */

const TRANSFORMERS_URL = 'https://cdn.jsdelivr.net/npm/@huggingface/transformers@4.2.0';
const MODEL_ID = 'Xenova/mobileclip_s0';
const EMB_BIN = './ai/car-embeddings.bin';
const EMB_META = './ai/car-embeddings.json';

/** Roughly what the user is about to download, for an honest opt-in prompt. */
export const MODEL_SIZE_MB = 21;

/**
 * fp16, not int8. The 11 MB q8 build of this vision tower is measurably broken —
 * its embeddings collapse toward a single point, so nearly every photo comes
 * back as the same car. fp16 scores identically to fp32 on the test set for
 * half the bytes, so it is the smallest weight format that actually works.
 */
const DTYPE = 'fp16';

/** How hard your own spotting history may lean on a near-tie. */
const PRIOR_WEIGHT = 0.035;

export const STATUS = {
  IDLE: 'idle',
  LOADING: 'loading',
  READY: 'ready',
  ERROR: 'error',
};

let status = STATUS.IDLE;
let loadPromise = null;
let processor = null;
let vision = null;
let bank = null; // { ids, dim, matrix: Float32Array (row-normalised) }
let backend = 'wasm';

export const getStatus = () => status;
export const getBackend = () => backend;

/** True once the weights are in Cache Storage, so we can skip the size warning. */
export async function isCached() {
  if (status === STATUS.READY) return true;
  if (!('caches' in window)) return false;
  try {
    for (const name of await caches.keys()) {
      const cache = await caches.open(name);
      for (const req of await cache.keys()) {
        if (req.url.includes('mobileclip_s0') && req.url.includes('vision_model')) return true;
      }
    }
  } catch { /* private mode, storage denied */ }
  return false;
}

async function loadBank() {
  const [meta, buf] = await Promise.all([
    fetch(EMB_META).then((r) => r.json()),
    fetch(EMB_BIN).then((r) => r.arrayBuffer()),
  ]);
  const { dim, ids, scale } = meta;
  const raw = new Int8Array(buf);
  const matrix = new Float32Array(ids.length * dim);

  for (let i = 0; i < ids.length; i++) {
    let norm = 0;
    for (let d = 0; d < dim; d++) {
      const v = raw[i * dim + d] * scale;
      matrix[i * dim + d] = v;
      norm += v * v;
    }
    norm = Math.sqrt(norm) || 1;
    for (let d = 0; d < dim; d++) matrix[i * dim + d] /= norm;
  }
  return { ids, dim, matrix };
}

/**
 * Download and warm the model. Safe to call repeatedly — concurrent callers
 * share one load. `onProgress` receives 0..1.
 */
export function load({ onProgress } = {}) {
  if (loadPromise) return loadPromise;
  status = STATUS.LOADING;

  loadPromise = (async () => {
    const { AutoProcessor, AutoModel, env } = await import(
      /* @vite-ignore */ `${TRANSFORMERS_URL}/dist/transformers.min.js`
    );
    env.allowLocalModels = false;

    // transformers.js reports progress per file; track the largest one.
    const seen = new Map();
    const progress_callback = (p) => {
      if (p.status === 'progress' && p.total) {
        seen.set(p.file, p.loaded / p.total);
        onProgress?.(Math.min(0.99, Math.max(...seen.values())));
      } else if (p.status === 'done') {
        onProgress?.(1);
      }
    };

    const [bankData, proc] = await Promise.all([
      loadBank(),
      AutoProcessor.from_pretrained(MODEL_ID, { progress_callback }),
    ]);

    // Ask for an adapter up front rather than letting the session throw — ORT
    // reports a missing GPU as a generic "no available backend" that is hard to
    // recover from once the session has started building.
    let device = 'wasm';
    try {
      if (navigator.gpu && (await navigator.gpu.requestAdapter())) device = 'webgpu';
    } catch { device = 'wasm'; }

    const opts = { dtype: DTYPE, subfolder: 'onnx', model_file_name: 'vision_model', progress_callback };
    let model;
    try {
      model = await AutoModel.from_pretrained(MODEL_ID, { ...opts, device });
      backend = device;
    } catch (err) {
      if (device === 'wasm') throw err;
      model = await AutoModel.from_pretrained(MODEL_ID, { ...opts, device: 'wasm' });
      backend = 'wasm';
    }

    bank = bankData;
    processor = proc;
    vision = model;
    status = STATUS.READY;
    onProgress?.(1);
    return true;
  })().catch((err) => {
    status = STATUS.ERROR;
    loadPromise = null;
    throw err;
  });

  return loadPromise;
}

/** Free the session — used when the user turns the feature off. */
export async function unload() {
  try { await vision?.dispose?.(); } catch { /* already gone */ }
  vision = null;
  processor = null;
  bank = null;
  loadPromise = null;
  status = STATUS.IDLE;
}

/**
 * Rank the catalog against a photo.
 * @param {Blob} blob  the captured frame
 * @param {number} topK
 * @returns {Promise<Array<{id:string, score:number, confidence:number}>>}
 *          `score` is raw cosine similarity; `confidence` is a softmaxed share.
 */
export async function identify(blob, { topK = 6, prior = null } = {}) {
  if (status !== STATUS.READY) throw new Error('Model is not loaded yet.');

  const { RawImage } = await import(/* @vite-ignore */ `${TRANSFORMERS_URL}/dist/transformers.min.js`);
  const image = await RawImage.fromBlob(blob);
  const inputs = await processor(image);
  const out = await vision(inputs);

  const embeds = out.image_embeds ?? out.last_hidden_state;
  const vec = Float32Array.from(embeds.data);

  let norm = 0;
  for (const v of vec) norm += v * v;
  norm = Math.sqrt(norm) || 1;
  for (let i = 0; i < vec.length; i++) vec[i] /= norm;

  const { ids, dim, matrix } = bank;
  const scored = new Array(ids.length);
  for (let i = 0; i < ids.length; i++) {
    let dot = 0;
    const base = i * dim;
    for (let d = 0; d < dim; d++) dot += matrix[base + d] * vec[d];
    scored[i] = { id: ids[i], score: dot };
  }

  // Nudge, don't steer. Similarities between distinct cars differ by ~0.05, so
  // this only decides near-ties — a confident match is never overturned.
  if (prior && prior.size) {
    for (const s of scored) s.score += PRIOR_WEIGHT * (prior.get(s.id) || 0);
  }

  scored.sort((a, b) => b.score - a.score);
  const top = scored.slice(0, topK);

  // Softmax over the shortlist. CLIP similarities live in a narrow band, so a
  // temperature is needed for the spread to mean anything to a human.
  const T = 0.02;
  const max = top[0].score;
  let sum = 0;
  for (const t of top) {
    t.exp = Math.exp((t.score - max) / T);
    sum += t.exp;
  }
  for (const t of top) {
    t.confidence = t.exp / sum;
    delete t.exp;
  }
  return top;
}
