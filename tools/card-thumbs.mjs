// Make the 320px card derivatives of v5's screenshots: the largest derivative, resized in two steps with the browser's
// high-quality filter (fine lines such as the sketch's pencil stay crisp) and saved as WebP, which carries no EXIF.
// Each gets the sidecar of the derivative it stands beside.
// Usage: node tools/card-thumbs.mjs   (needs the preview server on 8778; PLAYWRIGHT_MODULE, PW_CHANNEL and V5_BASE
// point it at another Playwright, browser or server, as for tests/v5/e2e)
import { writeFileSync, readFileSync } from 'node:fs';

const { chromium } = await import(process.env.PLAYWRIGHT_MODULE || '/Users/lcarvalho26/.npm/_npx/9833c18b2d85bc59/node_modules/playwright-core/index.mjs');
const CHANNEL = process.env.PW_CHANNEL ?? 'chrome';
const BASE = process.env.V5_BASE || 'http://127.0.0.1:8778/v5/';
const out = new URL('../v5/assets/img/', import.meta.url).pathname;
// [the largest derivative, the 320 to make, the sidecar to copy]
const JOBS = [
  ['loquar-openworld-1440.webp', 'loquar-openworld-320.webp', 'loquar-openworld-640.webp.json'],
  ['genuvalens-hardware-crop-960.webp', 'genuvalens-hardware-crop-320.webp', 'genuvalens-hardware-crop-640.webp.json'],
  ['ocapex-site-1440.webp', 'ocapex-site-320.webp', 'ocapex-site-720.webp.json'],
];

const browser = await chromium.launch(CHANNEL ? { channel: CHANNEL } : {});
const page = await browser.newPage();
await page.goto(BASE + 'assets/img/room-night.webp');   // any same-origin page will do
for (const [src, name, sidecar] of JOBS) {
  const b64 = await page.evaluate(async (url) => {
    const img = new Image(); img.src = url; await img.decode();
    const w = 320, h = Math.round(img.naturalHeight * w / img.naturalWidth);
    const twice = await createImageBitmap(img, { resizeWidth: w * 2, resizeHeight: h * 2, resizeQuality: 'high' });
    const bmp = await createImageBitmap(twice, { resizeWidth: w, resizeHeight: h, resizeQuality: 'high' });
    const c = new OffscreenCanvas(w, h); c.getContext('2d').drawImage(bmp, 0, 0);
    const blob = await c.convertToBlob({ type: 'image/webp', quality: .82 });
    if (blob.type !== 'image/webp') throw new Error('this browser cannot write WebP');
    let s = ''; for (const byte of new Uint8Array(await blob.arrayBuffer())) s += String.fromCharCode(byte);
    return btoa(s);
  }, BASE + 'assets/img/' + src);
  const buf = Buffer.from(b64, 'base64');
  writeFileSync(out + name, buf);
  writeFileSync(out + name + '.json', readFileSync(out + sidecar));
  console.log(name, buf.length, 'bytes');
}
await browser.close();
