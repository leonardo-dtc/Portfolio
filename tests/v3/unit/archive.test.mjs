// The archive's one source (archive/*.md, tools/archive.mjs): its format, its order, what each edition makes of a song,
// an album and a project, and that both editions match it.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, mkdirSync, writeFileSync, readFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { parse, entries, yearKey, imageSize, cover, strays, v3Card, run } from '../../../tools/archive.mjs';
import { archiveList, expRows } from '../../../tools/v5-chrome.mjs';

const deck = readFileSync(new URL('../../../v3/index.html', import.meta.url), 'utf8');
const SONG = `---
kind: Song
title: A song
by: An artist
year: 2026
line: Why it is here
listen: https://open.spotify.com/track/abc
---
One paragraph.

- Album: The album
`;

test('an entry: its head, its paragraphs and its details', () => {
  const e = parse(SONG, 'a-song.md');
  assert.equal(e.id, 'a-song');
  assert.equal(e.kind, 'Song');
  assert.equal(e.by, 'An artist');
  assert.equal(e.music, true);
  assert.equal(e.service, 'Spotify');
  assert.deepEqual(e.text, ['One paragraph.']);
  assert.deepEqual(e.facts, [['Album', 'The album']]);
  assert.equal(parse(SONG.replace('kind: Song', 'kind: Project'), 'p.md').music, false);
  assert.equal(parse(SONG.replace('https://open.spotify.com/track/abc', 'https://music.apple.com/us/album/x'), 's.md').service, 'Apple Music');
  assert.equal(parse(SONG.replace('---\nOne', 'draft: true\n---\nOne'), 'd.md').draft, true);
  assert.equal(parse(SONG.replace('year: 2026', 'v3: "#record"\nyear: 2026'), 'q.md').v3, '#record');
});

test('an entry that cannot be read says why', () => {
  assert.throws(() => parse('kind: Song', 'x.md'), /between two --- lines/);
  assert.throws(() => parse(SONG.replace('title: A song\n', ''), 'x.md'), /"title" is missing/);
  assert.throws(() => parse(SONG.replace('by:', 'artist:'), 'x.md'), /no field "artist"/);
  assert.throws(() => parse(SONG.replace('Why it is here', 'Why — here'), 'x.md'), /no en or em dashes/);
  assert.throws(() => parse(SONG.replace('- Album: The album', '- Album the album'), 'x.md'), /should read "- Name: what"/);
  assert.throws(() => parse(SONG.replace('year: 2026', 'v3: record\nyear: 2026'), 'x.md'), /names one of v3's sheets/);
  assert.throws(() => parse(SONG.replace('year: 2026', 'link: http://example.com\nyear: 2026'), 'x.md'), /full https/);
  assert.throws(() => parse(SONG.replace('year: 2026', 'cover: x.svg\nyear: 2026'), 'x.md'), /names a .jpg/);
  assert.throws(() => parse(SONG.replace('kind: Song', 'kind: Project').replace('year: 2026', 'cover: x.jpg\nyear: 2026'), 'x.md'), /needs "alt"/);
});

test('newest first: Now, then "to now", then by the last year and the first; ties by name', () => {
  assert.deepEqual(yearKey('Now'), [1e4, 1e4]);
  assert.deepEqual(yearKey('2026 to now'), [1e4, 2026]);
  assert.deepEqual(yearKey('2021 to 2025'), [2025, 2021]);
  const dir = mkdtempSync(join(tmpdir(), 'archive-'));
  for (const [f, y] of [['b.md', '2025'], ['a.md', '2025'], ['c.md', 'Now'], ['d.md', '2021 to 2026']]) writeFileSync(join(dir, f), SONG.replace('year: 2026', `year: ${y}`));
  writeFileSync(join(dir, 'README.md'), 'not an entry');
  writeFileSync(join(dir, '_start.md'), 'not an entry either');
  assert.deepEqual(entries(dir).map(e => e.id), ['c', 'd', 'a', 'b']);
});

test('a cover: its size read from its first bytes, and a picture that is not there stops the run', () => {
  const png = Buffer.alloc(33); png.writeUInt32BE(0x89504e47, 0); png.writeUInt32BE(600, 16); png.writeUInt32BE(590, 20);
  assert.deepEqual(imageSize(png), [600, 590]);
  const gif = Buffer.from('GIF89a\x40\x01\xf0\x00', 'latin1');
  assert.deepEqual(imageSize(Buffer.concat([gif, Buffer.alloc(8)])), [320, 240]);
  const dir = mkdtempSync(join(tmpdir(), 'archive-')); mkdirSync(join(dir, 'covers'));
  writeFileSync(join(dir, 'covers', 'x.png'), png);
  const e = parse(SONG.replace('year: 2026', 'cover: x.png\nyear: 2026'), 'x.md');
  assert.deepEqual({ ...cover(e, dir), src: null }, { file: 'x.png', src: null, w: 600, h: 590, alt: 'Cover of A song by An artist' });
  assert.throws(() => cover(parse(SONG.replace('year: 2026', 'cover: y.png\nyear: 2026'), 'y.md'), dir), /is not there/);
  // an edition's copy, and its note, go once no entry names the picture
  assert.deepEqual(strays(['x.png', 'x.png.json', 'old.jpg', 'old.jpg.json'], new Set(['x.png'])), ['old.jpg', 'old.jpg.json']);
});

test('v3: a song is a card with its artist and a way to listen; a sheet link reads as the deck names it', () => {
  const card = v3Card(parse(SONG.replace('year: 2026', 'v3: "#music"\nyear: 2026'), 'a-song.md'), deck);
  assert.match(card, /<li class="entry entry--music">/);
  assert.match(card, /<p class="entry__by">An artist<\/p>/);
  assert.match(card, /<p class="entry__line">Why it is here\.<\/p>/);
  assert.match(card, /<a class="entry__listen" href="https:\/\/open\.spotify\.com\/track\/abc" rel="noopener">Listen on Spotify<\/a>/);
  assert.match(card, /<a class="entry__link" href="#music">Sheet \d\d, Viola and violin<\/a>/);
  assert.match(card, /<div><dt>Album<\/dt><dd>The album<\/dd><\/div>/);
});

test('v5: music goes on the Listening shelf and never into the Experiments rows', () => {
  const made = { id: 'p', year: '2026', kind: 'Project', title: 'a project', by: '', line: 'A line', text: [], facts: [], music: false, cover: null, listen: null, link: null, away: { href: 'https://example.com', text: 'example.com' } };
  const song = { ...made, id: 's', kind: 'Song', title: 'A song', by: 'An artist', music: true, away: null, listen: { href: 'https://open.spotify.com/track/abc', service: 'Spotify' } };
  const sheet = archiveList('../../', [made, song]);
  assert.match(sheet, /<ol class="arc">[\s\S]*id="p"[\s\S]*<\/ol>\n {8}<h2 class="arc__shelf" id="listening">Listening<\/h2>\n {8}<ol class="arc">[\s\S]*id="s"/);
  assert.match(sheet, /<p class="arc__by">An artist<\/p>/);
  assert.match(sheet, /href="https:\/\/open\.spotify\.com\/track\/abc" rel="noopener">Listen on Spotify/);
  assert.match(sheet, /href="https:\/\/example\.com" rel="noopener">example\.com/);
  assert.doesNotMatch(archiveList('../../', [made]), /arc__shelf/);
  const rows = expRows('', Infinity, [made, song]);
  assert.match(rows, /#p"/);
  assert.doesNotMatch(rows, /#s"/);
});

test('both editions match archive/ (node tools/archive.mjs --check)', () => {
  assert.deepEqual(run({ check: true, log: () => {} }), []);
});
