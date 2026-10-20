/**
 * REDLINE — camera capture and paint analysis.
 *
 * Nothing here talks to a network. Frames are read off the <video> element,
 * downscaled locally, and handed back as a Blob the caller can store.
 */

const MAX_EDGE = 1280;
const JPEG_QUALITY = 0.82;

export class Camera {
  constructor(video) {
    this.video = video;
    this.stream = null;
    this.facing = 'environment';
    this.track = null;
    this.torchOn = false;
  }

  get supported() {
    return !!(navigator.mediaDevices && navigator.mediaDevices.getUserMedia);
  }

  async start(facing = this.facing) {
    this.stop();
    this.facing = facing;
    this.stream = await navigator.mediaDevices.getUserMedia({
      video: {
        facingMode: { ideal: facing },
        width: { ideal: 1920 },
        height: { ideal: 1080 },
      },
      audio: false,
    });
    this.track = this.stream.getVideoTracks()[0];
    this.video.srcObject = this.stream;
    await this.video.play().catch(() => {});
    return this.stream;
  }

  stop() {
    if (this.stream) this.stream.getTracks().forEach((t) => t.stop());
    this.stream = null;
    this.track = null;
    this.torchOn = false;
  }

  async flip() {
    return this.start(this.facing === 'environment' ? 'user' : 'environment');
  }

  get hasTorch() {
    const caps = this.track && this.track.getCapabilities ? this.track.getCapabilities() : null;
    return !!(caps && 'torch' in caps);
  }

  async toggleTorch() {
    if (!this.hasTorch) return false;
    this.torchOn = !this.torchOn;
    try {
      await this.track.applyConstraints({ advanced: [{ torch: this.torchOn }] });
    } catch {
      this.torchOn = false;
    }
    return this.torchOn;
  }

  /** Grab the current frame as { blob, width, height, palette }. */
  async capture() {
    const v = this.video;
    const vw = v.videoWidth;
    const vh = v.videoHeight;
    if (!vw || !vh) throw new Error('Camera is still warming up.');
    return frameToShot(v, vw, vh);
  }
}

/** Shared path for both live frames and files picked from the gallery. */
export async function frameToShot(source, sw, sh) {
  const scale = Math.min(1, MAX_EDGE / Math.max(sw, sh));
  const w = Math.round(sw * scale);
  const h = Math.round(sh * scale);

  const canvas = document.createElement('canvas');
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext('2d', { willReadFrequently: true });
  ctx.drawImage(source, 0, 0, w, h);

  const palette = paletteFrom(ctx, w, h);
  const blob = await new Promise((res) => canvas.toBlob(res, 'image/jpeg', JPEG_QUALITY));
  return { blob, width: w, height: h, palette };
}

/** Decode a File (gallery pick) into the same shot shape. */
export async function shotFromFile(file) {
  const bitmap = await createImageBitmap(file);
  const shot = await frameToShot(bitmap, bitmap.width, bitmap.height);
  bitmap.close?.();
  return shot;
}

/* ---------------- paint analysis ---------------- */

/**
 * Dominant colours from the middle of the frame — that's where the subject is
 * when someone points a phone at a car. Returns up to 3 swatches, best first.
 */
function paletteFrom(ctx, w, h) {
  const x0 = Math.floor(w * 0.18);
  const y0 = Math.floor(h * 0.2);
  const cw = Math.max(1, Math.floor(w * 0.64));
  const ch = Math.max(1, Math.floor(h * 0.6));
  let data;
  try {
    data = ctx.getImageData(x0, y0, cw, ch).data;
  } catch {
    return [];
  }

  const buckets = new Map();
  const step = Math.max(1, Math.floor((cw * ch) / 12000)) * 4;
  for (let i = 0; i < data.length; i += step) {
    const r = data[i];
    const g = data[i + 1];
    const b = data[i + 2];
    const key = ((r >> 4) << 8) | ((g >> 4) << 4) | (b >> 4);
    let e = buckets.get(key);
    if (!e) buckets.set(key, (e = { n: 0, r: 0, g: 0, b: 0 }));
    e.n++; e.r += r; e.g += g; e.b += b;
  }

  return [...buckets.values()]
    .sort((a, b) => b.n - a.n)
    .slice(0, 3)
    .map((e) => {
      const r = Math.round(e.r / e.n);
      const g = Math.round(e.g / e.n);
      const b = Math.round(e.b / e.n);
      return { hex: rgbToHex(r, g, b), name: colorName(r, g, b) };
    });
}

const rgbToHex = (r, g, b) =>
  '#' + [r, g, b].map((v) => Math.max(0, Math.min(255, v)).toString(16).padStart(2, '0')).join('');

export function colorName(r, g, b) {
  const [h, s, l] = rgbToHsl(r, g, b);
  if (s < 0.12) {
    if (l < 0.16) return 'Black';
    if (l < 0.42) return 'Gunmetal';
    if (l < 0.72) return 'Silver';
    return 'White';
  }
  const hues = [
    [15, 'Red'], [42, 'Orange'], [66, 'Yellow'], [160, 'Green'],
    [200, 'Teal'], [252, 'Blue'], [292, 'Purple'], [346, 'Pink'], [361, 'Red'],
  ];
  const base = hues.find(([max]) => h < max)[1];
  if (l < 0.28) return `Deep ${base}`;
  if (l > 0.74) return `Light ${base}`;
  return base;
}

function rgbToHsl(r, g, b) {
  r /= 255; g /= 255; b /= 255;
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const l = (max + min) / 2;
  if (max === min) return [0, 0, l];
  const d = max - min;
  const s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
  let h;
  if (max === r) h = ((g - b) / d + (g < b ? 6 : 0));
  else if (max === g) h = (b - r) / d + 2;
  else h = (r - g) / d + 4;
  return [h * 60, s, l];
}

/* ---------------- location ---------------- */

/** Coarse fix, rounded to ~11 m so a backup file never carries a doorstep. */
export function getCoords({ timeout = 8000 } = {}) {
  return new Promise((resolve) => {
    if (!navigator.geolocation) return resolve(null);
    navigator.geolocation.getCurrentPosition(
      (pos) =>
        resolve({
          lat: +pos.coords.latitude.toFixed(4),
          lng: +pos.coords.longitude.toFixed(4),
          acc: Math.round(pos.coords.accuracy),
        }),
      () => resolve(null),
      { enableHighAccuracy: false, timeout, maximumAge: 120000 }
    );
  });
}
