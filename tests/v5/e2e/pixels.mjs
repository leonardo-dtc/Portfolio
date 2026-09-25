// Read colours back from a real screenshot (the WebGL canvas does not keep its buffer, so screenshots are the truth).
export async function shotSampler(page) {
  const png = await page.screenshot();
  const b64 = png.toString('base64');
  return {
    // mean [r, g, b] of a CSS-pixel rectangle
    async mean(x, y, w, h) {
      return page.evaluate(async ([b64, x, y, w, h]) => {
        const img = new Image(); img.src = 'data:image/png;base64,' + b64; await img.decode();
        const k = img.width / innerWidth;
        const c = document.createElement('canvas'); c.width = Math.max(1, Math.round(w * k)); c.height = Math.max(1, Math.round(h * k));
        const g = c.getContext('2d'); g.drawImage(img, x * k, y * k, w * k, h * k, 0, 0, c.width, c.height);
        const d = g.getImageData(0, 0, c.width, c.height).data; const s = [0, 0, 0];
        for (let i = 0; i < d.length; i += 4) { s[0] += d[i]; s[1] += d[i + 1]; s[2] += d[i + 2]; }
        const n = d.length / 4; return s.map(v => v / n);
      }, [b64, x, y, w, h]);
    },
  };
}
export const grey = ([r, g, b]) => (r + g + b) / 3;
