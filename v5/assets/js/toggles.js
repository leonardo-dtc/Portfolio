// Design toggles: the choices still open on the decision page, to try in the browser. Each is a data attribute on
// <html> (data-launcher="widgets") that the stylesheet and the hero read. A change is kept in this browser only
// (localStorage, set again before the first paint by every page's head script), so visitors always see the defaults.
//
//   On the page         ?dev in the address: a panel with every toggle as buttons (kept in this browser until its
//                       Close; ?dev=0 forgets it too), or toggles.panel() in the console
//   In the console      toggles                         each one's value (toggles.list(): what each is, and its choices)
//                       toggles.launcher = 'widgets'    or toggles.set('launcher', 'widgets'), or by its question:
//                                                       toggles.T39 = 'b' (the letters are the decision page's)
//                       toggles.reset()                 every one back to its default (or toggles.reset('launcher'))
//   In the address      ?toggles=launcher:widgets,heroName:glass (for that visit only)
//   In Elements         edit the data attribute on <html>
//
// The hero's toggles change the hero while it shows; reload the home page (or the panel's Replay the hero) to bring
// it back. Each toggle's name and its values' labels are the panel's.
export const TOGGLES = {
  heroName: {
    q: 'T41', def: 'neon', name: 'Hero title',
    labels: { neon: 'Neon', glass: 'Liquid Glass' },
    values: { neon: 'the Glowtime neon on a dark stage (built)', glass: 'the name in Liquid Glass in the lit room, as in the launcher mock' },
  },
  heroContent: {
    q: 'T27', def: 'both', name: 'Under the title', letters: { a: 'name', b: 'line', c: 'apps', d: 'both' },
    labels: { name: 'Nothing', line: 'Line', apps: 'Apps', both: 'Line and apps' },
    values: { name: 'a: only the name and the hint', line: 'b: the name and one line of who I am', apps: 'c: the name and the apps', both: 'd: the name, the line and the apps (recommended)' },
  },
  launcher: {
    q: 'T39', def: 'icons', name: 'The apps', letters: { a: 'library', b: 'widgets', c: 'desktop' },
    labels: { icons: 'Icons', library: 'Library', widgets: 'Widgets', desktop: 'Desktop' },
    values: { icons: 'round glass icons with their names, as in the mock (T34)', library: 'a: tall covers, like the Steam library', widgets: 'b: widgets, like the dashboard', desktop: 'c: icons down the right edge, like a Mac desktop (myOS)' },
  },
  // not a question on the decision page: a test, so the cost of a sharper room can be judged on a real phone (the
  // panel shows the room's frame time beside it)
  roomRes: {
    def: 'standard', name: 'Room resolution',
    labels: { standard: '1.5×', sharp: '2×' },
    values: { standard: 'up to 1.5 times the screen’s pixels (built)', sharp: 'up to 2 times: a sharper neon on a phone’s screen, for about 1.8 times the pixels' },
  },
};

const KEY = 'v5:toggles';
const DEV = 'v5:dev';
// Home, wherever this page is (this file is v5/assets/js/toggles.js)
const HOME = new URL('../../', import.meta.url).href;
const attr = n => 'data-' + n.replace(/[A-Z]/g, c => '-' + c.toLowerCase());

export function initToggles() {
  const html = document.documentElement;
  const stored = () => { try { return JSON.parse(localStorage.getItem(KEY) || '{}') || {}; } catch (e) { return {}; } };
  const keep = (o) => { try { if (Object.keys(o).length) localStorage.setItem(KEY, JSON.stringify(o)); else localStorage.removeItem(KEY); } catch (e) { /* not kept */ } };
  const nameOf = (n) => (TOGGLES[n] ? n : Object.keys(TOGGLES).find(k => (TOGGLES[k].q || '').toLowerCase() === String(n).toLowerCase()));
  const named = k => `${k}${TOGGLES[k].q ? ` (${TOGGLES[k].q})` : ''}`;
  const valueOf = (t, v) => { v = String(v).trim().toLowerCase(); v = (t.letters && t.letters[v]) || v; return Object.prototype.hasOwnProperty.call(t.values, v) ? v : null; };
  const current = n => html.dataset[n] || TOGGLES[n].def;
  // what this script last wrote to each attribute, so the observer below can tell its own writes from an edit
  const written = {};
  // the console's object holds each toggle's value, so typing toggles shows them all
  const shown = {};
  const write = (n, v) => { written[n] = v; shown[n] = v; if (html.dataset[n] !== v) html.dataset[n] = v; };

  // one toggle to a value: on <html>, kept (a default is forgotten), and told to whoever listens
  function put(n, v, keepIt = true) {
    const was = current(n);
    write(n, v);
    if (keepIt) {
      const kept = stored();
      if (v === TOGGLES[n].def) delete kept[n]; else kept[n] = v;
      keep(kept);
    }
    if (v !== was) document.dispatchEvent(new CustomEvent('v5:toggle', { detail: { name: n, value: v, was } }));
  }
  function set(n, v, keepIt = true) {
    const k = nameOf(n);
    if (!k) { console.warn(`toggles: no toggle "${n}". There are: ${Object.keys(TOGGLES).join(', ')}`); return; }
    const t = TOGGLES[k], val = valueOf(t, v);
    if (!val) { console.warn(`toggles: ${named(k)} takes ${Object.keys(t.values).map(x => `"${x}"`).join(', ')}${t.letters ? `, or the letters ${Object.keys(t.letters).join(', ')}` : ''}`); return; }
    put(k, val, keepIt);
    return val;
  }
  function list() {
    const rows = {};
    for (const [k, t] of Object.entries(TOGGLES)) rows[k] = { question: t.q || '', value: current(k), default: t.def, choices: Object.entries(t.values).map(([v, d]) => `${v} (${d})`).join('; ') };
    console.table(rows);
  }
  function reset(n) {
    for (const k of n ? [nameOf(n)].filter(Boolean) : Object.keys(TOGGLES)) put(k, TOGGLES[k].def);
  }

  // what this browser kept (the head script set it already), then the address; every toggle shows on <html>
  const kept = stored();
  for (const k of Object.keys(TOGGLES)) write(k, valueOf(TOGGLES[k], kept[k] || TOGGLES[k].def) || TOGGLES[k].def);
  const asked = new URLSearchParams(location.search).get('toggles');
  // (for this visit only: a link with ?toggles= never changes what that browser shows next time)
  if (asked) for (const pair of asked.split(',')) { const [n, v] = pair.split(':'); if (n && v) set(n, v, false); }

  // an attribute edited in the Elements panel counts as a change
  // (an edit to a value the toggle does not take goes back to the last good one, with a note of what it takes)
  new MutationObserver((records) => {
    for (const r of records) {
      const k = Object.keys(TOGGLES).find(n => attr(n) === r.attributeName);
      const raw = k && html.getAttribute(r.attributeName);
      if (!k || raw === written[k]) continue;
      const v = valueOf(TOGGLES[k], raw || '');
      if (v) put(k, v); else { write(k, written[k] || TOGGLES[k].def); set(k, raw); }
    }
  }).observe(html, { attributes: true, attributeFilter: Object.keys(TOGGLES).map(attr) });

  // the panel: every toggle as a row of buttons (the one in use pressed), Replay the hero, Reset and Close; its
  // heading folds it away (so the hero shows whole on a phone), and it stays folded in this browser till unfolded. It
  // keeps up with every change, wherever it was made (the console, the address, Elements)
  let box = null;
  const keepDev = (v) => { try { if (v) localStorage.setItem(DEV, v); else localStorage.removeItem(DEV); } catch (e) { /* not kept */ } };
  function panel(on = true) {
    if (!on) { keepDev(null); clearInterval(meterTick); if (box) { box.remove(); box = null; } return; }
    let was = null;
    try { was = localStorage.getItem(DEV); } catch (e) { /* not kept */ }
    if (was !== 'folded') keepDev('1');
    if (box) return box;
    const el = (tag, props = {}, kids = []) => { const n = Object.assign(document.createElement(tag), props); n.append(...kids); return n; };
    box = el('aside', { className: 'devtoggles' });
    box.setAttribute('aria-labelledby', 'devtoggles-title');
    const body = el('div', { id: 'devtoggles-body', className: 'devtoggles__body' });
    const fold = el('button', { type: 'button', id: 'devtoggles-title', className: 'devtoggles__fold', textContent: 'Design toggles' });
    fold.setAttribute('aria-controls', body.id);
    const folded = (f) => { fold.setAttribute('aria-expanded', String(!f)); body.hidden = f; box.classList.toggle('is-folded', f); };
    fold.addEventListener('click', () => { const f = !body.hidden; folded(f); keepDev(f ? 'folded' : '1'); });
    const close = el('button', { type: 'button', className: 'devtoggles__close', textContent: 'Close' });
    close.addEventListener('click', () => panel(false));
    box.append(el('div', { className: 'devtoggles__head' }, [el('h2', {}, [fold]), close]), body);
    folded(was === 'folded');
    for (const [k, t] of Object.entries(TOGGLES)) {
      const row = el('div', { className: 'devtoggles__set' });
      for (const v of Object.keys(t.values)) {
        const b = el('button', { type: 'button', textContent: t.labels[v], title: t.values[v] });
        b.dataset.toggle = k; b.dataset.value = v;
        b.addEventListener('click', () => set(k, v));
        row.append(b);
      }
      body.append(el('fieldset', {}, [el('legend', { textContent: `${t.name}${t.q ? ` (${t.q})` : ''}` }), row]));
    }
    const replay = el('button', { type: 'button', textContent: 'Replay the hero' });
    replay.addEventListener('click', () => {
      try { sessionStorage.removeItem('v5:hello'); } catch (e) { /* the reload brings it back anyway, on Home */ }
      if (html.dataset.page === 'home') location.reload(); else location.href = HOME;
    });
    const resetAll = el('button', { type: 'button', textContent: 'Reset' });
    resetAll.addEventListener('click', () => reset());
    // the room as it draws now: its resolution and the time a frame takes (under about 17 ms keeps 60 a second)
    const meter = el('p', { className: 'devtoggles__meter' });
    meter.setAttribute('aria-live', 'off');
    const read = () => {
      const r = window.__room;
      meter.textContent = !r ? 'The room is off: CSS glass.' : r.gaveWay ? 'The room gave way to the still.' : `The room: ${r.dpr}×${r.slow ? ' (held at 1× as slow)' : ''}, ${r.frameMs ? `${r.frameMs.toFixed(1)} ms a frame` : 'still'}.`;
    };
    read();
    meterTick = setInterval(read, 500);
    body.append(el('div', { className: 'devtoggles__foot' }, [replay, resetAll, meter, el('p', { textContent: 'Kept in this browser only.' })]));
    document.body.append(box);
    sync();
    return box;
  }
  let meterTick = 0;
  function sync() {
    if (box) for (const b of box.querySelectorAll('[data-toggle]')) b.setAttribute('aria-pressed', String(current(b.dataset.toggle) === b.dataset.value));
  }
  document.addEventListener('v5:toggle', sync);

  // the methods are there but not listed, so the console shows just the values
  const methods = { set, list, reset, panel, get: n => { const k = nameOf(n); return k ? current(k) : undefined; } };
  for (const [k, f] of Object.entries(methods)) Object.defineProperty(shown, k, { value: f, enumerable: false });
  const api = new Proxy(shown, {
    get(o, p) { const k = typeof p === 'string' && nameOf(p); return k ? current(k) : o[p]; },
    set(o, p, v) { set(p, v); return true; },
  });
  window.toggles = api;
  const changed = Object.keys(TOGGLES).filter(k => current(k) !== TOGGLES[k].def);
  console.info(`v5 design toggles: ${Object.keys(TOGGLES).map(k => `${named(k)} = ${current(k)}`).join(', ')}.${changed.length ? ' Changed in this browser; toggles.reset() returns to the defaults.' : ''} toggles.list() shows the choices; ?dev in the address shows them as buttons.`);
  // the panel for a visit with ?dev (or one this browser kept); ?dev=0 forgets it
  const dev = new URLSearchParams(location.search).get('dev');
  let devKept = false;
  try { devKept = !!localStorage.getItem(DEV); } catch (e) { /* not kept */ }
  if (dev === '0' || dev === 'false') panel(false);
  else if (dev !== null || devKept) panel();
  return api;
}
