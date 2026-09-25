#!/usr/bin/env python3
"""Cut the studio portrait out of its grey backdrop for the v3 About sheet.

    python3 tools/make-cutout.py [source.jpg] [out-dir]

The backdrop is a soft grey gradient, so a single colour key fails at the
shadowed shoulder. Instead: pixels that are unsaturated and mid-grey are
"sure backdrop"; a wide box filter over those gives a local backdrop colour;
anything far from it, or dark, or saturated, is the person. The largest
connected component is kept, holes are filled, and the edge is feathered.
Writes leonardo-cutout-<width>.{png,webp} with transparency.
"""
import sys
import numpy as np
from PIL import Image, ImageFilter
from collections import deque

SRC = sys.argv[1] if len(sys.argv) > 1 else 'assets/img/portrait.jpg'
OUT = sys.argv[2] if len(sys.argv) > 2 else 'v3/assets/img'

im = Image.open(SRC).convert('RGB'); W, H = im.size
a = np.asarray(im).astype(float)
lum = a.mean(2); sat = a.max(2) - a.min(2)
sure = (sat < 26) & (lum > 128) & (lum < 236)


def box(arr, r):
    p = np.pad(arr, ((r + 1, r), (r + 1, r)), mode='edge'); c = p.cumsum(0).cumsum(1)
    return (c[2*r+1:, 2*r+1:] - c[:-2*r-1, 2*r+1:] - c[2*r+1:, :-2*r-1] + c[:-2*r-1, :-2*r-1]) / ((2*r+1) ** 2)


num = np.stack([box(a[:, :, c] * sure, 90) for c in range(3)], 2); den = box(sure.astype(float), 90)
bg = np.where(den[..., None] > 0.02, num / np.maximum(den, 1e-6)[..., None], a[sure].mean(0))
dist = np.sqrt(((a - bg) ** 2).sum(2))
mask = (dist > 30) | (lum < 110) | (sat > 40)

# largest component
lab = np.zeros((H, W), np.int32); cur = 0; best = (0, 0)
for y in range(H):
    for x in range(W):
        if mask[y, x] and lab[y, x] == 0:
            cur += 1; q = deque([(y, x)]); lab[y, x] = cur; n = 0
            while q:
                cy, cx = q.popleft(); n += 1
                for ny, nx in ((cy+1, cx), (cy-1, cx), (cy, cx+1), (cy, cx-1)):
                    if 0 <= ny < H and 0 <= nx < W and mask[ny, nx] and lab[ny, nx] == 0:
                        lab[ny, nx] = cur; q.append((ny, nx))
            if n > best[0]: best = (n, cur)
keep = lab == best[1]
# fill holes: background is only what the border can reach
notk = ~keep; reach = np.zeros((H, W), bool); q = deque()
for y in range(H):
    for x in (0, W - 1):
        if notk[y, x] and not reach[y, x]: reach[y, x] = True; q.append((y, x))
for x in range(W):
    for y in (0, H - 1):
        if notk[y, x] and not reach[y, x]: reach[y, x] = True; q.append((y, x))
while q:
    cy, cx = q.popleft()
    for ny, nx in ((cy+1, cx), (cy-1, cx), (cy, cx+1), (cy, cx-1)):
        if 0 <= ny < H and 0 <= nx < W and notk[ny, nx] and not reach[ny, nx]:
            reach[ny, nx] = True; q.append((ny, nx))
keep = keep | (~reach)

m = Image.fromarray((keep * 255).astype(np.uint8)).filter(ImageFilter.MinFilter(3)).filter(ImageFilter.GaussianBlur(1.0))
out = im.convert('RGBA'); out.putalpha(m); out = out.crop(out.getbbox())
out.save(f'{OUT}/leonardo-cutout-{out.width}.webp', quality=86, method=6)
out.save(f'{OUT}/leonardo-cutout-{out.width}.png', optimize=True)
print('cutout', out.size)
