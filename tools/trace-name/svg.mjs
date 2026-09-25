// Step 4: the name as SVG, for scripts off, print and the title's layout slot.
// Writes v5/assets/img/name.svg (one line) and name-2.svg (two lines, used below 700px) from v5/assets/js/name.js.
// Usage: node tools/trace-name/svg.mjs
import { writeFileSync } from 'node:fs';
import { nameLayout, toPaths } from '../../v5/assets/js/name.js';

const PAD = 14, PEN = 22;   // the margin hello.js expects around the name, and the drawn pen width
for (const [lines, file] of [[1, 'name.svg'], [2, 'name-2.svg']]) {
  const L = nameLayout(lines), b = L.box;
  const vb = [b.x0 - PAD, b.y0 - PAD, b.x1 - b.x0 + 2 * PAD, b.y1 - b.y0 + 2 * PAD].map(v => +v.toFixed(1));
  const paths = toPaths(L.strokes, 1).map(d => `<path d="${d}"/>`).join('');
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${vb.join(' ')}" width="${vb[2]}" height="${vb[3]}"><title>leonardo carvalho</title><g fill="none" stroke="#fff" stroke-width="${PEN}" stroke-linecap="round" stroke-linejoin="round">${paths}</g></svg>`;
  const out = new URL(`../../v5/assets/img/${file}`, import.meta.url);
  writeFileSync(out, svg);
  writeFileSync(new URL(`../../v5/assets/img/${file}.json`, import.meta.url), JSON.stringify({ source: 'tools/trace-name (Sacramento by Astigmatic, SIL OFL 1.1, traced to pen strokes)', note: 'drawing data from a font rendering; not a font file', size: [vb[2], vb[3]] }, null, 2) + '\n');
  console.log(file, vb.join(' '));
}
