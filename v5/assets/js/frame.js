// One requestAnimationFrame loop for everything that moves, so the glass and its windows share a frame.
const subs = new Set();
let last = 0, running = false;

function loop(now) {
  const dt = last ? Math.min(.05, (now - last) / 1000) : 1 / 60;
  last = now;
  for (const fn of [...subs]) fn(dt, now / 1000);
  if (subs.size) requestAnimationFrame(loop);
  else { running = false; last = 0; }
}

export function onFrame(fn) {
  subs.add(fn);
  if (!running && typeof requestAnimationFrame === 'function') { running = true; requestAnimationFrame(loop); }
  return () => subs.delete(fn);
}
