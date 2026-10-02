import test from 'node:test';
import assert from 'node:assert/strict';
import { between } from '../../../v5/assets/js/hero.js';

const near = (a, b, e = 1e-9) => assert.ok(Math.abs(a - b) < e, `${a} vs ${b}`);
// two layouts of the same letters: the hero's (big, heavy, centred) and the title's (small, lighter, up and left)
const hero = { size: 120, weight: 780, glyphs: [{ ch: 'L', x: 200, y: 450, w: 60 }, { ch: 'e', x: 262, y: 450, w: 62 }, { ch: 'C', x: 200, y: 570, w: 70 }] };
const title = { size: 46, weight: 700, glyphs: [{ ch: 'L', x: 40, y: 80, w: 23 }, { ch: 'e', x: 64, y: 80, w: 24 }, { ch: 'C', x: 40, y: 126, w: 27 }] };

test('the glide starts exactly on the hero and ends exactly on the title', () => {
  for (const [v, L] of [[0, hero], [1, title]]) {
    const g = between(hero, title, v);
    near(g.size, L.size); near(g.weight, L.weight);
    g.glyphs.forEach((q, i) => { near(q.x, L.glyphs[i].x, 1e-9); near(q.y, L.glyphs[i].y, 1e-9); assert.equal(q.ch, L.glyphs[i].ch); });
  }
});
test('the size changes in log space and the weight in a line', () => {
  const g = between(hero, title, .5);
  near(g.size, Math.sqrt(120 * 46), 1e-9);
  near(g.weight, 740);
});
test('the letters keep their order and their spacing scales with the size', () => {
  const g = between(hero, title, .3);
  assert.ok(g.glyphs[0].x < g.glyphs[1].x);
  const gap = (g.glyphs[1].x - g.glyphs[0].x) / g.size;
  assert.ok(gap > 62 / 120 * .9 && gap < 24 / 46 * 1.1 + .05, `gap ${gap}`);
});
