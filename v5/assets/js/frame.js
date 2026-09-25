// One requestAnimationFrame loop for everything that moves, so the glass and its windows share a frame.
// Callbacks run in order: motion first (springs, tweens: order 0), then what reads the moved layout (order 1),
// then the room, which reads where the glass is and draws it (order 2), so the glass never trails its window.
const subs = new Set();
let last = 0, running = false;

function loop(now) {
  const dt = last ? Math.min(.05, (now - last) / 1000) : 1 / 60;
  last = now;
  for (const s of [...subs].sort((a, b) => a.order - b.order)) s.fn(dt, now / 1000);
  if (subs.size) requestAnimationFrame(loop);
  else { running = false; last = 0; }
}

export function onFrame(fn, order = 0) {
  const s = { fn, order };
  subs.add(s);
  if (!running && typeof requestAnimationFrame === 'function') { running = true; requestAnimationFrame(loop); }
  return () => subs.delete(s);
}
