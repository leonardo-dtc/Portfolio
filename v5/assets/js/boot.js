// v5 entry point: the room first, then everything that moves in it.
import { createRoom } from './room.js';
import { onFrame } from './frame.js';
import { readPanels, forgetRadii } from './panels.js';
import { createWindows } from './windows.js';
import { createHello } from './hello.js';
import { initNav } from './nav.js';
import { initHue } from './hue.js';

const html = document.documentElement;
html.classList.add('js');

let room = null;
const lessGlass = matchMedia('(prefers-reduced-transparency: reduce)');
try {
  if (!lessGlass.matches) room = createRoom(document.querySelector('canvas.room'));
} catch (e) {
  console.warn('v5: the room could not start, using CSS glass', e);
  room = null;
}
html.classList.toggle('gl', !!room);
html.classList.toggle('no-gl', !room);
if (room) {
  window.__room = room;
  room.onlost = () => { html.classList.remove('gl'); html.classList.add('no-gl'); };
  // every frame, tell the room where the glass is
  onFrame(() => room.setPanels(readPanels(document, room.dpr)));
  addEventListener('resize', forgetRadii);
}

const windows = createWindows({ room });
window.__windows = windows;

// the color style control (it also sets Night and Day: Auto follows the system)
window.__hue = initHue({ room });

// the hello needs the room to write in; without it the page opens straight into the windows
let hello = null;
if (room) {
  hello = createHello({ room, windows });
  window.__hello = hello;
  if (html.classList.contains('is-hello')) hello.start();
  else hello.showTitle(true);
  const lost = room.onlost;
  room.onlost = () => { lost(); hello.abort(); };
} else {
  html.classList.remove('is-hello');
}

// Work's filters and the print buttons are delegated from the document, so they keep working after a page swap
document.addEventListener('click', (e) => {
  const f = e.target.closest && e.target.closest('[data-filter]');
  if (f) {
    const cat = f.dataset.filter;
    document.querySelectorAll('[data-filter]').forEach(b => b.setAttribute('aria-pressed', String(b.dataset.filter === cat)));
    let shown = 0;
    document.querySelectorAll('[data-cards] .card[data-cat]').forEach(c => { c.hidden = cat !== 'all' && c.dataset.cat !== cat; if (!c.hidden) shown++; });
    const live = document.querySelector('.sr-live');
    if (live) live.textContent = `${shown} ${shown === 1 ? 'project' : 'projects'}`;
    return;
  }
  const p = e.target.closest && e.target.closest('[data-print]');
  if (p) { e.preventDefault(); print(); }
});

// the Now window's clock: the time in Groton, refreshed each minute and whenever a page arrives
const clock = new Intl.DateTimeFormat('en-US', { timeZone: 'America/New_York', hour: 'numeric', minute: '2-digit' });
function tick() {
  const t = `${clock.format(new Date())}, Eastern time`;
  document.querySelectorAll('[data-clock]').forEach(el => { if (el.textContent !== t) el.textContent = t; });
}
tick();
setInterval(tick, 15000);
document.addEventListener('v5:navigate', tick);

const nav = initNav({ windows });
window.__nav = nav;

export { room, windows, hello, nav };
