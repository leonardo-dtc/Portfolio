import test from 'node:test';
import assert from 'node:assert/strict';
import { PRESETS, lab, rgb, turn, lut, neonFor } from '../../../v5/assets/js/palette.js';

const lch = c => { const [L, a, b] = lab(c); return [L, Math.hypot(a, b), (Math.atan2(b, a) * 180 / Math.PI + 360) % 360]; };
const dE = (x, y) => { const p = lab(x), q = lab(y); return Math.hypot(p[0] - q[0], p[1] - q[1], p[2] - q[2]); };
const off = (h, from) => ((h - from + 540) % 360) - 180;
const yiq = ([r, g, b]) => Math.atan2(.211 * r - .523 * g + .312 * b, .596 * r - .274 * g - .322 * b);
// a pseudo-random colour, the same every run
let seed = 7;
const rand = () => { seed = (seed * 16807) % 2147483647; return seed / 2147483647; };
const colour = () => [rand(), rand(), rand()];
const GLOWTIME = [[1, .4, .05], [1, .12, .46], [.88, .12, .92], [.52, .2, 1], [.13, .34, 1], [.08, .8, 1], [.11, .48, 1], [1, .56, .08], [.2, .3, 1], [.5, .16, 1], [.95, .14, .66], [.46, .32, 1], [.14, .08, .56], [1, .12, .46]];

test('OKLab there and back loses nothing', () => {
  for (let i = 0; i < 500; i++) { const c = colour(), d = rgb(lab(c)); c.forEach((v, j) => assert.ok(Math.abs(v - d[j]) < 1e-5, `${c} -> ${d}`)); }
});
test('Cobalt is the room as drawn: no turn, and an identity table', () => {
  const c = colour();
  assert.deepEqual(turn(c, 0, 1), c);
  const t = lut(0, 1, 5);
  for (let b = 0, o = 0; b < 5; b++) for (let g = 0; g < 5; g++) for (let r = 0; r < 5; r++, o += 4) assert.deepEqual([t[o], t[o + 1], t[o + 2], t[o + 3]], [r / 4, g / 4, b / 4, 1]);
});
test('a turn keeps lightness and turns every hue by the same angle', () => {
  for (const deg of [28, 92, 136, 170, -120, -66]) for (let i = 0; i < 200; i++) {
    const c = colour(), t = turn(c, deg, 1), [L0, C0, h0] = lch(c), [L1, C1, h1] = lch(t);
    assert.ok(Math.abs(L1 - L0) < .03, `lightness ${L0} -> ${L1}`);
    // where the colour fits sRGB once turned, its hue moves by exactly the angle (one that does not fit is pulled
    // toward grey, so its hue may drift a little)
    if (C0 > .04 && Math.abs(C1 - C0) < 1e-4) assert.ok(Math.abs(off(h1, h0) - (((deg % 360) + 540) % 360 - 180)) < .5, `hue ${h0} -> ${h1} for ${deg}`);
  }
});
test('every turned colour is a colour: in 0..1', () => {
  for (const [, , d, k] of PRESETS) for (const kk of [k, 1.5]) for (let i = 0; i < 100; i++) for (const v of turn(colour(), d, kk)) assert.ok(v >= 0 && v <= 1);
});
test('the hero keeps its Glowtime colours on Cobalt, exactly', () => {
  const n = neonFor(0, 1);
  assert.deepEqual(n.set, GLOWTIME);
  assert.deepEqual(n.arc, [1.676, 1.745]);
  assert.deepEqual([...n.list], GLOWTIME.flat().map(v => Math.fround(v)));
});
test('each palette gives its own neon, in its own family', () => {
  for (const [id, , d, k] of PRESETS) {
    if (id === 'cobalt' || id === 'graphite') continue;
    const n = neonFor(d, k), room = lch(turn([.15, .20, .90], d, k))[2];
    let x = 0, y = 0;
    for (const c of n.set.slice(0, 8)) { const [, C, h] = lch(c); x += C * Math.cos(h * Math.PI / 180); y += C * Math.sin(h * Math.PI / 180); }
    const mean = (Math.atan2(y, x) * 180 / Math.PI + 360) % 360;
    assert.ok(Math.abs(off(mean, room)) <= 20, `${id}: the neon's mean hue ${mean.toFixed(0)} against the room's ${room.toFixed(0)}`);
    for (const c of n.set.slice(0, 8)) assert.ok(Math.abs(off(lch(c)[2], room)) <= 80, `${id}: ${c} is ${off(lch(c)[2], room).toFixed(0)} degrees from the room`);
    // the arc it is held in holds every one of its colours (so holding them changes nothing)
    for (const c of n.set) if (c !== n.set[12]) assert.ok(Math.abs(Math.atan2(Math.sin(yiq(c) - n.arc[0]), Math.cos(yiq(c) - n.arc[0]))) <= n.arc[1] + 1e-6, `${id}: ${c} outside its arc`);
  }
});
test('Graphite is a silver neon', () => {
  const [, , d, k] = PRESETS.find(p => p[0] === 'graphite');
  for (const c of neonFor(d, k).set.slice(0, 11)) assert.ok(lch(c)[1] < .045, `${c} chroma ${lch(c)[1]}`);
});
test('a custom hue blends the neighbouring sets smoothly, never through grey', () => {
  let prev = neonFor(-180, 1).set;
  for (let deg = -179; deg <= 180; deg++) {
    const n = neonFor(deg, 1).set;
    n.forEach((c, s) => {
      assert.ok(dE(c, prev[s]) < .06, `slot ${s} jumps at ${deg}: ${dE(c, prev[s]).toFixed(3)}`);
      if (s !== 5 && s !== 12) assert.ok(lch(c)[1] > .1, `slot ${s} at ${deg} goes grey (${lch(c)[1].toFixed(3)})`);
    });
    prev = n;
  }
});
// Red is in for Leonardo to judge against Ember (October 2026). They sit 14 degrees apart, so their swatches are the
// closest pair (.027 where every other pair is .06 or more): crimson beside orange red, told apart by their names and
// little else. Whichever of the two stays, the other goes, and this exception with it.
const JUDGING = ['red', 'ember'];
test('the palettes are told apart at a glance', () => {
  const sw = PRESETS.map(([id, , d, k]) => [id, turn([.10, .22, .80], d, k)]);
  for (let i = 0; i < sw.length; i++) for (let j = i + 1; j < sw.length; j++) {
    const judging = JUDGING.includes(sw[i][0]) && JUDGING.includes(sw[j][0]);
    assert.ok(dE(sw[i][1], sw[j][1]) >= (judging ? .025 : .06), `${sw[i][0]} and ${sw[j][0]}: ${dE(sw[i][1], sw[j][1]).toFixed(3)}`);
  }
});
