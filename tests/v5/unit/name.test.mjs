import test from 'node:test';
import assert from 'node:assert/strict';
import { nameLayout } from '../../../v5/assets/js/name.js';
import { WORDS } from '../../../v5/assets/js/name-data.js';

test('both words are present as runs of points', () => {
  assert.ok(WORDS.leonardo.length >= 6 && WORDS.carvalho.length >= 6);
  assert.ok(WORDS.leonardo.every(r => r.length >= 2 && r.every(p => p.length === 2)));
});
test('one line is wide and short', () => {
  const { box, paths } = nameLayout(1);
  assert.ok(box.x1 - box.x0 > 1700 && box.x1 - box.x0 < 1850, `width ${box.x1 - box.x0}`);
  assert.ok(box.y1 - box.y0 < 300, `height ${box.y1 - box.y0}`);
  assert.ok(paths.length === 2 && paths.every(d => d.startsWith('M') && d.includes('C')));
});
test('two lines are narrower and taller', () => {
  const a = nameLayout(1).box, b = nameLayout(2).box;
  assert.ok(b.x1 - b.x0 < (a.x1 - a.x0) * .6);
  assert.ok(b.y1 - b.y0 > (a.y1 - a.y0) * 1.8);
});
