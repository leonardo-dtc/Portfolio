import test from 'node:test';
import assert from 'node:assert/strict';
import { rectToQuad, invert3, applyH, mul3 } from '../../../v5/assets/js/geometry.js';

const near = (a, b, e = 1e-6) => assert.ok(Math.abs(a - b) < e, `${a} vs ${b}`);

test('maps a rect onto an axis-aligned quad', () => {
  const m = rectToQuad(200, 100, [[10, 20], [210, 20], [210, 120], [10, 120]]);
  const [x, y] = applyH(m, 200, 100);
  near(x, 210); near(y, 120);
  const [x0, y0] = applyH(m, 0, 0);
  near(x0, 10); near(y0, 20);
});
test('maps a rect onto a perspective quad and back', () => {
  const q = [[100, 50], [300, 80], [300, 260], [100, 300]];
  const m = rectToQuad(400, 300, q), inv = invert3(m);
  [[0, 0], [400, 0], [400, 300], [0, 300]].forEach(([u, v], i) => {
    const [x, y] = applyH(m, u, v);
    near(x, q[i][0], 1e-6); near(y, q[i][1], 1e-6);
  });
  const [u, v] = applyH(inv, ...applyH(m, 123, 77));
  near(u, 123, 1e-6); near(v, 77, 1e-6);
});
test('the inverse of a scale-and-shift maps screen back to panel pixels', () => {
  const inv = invert3(rectToQuad(100, 50, [[20, 30], [220, 30], [220, 130], [20, 130]]));
  const [u, v] = applyH(inv, 120, 80);
  near(u, 50); near(v, 25);
});
test('a scrolled panel: corners read s pixels up its plane, shifted back down, give the panel in place', () => {
  // the true map of a 300x600 panel in perspective, and where its probes land once its contents scroll by s
  const truth = rectToQuad(300, 600, [[1000, 60], [1300, 40], [1300, 820], [1000, 790]]), s = 177;
  const read = [[0, -s], [300, -s], [300, 600 - s], [0, 600 - s]].map(([u, v]) => applyH(truth, u, v));
  const fixed = mul3(rectToQuad(300, 600, read), [1, 0, 0, 0, 1, s, 0, 0, 1]);   // as panels.js does
  [[0, 0], [300, 0], [300, 600], [0, 600], [150, 321]].forEach(([u, v]) => {
    const [x, y] = applyH(fixed, u, v), [X, Y] = applyH(truth, u, v);
    near(x, X, 1e-6); near(y, Y, 1e-6);
  });
});
