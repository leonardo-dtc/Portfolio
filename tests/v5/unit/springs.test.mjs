import test from 'node:test';
import assert from 'node:assert/strict';
import { createSpring } from '../../../v5/assets/js/springs.js';

const run = (s, secs) => { let max = -Infinity; for (let t = 0; t < secs; t += 1 / 60) { s.step(1 / 60); max = Math.max(max, s.value); } return max; };

test('critically damped never overshoots', () => {
  const s = createSpring({ value: 0, target: 1, response: .5, damping: 1 });
  assert.ok(run(s, 2) <= 1 + 1e-6);
  assert.ok(Math.abs(s.value - 1) < 1e-3);
});
test('underdamped overshoots', () => {
  const s = createSpring({ value: 0, target: 1, response: .5, damping: .5 });
  assert.ok(run(s, 2) > 1.05);
});
test('the window spring settles within 1.2 responses', () => {
  const s = createSpring({ value: 0, target: 1, response: .5, damping: .86 });
  run(s, .6);
  assert.ok(Math.abs(s.value - 1) < .02, `value ${s.value}`);
});
test('reports settled', () => {
  const s = createSpring({ value: 0, target: 1 });
  let done = false;
  for (let i = 0; i < 300 && !done; i++) done = s.step(1 / 60);
  assert.ok(done);
});
test('a long frame does not explode', () => {
  const s = createSpring({ value: 0, target: 1, response: .3, damping: .8 });
  s.step(2);
  assert.ok(Number.isFinite(s.value) && Math.abs(s.value) < 3);
});
