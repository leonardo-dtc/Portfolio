// Springs as Apple describes them: a response (the period, in seconds) and a damping ratio.
import { onFrame } from './frame.js';

export function createSpring({ value = 0, target = value, response = .5, damping = .86 } = {}) {
  const s = { value, target, velocity: 0, response, damping };
  s.step = (dt) => {
    const w = 2 * Math.PI / s.response, k = w * w, c = 2 * s.damping * w;
    const t = Math.min(dt, .064), n = Math.max(1, Math.ceil(t / .004)), h = t / n;
    for (let i = 0; i < n; i++) {
      s.velocity += (-k * (s.value - s.target) - c * s.velocity) * h;
      s.value += s.velocity * h;
    }
    return Math.abs(s.value - s.target) < 1e-3 && Math.abs(s.velocity) < 1e-3;
  };
  s.snap = (v = s.target) => { s.value = s.target = v; s.velocity = 0; };
  return s;
}

// Drive a spring to a target, calling onUpdate every frame; resolves true when it settles.
// A newer tween on the same spring takes over the old one, which resolves false.
export function tween(spring, target, onUpdate) {
  spring.target = target;
  const token = spring._token = {};
  return new Promise(resolve => {
    const off = onFrame(dt => {
      if (spring._token !== token) { off(); resolve(false); return; }
      const done = spring.step(dt);
      onUpdate(spring.value);
      if (done) { spring.snap(target); onUpdate(target); off(); resolve(true); }
    });
  });
}
