import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { relative } from 'node:path';
import { ROOT, TABS, APPS, pages, render, tabBar } from '../../../tools/v5-chrome.mjs';

test('every page carries the chrome tools/v5-chrome.mjs writes (run it after changing the list)', () => {
  const all = pages();
  assert.equal(all.length, 13, `thirteen pages, found ${all.length}`);
  for (const { file, up } of all) {
    const html = readFileSync(file, 'utf8');
    assert.equal(render(html, up), html, `${relative(ROOT, file)} differs: run node tools/v5-chrome.mjs`);
  }
});
test('the tab bar marks its own page, and its links climb to v5/ from where the page sits', () => {
  const bar = tabBar('../../', 'work');
  assert.equal((bar.match(/aria-current="page"/g) || []).length, 1);
  assert.match(bar, /data-tab="work" href="\.\.\/\.\.\/work\/" aria-current="page"/);
  assert.match(tabBar('', 'home'), /data-tab="home" href="\.\/" aria-current="page"/);
});
test('the hero offers every page but Home, and a way to write, with no counts', () => {
  assert.deepEqual(APPS.map(a => a.id), ['work', 'hockey', 'about', 'resume', 'archive', 'write']);
  for (const a of APPS) assert.ok(!/\d/.test(a.name) && !/\d\s+(projects?|pages?|items?)/i.test(JSON.stringify(a.more)), `${a.id} shows a number`);
  assert.equal(TABS.length, 6);
});
test('the archive comes from one list: Home shows the newest four things made, Work all of them, and its page every entry in full, the music in its Listening window', async () => {
  const { ARCHIVE, MADE, HEARD, HOME_ARCHIVE } = await import('../../../tools/v5-chrome.mjs');
  const home = readFileSync(new URL('../../../v5/index.html', import.meta.url), 'utf8');
  const work = readFileSync(new URL('../../../v5/work/index.html', import.meta.url), 'utf8');
  const sheet = readFileSync(new URL('../../../v5/archive/index.html', import.meta.url), 'utf8');
  const rows = html => [...html.replace(/<!--[\s\S]*?-->/g, '').matchAll(/<a class="row" href="([^"]+)"/g)].map(m => m[1]);
  const homeExp = rows(home.slice(home.indexOf('<ul class="rows exp">'), home.indexOf('</ul>', home.indexOf('<ul class="rows exp">'))));
  const workExp = rows(work.slice(work.indexOf('<ul class="rows exp">'), work.indexOf('</ul>', work.indexOf('<ul class="rows exp">'))));
  assert.deepEqual(homeExp, MADE.slice(0, HOME_ARCHIVE).map(a => `archive/#${a.id}`));
  assert.deepEqual(workExp, MADE.map(a => `../archive/#${a.id}`));
  const main = sheet.slice(sheet.indexOf('<main'), sheet.indexOf('</main>')), side = sheet.slice(sheet.indexOf('</main>'));
  for (const a of MADE) assert.match(main, new RegExp(`<li class="arc__item" id="${a.id}">`), `${a.id} in the archive's window`);
  for (const a of HEARD) assert.match(side, new RegExp(`<li class="track(?: is-current)?" id="${a.id}"`), `${a.id} in the Listening window`);
  assert.match(side, new RegExp(`<li class="track is-current" id="${HEARD[0] && HEARD[0].id}"`), 'the newest shows first');
  assert.equal(/<aside[^>]*aria-labelledby="listening"/.test(side), HEARD.length > 0, 'a Listening window only with music');
  assert.ok(!/snake|minesweeper/i.test(home.replace(/<!--[\s\S]*?-->/g, '') + work.replace(/<!--[\s\S]*?-->/g, '') + sheet), 'the class games stay out (T6)');
  for (const a of ARCHIVE) assert.ok(!/[–—]/.test(JSON.stringify(a)), `${a.id}: no en or em dashes`);
});
