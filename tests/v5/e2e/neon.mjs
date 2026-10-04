// The hero's colour, after Apple's "It's Glowtime." art: neon in hot pink, magenta, orange, violet, electric blue and
// cyan, its light blooming into a near-black field. A census of the bright, saturated pixels in the name's box (lit:
// value .6 or more and saturation .2 or more, binned by hue), the ground right round the letters (0.1 to 0.3 em out),
// and, without the room by day, the name's edge (the brighter half of a band 0.03 em either side of the outline)
// against the ground just beyond its light (0.06 to 0.15 em out), and the faces against the pool beyond that (0.15 to
// 0.3 em out). By night, the stage: the room outside the name's box near black, and the light falling smoothly into
// it: the mean luminance in bands 0.1 em wide by distance from the letters, in eight directions round them, from
// 0.1 em out (past the tube's own light) to 3 em, with no step between neighbouring bands over 0.01 and no rise, so
// no edge or shape (a pool, the mask's box) outlines the name; and the first frames of a hero view (a first visit and
// a reload), read from the compositor, never showing the bright room. The letters are drawn again from the page's own
// layout (glyph by glyph, as hero.js draws its mask), widened or narrowed with a stroke to find each band.
import { open, BASE, check } from './lib.mjs';
import { measure } from './measure.mjs';

const f1 = v => v.toFixed(1), f3 = v => v.toFixed(3), f4 = v => v.toFixed(4);
const census = s => `orange ${f1(s.pct.orange)}%, cyan ${f1(s.pct.cyan)}%, pink and magenta ${f1(s.pct.pink + s.pct.magenta)}%, blue and violet ${f1(s.pct.blue + s.pct.violet)}%; ground ${s.ground.toFixed(3)}`;
// the stage checks, for one frame by night
function stageChecks(s, where) {
  check(s.outside <= .03, `${where}: the room outside the name is near black (mean luminance ${f4(s.outside)})`);
  check(s.step <= .01 && s.rise <= .003, `${where}: the light falls smoothly into the dark, eight ways round the letters (largest step ${f4(s.step)} per 0.1 em, ${s.worst}; largest rise ${f4(s.rise)})`);
  check(s.hint >= 4.5, `${where}: the hint at ${s.hint.toFixed(1)}:1 on the stage`);
}
const ready = page => page.waitForFunction(() => document.querySelector('.hero.is-ready'), null, { timeout: 8000 });
async function lit(page) {                                   // the light is up and the room has drawn it
  await ready(page);
  await page.waitForFunction(() => window.__hero.ink.on >= 1, null, { timeout: 8000 });
  const f0 = await page.evaluate(() => window.__roomFrames);
  await page.evaluate(() => window.__room.kick(1));
  await page.waitForFunction(f0 => window.__roomFrames >= f0 + 2, f0, { timeout: 8000 });
}

// with the room, by night: the reduced-motion still (one moment of the light, the same everywhere), then the light
// moving, at 1440 on one line and 390 on two
for (const [width, height] of [[1440, 900], [390, 844]]) {
  const { browser, page, errors } = await open({ width, height, reduced: true, touch: width < 700 });
  await page.goto(BASE, { waitUntil: 'load' });
  if (!(await page.evaluate(() => document.documentElement.classList.contains('gl')))) { console.log('skip: no WebGL2 here'); await browser.close(); continue; }
  await lit(page);
  const s = await measure(page, { stage: true });
  check(s.pct.orange >= 10 && s.pct.cyan >= 10 && s.pct.pink + s.pct.magenta >= 5, `night ${width}, the still: orange, cyan and pink in the light (${census(s)})`);
  check(s.ground < .03, `night ${width}: the ground round the letters is near black (luminance ${s.ground.toFixed(3)})`);
  stageChecks(s, `night ${width}, the still`);
  check(errors.length === 0, 'no console errors ' + errors.join(' | '));
  await browser.close();
}
{
  const { browser, page, errors } = await open();
  await page.goto(BASE, { waitUntil: 'load' });
  if (await page.evaluate(() => document.documentElement.classList.contains('gl'))) {
    await lit(page);
    const frames = [];
    for (let n = 0; n < 4; n++) { if (n) await page.waitForTimeout(2000); frames.push(await measure(page, { stage: true })); }
    const warm = frames.filter(s => s.pct.orange >= 10).length, cold = frames.filter(s => s.pct.cyan >= 10).length;
    check(warm >= 3 && cold >= 3, `night 1440, moving: orange ${warm} and cyan ${cold} of 4 frames at 10% or more (${frames.map(s => `${f1(s.pct.orange)}/${f1(s.pct.cyan)}`).join(', ')})`);
    check(frames.every(s => s.ground < .03), `night 1440, moving: the ground stays near black (${frames.map(s => s.ground.toFixed(3)).join(', ')})`);
    check(frames.every(s => s.outside <= .03), `night 1440, moving: the stage stays near black (${frames.map(s => f4(s.outside)).join(', ')})`);
    check(frames.every(s => s.step <= .01 && s.rise <= .003), `night 1440, moving: the light falls smoothly in every frame (largest steps ${frames.map(s => f4(s.step)).join(', ')})`);
  } else console.log('skip: no WebGL2 here');
  check(errors.length === 0, 'no console errors ' + errors.join(' | '));
  await browser.close();
}
// by day there is no stage: the room keeps its light round the name
{
  const { browser, page, errors } = await open({ scheme: 'light', reduced: true });
  await page.goto(BASE, { waitUntil: 'load' });
  if (await page.evaluate(() => document.documentElement.classList.contains('gl'))) {
    await lit(page);
    const s = await measure(page, { stage: true });
    check(s.outside > .08, `day 1440: no stage, the room keeps its light (mean luminance ${f4(s.outside)} outside the name)`);
  } else console.log('skip: no WebGL2 here');
  check(errors.length === 0, 'no console errors ' + errors.join(' | '));
  await browser.close();
}
// the first frames of a hero view, by night, as the compositor sends them (a screencast): a first visit (from a black
// page on the same origin) and a reload, each from the new page's first paint until the light is up. None may show the
// bright room: the page's CSS darkens the room's still from the first paint, and the room's first frame is already dark.
async function firstFrames(page, how, gl) {
  const cdp = await page.context().newCDPSession(page), frames = [];
  cdp.on('Page.screencastFrame', f => { if (frames.length < 160) frames.push(f); cdp.send('Page.screencastFrameAck', { sessionId: f.sessionId }).catch(() => {}); });
  await cdp.send('Page.startScreencast', { format: 'jpeg', quality: 90, everyNthFrame: 1 });
  if (how === 'visit') await page.goto(BASE, { waitUntil: 'commit' }); else await page.reload({ waitUntil: 'commit' });
  await ready(page);
  if (gl && !(await page.evaluate(() => document.documentElement.classList.contains('gl')))) { await cdp.detach(); return null; }
  if (gl) await lit(page);
  await new Promise(r => setTimeout(r, gl ? 400 : 1200));
  await cdp.send('Page.stopScreencast');
  // from the new page's first paint (a reload starts on the old page's last frames), the first 40
  const fp = await page.evaluate(() => { const e = performance.getEntriesByName('first-paint')[0]; return e ? performance.timeOrigin + e.startTime : 0; });
  const mine = frames.filter(f => f.metadata.timestamp * 1000 >= fp - 1).slice(0, 40), means = [];
  for (let i = 0; i < mine.length; i += 8) means.push(...await page.evaluate(async (list) => {
    const lin = v => { v /= 255; return v <= .04045 ? v / 12.92 : ((v + .055) / 1.055) ** 2.4; };
    const b = document.querySelector('.hero__name').getBoundingClientRect(), out = [];
    for (const b64 of list) {
      const i = new Image(); i.src = 'data:image/jpeg;base64,' + b64; await i.decode();
      const c = new OffscreenCanvas(i.width, i.height), g = c.getContext('2d'); g.drawImage(i, 0, 0);
      const d = g.getImageData(0, 0, i.width, i.height).data, k = i.width / innerWidth;
      let s = 0, n = 0;
      for (let y = 0; y < i.height - 110 * k; y += 2) for (let x = 0; x < i.width; x += 2) {
        if (x >= (b.left - 40) * k && x < (b.right + 40) * k && y >= (b.top - 40) * k && y < (b.bottom + 40) * k) continue;   // the name and its light
        const j = (y * i.width + x) * 4; s += .2126 * lin(d[j]) + .7152 * lin(d[j + 1]) + .0722 * lin(d[j + 2]); n++;
      }
      out.push(s / n);
    }
    return out;
  }, mine.slice(i, i + 8).map(f => f.data)));
  await cdp.detach();
  return means;
}
for (const noGL of [false, true]) {
  const { browser, page, errors } = await open({ noGL });
  await page.context().route('**/v5/__black.html', r => r.fulfill({ contentType: 'text/html', body: '<!doctype html><html style="background:#000"><body></body></html>' }));
  await page.goto(BASE + '__black.html');
  const gl = !noGL;
  for (const how of ['visit', 'reload']) {
    const means = await firstFrames(page, how, gl);
    if (!means) { console.log('skip: no WebGL2 here'); break; }
    check(means.length > 0 && Math.max(...means) <= .03, `${noGL ? 'no WebGL' : 'with the room'}, night, ${how === 'visit' ? 'a first visit' : 'a reload'}: no flash of the bright room, ${means.length} frames from the first paint (mean luminance round the name ${means.map(f4).join(' ')})`);
  }
  check(errors.length === 0, 'no console errors ' + errors.join(' | '));
  await browser.close();
}
// without the room: a real orange trace by night on the same near-black stage, and by day the edge at 3:1 or more
// against the ground beside it and the faces at 3:1 or more against the pool round the letters (the still, under
// reduced motion, is the dimmest: the second face is not there to lift them)
for (const [width, height] of [[1440, 900], [390, 844]]) {
  const { browser, page } = await open({ noGL: true, reduced: true, width, height, touch: width < 700 });
  await page.goto(BASE, { waitUntil: 'load' });
  await ready(page); await page.waitForTimeout(300);
  const s = await measure(page, { stage: true });
  check(s.pct.orange >= 10, `no WebGL, night ${width}: an orange trace (${census(s)})`);
  check(s.ground < .03, `no WebGL, night ${width}: the ground round the letters is near black (${s.ground.toFixed(3)})`);
  stageChecks(s, `no WebGL, night ${width}`);
  await browser.close();
}
for (const [width, height, reduced] of [[1440, 900, false], [390, 844, false], [1440, 900, true]]) {
  const { browser, page } = await open({ noGL: true, scheme: 'light', width, height, reduced, touch: width < 700 });
  await page.goto(BASE, { waitUntil: 'load' });
  await ready(page); await page.waitForTimeout(1600);
  for (let n = 0; n < (reduced ? 1 : 3); n++) {
    if (n) await page.waitForTimeout(3000);
    const s = await measure(page), where = `no WebGL, day ${width}${reduced ? ', the still' : ''}`;
    check(s.parts.every(q => q.edge >= 3), `${where}: the edge against the ground beside it ${s.parts.map(q => `${q.ch} ${q.edge.toFixed(2)}:1`).join(', ')}`);
    check(s.parts.every(q => q.pool >= 3), `${where}: the faces against the pool ${s.parts.map(q => `${q.ch} ${q.pool.toFixed(2)}:1`).join(', ')}`);
  }
  await browser.close();
}
