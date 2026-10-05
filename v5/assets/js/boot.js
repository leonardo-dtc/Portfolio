// v5 entry point: the room first, then everything that moves in it.
import { createRoom } from './room.js';
import { readPanels, forgetRadii } from './panels.js';
import { createWindows } from './windows.js';
import { createHero } from './hero.js';
import { initNav } from './nav.js';
import { initHue } from './hue.js';
import { initSpy } from './spy.js';
import { prepareFlip, reflow } from './flip.js';
import { initToggles } from './toggles.js';

const html = document.documentElement;
html.classList.add('js');
// the design toggles still open on the decision page, for the developer tools (toggles.js): first, so everything
// below reads them
initToggles();

let room = null;
// reduced transparency and forced colours keep to CSS glass over the still (forced colours hide the canvas)
const lessGlass = matchMedia('(prefers-reduced-transparency: reduce), (forced-colors: active)');
// so does a device that asks for less data, or has 2 GB of memory or less: it starts on the still, which is the
// same page in CSS glass (html[data-still] says why; a room that gives way later says so there too)
const conn = navigator.connection, memory = navigator.deviceMemory;
const weak = conn && conn.saveData ? 'save-data' : memory && memory <= 2 ? 'memory' : '';
if (weak) html.dataset.still = weak;
try {
  if (!lessGlass.matches && !weak) room = createRoom(document.querySelector('canvas.room'));
} catch (e) {
  console.warn('v5: the room could not start, using CSS glass', e);
  room = null;
}
html.classList.toggle('gl', !!room);
html.classList.toggle('no-gl', !room);
// The dock's layout is decided once, here: without a room from the start there is no color control, and the phone's
// tab bar is centred alone. A room that gives way later (a lost context, a slow device) leaves both where they are,
// so nothing jumps under a thumb; the control keeps working over CSS glass. no-room is never changed after this.
html.classList.toggle('no-room', !room);
if (room) {
  window.__room = room;
  room.onlost = (why = 'lost') => { html.classList.remove('gl'); html.classList.add('no-gl'); html.dataset.still = why; };
  // every frame, once the windows have moved, the room reads where the glass is
  room.source = () => readPanels(document, room.dpr);
  addEventListener('resize', forgetRadii);
}

const windows = createWindows({ room });
window.__windows = windows;

// the color style control (it also sets Night and Day: Auto follows the system)
window.__hue = initHue({ room });

// the hero: on the first home view of a session (html.is-hello, set in the page's head). With the room it is drawn
// in Liquid Glass; without it (no WebGL2, reduced transparency, forced colours) it is the same name in CSS glass.
// (an app on the hero goes to its page through the navigation, which starts below)
let nav = null;
const hero = createHero({ room, windows, go: (href, o) => (nav ? nav.go(href, o) : Promise.reject(new Error('no navigation yet'))) });
window.__hero = hero;
if (html.classList.contains('is-hello')) hero.start();
if (room) { const lost = room.onlost; room.onlost = (why) => { lost(why); hero.abort(); }; }

// Work's filters and the print buttons are delegated from the document, so they keep working after a page swap
document.addEventListener('click', (e) => {
  const f = e.target.closest && e.target.closest('[data-filter]');
  if (f) {
    const cat = f.dataset.filter;
    document.querySelectorAll('[data-filter]').forEach(b => b.setAttribute('aria-pressed', String(b.dataset.filter === cat)));
    let shown = 0;
    const cards = [...document.querySelectorAll('[data-cards] .card[data-cat]')];
    // the cards glide to their new places, and what follows the grid moves with them (flip.js; at once without GSAP or
    // under reduced motion)
    const after = [...document.querySelectorAll('[data-cards]')].flatMap(g => { const all = [...g.parentElement.children]; return all.slice(all.indexOf(g) + 1); });
    reflow([...cards, ...after], () => {
      cards.forEach(c => { c.hidden = cat !== 'all' && c.dataset.cat !== cat; if (!c.hidden) shown++; });
      document.querySelectorAll('[data-cards]').forEach(g => g.classList.toggle('cards--3', cat !== 'all'));   // a filtered set runs three across
    });
    const live = document.querySelector('.sr-live');
    if (live) live.textContent = `${shown} ${shown === 1 ? 'project' : 'projects'}`;
    return;
  }
  const p = e.target.closest && e.target.closest('[data-print]');
  if (p) { e.preventDefault(); print(); }
});

// GSAP, for Work's grid, loads once a page with one is idle (flip.js)
prepareFlip();
document.addEventListener('v5:navigate', prepareFlip);

// Groton's clock (Home's side window): the time there, refreshed each minute and whenever a page arrives.
// data-clock="in Groton" reads "9:41 AM in Groton"; an empty data-clock reads "9:41 AM, Eastern time".
const clock = new Intl.DateTimeFormat('en-US', { timeZone: 'America/New_York', hour: 'numeric', minute: '2-digit' });
function tick() {
  const now = clock.format(new Date());
  document.querySelectorAll('[data-clock]').forEach(el => {
    const t = el.dataset.clock ? `${now} ${el.dataset.clock}` : `${now}, Eastern time`;
    if (el.textContent !== t) el.textContent = t;
  });
}
tick();
setInterval(tick, 15000);
document.addEventListener('v5:navigate', tick);

// Phones: a window's header folds to one line of its title once its contents scroll, as iOS folds a large title, so
// the reading space grows; back at the top it unfolds. Two thresholds (folds past 48px, unfolds under 8px) keep it
// from flickering at one edge, and a new page in the window starts unfolded. It folds only where the contents are
// long enough to stay past the second threshold once the header has given its height to them: a page barely longer
// than its window would otherwise fold, lose the length it scrolled by, and unfold at once. While the header
// changes (.28s, site.css) the window is not read again; it is read once when the change is done.
const phone = matchMedia('(max-width: 899px)');
const FOLDED = 44;                                                    // a folded header is 45 to 66px tall: never more gain than this
let foldQuiet = 0, foldAgain = 0;
function fold(body) {
  const win = body.closest('.win'); if (!win) return;
  const y = body.scrollTop, folded = win.classList.contains('is-folded');
  if (!folded && y > 48) {
    const head = win.querySelector(':scope > .win__head');
    const gain = head ? Math.max(0, head.offsetHeight - FOLDED) : 0;
    if (body.scrollHeight - body.clientHeight - gain < 64) return;
    win.classList.add('is-folded');
  } else if (folded && y < 8) win.classList.remove('is-folded');
  else return;
  foldQuiet = performance.now() + 340;
  clearTimeout(foldAgain);
  foldAgain = setTimeout(() => { if (phone.matches && body.isConnected) fold(body); }, 360);
}
document.addEventListener('scroll', (e) => {
  const body = e.target;
  if (!phone.matches || !(body instanceof Element) || !body.matches('.win__body') || performance.now() < foldQuiet) return;
  fold(body);
}, { capture: true, passive: true });
document.addEventListener('v5:navigate', () => document.querySelectorAll('.win.is-folded').forEach(w => { const b = w.querySelector('.win__body'); if (!b || b.scrollTop < 8) w.classList.remove('is-folded'); }));

nav = initNav({ windows });
window.__nav = nav;

// the Résumé's Sections follow the reader
initSpy();

// everything has started: the head script's way out (a page left hidden if this never runs) stands down
html.classList.add('booted');

export { room, windows, hero, nav };
