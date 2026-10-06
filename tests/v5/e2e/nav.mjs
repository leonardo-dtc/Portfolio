// Moving around the room: pages swap in place (the side window too: it stays, and only its contents change),
// projects open as sheets, history and direct loads behave.
import { open, BASE, check } from './lib.mjs';

const settle = (page, ms = 800) => page.waitForTimeout(ms);
const gone = (page) => page.waitForFunction(() => !document.querySelector('section.sheet'), null, { timeout: 2500 }).then(() => true, () => false);
const text = (page, sel) => page.evaluate(s => { const el = document.querySelector(s); return el ? el.textContent.trim() : null; }, sel);

{
  const { browser, page, errors } = await open();
  await page.goto(BASE + '?nohello', { waitUntil: 'load' });
  await settle(page, 600);
  await page.evaluate(() => { window.__marker = 1; window.__side = document.querySelector('aside.side'); });

  await page.click('nav.tabs a[data-tab="work"]');
  await page.waitForURL('**/v5/work/');
  await settle(page);
  check(await page.evaluate(() => window.__marker === 1), 'no full reload between pages');
  check(await text(page, '#main h1') === 'Work', 'Work title in the window');
  check(await page.getAttribute('nav.tabs a[data-tab="work"]', 'aria-current') === 'page', 'Work tab is current');
  check(await page.evaluate(() => document.title.startsWith('Work')), 'the document title follows');
  // one side window, the same element as Home's: it stays where it is and its contents change
  // (round three: Work's Experiments moved out of the side window into the main window, under the cards)
  check(await page.waitForFunction(() => document.querySelectorAll('aside.side').length === 1 && document.querySelector('aside.side') === window.__side && !!document.querySelector('aside.side #progress-h') && !!document.querySelector('#main #exp-h'), null, { timeout: 2500 }).then(() => true, () => false), 'Work’s In progress fills the same side window; its Experiments sit in the main window');
  check(await page.evaluate(() => { const a = document.querySelector('aside.side'); return a.getAttribute('aria-labelledby') === 'progress-h' && a.querySelectorAll(':scope > .probe').length === 4 && !a.style.transform; }), 'the side window keeps its probes and its place, and takes the new labels');
  check(await page.evaluate(() => new URL(document.querySelector('nav.tabs a[data-tab="home"]').href).pathname === '/v5/'), 'tab links still resolve after the address changed');

  await page.click('a[href$="loquar/"]');
  await page.waitForURL('**/v5/work/loquar/');
  await settle(page, 900);
  check(await text(page, 'section.sheet h1') === 'Loquar', 'Loquar opens as a sheet');
  check(await page.evaluate(() => document.querySelector('#main').inert), 'the window behind is inert');
  check(await page.evaluate(() => document.activeElement === document.querySelector('section.sheet h1')), 'focus moves into the sheet');

  await page.click('.toolbar--sheet a[href$="daedalus/"]');
  await page.waitForURL('**/v5/work/daedalus/');
  await settle(page);
  check(await text(page, 'section.sheet h1') === 'Daedalus', 'next swaps the sheet to Daedalus');
  check(await page.locator('section.sheet').count() === 1, 'still one sheet');

  await page.keyboard.press('Escape');
  await page.waitForURL('**/v5/work/');
  check(await gone(page), 'Escape closes the sheet, back to Work');
  check(await page.evaluate(() => !document.querySelector('#main').inert), 'Work is live again');

  await page.goForward();
  await page.waitForURL('**/v5/work/daedalus/');
  await settle(page);
  check(await page.locator('section.sheet').count() === 1, 'Forward reopens it');
  await page.goBack();
  await page.waitForURL('**/v5/work/');
  check(await gone(page), 'Back closes it');

  await page.goBack();
  await page.waitForURL(u => u.pathname === '/v5/');
  await settle(page);
  check(await page.evaluate(() => !!document.querySelector('#main h1.name')), 'Back to Home restores its window');
  await settle(page, 400);
  check(await page.evaluate(() => { const h = document.querySelector('#main h1.name'); return h.textContent.trim() === 'Leonardo Carvalho' && getComputedStyle(h).opacity === '1' && !!document.querySelector('[data-clock]'); }), 'the text title (and Groton’s time) return with Home');

  await page.click('a.row[href$="resume/#amora"]');
  await page.waitForURL('**/v5/resume/#amora');
  await settle(page, 1200);
  check(await page.evaluate(() => { const b = document.querySelector('#main .win__body'), t = document.getElementById('amora'); const r = t.getBoundingClientRect(), rb = b.getBoundingClientRect(); return b.scrollTop > 200 && r.top >= rb.top - 2 && r.top < rb.top + 120; }), 'a link to a résumé entry opens the résumé at that entry');

  await page.click('nav.tabs a[data-tab="hockey"]');
  await page.waitForURL('**/v5/hockey/');
  await settle(page);
  await page.goBack();
  await page.waitForURL('**/v5/resume/#amora');
  await settle(page);
  check(await page.evaluate(() => document.querySelector('#main .win__body').scrollTop > 200), 'Back restores the résumé’s scroll');
  check(errors.length === 0, 'no console errors ' + errors.join(' | '));
  await browser.close();
}
{
  const { browser, page, errors } = await open();
  await page.goto(BASE + 'work/genuvalens/', { waitUntil: 'load' });
  await settle(page, 1000);
  check(await text(page, '#main h1') === 'Work' && await text(page, 'section.sheet h1') === 'Genuvalens', 'a direct load shows the sheet over Work');
  check(await page.evaluate(() => !document.documentElement.classList.contains('is-booting')), 'the boot cover is gone');
  await page.click('section.sheet .close');
  await page.waitForURL('**/v5/work/');
  check(await gone(page) && await text(page, '#main h1') === 'Work', 'closing a direct-loaded sheet leaves Work');
  check(errors.length === 0, 'no console errors ' + errors.join(' | '));
  await browser.close();
}
{
  // phones: the same moves, with the sheet over the whole screen
  const { browser, page, errors } = await open({ width: 390, height: 844 });
  await page.goto(BASE + 'work/', { waitUntil: 'load' });
  await settle(page, 600);
  await page.click('a.card[href$="ocapex/"]');
  await page.waitForURL('**/v5/work/ocapex/');
  await settle(page, 900);
  check(await text(page, 'section.sheet h1') === 'OCAPEX', 'phone: OCAPEX opens as a sheet');
  await page.click('section.sheet .close');
  await page.waitForURL('**/v5/work/');
  check(await gone(page), 'phone: the close button closes it');
  check(errors.length === 0, 'no console errors ' + errors.join(' | '));
  await browser.close();
}
{
  // quick tab clicks: the toolbars and side windows of pages passed through must not pile up
  const { browser, page, errors } = await open();
  await page.goto(BASE + '?nohello', { waitUntil: 'load' });
  await settle(page, 700);
  for (const [tab, gap] of [['work', 250], ['hockey', 150], ['about', 300], ['resume', 120], ['work', 400], ['hockey', 200]]) {
    await page.click(`nav.tabs a[data-tab="${tab}"]`);
    await page.waitForTimeout(gap);
  }
  await settle(page, 2000);
  const r = await page.evaluate(() => ({
    bars: document.querySelectorAll('.space > .toolbar').length,
    sides: document.querySelectorAll('aside.side').length,
    side: !!document.getElementById('measure-h') && !!document.getElementById('coaches-h'),
    title: document.querySelector('#main h1').textContent.trim(),
    tab: document.querySelector('nav.tabs a[aria-current="page"]').dataset.tab,
    path: location.pathname,
  }));
  check(r.bars === 1, `quick tab clicks leave one toolbar (${r.bars})`);
  check(r.sides === 1, `quick tab clicks leave one side window (${r.sides})`);
  check(r.path === '/v5/hockey/' && r.tab === 'hockey' && r.title.startsWith('Leonardo Carvalho, goaltender') && r.side, 'the last click wins: Hockey, with its tab, title and side window');
  check(errors.length === 0, 'no console errors ' + errors.join(' | '));
  await browser.close();
}
{
  // the Résumé's Sections follow the reader, and landing on an entry lights it (without WebGL, so timing is real)
  const { browser, page, errors } = await open({ noGL: true });
  const current = () => page.evaluate(() => [...document.querySelectorAll('.toc a[aria-current="true"]')].map(a => a.textContent).join('|'));
  await page.goto(BASE + '?nohello', { waitUntil: 'load' });
  await settle(page, 600);
  await page.click('a.row[href$="resume/#carnegie"]');
  await page.waitForFunction(() => document.documentElement.dataset.page === 'resume' && document.getElementById('carnegie'), null, { timeout: 4000 });
  // polled rather than after a fixed wait: V5_SLOW stretches fixed waits, and a stretched one outlasts the 1.2 s wash
  check(await page.waitForFunction(() => getComputedStyle(document.getElementById('carnegie')).animationName === 'landed', null, { timeout: 1000, polling: 30 }).then(() => true, () => false), 'landing on résumé/#carnegie lights the entry');
  check(await page.waitForFunction(() => [...document.querySelectorAll('.toc a[aria-current="true"]')].map(a => a.textContent).join('|') === 'Music', null, { timeout: 1000, polling: 30 }).then(() => true, () => false), 'and Sections marks Music');
  await page.waitForTimeout(1500);
  check(await page.evaluate(() => !document.getElementById('carnegie').classList.contains('is-landed')), 'the wash is gone after 1.2 s');
  await page.evaluate(() => { const b = document.querySelector('#main .win__body'), s = document.getElementById('athletics').closest('section'); b.scrollTop += s.getBoundingClientRect().top - b.getBoundingClientRect().top + 20; });
  await page.waitForTimeout(300);
  check(await current() === 'Athletics', 'scrolling to Athletics marks it');
  await page.click('.toc a[href$="#honors"]');
  check(await current() === 'Honors', 'a jump from Sections marks its target at once');
  await page.waitForTimeout(1200);
  check(await current() === 'Honors', 'and keeps it once the scroll arrives');
  check(errors.length === 0, 'no console errors ' + errors.join(' | '));
  await browser.close();
}
{
  // phones and laptops: a page change places the new side window by its role (windows.refresh after the swap)
  const { browser, page, errors } = await open({ width: 390, height: 844, noGL: true });
  await page.goto(BASE + 'work/', { waitUntil: 'load' });
  await settle(page, 600);
  await page.click('nav.tabs a[data-tab="hockey"]');
  await page.waitForURL('**/v5/hockey/');
  await settle(page);
  check(await page.evaluate(() => document.querySelector('#main .win__body').firstElementChild.matches('aside.side[data-inline="start"]') && !!document.getElementById('measure-h')), 'phone: after the swap, Hockey’s Measurables lead the window');
  await page.click('nav.tabs a[data-tab="resume"]');
  await page.waitForURL('**/v5/resume/');
  await settle(page);
  check(await page.evaluate(() => !!document.querySelector('#main > .side__part--pin .toc') && document.querySelector('#main .win__body').lastElementChild.matches('aside.side') && document.querySelectorAll('aside.side').length === 1), 'phone: the Résumé’s Sections are pinned and its Contact closes the page');
  await page.click('nav.tabs a[data-tab="home"]');
  await page.waitForURL(u => u.pathname === '/v5/');
  await settle(page);
  check(await page.evaluate(() => !document.querySelector('.side__part--pin') && document.querySelector('#main .win__body').lastElementChild.matches('aside.side')), 'phone: back on Home, nothing is pinned and This fall closes the page');
  check(errors.length === 0, 'no console errors ' + errors.join(' | '));
  await browser.close();
}
// phones: the six tabs fill the dock, apart and clear of the colour control; under 400px the control leaves the dock
// for the front window's actions at its foot (on Work, whose inline toolbar is its filters, a row of its own at the
// foot, not one more filter), and from 400px it keeps its corner
{
  const rows = [];
  for (const [w, h] of [[360, 640], [375, 667], [390, 844], [430, 932]]) {
    const { browser, page, errors } = await open({ width: w, height: h, touch: true });
    for (const path of ['work/', 'hockey/']) {
      await page.goto(BASE + path, { waitUntil: 'load' });
      await settle(page, 900);
      rows.push({ w, path, ...await page.evaluate(() => {
        const bar = document.querySelector('.tabs').getBoundingClientRect(), tabs = [...document.querySelectorAll('.tabs a')].map(a => a.getBoundingClientRect());
        const btn = document.querySelector('.hue__button'), b = btn.getBoundingClientRect(), home = btn.parentElement;
        const over = (p, q) => Math.min(p.right, q.right) - Math.max(p.left, q.left) > 1 && Math.min(p.bottom, q.bottom) - Math.max(p.top, q.top) > 1;
        return {
          six: tabs.length === 6, inside: tabs.every(t => t.left >= bar.left - 1 && t.right <= bar.right + 1),
          apart: tabs.every((t, i) => tabs.every((u, j) => i === j || !over(t, u))), clear: tabs.every(t => !over(t, b)),
          where: home.classList.contains('hue') ? 'corner' : home.classList.contains('hue__row') ? 'row' : home.classList.contains('filters') ? 'filters' : 'actions',
          foot: !!home.closest('.win__body') && home.closest('.win__body').lastElementChild === home,
        };
      }) });
    }
    check(errors.length === 0, `phone ${w}: no console errors ` + errors.join(' | '));
    await browser.close();
  }
  const bad = rows.filter(r => !r.six || !r.inside || !r.apart || !r.clear || (r.w < 400 ? (r.path === 'work/' ? r.where !== 'row' || !r.foot : r.where !== 'actions') : r.where !== 'corner'));
  check(bad.length === 0, `phones: six tabs fill the dock apart and clear of the colour control, which under 400px joins the window's actions (on Work a row of its own at the foot) and from 400px keeps its corner (${rows.map(r => `${r.w} ${r.path} ${r.where}`).join(', ')})`, JSON.stringify(bad));
}
