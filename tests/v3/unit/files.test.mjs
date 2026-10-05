import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { ROOT, FILES, files, render, sheets, pager } from '../../../tools/v3-files.mjs';

test('every project file carries what tools/v3-files.mjs writes from the deck (run it after changing the deck or the list)', () => {
  const all = files();
  assert.equal(all.length, FILES.length);
  for (const f of all) {
    const p = join(ROOT, 'files', f.dir, 'index.html'), html = readFileSync(p, 'utf8');
    assert.equal(render(html, all, f), html, `v3/files/${f.dir}/index.html differs: run node tools/v3-files.mjs`);
  }
});
test('a file takes its number, name and line from its sheet in the deck', () => {
  const deck = readFileSync(join(ROOT, 'index.html'), 'utf8'), s = sheets(deck);
  const ids = [...deck.matchAll(/<section class="slide[^"]*" id="([^"]+)"/g)].map(m => m[1]);
  for (const f of files(deck)) {
    assert.equal(Number(f.n), ids.indexOf(f.sheet) + 1, `${f.dir}: numbered by its sheet's place`);
    assert.ok(f.name && f.line, `${f.dir}: a name and a line from its folder`);
    assert.equal(s[f.sheet].name, f.name);
  }
});
test('the pager links each file to the ones on either side, and the ends have one link', () => {
  const all = files();
  assert.match(pager(all, all[0]), /aria-label="Next file"/);
  assert.doesNotMatch(pager(all, all[0]), /rel="prev"/);
  assert.match(pager(all, all[all.length - 1]), /aria-label="Previous file"/);
  const mid = pager(all, all[1]);
  assert.match(mid, new RegExp(`href="\\.\\./${all[0].dir}/" rel="prev"`));
  assert.match(mid, new RegExp(`href="\\.\\./${all[2].dir}/" rel="next"`));
});
test('every file can write to me from its chrome (T4)', () => {
  for (const f of files()) {
    const html = readFileSync(join(ROOT, 'files', f.dir, 'index.html'), 'utf8');
    assert.match(html, /<header class="chrome"[\s\S]*?href="mailto:leonardo\.dtc2009@gmail\.com"[\s\S]*?<\/header>/, `${f.dir}: Email in the chrome`);
  }
});
