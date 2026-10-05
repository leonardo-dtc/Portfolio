// The colour styles. A style turns the room: every colour in it turns by the same angle of hue in OKLab, a space
// made so that equal turns look equal, and its colourfulness scales by the vibrance, while its lightness stays as it
// was (so white text keeps its contrast on the glass). An even turn matters: in the YIQ space this used before, one
// angle turned the night room teal and the day room green, and dark blue went olive on its way to gold. The room is
// turned through a small table of colours (lut), the glass's tints and the stage one by one (turn). Each style also
// gives the hero's name its neon: the Glowtime colours for Cobalt, and for every other style a set from its own family
// (neonFor), so the name matches the style it opens on.

// [id, label, hue turn in degrees, vibrance]
export const PRESETS = [
  ['cobalt', 'Cobalt', 0, 1], ['violet', 'Violet', 28, 1], ['rose', 'Rose', 92, 1], ['red', 'Red', 122, 1], ['ember', 'Ember', 136, 1],
  ['gold', 'Gold', 170, 1], ['emerald', 'Emerald', -120, 1], ['teal', 'Teal', -66, 1], ['graphite', 'Graphite', 0, .12],
];

// ---------- OKLab (Björn Ottosson's), from and to sRGB in 0..1 ----------
const toLin = v => (v <= .04045 ? v / 12.92 : ((v + .055) / 1.055) ** 2.4);
const toGam = v => (v <= .0031308 ? 12.92 * v : 1.055 * v ** (1 / 2.4) - .055);
export function lab([r, g, b]) {
  r = toLin(r); g = toLin(g); b = toLin(b);
  const l = Math.cbrt(.4122214708 * r + .5363325363 * g + .0514459929 * b);
  const m = Math.cbrt(.2119034982 * r + .6806995451 * g + .1073969566 * b);
  const s = Math.cbrt(.0883024619 * r + .2817188376 * g + .6299787005 * b);
  return [.2104542553 * l + .793617785 * m - .0040720468 * s, 1.9779984951 * l - 2.428592205 * m + .4505937099 * s, .0259040371 * l + .7827717662 * m - .808675766 * s];
}
// back to sRGB; a colour outside sRGB moves toward the grey of its lightness (in linear light) until it fits, so it
// keeps its lightness and, nearly, its hue
export function rgb([L, a, b]) {
  const l = (L + .3963377774 * a + .2158037573 * b) ** 3, m = (L - .1055613458 * a - .0638541728 * b) ** 3, s = (L - .0894841775 * a - 1.291485548 * b) ** 3;
  const c = [4.0767416621 * l - 3.3077115913 * m + .2309699292 * s, -1.2684380046 * l + 2.6097574011 * m - .3413193965 * s, -.0041960863 * l - .7034186147 * m + 1.707614701 * s];
  const y = Math.min(1, Math.max(0, L)) ** 3;
  let t = 1;
  for (const v of c) { if (v > 1) t = Math.min(t, (1 - y) / (v - y)); else if (v < 0) t = Math.min(t, y / (y - v)); }
  return c.map(v => toGam(Math.min(1, Math.max(0, y + t * (v - y)))));
}
// a colour turned by deg degrees of hue (positive: cobalt toward violet, rose, ember, gold) and its colourfulness
// scaled by k
export function turn(c, deg, k = 1) {
  if (!deg && k === 1) return c.slice();
  const [L, a, b] = lab(c), h = deg * Math.PI / 180, co = Math.cos(h) * k, si = Math.sin(h) * k;
  return rgb([L, a * co - b * si, a * si + b * co]);
}
// the table the room is turned through: n x n x n colours over the sRGB cube (red fastest), RGBA
export function lut(deg, k, n = 17) {
  const out = new Float32Array(n * n * n * 4);
  for (let bi = 0, o = 0; bi < n; bi++) for (let gi = 0; gi < n; gi++) for (let ri = 0; ri < n; ri++, o += 4) {
    const c = turn([ri / (n - 1), gi / (n - 1), bi / (n - 1)], deg, k);
    out[o] = c[0]; out[o + 1] = c[1]; out[o + 2] = c[2]; out[o + 3] = 1;
  }
  return out;
}

// ---------- the hero's neon ----------
// Fourteen colours of light, in the shader's order (shaders.js, uNeon): the tube's six along the name (0 its warm end,
// 5 its cool end, both wide stretches), the third echo's first colour (6) and the second echo's last (7) (the first
// echo runs 1 to 2, the second 0 to 7, the third 6 to 5), the halo's three (8 to 10), the faces' cool colour (11), the
// day pool's deep colour (12) and the faces' warm colour (13). arc: the family the light is held in, as the centre
// and half-width of an arc of YIQ hue angles (radians), so where colours add up they never leave it (Cobalt's runs
// from orange through pink, violet and blue to cyan, and so never to lime or green).
const NEON = {
  // the Glowtime colours: orange, hot pink, magenta, violet, electric blue, cyan; echoes pink to magenta, orange to
  // amber, azure to cyan
  cobalt: { arc: [1.676, 1.745], set: [[1, .4, .05], [1, .12, .46], [.88, .12, .92], [.52, .2, 1], [.13, .34, 1], [.08, .8, 1], [.11, .48, 1], [1, .56, .08], [.2, .3, 1], [.5, .16, 1], [.95, .14, .66], [.46, .32, 1], [.14, .08, .56], [1, .12, .46]] },
  // pink, magenta, orchid, purple, violet, periwinkle; echoes magenta to orchid, pink to rose, indigo to periwinkle
  violet: { arc: [1.72, 1.209], set: [[0.985, 0.02, 0.722], [0.919, 0.021, 0.925], [0.744, 0.16, 0.998], [0.593, 0.286, 0.998], [0.438, 0.338, 0.997], [0.494, 0.625, 0.998], [0.187, 0.46, 0.998], [0.998, 0.345, 0.6], [0.43, 0.251, 0.997], [0.608, 0.115, 0.997], [0.846, 0.017, 0.851], [0.549, 0.256, 0.997], [0.233, 0.003, 0.513], [0.892, 0.017, 0.718]] },
  // peach, coral, rose, hot pink, magenta, lilac; echoes coral to rose, peach to apricot, fuchsia to lilac
  rose: { arc: [0.653, 0.896], set: [[0.999, 0.519, 0.199], [0.998, 0.259, 0.224], [0.997, 0.019, 0.432], [0.98, 0.019, 0.65], [0.928, 0.021, 0.901], [0.822, 0.515, 0.998], [0.796, 0.019, 0.964], [0.999, 0.657, 0.28], [0.932, 0.017, 0.556], [0.855, 0.017, 0.829], [0.998, 0.142, 0.208], [0.892, 0.017, 0.718], [0.343, 0.002, 0.191], [0.925, 0.016, 0.313]] },
  // a true red (its glass at hue 26 in OKLCH, where pure red is 29; Rose sits near 1, pink, and Ember near 35, orange):
  // orange red, scarlet, red, crimson, ruby, raspberry; echoes scarlet to red, orange red to amber, deep crimson to
  // raspberry. It stops short of pink.
  red: { arc: [0.27, 0.52], set: [[1, 0.42, 0.06], [1, 0.2, 0.04], [0.98, 0.05, 0.05], [0.92, 0.03, 0.2], [0.84, 0.02, 0.28], [0.86, 0.06, 0.42], [0.9, 0.02, 0.16], [1, 0.55, 0.1], [0.95, 0.2, 0.03], [0.9, 0.02, 0.06], [0.85, 0.03, 0.3], [0.93, 0.03, 0.18], [0.33, 0.01, 0.02], [0.96, 0.12, 0.08]] },
  // gold, amber, orange, vermilion, red, hot pink; echoes amber to orange, gold to yellow, crimson to hot pink
  ember: { arc: [0.058, 0.751], set: [[0.999, 0.788, 0.149], [0.999, 0.618, 0.132], [0.992, 0.451, 0.016], [0.982, 0.26, 0.012], [0.977, 0.018, 0.168], [0.998, 0.248, 0.626], [0.925, 0.016, 0.313], [0.999, 0.903, 0.3], [0.92, 0.385, 0.013], [0.939, 0.017, 0.076], [0.915, 0.016, 0.394], [0.936, 0.016, 0.159], [0.339, 0.065, 0.001], [0.888, 0.014, 0.261]] },
  // lemon, gold, amber, orange, copper, champagne; echoes gold to amber, lemon to orange, deep gold to champagne
  gold: { arc: [-0.203, 0.523], set: [[1, 0.922, 0.31], [0.999, 0.767, 0.168], [0.993, 0.623, 0.021], [0.983, 0.486, 0.017], [0.974, 0.314, 0.012], [0.964, 0.921, 0.79], [0.999, 0.706, 0.081], [0.999, 0.524, 0.038], [0.908, 0.548, 0.017], [0.901, 0.406, 0.013], [0.951, 0.174, 0.01], [0.924, 0.536, 0.017], [0.286, 0.132, 0.001], [0.951, 0.174, 0.01]] },
  // lime, green, emerald, jade, teal, aqua; echoes green to emerald, lime to yellow, sea green to aqua
  emerald: { arc: [-1.759, 1.173], set: [[0.739, 0.964, 0.034], [0.295, 0.916, 0.026], [0.029, 0.857, 0.445], [0.031, 0.873, 0.637], [0.027, 0.802, 0.72], [0.038, 0.929, 0.966], [0.029, 0.824, 0.793], [0.99, 0.932, 0.037], [0.021, 0.744, 0.346], [0.021, 0.728, 0.555], [0.021, 0.716, 0.66], [0.023, 0.759, 0.552], [0.002, 0.219, 0.125], [0.232, 0.742, 0.016]] },
  // mint, aquamarine, turquoise, cyan, cerulean, azure; echoes aquamarine to turquoise, mint to green, blue to azure
  teal: { arc: [-2.857, 0.519], set: [[0.042, 0.989, 0.736], [0.036, 0.918, 0.809], [0.033, 0.876, 0.884], [0.03, 0.832, 0.952], [0.021, 0.704, 0.926], [0.236, 0.604, 0.998], [0.019, 0.662, 0.966], [0.037, 0.961, 0.502], [0.021, 0.704, 0.749], [0.018, 0.661, 0.812], [0.011, 0.513, 0.877], [0.018, 0.657, 0.835], [0.002, 0.2, 0.269], [0.027, 0.803, 0.707]] },
};
const ANCHORS = PRESETS.filter(p => p[0] !== 'graphite' && NEON[p[0]]).map(([id, , deg, k]) => ({ id, deg: ((deg % 360) + 360) % 360, k, lch: NEON[id].set.map(c => { const [L, a, b] = lab(c); return [L, Math.hypot(a, b), Math.atan2(b, a)]; }), arc: NEON[id].arc })).sort((x, y) => x.deg - y.deg);
const wrap = a => Math.atan2(Math.sin(a), Math.cos(a));
// the neon for any turn and vibrance: the sets of the two styles either side of it, blended in OKLCH (the hue the short
// way round), its colourfulness scaled by the vibrance against theirs (so Graphite's is a silver neon)
export function neonFor(deg, k) {
  const d = ((deg % 360) + 360) % 360;
  let i = ANCHORS.findIndex(p => p.deg > d); if (i < 0) i = 0;
  const B = ANCHORS[i], A = ANCHORS[(i - 1 + ANCHORS.length) % ANCHORS.length];
  const span = ((B.deg - A.deg) % 360 + 360) % 360 || 360, t = (((d - A.deg) % 360) + 360) % 360 / span;
  const kp = A.k + (B.k - A.k) * t, f = Math.min(1, Math.max(0, k) / kp);
  const list = new Float32Array(42), set = [];
  for (let s = 0; s < 14; s++) {
    const [L0, C0, h0] = A.lch[s], [L1, C1, h1] = B.lch[s];
    const L = L0 + (L1 - L0) * t, C = (C0 + (C1 - C0) * t) * f, h = h0 + wrap(h1 - h0) * t;
    const c = (A === B || t === 0) && f === 1 ? NEON[A.id].set[s] : rgb([L, C * Math.cos(h), C * Math.sin(h)]);
    set.push(c); list.set(c, s * 3);
  }
  const arc = [A.arc[0] + wrap(B.arc[0] - A.arc[0]) * t, A.arc[1] + (B.arc[1] - A.arc[1]) * t];
  return { list, set, arc };
}
