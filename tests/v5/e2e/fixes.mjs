// The v5 bug audit of October 2026 (docs/editions/round-3.md, section 13), kept fixed: each check below repeats one of
// its findings and passes when the bug is gone. Without WebGL (the CSS glass), where every one of them showed.
import { open, BASE, PAGES, check } from './lib.mjs';

const { browser, page: first } = await open({ noGL: true });
await first.context().close();
const errors = [];
async function tab({ width = 1440, height = 900, touch = false, forced = false, reduced = false, scheme = 'dark', scale = 1, block } = {}) {
  const ctx = await browser.newContext({ viewport: { width, height }, deviceScaleFactor: scale, colorScheme: scheme, reducedMotion: reduced ? 'reduce' : 'no-preference', forcedColors: forced ? 'active' : 'none', ...(touch ? { hasTouch: true, isMobile: true } : {}) });
  if (block) await ctx.route(block, r => r.abort());
  const page = await ctx.newPage();
  page.on('pageerror', e => errors.push(e.message));
  return page;
}
const done = page => page.context().close();
const go = async (page, path, settle = 1200) => { await page.goto(BASE + path, { waitUntil: 'load' }); await page.waitForTimeout(settle); };
const focused = page => page.evaluate(() => {
  const a = document.activeElement;
  if (!a || a === document.body) return 'nothing';
  if (a.matches('h1')) return a.closest('section.sheet') ? 'the sheet title' : 'the window title';
  return a.closest('.toolbar--sheet') ? 'the pager' : a.matches('.win__body') ? 'the window body' : a.matches('.skip') ? 'the skip link' : a.tagName.toLowerCase();
});

// 1. Phones: once the header folds, the window keeps its width (the folded title is one line with an ellipsis)
for (const [w, path] of [[390, 'work/freecode/'], [360, 'work/aducanumab/'], [320, 'about/']]) {
  const page = await tab({ width: w, height: 760, touch: true });
  await go(page, path);
  const r = await page.evaluate(async () => {
    const win = document.querySelector('section.sheet') || document.getElementById('main');
    win.querySelector('.win__body').scrollTop = 300;
    await new Promise(res => setTimeout(res, 700));
    const box = el => el.getBoundingClientRect();
    return { folded: win.classList.contains('is-folded'), over: Math.round(Math.max(box(win.querySelector('.win__head')).right, box(win.querySelector('.win__body')).right) - box(win).right) };
  });
  check(r.folded && r.over <= 0, `1. ${w}px, ${path}: folded, the header and the contents stay inside the window (${r.over}px past it)`);
  await done(page);
}

// 2. Printing from a phone with the header folded prints the whole header
{
  const page = await tab({ width: 390, height: 844, touch: true });
  await go(page, 'resume/');
  await page.evaluate(async () => { document.querySelector('#main .win__body').scrollTop = 600; await new Promise(res => setTimeout(res, 800)); });
  const folded = await page.evaluate(() => document.getElementById('main').classList.contains('is-folded'));
  await page.emulateMedia({ media: 'print' });
  const s = await page.evaluate(() => ({ sub: getComputedStyle(document.querySelector('#main .win__head .sub')).display, h1: getComputedStyle(document.querySelector('#main h1')).fontSize }));
  check(folded && s.sub !== 'none' && s.h1 !== '21px', `2. printed with the header folded, the Résumé keeps its name and email line (${s.sub}) and its printed title size (${s.h1})`);
  await done(page);
}

// 3. Crossing 1360px with a sheet open: the side window steps back with the parent, and nothing stays behind after
{
  const page = await tab({ width: 1440, height: 900 });
  await go(page, 'work/');
  await page.click('a.card[href*="ocapex"]'); await page.waitForTimeout(1500);
  await page.setViewportSize({ width: 1024, height: 768 }); await page.waitForTimeout(800);
  await page.keyboard.press('Escape'); await page.waitForTimeout(1500);
  const a = await page.evaluate(() => { const s = document.querySelector('aside.side'); return { inert: s.inert || !!s.closest('[inert]'), behind: s.classList.contains('is-behind'), seen: getComputedStyle(s).opacity }; });
  check(!a.inert && !a.behind && a.seen === '1', `3. opened at 1440, closed at 1024: In progress is live and lit (inert ${a.inert}, behind ${a.behind}, opacity ${a.seen})`);
  await done(page);
}
{
  const page = await tab({ width: 1024, height: 768 });
  await go(page, 'work/');
  await page.click('a.card[href*="ocapex"]'); await page.waitForTimeout(1500);
  await page.setViewportSize({ width: 1440, height: 900 }); await page.waitForTimeout(800);
  const a = await page.evaluate(() => { const s = document.querySelector('aside.side'); return { inert: s.inert || !!s.closest('[inert]'), behind: s.classList.contains('is-behind') }; });
  check(a.inert && a.behind, `3. opened at 1024, widened to 1440: the floating side window is behind the sheet (inert ${a.inert}, behind ${a.behind})`);
  await done(page);
}

// 4. The fold never flickers on a page barely longer than its window
{
  const page = await tab({ width: 768, height: 1006 });
  await go(page, 'work/freecode/');
  await page.evaluate(() => { const w = document.querySelector('section.sheet'); window.__flips = 0; new MutationObserver(() => window.__flips++).observe(w, { attributes: true, attributeFilter: ['class'] }); });
  await page.mouse.move(384, 600); await page.mouse.wheel(0, 100); await page.waitForTimeout(4000);
  const flips = await page.evaluate(() => window.__flips);
  check(flips <= 2, `4. 768×1006, FreeCode, one turn of the wheel: the header changes ${flips} times (at most once each way)`);
  await done(page);
}

// 5. The keys scroll the window after a page change and a sheet opening (focus is on the title, above the scroller)
{
  const page = await tab({ width: 1440, height: 900 });
  await go(page, '?nohello', 900);
  await page.click('nav.tabs a[data-tab="about"]'); await page.waitForTimeout(1300);
  await page.keyboard.press('PageDown'); await page.waitForTimeout(800);
  const top = await page.evaluate(() => document.querySelector('#main .win__body').scrollTop);
  check(top > 0, `5. after the About tab, Page Down scrolls the window (${top}px)`);
  await page.click('nav.tabs a[data-tab="work"]'); await page.waitForTimeout(1300);
  await page.click('a.card[href*="loquar"]'); await page.waitForTimeout(1600);
  await page.keyboard.press('ArrowDown'); await page.keyboard.press('ArrowDown'); await page.waitForTimeout(700);
  const top2 = await page.evaluate(() => document.querySelector('section.sheet .win__body').scrollTop);
  check(top2 > 0, `5. in a sheet just opened, the Down arrow scrolls it (${top2}px)`);

  // 6. its pager comes after it in the tab order
  await page.evaluate(() => document.querySelector('section.sheet h1').focus());
  const trail = [];
  for (let i = 0; i < 8; i++) { await page.keyboard.press('Tab'); const f = await focused(page); trail.push(f); if (f === 'the pager' || f === 'the skip link') break; }
  check(trail.includes('the pager'), `6. Tab from the sheet's title reaches its pager (${trail.join(', ')})`);

  // 18. the title and the announcement come as a sheet opens, not after its animation
  await page.keyboard.press('Escape'); await page.waitForTimeout(1300);
  // (timed from the click itself, not from before Playwright's own wait for the card to hold still)
  const t0 = await page.evaluate(() => { window.__at = null; let t = performance.now(); document.addEventListener('click', () => { t = performance.now(); }, { capture: true, once: true }); new MutationObserver(() => { if (window.__at === null && /Daedalus/.test(document.title)) window.__at = performance.now() - t; }).observe(document.querySelector('title'), { childList: true, characterData: true, subtree: true }); return t; });
  await page.click('a.card[href*="daedalus"]'); await page.waitForTimeout(1600);
  const at = await page.evaluate(() => window.__at), live = await page.evaluate(() => document.querySelector('.sr-live').textContent);
  check(at !== null && at < 500 && /Daedalus/.test(live), `18. the title changes ${at === null ? 'never' : Math.round(at) + 'ms'} after the click, and the announcement says "${live}"`);
  void t0;
  await done(page);
}

// 7. By day the hero's line stands on its own darkened capsule (it measured 3:1 over the pale room)
{
  const page = await tab({ width: 390, height: 844, touch: true, scheme: 'light' });
  await go(page, '', 1500);
  const s = await page.evaluate(() => { const c = getComputedStyle(document.querySelector('.hero__line')); return (c.backdropFilter || c.webkitBackdropFilter || '') + ' | ' + c.backgroundColor; });
  check(/brightness\(0?\.5\)/.test(s), `7. by day the hero's line darkens what is behind it (${s})`);
  await done(page);
}

// 8. Forced colours keep every current or chosen state
{
  const page = await tab({ width: 1440, height: 900, forced: true });
  await go(page, 'work/');
  await page.click('.toolbar--filters [data-filter="research"]'); await page.waitForTimeout(800);
  const s = await page.evaluate(() => ({
    on: getComputedStyle(document.querySelector('.toolbar--filters [aria-pressed="true"]')).outlineStyle,
    off: getComputedStyle(document.querySelector('.toolbar--filters [aria-pressed="false"]')).outlineStyle,
    tab: getComputedStyle(document.querySelector('nav.tabs a[aria-current="page"]')).outlineStyle,
  }));
  check(s.on === 'solid' && s.off === 'none' && s.tab === 'solid', `8. forced colours: the chosen filter (${s.on}, the others ${s.off}) and the current tab (${s.tab}) are outlined`);
  await go(page, 'resume/');
  const dot = await page.evaluate(() => { const li = document.querySelector('.cv ul li'); return li ? getComputedStyle(li, '::before').backgroundColor : 'none'; });
  check(dot !== 'none' && !/rgba\(0, 0, 0, 0\)|transparent/.test(dot), `8. forced colours: the Résumé's bullets are drawn (${dot})`);
  await done(page);
}

// 9. Closing a sheet loaded on its own leaves focus on the window under it
{
  const page = await tab({ width: 1440, height: 900 });
  await go(page, 'work/loquar/', 1800);
  // (once Work has swapped in under it: the address changes first, and a slow fetch can hold the page a moment)
  await page.keyboard.press('Escape');
  await page.waitForFunction(() => document.documentElement.dataset.page === 'work' && !document.querySelector('section.sheet'), null, { timeout: 8000 }).catch(() => {});
  await page.waitForTimeout(300);
  const f = await focused(page);
  check(f === 'the window title', `9. Escape on a sheet loaded on its own: focus goes to ${f}`);
  await done(page);
}

// 10. "Skip to content" with a sheet open goes to the sheet
{
  const page = await tab({ width: 1440, height: 900 });
  await go(page, 'work/');
  await page.click('a.card[href*="loquar"]'); await page.waitForTimeout(1500);
  await page.focus('a.skip'); await page.keyboard.press('Enter'); await page.waitForTimeout(800);
  const f = await focused(page);
  check(f === 'the sheet title', `10. the skip link over an open sheet goes to ${f}`);
  await done(page);
}

// 11. If boot.js cannot load, Home is the page without scripts, never a blank stage
{
  const page = await tab({ width: 1280, height: 720, block: '**/assets/js/boot.js' });
  await go(page, '', 1500);
  const s = await page.evaluate(() => ({ cls: document.documentElement.className, main: getComputedStyle(document.getElementById('main')).opacity, hero: getComputedStyle(document.querySelector('.hero')).display }));
  check(!/\bis-hello\b|\bjs\b/.test(s.cls) && s.main === '1' && s.hero === 'none', `11. boot.js blocked: the window shows (opacity ${s.main}), the hero is gone (${s.hero}), classes "${s.cls}"`);
  await done(page);
}

// 12. Changing page, the old and new toolbars never show together
{
  let both = 0;
  for (let i = 0; i < 3; i++) {
    const page = await tab({ width: 1440, height: 900 });
    await go(page, '?nohello');
    await page.evaluate(() => { window.__both = 0; const t0 = performance.now(); const f = () => { if ([...document.querySelectorAll('.space > .toolbar')].filter(b => +getComputedStyle(b).opacity > .15).length > 1) window.__both++; if (performance.now() - t0 < 1500) requestAnimationFrame(f); }; requestAnimationFrame(f); });
    await page.click('nav.tabs a[data-tab="work"]'); await page.waitForTimeout(1700);
    both += await page.evaluate(() => window.__both);
    await done(page);
  }
  check(both === 0, `12. Home to Work, three times: ${both} frames show both toolbars`);
}

// 13. A page arriving in a folded window arrives unfolded at once: its contents never slide as they fade in
{
  const page = await tab({ width: 390, height: 844, touch: true });
  await go(page, '?nohello', 1000);
  await page.evaluate(async () => { document.querySelector('#main .win__body').scrollTop = 400; await new Promise(res => setTimeout(res, 600)); });
  const folded = await page.evaluate(() => document.getElementById('main').classList.contains('is-folded'));
  // (where the contents sit in the window, apart from the 6px rise every page's contents fade in with)
  await page.evaluate(() => { window.__tops = []; const t0 = performance.now(); const f = () => { const h = document.querySelector('#main h1'); if (h && /Work/.test(h.textContent)) window.__tops.push(document.querySelector('#main .win__body').offsetTop); if (performance.now() - t0 < 1800) requestAnimationFrame(f); }; requestAnimationFrame(f); });
  await page.tap('nav.tabs a[data-tab="work"]'); await page.waitForTimeout(2200);
  const tops = await page.evaluate(() => window.__tops);
  check(folded && tops.length > 3 && new Set(tops).size === 1, `13. from a folded Home to Work: the new contents start at one place throughout (${[...new Set(tops)].join(', ')}px down the window)`);
  await done(page);
}

// 14. The hero's launchers (design toggles) keep clear of the name, the hint and the screen's edges at every size
{
  const bad = [];
  for (const mode of ['icons', 'library', 'widgets', 'desktop']) {
    for (const [w, h] of [[320, 568], [360, 640], [375, 667], [568, 320], [667, 375], [844, 390], [768, 1024], [1024, 600], [1280, 800]]) {
      const page = await tab({ width: w, height: h });
      await page.goto(`${BASE}?toggles=launcher:${mode}`, { waitUntil: 'load' });
      await page.waitForSelector('.hero.is-ready', { timeout: 15000 }).catch(() => {});
      await page.waitForTimeout(700);
      const r = await page.evaluate(() => {
        const items = [];
        const add = (name, el) => { if (!el) return; const b = el.getBoundingClientRect(); if (b.width && b.height) items.push({ name, l: b.left, t: b.top, r: b.right, b: b.bottom }); };
        add('name', document.querySelector('.hero__text')); add('line', document.querySelector('.hero__line')); add('hint', document.querySelector('.hero__hint')); add('color', document.querySelector('.hue__button'));
        document.querySelectorAll('.app').forEach(a => add(a.dataset.app, a));
        const out = items.filter(i => i.l < -1 || i.t < -1 || i.r > innerWidth + 1 || i.b > innerHeight + 1).map(i => `${i.name} off screen`);
        for (let a = 0; a < items.length; a++) for (let c = a + 1; c < items.length; c++) {
          const A = items[a], C = items[c];
          if (Math.min(A.r, C.r) - Math.max(A.l, C.l) > 1 && Math.min(A.b, C.b) - Math.max(A.t, C.t) > 1) out.push(`${A.name} over ${C.name}`);
        }
        return out;
      });
      if (r.length) bad.push(`${mode} ${w}×${h}: ${r.join(', ')}`);
      await done(page);
    }
  }
  check(!bad.length, `14. every launcher at nine sizes, from 320×568 to 1280×800: nothing overlaps or leaves the screen${bad.length ? ' (' + bad.join('; ') + ')' : ''}`);
}

// 15. The About portrait is sharp on a 2× screen
{
  const page = await tab({ width: 1440, height: 900, scale: 2 });
  await go(page, 'about/');
  const src = await page.evaluate(() => document.querySelector('.portrait img').currentSrc.split('/').pop());
  check(/-600\./.test(src), `15. at 1440 on a 2× screen the portrait comes from the 600px file (${src})`);
  await done(page);
}

// 16, 17. The color button does not grow under reduced motion, and its panel closes when the keyboard moves past it
// (with the room: there is no color control without it)
{
  const gl = await open({ width: 1440, height: 900, reduced: true });
  const page = gl.page;
  page.on('pageerror', e => errors.push(e.message));
  await go(page, '?nohello', 1500);
  await page.hover('.hue__button'); await page.waitForTimeout(400);
  const grown = await page.evaluate(() => { const c = getComputedStyle(document.querySelector('.hue__button')); return c.scale + ' ' + c.transform; });
  check(/^(none|1) none$/.test(grown), `16. reduced motion: the color button keeps its size on hover (${grown})`);
  const expanded = () => page.evaluate(() => document.querySelector('.hue__button').getAttribute('aria-expanded'));
  await page.click('.hue__button'); await page.waitForTimeout(400);
  await page.evaluate(() => document.querySelector('.hue__reset').focus());
  await page.keyboard.press('Shift+Tab'); await page.waitForTimeout(400);
  const back = await expanded();
  await page.click('.hue__button'); await page.waitForTimeout(400);
  await page.evaluate(() => [...document.querySelectorAll('.hue__seg [role="radio"]')].find(x => x.tabIndex === 0).focus());
  const trail = [];
  for (let i = 0; i < 3 && (await expanded()) === 'true'; i++) { await page.keyboard.press('Tab'); await page.waitForTimeout(200); trail.push(await focused(page)); }
  const ahead = await expanded();
  check(back === 'false' && ahead === 'false', `17. the color panel closes when focus leaves it: Shift+Tab before Reset (${back === 'false' ? 'closed' : 'open'}), Tab past its last control (${ahead === 'false' ? 'closed' : 'open'}, via ${trail.join(', ')})`);
  await gl.browser.close();
}

// 19. Every window body, a tab stop, is a region named for its page
{
  const page = await tab();
  const unnamed = [];
  for (const p of PAGES) {
    const html = await (await page.request.get(BASE + p)).text();
    const tag = (html.match(/<div class="win__body"[^>]*>/) || [''])[0];
    if (!/role="region"/.test(tag) || !/aria-label="[^"]+"/.test(tag)) unnamed.push(p || 'home');
  }
  check(!unnamed.length, `19. every page's window body is a named region${unnamed.length ? ' (not: ' + unnamed.join(', ') + ')' : ''}`);

  // 21. the facts agree from page to page
  const text = async p => (await (await page.request.get(BASE + p)).text());
  const hockey = await text('hockey/'), home = await text(''), work = await text('work/');
  check(/<dt>Born<\/dt><dd>2009<\/dd>/.test(hockey) && /<dt>Hometown<\/dt><dd>South Florida<\/dd>/.test(hockey), '21. Hockey gives the year of birth alone, and South Florida as the hometown (About gives Beijing as the birthplace)');
  check(/principal violist<\/span><span class="row__m">2026 to now/.test(home), "21. Home's principal violist row dates from 2026, as the Résumé does");
  check(/archive\/#robots"[^]*?<span class="row__m">2023 to 2025/.test(work), "21. the FRC and FTC robots, in Java, date from 2023, when Java came");
  await done(page);
}

// 20. Without WebGL on a phone, nothing of the window under a sheet shows through it
{
  const page = await tab({ width: 390, height: 844, touch: true });
  await go(page, 'work/ocapex/', 1800);
  const o = await page.evaluate(() => getComputedStyle(document.getElementById('main')).opacity);
  check(+o < .05, `20. 390 without WebGL, a sheet open: the window under it is hidden (opacity ${o})`);
  await done(page);
}

check(!errors.length, `no script errors${errors.length ? ': ' + errors.slice(0, 3).join(' | ') : ''}`);
await browser.close();
