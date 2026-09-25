// Every element marked data-glass tells the room where its glass is. Flat elements give their box; elements
// turned in 3D carry four zero-size corner probes, which the browser projects with the element's own transform.
import { rectToQuad, invert3 } from './geometry.js';

const KIND = { window: 0, ornament: 1, control: 2, prominent: 3 };  // prominent: the tinted glass of a primary button
const MAX = 16;
const inv = new Float32Array(MAX * 9), box = new Float32Array(MAX * 4), state = new Float32Array(MAX * 4);
const radiusCache = new WeakMap();

// Layers, back to front: the room draws the last panel that covers a pixel, so windows go first, then the
// ornaments that sit over their edges, then controls. (Page order put a sheet's rim over its own toolbar.)
const LAYER = { window: 0, ornament: 1, control: 2, prominent: 3 };
const byLayer = (a, b) => (LAYER[a.dataset.glass] ?? 0) - (LAYER[b.dataset.glass] ?? 0);

export function readPanels(root = document, dpr = 1) {
  let n = 0;
  for (const el of [...root.querySelectorAll('[data-glass]')].sort(byLayer)) {
    if (n === MAX) break;
    const g = el.glass || { m: 1, dim: 0 };
    if (!(g.m > .001)) continue;
    const w = el.offsetWidth, h = el.offsetHeight;
    if (!w || !h) continue;
    if (el.closest('[hidden]') || el.hasAttribute('data-glass-off')) continue;
    if (el.classList.contains('side--inline')) continue;           // inside the window it is content, not a second glass
    let quad, sx, sy;
    const probes = el.querySelectorAll(':scope > .probe');
    if (probes.length === 4 && !el.classList.contains('side--inline')) {
      quad = [...probes].map(p => { const r = p.getBoundingClientRect(); return [r.left * dpr, r.top * dpr]; });
      sx = w * dpr; sy = h * dpr;
    } else {
      const r = el.getBoundingClientRect();
      if (r.width < 1 || r.height < 1) continue;
      quad = [[r.left * dpr, r.top * dpr], [r.right * dpr, r.top * dpr], [r.right * dpr, r.bottom * dpr], [r.left * dpr, r.bottom * dpr]];
      sx = r.width * dpr; sy = r.height * dpr;
    }
    let rad = radiusCache.get(el);
    if (rad === undefined) { rad = parseFloat(getComputedStyle(el).borderTopLeftRadius) || 0; radiusCache.set(el, rad); }
    const scale = sx / (w * dpr);
    const r = Math.min(rad, Math.min(w, h) / 2) * dpr * scale;
    inv.set(invert3(rectToQuad(sx, sy, quad)), n * 9);
    box.set([sx, sy, r, KIND[el.dataset.glass] ?? 0], n * 4);
    state.set([Math.min(1, g.m), g.dim || 0, g.press || 0, 0], n * 4);
    n++;
  }
  return { count: n, inv, box, state };
}

// radii can change with the layout (phones use larger corners)
export function forgetRadii() { /* WeakMap entries are replaced lazily */ radiusCacheReset(); }
function radiusCacheReset() { for (const el of document.querySelectorAll('[data-glass]')) radiusCache.delete(el); }
