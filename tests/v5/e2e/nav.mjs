// Moving around the room: pages swap in place, projects open as sheets, history and direct loads behave.
import { open, BASE, check } from './lib.mjs';

const settle = (page, ms = 800) => page.waitForTimeout(ms);
const gone = (page) => page.waitForFunction(() => !document.querySelector('section.sheet'), null, { timeout: 2500 }).then(() => true, () => false);
const text = (page, sel) => page.evaluate(s => { const el = document.querySelector(s); return el ? el.textContent.trim() : null; }, sel);

{
  const { browser, page, errors } = await open();
  await page.goto(BASE + '?nohello', { waitUntil: 'load' });
  await settle(page, 600);
  await page.evaluate(() => { window.__marker = 1; });

  await page.click('nav.tabs a[data-tab="work"]');
  await page.waitForURL('**/v5/work/');
  await settle(page);
  check(await page.evaluate(() => window.__marker === 1), 'no full reload between pages');
  check(await text(page, '#main h1') === 'Work', 'Work title in the window');
  check(await page.getAttribute('nav.tabs a[data-tab="work"]', 'aria-current') === 'page', 'Work tab is current');
  check(await page.evaluate(() => document.title.startsWith('Work')), 'the document title follows');
  // Home's side windows swing out (a spring of about a second) before they are removed
  check(await page.waitForFunction(() => document.querySelectorAll('aside.side').length === 2 && !!document.getElementById('progress-h'), null, { timeout: 2500 }).then(() => true, () => false), 'Work’s side windows replaced Home’s');
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
  check(await page.evaluate(() => !window.__room || window.__room.state.ink.on > .9), 'the written title returns with Home');

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
    title: document.querySelector('#main h1').textContent.trim(),
    tab: document.querySelector('nav.tabs a[aria-current="page"]').dataset.tab,
    path: location.pathname,
  }));
  check(r.bars === 1, `quick tab clicks leave one toolbar (${r.bars})`);
  check(r.sides === 2, `quick tab clicks leave two side windows (${r.sides})`);
  check(r.path === '/v5/hockey/' && r.tab === 'hockey' && r.title.startsWith('Leonardo Carvalho, goaltender'), 'the last click wins: Hockey, with its tab and title');
  check(errors.length === 0, 'no console errors ' + errors.join(' | '));
  await browser.close();
}
