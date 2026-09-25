// Moving around the room. Links inside the edition swap the window's contents in place and projects open as
// sheets in front of it, while every page stays its own HTML file: Back, Forward, deep links and reading without
// scripts all keep working. Anything unexpected falls back to an ordinary page load.
const ROOT = new URL('../../', import.meta.url).pathname;
const OUT = [{ opacity: 1, filter: 'blur(0px)', transform: 'scale(1)' }, { opacity: 0, filter: 'blur(8px)', transform: 'scale(.985)' }];
const IN = [{ opacity: 0, filter: 'blur(6px)', transform: 'translateY(14px)' }, { opacity: 1, filter: 'blur(0px)', transform: 'none' }];

export function initNav({ windows }) {
  const html = document.documentElement;
  const space = document.querySelector('[data-space]');
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  const $main = () => document.getElementById('main');
  const $sheet = () => document.querySelector('section.sheet:not(.is-closing)');
  const $front = () => $sheet() || $main();
  const cache = new Map(), scrolls = new Map();
  let shown = location.pathname;                                      // what is in front
  let under = html.dataset.kind === 'sheet' ? null : location.pathname;  // the page in the main window
  let seq = 0, opener = null;

  // Links now. Image addresses only matter once the address changes (a srcset or <picture> can choose again after
  // that), and rewriting one reloads it, so they are fixed on the first move, when the page has long loaded.
  const here = location.href;
  let pinned = false;
  const pin = () => { if (!pinned) { pinned = true; absolutize(document.body, here, { links: false }); } };
  absolutize(document.body, here, { media: false });
  history.replaceState({ ...(history.state || {}), v5: true }, '');

  // ---------- fetching ----------
  function load(url) {
    const key = new URL(url, location.href).pathname;
    if (!cache.has(key)) {
      cache.set(key, fetch(key, { credentials: 'same-origin' })
        .then(r => { if (!r.ok) throw new Error(`${key}: ${r.status}`); return r.text(); })
        .then(t => { const doc = new DOMParser().parseFromString(t, 'text/html'); absolutize(doc.body, new URL(key, location.origin).href); return doc; })
        .catch(e => { cache.delete(key); throw e; }));
    }
    return cache.get(key);
  }
  function read(doc) {
    const d = doc.documentElement.dataset;
    return {
      page: d.page, kind: d.kind || 'page', tab: d.tab, parent: d.parent, title: doc.title,
      main: doc.getElementById('main'), sides: [...doc.querySelectorAll('aside.side')],
      bar: doc.querySelector('.toolbar:not(.toolbar--inline):not(.toolbar--sheet)'),
      sheetBar: doc.querySelector('.toolbar--sheet'), grab: doc.querySelector('.grab'),
    };
  }
  const copy = nodes => [...nodes].map(n => document.importNode(n, true));

  // ---------- motion ----------
  function fade(els, frames, ms, easing) {
    if (reduced.matches) { frames = frames.map(f => ({ opacity: f.opacity })); ms = 150; }
    return Promise.all(els.filter(Boolean).map(el => {
      const a = el.animate(frames, { duration: ms, easing, fill: 'both' });
      return a.finished.catch(() => {}).then(() => a);
    }));
  }
  // outgoing content drops back and blurs, the new content rises in
  async function swapWindow(win, info) {
    await fade([...win.children], OUT, 180, 'cubic-bezier(.4, 0, 1, 1)');
    const fresh = copy(info.main.children);
    win.replaceChildren(...fresh);
    fade(fresh, IN, 260, 'cubic-bezier(.2, .8, .2, 1)').then(as => as.forEach(a => a.cancel()));
  }
  // Every toolbar still on screen leaves (not only the first one found): one that is still fading out from an
  // earlier change is marked, so a quick second click never mistakes it for the current one and leaves two.
  function swapBar(info) {
    const current = [...document.querySelectorAll('.space > .toolbar:not(.toolbar--sheet):not(.is-leaving)')];
    const fresh = info.bar ? document.importNode(info.bar, true) : null;
    if (fresh && current.length === 1 && current[0].className === fresh.className && current[0].innerHTML === fresh.innerHTML) return;
    for (const old of current) {
      old.classList.add('is-leaving');
      old.inert = true;
      windows.dematerialise([old], { from: 'ornament' }).then(() => old.remove());
    }
    if (fresh) {
      windows.hideNow([fresh]);
      space.insertBefore(fresh, document.querySelector('.space > .grab'));
      windows.materialise([fresh], { delay: .14, from: 'ornament' });
    }
  }

  // ---------- pages ----------
  async function showPage(info, url, token) {
    if ($sheet()) await closeSheet();
    if (token !== seq) return false;                                   // a newer page change took over
    if (under === url.pathname) return false;                          // the page was already underneath
    under = url.pathname;
    const desk = windows.mode === 'desktop';
    const oldSides = [...document.querySelectorAll('aside.side')];
    if (desk) windows.dematerialise(oldSides, { from: 'side' }).then(() => oldSides.forEach(s => s.remove()));
    swapBar(info);
    await swapWindow($main(), info);
    if (token !== seq) return true;                                    // overtaken: the newer change adds its own sides
    if (!desk) oldSides.forEach(s => s.remove());                      // inline, they left with the old body
    const sides = copy(info.sides);
    windows.hideNow(sides);
    $main().after(...sides);
    windows.refresh();
    windows.materialise(sides, { stagger: .06, delay: desk ? .06 : 0 });
    windows.setTab(info.tab);
    return true;
  }

  // ---------- sheets ----------
  function buildSheet(children) {
    const s = document.createElement('section');
    s.className = 'sheet win glass';
    s.dataset.glass = 'window'; s.dataset.window = 'sheet';
    s.setAttribute('role', 'dialog'); s.setAttribute('aria-modal', 'true');
    s.append(...children);
    label(s);
    return s;
  }
  function label(s) { const h = s.querySelector('h1'); if (h) { h.id = 'sheet-title'; s.setAttribute('aria-labelledby', 'sheet-title'); } }
  async function showSheet(info, token) {
    const open = $sheet();
    if (open) {
      await swapWindow(open, info);
      if (token !== seq) return;
      label(open);
      const bar = document.querySelector('.toolbar--sheet');
      if (bar && info.sheetBar) bar.replaceChildren(...copy(info.sheetBar.children));
      return;
    }
    opener = document.activeElement;
    const sheet = buildSheet(copy(info.main.children));
    if (info.sheetBar) space.append(document.importNode(info.sheetBar, true));
    const opening = windows.openSheet(sheet);
    const h = sheet.querySelector('h1');
    if (h) h.focus({ preventScroll: true });
    await opening;
  }
  async function closeSheet() {
    const back = opener;
    opener = null;
    await windows.closeSheet();
    if (back && back.isConnected && !back.closest('[inert]')) back.focus({ preventScroll: true });
  }
  // closing a sheet opened from inside the site is going back; one loaded directly goes to its parent
  function close() {
    if (!$sheet()) return;
    const st = history.state || {};
    if (st.inside && st.sheet) history.back();
    else go(new URL(html.dataset.parent || '../', location.href).href);
  }

  // ---------- going somewhere ----------
  async function go(href, { push = true } = {}) {
    const url = new URL(href, location.href);
    const token = ++seq;
    pin();
    try {
      if (url.pathname === shown) {                                   // same page: a #target, or back to the top
        if (push) history.replaceState(history.state, '', url.href);
        if (url.hash) reveal(url.hash); else top();
        return;
      }
      const doc = await load(url.href);
      if (token !== seq) return;
      const info = read(doc);
      if (!info.main) throw new Error('no window in ' + url.pathname);
      const sheetToSheet = info.kind === 'sheet' && !!$sheet();
      if (push) {
        const state = { v5: true, inside: sheetToSheet ? !!(history.state && history.state.inside) : true, sheet: info.kind === 'sheet' };
        if (sheetToSheet) history.replaceState(state, '', url.href);  // paging through projects is one place in history
        else history.pushState(state, '', url.href);
      }
      remember();
      shown = url.pathname;
      let moved = true;
      if (info.kind === 'sheet') await showSheet(info, token);
      else moved = await showPage(info, url, token);
      if (token !== seq) return;
      finish(info, url, moved, !push);
    } catch (e) {
      console.warn('v5: navigation fell back to a page load', e);
      location.assign(url.href);
    }
  }
  function finish(info, url, moved, restoring) {
    document.title = info.title;
    document.dispatchEvent(new CustomEvent('v5:navigate', { detail: { page: info.page, kind: info.kind } }));
    Object.assign(html.dataset, { page: info.page, kind: info.kind, tab: info.tab });
    if (info.parent) html.dataset.parent = info.parent; else delete html.dataset.parent;
    const front = $front();
    const live = document.querySelector('.sr-live');
    if (live) live.textContent = `${info.title.split(' · ')[0]}, ${info.kind === 'sheet' ? 'sheet' : 'page'}`;
    if (!moved) return;
    const h = front.querySelector('h1');
    if (h && document.activeElement !== h) h.focus({ preventScroll: true });
    const body = front.querySelector('.win__body');
    if (restoring && scrolls.has(url.pathname)) { if (body) body.scrollTop = scrolls.get(url.pathname); }
    else if (url.hash) requestAnimationFrame(() => reveal(url.hash, true));
    else if (body) body.scrollTop = 0;
  }
  // where each window was scrolled, for Back and Forward
  function remember() {
    const m = $main().querySelector('.win__body'), s = $sheet() && $sheet().querySelector('.win__body');
    if (m && under) scrolls.set(under, m.scrollTop);
    if (s) scrolls.set(shown, s.scrollTop);
  }
  function reveal(hash, instant) {
    const el = document.getElementById(decodeURIComponent(hash.slice(1)));
    if (!el) return;
    el.scrollIntoView({ behavior: instant || reduced.matches ? 'auto' : 'smooth', block: 'start' });
    if (!el.matches('a[href], button, input, select, textarea, [tabindex]')) el.setAttribute('tabindex', '-1');
    el.focus({ preventScroll: true });
  }
  function top() {
    const body = $front().querySelector('.win__body');
    if (body) body.scrollTo({ top: 0, behavior: reduced.matches ? 'auto' : 'smooth' });
  }

  // ---------- links, keys, history ----------
  function inside(a) {
    if (!a || (a.target && a.target !== '_self') || a.hasAttribute('download')) return null;
    const url = new URL(a.href, location.href);
    if (url.origin !== location.origin || !url.pathname.startsWith(ROOT) || !/\/$|\.html?$/.test(url.pathname)) return null;
    return url;
  }
  document.addEventListener('click', (e) => {
    if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
    const a = e.target.closest && e.target.closest('a[href]');
    const url = inside(a);
    if (!url) return;
    e.preventDefault();
    if (a.hasAttribute('data-close')) close();
    else go(url.href);
  });
  const warm = (e) => { const url = inside(e.target.closest && e.target.closest('a[href]')); if (url && url.pathname !== shown) load(url.href).catch(() => {}); };
  document.addEventListener('pointerover', warm, { passive: true });
  document.addEventListener('focusin', warm);
  addEventListener('keydown', (e) => { if (e.key === 'Escape' && $sheet() && !e.defaultPrevented) { e.preventDefault(); close(); } });
  addEventListener('popstate', () => { pin(); go(location.href, { push: false }); });

  // ---------- a project loaded directly: show it as a sheet in front of its parent ----------
  async function bootSheet() {
    const parts = () => [$main(), ...document.querySelectorAll('aside.side'), document.querySelector('nav.tabs'), ...document.querySelectorAll('.space > .toolbar'), document.querySelector('.grab')].filter(Boolean);
    windows.hideNow(parts());
    const parentUrl = new URL(html.dataset.parent || '../', location.href);
    let doc = null;
    try { doc = await Promise.race([load(parentUrl.href), new Promise(r => setTimeout(r, 600, null))]); } catch (e) { doc = null; }
    const info = doc && read(doc);
    if (!info || !info.main) {                                        // no parent: the project stays the only window
      under = location.pathname;
      parts().forEach(el => windows.settle(el));
      html.classList.remove('is-booting');
      return;
    }
    const main = $main();
    const sheet = buildSheet([...main.children]);
    main.replaceChildren(...copy(info.main.children));
    main.after(...copy(info.sides));
    if (info.bar) space.insertBefore(document.importNode(info.bar, true), document.querySelector('.space > .toolbar--sheet'));
    if (!document.querySelector('.grab') && info.grab) space.append(document.importNode(info.grab, true));
    under = parentUrl.pathname;
    windows.refresh();
    windows.setTab(info.tab);
    parts().forEach(el => windows.settle(el));
    await windows.openSheet(sheet, { instant: true });
    html.classList.remove('is-booting');
    const h = sheet.querySelector('h1');
    if (h) h.focus({ preventScroll: true });
  }
  if (html.dataset.kind === 'sheet') bootSheet();

  return { go, close };
}

// Rewrites relative links and image sources as root-relative ones, so they survive the address changing under them.
function absolutize(root, base, { links = true, media = true } = {}) {
  const fix = (v) => {
    if (!v || v.startsWith('#') || /^(mailto:|tel:|data:|javascript:)/i.test(v)) return v;
    try { const u = new URL(v, base); return u.origin === location.origin ? u.pathname + u.search + u.hash : u.href; } catch (e) { return v; }
  };
  if (links) root.querySelectorAll('[href]').forEach(el => el.setAttribute('href', fix(el.getAttribute('href'))));
  if (!media) return;
  root.querySelectorAll('[src]').forEach(el => { const v = el.getAttribute('src'), f = fix(v); if (f !== v) el.setAttribute('src', f); });
  root.querySelectorAll('[srcset]').forEach(el => {
    const v = el.getAttribute('srcset');
    const f = v.split(',').map(part => { const [u, ...d] = part.trim().split(/\s+/); return [fix(u), ...d].join(' '); }).join(', ');
    if (f !== v) el.setAttribute('srcset', f);
  });
}
