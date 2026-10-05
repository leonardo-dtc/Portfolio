// Design toggles: the choices still open on the decision page, to try in the browser's developer tools. Each is a
// data attribute on <html> (data-launcher="widgets") that the stylesheet and the hero read. A change is kept in this
// browser only (localStorage, set again before the first paint by every page's head script), so visitors always
// see the defaults.
//
//   In the console      toggles                         each one's value (toggles.list(): what each is, and its choices)
//                       toggles.launcher = 'widgets'    or toggles.set('launcher', 'widgets'), or by its question:
//                                                       toggles.T39 = 'b' (the letters are the decision page's)
//                       toggles.reset()                 every one back to its default (or toggles.reset('launcher'))
//   In the address      ?toggles=launcher:widgets,heroName:glass
//   In Elements         edit the data attribute on <html>
//
// The hero's toggles change the hero while it shows; reload the home page to bring it back.
export const TOGGLES = {
  heroName: {
    q: 'T41', def: 'neon',
    values: { neon: 'the Glowtime neon on a dark stage (built)', glass: 'the glass name in the lit room, as in the launcher mock' },
  },
  heroContent: {
    q: 'T27', def: 'both', letters: { a: 'name', b: 'line', c: 'apps', d: 'both' },
    values: { name: 'a: only the name and the hint', line: 'b: the name and one line of who I am', apps: 'c: the name and the apps', both: 'd: the name, the line and the apps (recommended)' },
  },
  launcher: {
    q: 'T39', def: 'icons', letters: { a: 'library', b: 'widgets', c: 'desktop' },
    values: { icons: 'round glass icons with their names, as in the mock (T34)', library: 'a: tall covers, like the Steam library', widgets: 'b: widgets, like the dashboard', desktop: 'c: icons down the right edge, like a Mac desktop (myOS)' },
  },
};

const KEY = 'v5:toggles';
const attr = n => 'data-' + n.replace(/[A-Z]/g, c => '-' + c.toLowerCase());

export function initToggles() {
  const html = document.documentElement;
  const stored = () => { try { return JSON.parse(localStorage.getItem(KEY) || '{}') || {}; } catch (e) { return {}; } };
  const keep = (o) => { try { if (Object.keys(o).length) localStorage.setItem(KEY, JSON.stringify(o)); else localStorage.removeItem(KEY); } catch (e) { /* not kept */ } };
  const nameOf = (n) => (TOGGLES[n] ? n : Object.keys(TOGGLES).find(k => TOGGLES[k].q.toLowerCase() === String(n).toLowerCase()));
  const valueOf = (t, v) => { v = String(v).trim().toLowerCase(); v = (t.letters && t.letters[v]) || v; return Object.prototype.hasOwnProperty.call(t.values, v) ? v : null; };
  const current = n => html.dataset[n] || TOGGLES[n].def;
  // what this script last wrote to each attribute, so the observer below can tell its own writes from an edit
  const written = {};
  // the console's object holds each toggle's value, so typing toggles shows them all
  const shown = {};
  const write = (n, v) => { written[n] = v; shown[n] = v; if (html.dataset[n] !== v) html.dataset[n] = v; };

  // one toggle to a value: on <html>, kept (a default is forgotten), and told to whoever listens
  function put(n, v) {
    const was = current(n);
    write(n, v);
    const kept = stored();
    if (v === TOGGLES[n].def) delete kept[n]; else kept[n] = v;
    keep(kept);
    if (v !== was) document.dispatchEvent(new CustomEvent('v5:toggle', { detail: { name: n, value: v, was } }));
  }
  function set(n, v) {
    const k = nameOf(n);
    if (!k) { console.warn(`toggles: no toggle "${n}". There are: ${Object.keys(TOGGLES).join(', ')}`); return; }
    const t = TOGGLES[k], val = valueOf(t, v);
    if (!val) { console.warn(`toggles: ${k} (${t.q}) takes ${Object.keys(t.values).map(x => `"${x}"`).join(', ')}${t.letters ? `, or the letters ${Object.keys(t.letters).join(', ')}` : ''}`); return; }
    put(k, val);
    return val;
  }
  function list() {
    const rows = {};
    for (const [k, t] of Object.entries(TOGGLES)) rows[k] = { question: t.q, value: current(k), default: t.def, choices: Object.entries(t.values).map(([v, d]) => `${v} (${d})`).join('; ') };
    console.table(rows);
  }
  function reset(n) {
    for (const k of n ? [nameOf(n)].filter(Boolean) : Object.keys(TOGGLES)) put(k, TOGGLES[k].def);
  }

  // what this browser kept (the head script set it already), then the address; every toggle shows on <html>
  const kept = stored();
  for (const k of Object.keys(TOGGLES)) write(k, valueOf(TOGGLES[k], kept[k] || TOGGLES[k].def) || TOGGLES[k].def);
  const asked = new URLSearchParams(location.search).get('toggles');
  if (asked) for (const pair of asked.split(',')) { const [n, v] = pair.split(':'); if (n && v) set(n, v); }

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

  // the methods are there but not listed, so the console shows just the values
  const methods = { set, list, reset, get: n => { const k = nameOf(n); return k ? current(k) : undefined; } };
  for (const [k, f] of Object.entries(methods)) Object.defineProperty(shown, k, { value: f, enumerable: false });
  const api = new Proxy(shown, {
    get(o, p) { const k = typeof p === 'string' && nameOf(p); return k ? current(k) : o[p]; },
    set(o, p, v) { set(p, v); return true; },
  });
  window.toggles = api;
  const changed = Object.keys(TOGGLES).filter(k => current(k) !== TOGGLES[k].def);
  console.info(`v5 design toggles: ${Object.keys(TOGGLES).map(k => `${k} (${TOGGLES[k].q}) = ${current(k)}`).join(', ')}.${changed.length ? ' Changed in this browser; toggles.reset() returns to the defaults.' : ''} toggles.list() shows the choices.`);
  return api;
}
