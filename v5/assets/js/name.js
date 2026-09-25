// The written name: traced pen strokes (name-data.js) laid out on one line or two, as SVG path data.
import { WORDS } from './name-data.js';

export const ADVANCE = 845.6;   // "leonardo" set in Sacramento, in name units (x-height 100)
export const SPACE = 71.8;      // Sacramento's word space
export const LINE_GAP = 300;    // baseline to baseline on two lines
export const STROKE = 24;       // the pen, in name units

// Centripetal Catmull-Rom (alpha .5) through a run of points, as cubic Bezier segments.
export function runToBeziers(P) {
  if (P.length < 2) return [];
  const n = P.length;
  const ext = [[2 * P[0][0] - P[1][0], 2 * P[0][1] - P[1][1]], ...P, [2 * P[n - 1][0] - P[n - 2][0], 2 * P[n - 1][1] - P[n - 2][1]]];
  const d = (a, b) => Math.max(1e-6, Math.pow(Math.hypot(b[0] - a[0], b[1] - a[1]), .5));
  const segs = [];
  for (let i = 1; i < ext.length - 2; i++) {
    const p0 = ext[i - 1], p1 = ext[i], p2 = ext[i + 1], p3 = ext[i + 2];
    const d1 = d(p0, p1), d2 = d(p1, p2), d3 = d(p2, p3);
    const c1 = [0, 1].map(j => (d1 * d1 * p2[j] - d2 * d2 * p0[j] + (2 * d1 * d1 + 3 * d1 * d2 + d2 * d2) * p1[j]) / (3 * d1 * (d1 + d2)));
    const c2 = [0, 1].map(j => (d3 * d3 * p1[j] - d2 * d2 * p3[j] + (2 * d3 * d3 + 3 * d3 * d2 + d2 * d2) * p2[j]) / (3 * d3 * (d3 + d2)));
    segs.push([p1, c1, c2, p2]);
  }
  return segs;
}

// One SVG path per word; y is flipped so the baseline sits at y = 0 and up is negative.
export function toPaths(strokes, dp = 1) {
  const f = v => +v.toFixed(dp);
  return strokes.map(runs => {
    let s = '';
    for (const run of runs) {
      const segs = runToBeziers(run);
      if (!segs.length) continue;
      if (!s) s += `M${f(segs[0][0][0])} ${f(-segs[0][0][1])}`;
      for (const [, c1, c2, p] of segs) s += `C${f(c1[0])} ${f(-c1[1])} ${f(c2[0])} ${f(-c2[1])} ${f(p[0])} ${f(-p[1])}`;
    }
    return s;
  });
}

const cache = new Map();
export function nameLayout(lines = 1) {
  if (cache.has(lines)) return cache.get(lines);
  const a = WORDS.leonardo, b0 = WORDS.carvalho;
  const xs = rs => rs.flat().map(p => p[0]);
  let b;
  if (lines === 2) {
    const ax = xs(a), bx = xs(b0);
    const shift = (Math.min(...ax) + Math.max(...ax) - Math.min(...bx) - Math.max(...bx)) / 2 + 40;
    b = b0.map(r => r.map(([x, y]) => [x + shift, y - LINE_GAP]));
  } else {
    b = b0.map(r => r.map(([x, y]) => [x + ADVANCE + SPACE, y]));
  }
  const strokes = [a, b], pts = strokes.flat(2);
  const box = {
    x0: Math.min(...pts.map(p => p[0])), x1: Math.max(...pts.map(p => p[0])),
    y0: Math.min(...pts.map(p => -p[1])), y1: Math.max(...pts.map(p => -p[1])),
  };
  const out = { strokes, box, paths: toPaths(strokes, 2) };
  cache.set(lines, out);
  return out;
}
