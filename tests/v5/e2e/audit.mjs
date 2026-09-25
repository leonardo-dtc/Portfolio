// Visual audit: across many window sizes and every page, finds things that clash or break:
// glass pieces outside the screen or overlapping each other, text overflowing its window, text over text,
// card captions running into their pictures, clipped toolbars, overflowing side windows, missing images.
// Usage: node tests/v5/e2e/audit.mjs [size,…]   Prints one line per problem; exit code 1 if any.
import { open, BASE, PAGES } from './lib.mjs';

const SIZES = {
  d1920: [1920, 1080], d1536: [1536, 864], d1440: [1440, 900], d1366: [1366, 768], l1280: [1280, 720],
  l1024: [1024, 768], t820: [820, 1180], t768: [768, 1024], p430: [430, 932], p390: [390, 844], p360: [360, 740], pl844: [844, 390],
};
const want = process.argv[2] ? process.argv[2].split(',') : Object.keys(SIZES);
let problems = 0;

function inspect(opts) {
  const out = [];
  const W = innerWidth, H = innerHeight;
  const vis = el => { if (!el) return false; const s = getComputedStyle(el); if (s.display === 'none' || s.visibility === 'hidden' || +s.opacity < .05) return false; const r = el.getBoundingClientRect(); return r.width > 1 && r.height > 1; };
  const box = el => {
    const probes = el.querySelectorAll(':scope > .probe');
    if (probes.length === 4 && !el.classList.contains('side--inline')) {
      const pts = [...probes].map(p => p.getBoundingClientRect());
      const xs = pts.map(p => p.left), ys = pts.map(p => p.top);
      return { left: Math.min(...xs), right: Math.max(...xs), top: Math.min(...ys), bottom: Math.max(...ys) };
    }
    const r = el.getBoundingClientRect(); return { left: r.left, right: r.right, top: r.top, bottom: r.bottom };
  };
  const over = (a, b) => Math.max(0, Math.min(a.right, b.right) - Math.max(a.left, b.left)) * Math.max(0, Math.min(a.bottom, b.bottom) - Math.max(a.top, b.top));
  const gapX = (a, b) => Math.max(a.left - b.right, b.left - a.right);
  const name = el => el.matches('aside.side') ? `side:${el.dataset.side}` : el.matches('nav.tabs') ? 'tabs' : el.matches('.toolbar--sheet') ? 'sheet-toolbar' : el.matches('.toolbar') ? 'toolbar' : el.matches('.grab') ? 'window-bar' : el.matches('section.sheet') ? 'sheet' : el.matches('#main') ? 'window' : el.matches('.hue') ? 'color-control' : el.className;

  // A. glass pieces stay on screen
  const pieces = [...document.querySelectorAll('#main, section.sheet:not(.is-closing), aside.side:not(.side--inline), nav.tabs, .space > .toolbar, .grab, .hue')].filter(vis).filter(el => !el.closest('.is-behind') || el.matches('#main, aside.side, nav.tabs'));
  for (const el of pieces) {
    const b = box(el);
    const outL = -b.left, outR = b.right - W, outT = -b.top, outB = b.bottom - H;
    const worst = Math.max(outL, outR, outT, outB);
    if (worst > 1) out.push(`${name(el)} runs ${Math.round(worst)}px off screen`);
  }
  // B. pieces that must not touch (the tab bar and toolbar may overlap the window's edge by design)
  const byName = Object.fromEntries(pieces.map(el => [name(el), el]));
  const pairs = [['tabs', 'side:left'], ['tabs', 'side:right'], ['toolbar', 'side:left'], ['toolbar', 'side:right'], ['window-bar', 'side:left'], ['window-bar', 'side:right'],
    ['window', 'side:left'], ['window', 'side:right'], ['toolbar', 'window-bar'], ['color-control', 'side:right'], ['color-control', 'toolbar'], ['color-control', 'window-bar'], ['color-control', 'tabs'], ['color-control', 'window'], ['color-control', 'sheet'], ['color-control', 'sheet-toolbar']];
  for (const [a, b] of pairs) {
    if (!byName[a] || !byName[b]) continue;
    if (W < 900 && a === 'color-control' && (b === 'window' || b === 'sheet')) continue;   // on phones it docks over the window, frosted
    const A = box(byName[a]), B = box(byName[b]);
    const o = over(A, B);
    if (o > 16) out.push(`${a} overlaps ${b} (${Math.round(o)}px²)`);
    else if (a === 'tabs' && b.startsWith('side') && gapX(A, B) < 12 && gapX(A, B) > -1) out.push(`${a} is ${Math.round(gapX(A, B))}px from ${b}`);
  }
  // C/D/E. inside the front window
  const front = document.querySelector('section.sheet:not(.is-closing)') || document.getElementById('main');
  const body = front && front.querySelector('.win__body');
  if (body) {
    const br = body.getBoundingClientRect(), cs = getComputedStyle(body);
    const inner = { left: br.left + parseFloat(cs.paddingLeft) - 1, right: br.right - parseFloat(cs.paddingRight) + 1 };
    const leaves = [...front.querySelectorAll('h1, h2, h3, p, li, dt, dd, td, th, figcaption, caption, .btn, .row__t, .row__m, .card__tag, .card__text b, .card__text span, .card__paper, .cv__when, .more')].filter(vis);
    for (const el of leaves) {
      if (el.closest('.tbl-wrap, .toolbar, .tabs')) continue;
      const r = el.getBoundingClientRect();
      if (r.bottom < br.top || r.top > br.bottom) continue;               // scrolled out of view
      if (el.closest('.win__body') && (r.right > inner.right + 1 || r.left < inner.left - 1)) out.push(`text runs past the window's edge: “${el.textContent.trim().slice(0, 40)}” (${Math.round(Math.max(r.right - inner.right, inner.left - r.left))}px)`);
      if (el.scrollWidth > el.clientWidth + 2 && getComputedStyle(el).overflowX !== 'visible' && !el.matches('.card__paper, .card__text span')) out.push(`text clipped inside “${el.textContent.trim().slice(0, 40)}”`);
    }
    // text over text (only between elements that are not nested)
    const texts = leaves.filter(el => !el.closest('.tbl-wrap') && el.children.length === 0 || el.matches('.card__text b, .card__tag, .row__t, .cv__when, .btn, h1'));
    const rects = texts.map(el => ({ el, r: el.getBoundingClientRect() })).filter(t => t.r.bottom > br.top && t.r.top < br.bottom);
    for (let i = 0; i < rects.length; i++) for (let j = i + 1; j < rects.length; j++) {
      const a = rects[i], b = rects[j];
      if (a.el.contains(b.el) || b.el.contains(a.el)) continue;
      const o = over(a.r, b.r);
      if (o > 24) out.push(`text overlaps text: “${a.el.textContent.trim().slice(0, 24)}” and “${b.el.textContent.trim().slice(0, 24)}” (${Math.round(o)}px²)`);
    }
    // captions into pictures on cards
    for (const card of front.querySelectorAll('.card')) {
      if (!vis(card)) continue;
      const t = card.querySelector('.card__text'), pic = card.querySelector('.card__shot, .card__page');
      if (!t || !pic) continue;
      const tr = t.getBoundingClientRect(), pr = pic.getBoundingClientRect();
      if (tr.top < pr.bottom - 2) out.push(`card caption runs into its picture: ${card.querySelector('b').textContent} (${Math.round(pr.bottom - tr.top)}px)`);
      const tag = card.querySelector('.card__tag');
      if (tag && tag.getBoundingClientRect().right > card.getBoundingClientRect().right - 4) out.push(`card tag too wide: ${card.querySelector('b').textContent}`);
    }
    // the home title and the avatar
    const name2 = front.querySelector('h1.name .name__svg'), av = front.querySelector('.win__head .avatar');
    if (name2 && vis(av) && over(name2.getBoundingClientRect(), av.getBoundingClientRect()) > 4) out.push('the written title overlaps the avatar');
    // head text into the close button
    const close = front.querySelector('.close'), h1 = front.querySelector('.win__head h1');
    if (close && h1 && over(close.getBoundingClientRect(), h1.getBoundingClientRect()) > 4) out.push('the close button overlaps the title');
  }
  // F. toolbars that clip their buttons
  for (const tb of document.querySelectorAll('.space > .toolbar')) if (vis(tb) && tb.scrollWidth > tb.clientWidth + 2) out.push(`${name(tb)} clips its buttons (${tb.scrollWidth - tb.clientWidth}px)`);
  // I. side windows that hide content
  for (const s of document.querySelectorAll('aside.side:not(.side--inline)')) if (vis(s) && s.scrollHeight > s.clientHeight + 4) out.push(`side:${s.dataset.side} hides ${s.scrollHeight - s.clientHeight}px of its content`);
  // J/K. images and page overflow
  for (const img of document.querySelectorAll('img')) if (vis(img) && img.complete && img.naturalWidth === 0) out.push(`image failed: ${img.getAttribute('src')}`);
  if (document.documentElement.scrollWidth > W + 1) out.push(`page scrolls sideways (${document.documentElement.scrollWidth - W}px)`);
  // the tab bar opened (desktop and laptop): it must not cover the window's text without frosting it
  return out;
}

for (const key of want) {
  const [w, h] = SIZES[key];
  const { browser, page, errors } = await open({ width: w, height: h });
  for (const p of PAGES) {
    await page.goto(BASE + p + (p ? '' : '?nohello'), { waitUntil: 'load' });
    await page.waitForTimeout(p.includes('work/') && p !== 'work/' ? 1100 : 800);
    const found = await page.evaluate(inspect);
    // the tab bar opened by the pointer
    let open = [];
    if (w >= 900) {
      const t = await page.$('nav.tabs');
      if (t && await t.isVisible() && !(await page.evaluate(() => !!document.querySelector('section.sheet')))) {
        const bb = await t.boundingBox();
        await page.mouse.move(bb.x + bb.width / 2, bb.y + bb.height / 2);
        await page.waitForTimeout(700);
        open = (await page.evaluate(inspect)).map(s => 'tab bar open: ' + s).filter(s => !found.includes(s.replace('tab bar open: ', '')));
        await page.mouse.move(w - 5, h / 2);
        await page.waitForTimeout(400);
      }
    }
    for (const s of [...found, ...open]) { problems++; console.log(`${key} ${p || 'home'}: ${s}`); }
  }
  if (errors.length) { problems += errors.length; console.log(`${key}: console errors: ${errors.join(' | ')}`); }
  await browser.close();
}
console.log(problems ? `${problems} problems` : 'no problems found');
process.exitCode = problems ? 1 : 0;
