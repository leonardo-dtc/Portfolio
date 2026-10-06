// The archive page's Listening window, after Spotify on Vision Pro: its card shows the newest song, Previous and Next
// step through them (and stay where they are), the list marks the one shown, an address names one, and it still
// works after a page swaps in, with the keyboard, under reduced motion, without the script, in print and in forced
// colours. The songs are the ones in archive/ (tools/v5-chrome.mjs reads them).
import { open, BASE, check } from './lib.mjs';
import { ringContrast } from './measure.mjs';
import { HEARD } from '../../../tools/v5-chrome.mjs';

const at = n => HEARD[(n + HEARD.length) % HEARD.length];
const card = page => page.evaluate(() => {
  const q = s => document.querySelector(s);
  const cur = [...document.querySelectorAll('.track__go[aria-current="true"]')];
  return { title: q('.player__title').textContent, by: q('.player__by').textContent, art: q('.player__now .art b').textContent, href: q('.player__listen').getAttribute('href'), current: cur.map(a => a.closest('.track').id), live: (q('.sr-live') || {}).textContent || '' };
});
const shows = (c, n) => c.title === at(n).title && c.by === at(n).by && c.art === at(n).title && c.href === at(n).listen.href && c.current.length === 1 && c.current[0] === at(n).id;
const press = async (page, d) => { await page.click(`.player__skip[data-skip="${d}"]`); await page.waitForTimeout(80); };

check(HEARD.length >= 2, `archive/ has songs to step through (${HEARD.length})`);

for (const [w, h, where] of [[1440, 900, 'the side window'], [390, 844, 'inside the window']]) {
  const { browser, page, errors, foreign } = await open({ width: w, height: h, touch: w < 700 });
  await page.goto(BASE + 'archive/', { waitUntil: 'load' });
  await page.waitForTimeout(600);
  check(await page.evaluate(() => !!document.querySelector('aside.side [data-player] h2#listening')), `${w}: Listening is ${where}`);
  check(shows(await card(page), 0), `${w}: the card shows the newest, ${at(0).title}, and its row is the one marked`);
  check(await page.getByRole('link', { name: 'Listen on Spotify', exact: true }).first().evaluate(a => a.matches('.player__listen.is-spotify')), `${w}: the capsule is named Listen on Spotify (when its words are cut to "Spotify" too) and is Spotify’s green`);
  // (measured from the window's own heading, as a phone's header folds once the window scrolls)
  const keyAt = () => page.evaluate(() => Math.round(document.querySelector('.player__skip[data-skip="1"]').getBoundingClientRect().top - document.getElementById('listening').getBoundingClientRect().top));
  const y0 = await keyAt();
  await press(page, 1);
  let c = await card(page);
  check(shows(c, 1), `${w}: Next shows ${at(1).title}, marks its row and points the capsule at it`);
  check(c.live === `${at(1).title}, ${at(1).by}`, `${w}: and says so to a screen reader ("${c.live}")`);
  await press(page, -1); await press(page, -1);
  check(shows(await card(page), -1), `${w}: Previous from the newest goes round to the last, ${at(-1).title}`);
  let steady = true;
  for (let k = 0; k < HEARD.length; k++) {
    await press(page, 1);
    steady = steady && await keyAt() === y0;
  }
  check(steady, `${w}: Previous and Next stay where they are from song to song`);
  const sizes = await page.evaluate(() => {
    const p = document.querySelector('[data-player]'), small = [];
    const walk = document.createTreeWalker(p, NodeFilter.SHOW_TEXT);
    for (let t = walk.nextNode(); t; t = walk.nextNode()) if (t.textContent.trim() && parseFloat(getComputedStyle(t.parentElement).fontSize) < 12) small.push(t.textContent.trim());
    const box = s => [...p.querySelectorAll(s)].map(e => [e.offsetWidth, e.offsetHeight]);
    return { small, skip: box('.player__skip'), listen: box('.player__listen'), rows: box('.track__go') };
  });
  check(!sizes.small.length, `${w}: no words under 12px (${sizes.small.join(', ')})`);
  check(sizes.skip.every(([a, b]) => a >= 44 && b >= 44) && sizes.listen.every(([, b]) => b >= 44) && sizes.rows.every(([, b]) => b >= 44), `${w}: every control is at least 44px (${JSON.stringify(sizes)})`);
  check(await page.evaluate(() => [...document.querySelectorAll('.player__skip, .player__listen, a.track__go')].every(e => e.hasAttribute('data-hover'))), `${w}: its controls answer the pointer with light, as the rest of the room does`);
  await page.waitForTimeout(300);
  check(errors.length === 0, `${w}: no console errors ${errors.join(' | ')}`);
  check(foreign.length === 0, `${w}: no third-party requests ${foreign.join(' ')}`);
  await browser.close();
}

// an address names a song; a later one changes it
{
  const { browser, page, errors } = await open();
  await page.goto(BASE + `archive/#${at(-1).id}`, { waitUntil: 'load' });
  await page.waitForTimeout(400);
  check(shows(await card(page), -1), `archive/#${at(-1).id} shows ${at(-1).title}`);
  await page.evaluate(id => { location.hash = id; }, at(1).id);
  await page.waitForTimeout(200);
  check(shows(await card(page), 1), `and #${at(1).id} then shows ${at(1).title}`);
  check(errors.length === 0, `no console errors ${errors.join(' | ')}`);
  await browser.close();
}

// after the page swaps in from another (the tab bar), and from the keyboard
{
  const { browser, page, errors } = await open();
  await page.goto(BASE + '?nohello', { waitUntil: 'load' });
  await page.waitForTimeout(500);
  await page.click('nav.tabs a[data-tab="archive"]');
  await page.waitForFunction(() => document.documentElement.dataset.page === 'archive' && document.querySelector('[data-player]'), null, { timeout: 4000 });
  await page.waitForTimeout(600);
  await press(page, 1);
  check(shows(await card(page), 1), 'after the Archive tab swaps the page in, Next still steps');
  let on = false;
  for (let i = 0; i < 90 && !on; i++) { await page.keyboard.press('Tab'); on = await page.evaluate(() => document.activeElement && document.activeElement.matches('.player__skip[data-skip="1"]')); }
  check(on, 'Tab reaches Next');
  check(await page.evaluate(() => getComputedStyle(document.activeElement).outlineStyle !== 'none'), 'with a focus ring');
  await page.keyboard.press('Enter'); await page.waitForTimeout(80);
  check(shows(await card(page), 2), `Enter on Next shows ${at(2).title}`);
  await page.keyboard.press('Space'); await page.waitForTimeout(80);
  check(shows(await card(page), 3), `and Space the one after, ${at(3).title}`);
  check(errors.length === 0, `no console errors ${errors.join(' | ')}`);
  await browser.close();
}

// a song with a cover of its own (archive/covers/) shows it on the card in the drawing's place, and the next without
// one brings the drawing back (a picture already on the site stands in for the cover here)
{
  const { browser, page, errors } = await open();
  await page.goto(BASE + 'archive/', { waitUntil: 'load' });
  await page.waitForTimeout(400);
  await page.evaluate(() => { document.querySelectorAll('.track')[1].dataset.cover = '../assets/img/genuvalens-hardware-crop-320.webp'; });
  await press(page, 1);
  await page.waitForFunction(() => { const i = document.querySelector('.player__now .art img'); return i && i.complete && i.naturalWidth > 0; }, null, { timeout: 4000 }).catch(() => {});
  const on = await page.evaluate(() => { const a = document.querySelector('.player__now .art'), i = a.querySelector('img'), r = a.getBoundingClientRect(), ri = i && i.getBoundingClientRect(); return { cls: a.classList.contains('art--img'), src: i && i.getAttribute('src'), loaded: !!i && i.naturalWidth > 0, fills: !!ri && Math.abs(ri.width - r.width) < 1 && Math.abs(ri.height - r.height) < 1, words: getComputedStyle(a.querySelector('b')).display }; });
  check(on.cls && on.loaded && on.fills && on.words === 'none' && /genuvalens-hardware-crop-320\.webp$/.test(on.src), `a cover fills the card in the drawing's place (${JSON.stringify(on)})`);
  await press(page, 1);
  const off = await page.evaluate(() => { const a = document.querySelector('.player__now .art'); return { cls: a.classList.contains('art--img'), img: !!a.querySelector('img'), words: getComputedStyle(a.querySelector('b')).display }; });
  check(!off.cls && !off.img && off.words !== 'none', 'and the next song without one has its drawing back');
  check(errors.length === 0, `no console errors ${errors.join(' | ')}`);
  await browser.close();
}

// reduced motion: the card changes at once
{
  const { browser, page } = await open({ reduced: true });
  await page.goto(BASE + 'archive/', { waitUntil: 'load' });
  await page.waitForTimeout(400);
  await press(page, 1);
  // (reduced motion crossfades colours site-wide, as the glow under the artwork does here; nothing may move)
  const moving = await page.evaluate(() => document.querySelector('.player__now').getAnimations({ subtree: true }).filter(a => a.animationName || /translate|transform|scale|rotate/.test(a.transitionProperty)).map(a => a.animationName || a.transitionProperty));
  check(!moving.length, `reduced motion: Next changes the card in place, with nothing sliding (${moving.join(', ')})`);
  await browser.close();
}

// without the script: the newest on the card, no Previous or Next, and every row opens its song
{
  const { browser, page } = await open({ js: false });
  await page.goto(BASE + 'archive/', { waitUntil: 'load' });
  check(shows(await card(page), 0), 'without the script the card shows the newest');
  check(await page.evaluate(() => [...document.querySelectorAll('.player__skip')].every(b => getComputedStyle(b).visibility === 'hidden')), 'and Previous and Next do not show');
  const rows = await page.evaluate(() => [...document.querySelectorAll('.track__go')].map(a => a.getAttribute('href')));
  check(rows.length === HEARD.length && rows.every((r, i) => r === HEARD[i].listen.href), 'every row opens its song where it plays');
  await browser.close();
}

// print keeps the list, not the card; forced colours drop the drawn artwork and outline the capsule
{
  const { browser, page } = await open();
  await page.goto(BASE + 'archive/', { waitUntil: 'load' });
  await page.waitForTimeout(300);
  await page.emulateMedia({ media: 'print' });
  check(await page.evaluate(() => getComputedStyle(document.querySelector('.player__now')).display === 'none' && [...document.querySelectorAll('.track')].every(t => getComputedStyle(t).display !== 'none')), 'print: the list of songs, without the card');
  await page.emulateMedia({ media: 'screen', forcedColors: 'active' });
  check(await page.evaluate(() => getComputedStyle(document.querySelector('.player__now .art')).display === 'none' && [...document.querySelectorAll('.player__listen, .player__skip')].every(b => parseFloat(getComputedStyle(b).borderTopWidth) >= 1)), 'forced colours: no drawn artwork, and the capsule and the keys keep an edge');
  check(await page.evaluate(() => { const s = getComputedStyle(document.querySelector('.track__go[aria-current="true"]')); return s.outlineStyle === 'solid' && parseFloat(s.outlineWidth) >= 2; }), 'forced colours: the row on the card is outlined, as the current tab is');
  await browser.close();
}

// its words keep 4.5:1 against what is behind them (as tests/v5/e2e/contrast.mjs measures), by night and by day, in
// the side window and inside the window on a phone; the capsule's black on Spotify's green is 11:1 on its own
for (const scheme of ['dark', 'light']) for (const [w, h] of [[1440, 900], [390, 844]]) {
  const { browser, page } = await open({ width: w, height: h, scheme, touch: w < 700 });
  await page.goto(BASE + 'archive/', { waitUntil: 'load' });
  await page.waitForTimeout(1400);
  if (w < 1360) { await page.evaluate(() => document.getElementById('listening').scrollIntoView({ block: 'start' })); await page.waitForTimeout(900); }
  const boxes = await page.$$eval('#listening, .player__title, .player__by, .player__line, .track__t b, .track__t small', els => els.map(e => {
    const r = e.getBoundingClientRect(), c = getComputedStyle(e).color.match(/[\d.]+/g).map(Number);
    return { x: r.left, y: r.top, w: r.width, h: r.height, c, t: e.textContent.trim().slice(0, 32) };
  }).filter(b => b.w > 8 && b.h > 8 && b.y > 30 && b.y + b.h < innerHeight - 90 && b.t));
  const ratios = await ringContrast(page, boxes), low = boxes.map((b, i) => [b.t, ratios[i]]).filter(([, r]) => r < 4.5);
  check(boxes.length >= 6 && !low.length, `${scheme === 'dark' ? 'night' : 'day'} ${w}: ${boxes.length} lines of the player at 4.5:1 or more (lowest ${Math.min(...ratios).toFixed(2)}:1)${low.length ? ': ' + low.map(([t, r]) => `“${t}” ${r.toFixed(2)}`).join(', ') : ''}`);
  await browser.close();
}
