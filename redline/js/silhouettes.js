/**
 * Minimal side-profile silhouettes, one per body style.
 *
 * Each definition supplies only the *upper* outline (left rocker → over the
 * roof → right rocker). The lower edge, including the wheel arches, is
 * generated from the wheel positions so every body reads consistently.
 */

const VIEWBOX = '0 0 200 80';

const DEFS = {
  coupe: {
    base: 54, x0: 12, x1: 190, r: 13, wheels: [52, 150],
    top: 'M12,54 L12,44 Q12,38 24,36 L58,32 Q72,19 98,16 L124,16 Q150,19 164,32 L180,36 Q190,39 190,46 L190,54',
  },
  sedan: {
    base: 54, x0: 12, x1: 191, r: 13, wheels: [50, 152],
    top: 'M12,54 L12,42 Q12,35 24,33 L52,30 Q64,15 90,13 L124,13 Q140,15 150,28 L184,32 Q191,35 191,43 L191,54',
  },
  hatch: {
    base: 54, x0: 16, x1: 186, r: 13, wheels: [52, 148],
    top: 'M16,54 L16,42 Q16,35 26,33 L52,30 Q62,14 88,12 L136,12 Q152,14 160,26 L176,31 Q186,34 186,43 L186,54',
  },
  wagon: {
    base: 54, x0: 12, x1: 189, r: 13, wheels: [50, 152],
    top: 'M12,54 L12,42 Q12,35 24,33 L50,30 Q62,15 88,13 L166,13 Q180,14 184,22 L188,30 Q189,34 189,42 L189,54',
  },
  suv: {
    base: 51, x0: 14, x1: 190, r: 15, wheels: [52, 152],
    top: 'M14,51 L14,34 Q14,26 26,24 L52,22 Q62,10 88,9 L160,9 Q176,11 181,22 L186,26 Q190,29 190,38 L190,51',
  },
  truck: {
    base: 51, x0: 14, x1: 190, r: 15, wheels: [52, 156],
    top: 'M14,51 L14,34 Q14,27 26,25 L50,23 Q58,11 82,10 L118,10 L122,25 L124,30 L188,30 Q190,30 190,34 L190,51',
  },
  van: {
    base: 52, x0: 14, x1: 187, r: 13, wheels: [50, 154],
    top: 'M14,52 L14,30 Q14,20 26,16 L44,10 Q52,6 72,6 L170,6 Q183,7 185,20 L187,30 L187,52',
  },
  roadster: {
    base: 54, x0: 12, x1: 190, r: 13, wheels: [52, 150],
    top: 'M12,54 L12,46 Q12,40 24,38 L66,33 Q76,32 86,31 L94,20 L102,20 L106,31 L150,31 Q176,32 184,38 Q190,41 190,47 L190,54',
  },
  super: {
    base: 55, x0: 8, x1: 192, r: 13, wheels: [50, 152],
    top: 'M8,55 L8,49 L24,41 L64,35 Q80,22 106,21 L134,24 L172,33 Q188,37 192,47 L192,55',
  },
  offroad: {
    base: 46, x0: 16, x1: 184, r: 18, wheels: [54, 148],
    top: 'M16,46 L16,26 L26,24 L30,11 Q32,6 41,6 L152,6 Q161,6 163,12 L166,24 L180,26 Q184,27 184,32 L184,46',
  },
  micro: {
    base: 54, x0: 40, x1: 162, r: 12, wheels: [62, 140],
    top: 'M40,54 L40,40 Q40,30 50,27 L58,24 Q62,12 82,11 L116,11 Q136,12 142,25 L154,28 Q162,31 162,40 L162,54',
  },
};

const cache = new Map();

/** Full outline path (upper profile + generated lower edge with wheel arches). */
function bodyPath(def) {
  let d = def.top;
  const wheels = [...def.wheels].sort((a, b) => b - a);
  for (const cx of wheels) {
    d += ` L${cx + def.r + 4},${def.base}`;
    d += ` Q${cx},${(def.base - def.r * 2.1).toFixed(1)} ${cx - def.r - 4},${def.base}`;
  }
  d += ` L${def.x0},${def.base} Z`;
  return d;
}

/**
 * Inline SVG markup for a body style.
 * @param {string} body  key from DEFS
 * @param {object} [opt] { className, wheelOpacity }
 */
export function silhouette(body, opt = {}) {
  const key = `${body}|${opt.className || ''}`;
  if (cache.has(key)) return cache.get(key);
  const def = DEFS[body] || DEFS.coupe;
  const wheelY = def.base + 1;
  const wheels = def.wheels
    .map(
      (cx) =>
        `<circle cx="${cx}" cy="${wheelY}" r="${def.r}" class="sil-tyre"/>` +
        `<circle cx="${cx}" cy="${wheelY}" r="${(def.r * 0.5).toFixed(1)}" class="sil-rim"/>` +
        `<circle cx="${cx}" cy="${wheelY}" r="${(def.r * 0.16).toFixed(1)}" class="sil-hub"/>`
    )
    .join('');
  const svg =
    `<svg class="sil ${opt.className || ''}" viewBox="${VIEWBOX}" role="img" aria-hidden="true" preserveAspectRatio="xMidYMid meet">` +
    `<g class="sil-g">${wheels}<path class="sil-body" d="${bodyPath(def)}"/></g>` +
    `</svg>`;
  cache.set(key, svg);
  return svg;
}

export const BODY_STYLES = Object.keys(DEFS);
