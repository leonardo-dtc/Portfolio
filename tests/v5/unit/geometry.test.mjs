import test from 'node:test';
import assert from 'node:assert/strict';
import { rectToQuad, invert3, applyH } from '../../../v5/assets/js/geometry.js';

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
