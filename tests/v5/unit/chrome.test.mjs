import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { relative } from 'node:path';
import { ROOT, TABS, APPS, pages, render, tabBar } from '../../../tools/v5-chrome.mjs';

test('every page carries the chrome tools/v5-chrome.mjs writes (run it after changing the list)', () => {
  const all = pages();
  assert.equal(all.length, 12, `twelve pages, found ${all.length}`);
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
  assert.deepEqual(APPS.map(a => a.id), ['work', 'hockey', 'about', 'resume', 'write']);
  for (const a of APPS) assert.ok(!/\d/.test(a.name) && !/\d\s+(projects?|pages?|items?)/i.test(JSON.stringify(a.more)), `${a.id} shows a number`);
  assert.equal(TABS.length, 5);
});
