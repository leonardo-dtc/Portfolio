"""Chain Sacramento skeleton branches into pen strokes and write v5/assets/js/name-data.js.

Run from the repository root after render.mjs and skel.py (see README.md).

A spec entry is a branch id, optionally suffixed:
  '>'  closed loop: go the way whose first steps move right (the slanted upstroke of l, h)
  ''   open branch: start at the end nearest the pen; closed loop: smoothest continuation
A repeated id retraces the previous branch backwards (the same pixels, so both passes coincide).
"""
import json
import math
import os

HERE = os.path.dirname(os.path.abspath(__file__))
WORK = os.path.join(HERE, 'work')
OUT = os.path.join(HERE, '..', '..', 'v5', 'assets', 'js', 'name-data.js')

import numpy as np

SPECS = {
    'leonardo': ('leo', ['0>', 1, 2, 3, 3, 4, 5, 5, 6, 7, 9, 11, 11, 10, 12, 12, 13, 14, 16, 17, 19, 20, 20, 21, 18, 18, 22, 24, 24, 23, 25, 27]),
    'carvalho': ('car', [0, 2, 2, 1, 3, 3, 4, 5, 7, 8, 8, 9, 10, 10, 11, 12, 12, 13, 14, 14, 15, 18, '16>', 18, 17, 19, '21>', 19, 20, 22, 22, 23, 24, 25]),
}
BASE, X0, XH = 590.0, 110.0, 195.9375       # canvas baseline, pen origin, x-height (px at 640px)


def heading(p, back=10):
    a = np.array(p[max(0, len(p) - 1 - back)]); b = np.array(p[-1])
    v = b - a
    n = np.linalg.norm(v)
    return v / n if n else v


def chain(prefix, spec):
    d = json.load(open(os.path.join(WORK, prefix + '-branches.json')))
    B = {b['id']: b for b in d['branches']}
    path, marks = [], []          # marks: indices in path where the pen reverses (a cusp)
    prev_id, prev_pts = None, None
    for item in spec:
        s = str(item)
        mode = s[-1] if s[-1] in '>' else ''
        bid = int(s.rstrip('>'))
        pts = [tuple(p) for p in B[bid]['pts']]
        closed = B[bid]['a'] == B[bid]['z'] and B[bid]['a'] != -1
        if bid == prev_id:                                   # retrace
            pts = prev_pts[::-1]
            marks.append(len(path) - 1)
        elif not path:
            if closed and mode == '>':
                if pts[min(30, len(pts) - 1)][0] < pts[0][0]:
                    pts = pts[::-1]
            elif B[bid]['endZ'] and not B[bid]['endA']:
                pts = pts[::-1]
        else:
            cur = np.array(path[-1])
            if closed:
                if mode == '>':
                    if pts[min(30, len(pts) - 1)][0] < pts[0][0]:
                        pts = pts[::-1]
                else:
                    h = heading(path)
                    f = np.array(pts[min(12, len(pts) - 1)]) - np.array(pts[0])
                    r = np.array(pts[-1 - min(12, len(pts) - 1)]) - np.array(pts[-1])
                    fa = np.dot(h, f / (np.linalg.norm(f) or 1)); ra = np.dot(h, r / (np.linalg.norm(r) or 1))
                    if ra > fa:
                        pts = pts[::-1]
            else:
                da = np.linalg.norm(np.array(pts[0]) - cur); dz = np.linalg.norm(np.array(pts[-1]) - cur)
                if dz < da:
                    pts = pts[::-1]
            gap = np.linalg.norm(np.array(pts[0]) - cur)
            if gap > 12:
                print(f'  warning: gap of {gap:.1f}px before branch {bid}')
        path.extend(pts if not path else pts[1:])
        prev_id, prev_pts = bid, pts
    return path, marks


def resample(p, step):
    p = np.array(p, float)
    seg = np.linalg.norm(np.diff(p, axis=0), axis=1)
    s = np.concatenate([[0], np.cumsum(seg)])
    n = max(2, int(s[-1] // step) + 1)
    t = np.linspace(0, s[-1], n)
    return np.stack([np.interp(t, s, p[:, 0]), np.interp(t, s, p[:, 1])], 1)


def smooth(p, k=3):
    if len(p) < 2 * k + 3:
        return p
    q = p.copy()
    for i in range(k, len(p) - k):
        q[i] = p[i - k:i + k + 1].mean(0)
    return q


def cusps(p, win=5, limit=78):
    out = []
    for i in range(win, len(p) - win):
        a = p[i] - p[i - win]; b = p[i + win] - p[i]
        na, nb = np.linalg.norm(a), np.linalg.norm(b)
        if na == 0 or nb == 0:
            continue
        ang = math.degrees(math.acos(max(-1, min(1, np.dot(a, b) / (na * nb)))))
        if ang > limit:
            out.append((i, ang))
    # keep the sharpest point of each cluster
    keep = []
    for i, a in out:
        if keep and i - keep[-1][0] <= win * 2:
            if a > keep[-1][1]:
                keep[-1] = (i, a)
        else:
            keep.append((i, a))
    return [i for i, _ in keep]


def runs_for(path, marks, fine=3.0, coarse=11.0):
    # split at the explicit reversals first, then at sharp corners inside each piece
    cut = sorted(set([0] + marks + [len(path) - 1]))
    pieces = [path[cut[i]:cut[i + 1] + 1] for i in range(len(cut) - 1)]
    runs = []
    for piece in pieces:
        if len(piece) < 2:
            continue
        f = smooth(resample(piece, fine), 3)
        cs = [0] + cusps(f) + [len(f) - 1]
        for a, b in zip(cs[:-1], cs[1:]):
            sub = f[a:b + 1]
            if len(sub) < 2:
                continue
            c = resample(sub, coarse)
            c[0], c[-1] = sub[0], sub[-1]
            runs.append(c)
    return runs


out = {}
for word, (prefix, spec) in SPECS.items():
    print(word)
    path, marks = chain(prefix, spec)
    runs = runs_for(path, marks)
    conv = [[[round((x - X0) / XH * 100, 2), round((BASE - y) / XH * 100, 2)] for x, y in r] for r in runs]
    out[word] = conv
    print(f'  {len(path)} skeleton px, {len(marks)} retraces, {len(runs)} runs, {sum(len(r) for r in runs)} points')

js = '// Generated by tools/trace-name/assemble.py. Do not edit by hand.\n'
js += '// Sacramento (Astigmatic, SIL OFL 1.1) rendered, skeletonised and chained into single pen strokes in writing order.\n'
js += '// This is drawing data taken from a font rendering, not a font. Units: baseline 0, x-height 100, y up.\n'
js += '// Each word is a list of runs; runs meet at cusps; a run is drawn as one centripetal Catmull-Rom spline.\n'
js += 'export const WORDS = ' + json.dumps(out, separators=(',', ':')) + ';\n'
open(OUT, 'w').write(js)
print('bytes', len(js))
