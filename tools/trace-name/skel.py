"""Skeletonize a monoline script rendering and split the skeleton into branches.

Usage: python3 skel.py <png> <out_prefix>
Writes <out_prefix>-branches.json and <out_prefix>-debug.png.
"""
import json
import sys
from collections import deque

import matplotlib
matplotlib.use('Agg')
import matplotlib.pyplot as plt
import numpy as np
from scipy import ndimage


def zhang_suen(img):
    img = img.copy().astype(np.uint8)
    changed = True
    while changed:
        changed = False
        for step in (0, 1):
            p = np.pad(img, 1)
            P2 = p[:-2, 1:-1]; P3 = p[:-2, 2:]; P4 = p[1:-1, 2:]; P5 = p[2:, 2:]
            P6 = p[2:, 1:-1]; P7 = p[2:, :-2]; P8 = p[1:-1, :-2]; P9 = p[:-2, :-2]
            nb = [P2, P3, P4, P5, P6, P7, P8, P9]
            B = sum(n.astype(np.int32) for n in nb)
            seq = nb + [P2]
            A = sum(((seq[i] == 0) & (seq[i + 1] == 1)).astype(np.int32) for i in range(8))
            if step == 0:
                c1 = (P2 * P4 * P6) == 0; c2 = (P4 * P6 * P8) == 0
            else:
                c1 = (P2 * P4 * P8) == 0; c2 = (P2 * P6 * P8) == 0
            m = (img == 1) & (B >= 2) & (B <= 6) & (A == 1) & c1 & c2
            if m.any():
                img[m] = 0
                changed = True
    return img.astype(bool)


RING = [(-1, 0), (-1, 1), (0, 1), (1, 1), (1, 0), (1, -1), (0, -1), (-1, -1)]
N8 = RING


def main(png, prefix, spur=20):
    im = plt.imread(png)
    g = im[..., :3].mean(axis=2) if im.ndim == 3 else im
    ink = g > 0.5
    sk = zhang_suen(ink)
    H, W = sk.shape
    pix = set(zip(*np.nonzero(sk)))

    def adj(p):
        y, x = p
        out = []
        for dy, dx in N8:
            q = (y + dy, x + dx)
            if q not in pix:
                continue
            if dy and dx and ((y, x + dx) in pix or (y + dy, x) in pix):
                continue          # a diagonal step already bridged by a 4-neighbour
            out.append(q)
        return out

    A = {p: adj(p) for p in pix}

    def trace(A):
        nodes = {p for p, n in A.items() if len(n) != 2}
        used = set(); branches = []
        for n in nodes:
            for m in A[n]:
                if (n, m) in used:
                    continue
                chain = [n, m]; used.add((n, m)); used.add((m, n))
                prev, cur = n, m
                while cur not in nodes:
                    nx = [q for q in A[cur] if q != prev]
                    if not nx:
                        break
                    prev, cur = cur, nx[0]
                    used.add((prev, cur)); used.add((cur, prev))
                    chain.append(cur)
                branches.append(chain)
        seen = {q for b in branches for q in b}
        for p in A:                      # closed loops with no node on them
            if p in seen or len(A[p]) != 2:
                continue
            chain = [p]; prev, cur = p, A[p][0]
            while cur != p:
                chain.append(cur); seen.add(cur)
                nx = [q for q in A[cur] if q != prev]
                prev, cur = cur, nx[0]
            chain.append(p); seen.add(p)
            branches.append(chain)
        return nodes, branches

    for _ in range(4):                   # prune short spurs that end in a free end
        nodes, branches = trace(A)
        cut = False
        for b in branches:
            e0, e1 = len(A[b[0]]) == 1, len(A[b[-1]]) == 1
            if (e0 != e1) and len(b) < spur:
                for q in (b[1:] if e1 else b[:-1]):
                    if q in A and len(A[q]) <= 2 or q in (b[-1] if e1 else b[0],):
                        for r in A.pop(q, []):
                            if r in A:
                                A[r] = [t for t in A[r] if t != q]
                cut = True
        if not cut:
            break
    nodes, branches = trace(A)

    # merge node pixels that touch into clusters
    cl, cid = {}, 0
    for p in sorted(nodes):
        if p in cl:
            continue
        st = [p]; cl[p] = cid
        while st:
            q = st.pop()
            for dy, dx in N8:
                r = (q[0] + dy, q[1] + dx)
                if r in nodes and r not in cl:
                    cl[r] = cid; st.append(r)
        cid += 1
    cent = {}
    for p, i in cl.items():
        cent.setdefault(i, []).append(p)
    cent = {i: (float(np.mean([p[1] for p in ps])), float(np.mean([p[0] for p in ps]))) for i, ps in cent.items()}
    # drop branches that only link two pixels of the same cluster
    branches = [b for b in branches if not (len(b) <= 3 and b[0] in cl and b[-1] in cl and cl[b[0]] == cl[b[-1]])]

    out = []
    for b in branches:
        a = cl.get(b[0], -1); z = cl.get(b[-1], -1)
        pts = [[float(q[1]), float(q[0])] for q in b]
        out.append({'pts': pts, 'a': a, 'z': z, 'len': len(pts), 'endA': len(A.get(b[0], [])) == 1, 'endZ': len(A.get(b[-1], [])) == 1})
    out.sort(key=lambda b: (min(p[0] for p in b['pts'])))
    for i, b in enumerate(out):
        b['id'] = i
    json.dump({'shape': [H, W], 'nodes': {str(k): v for k, v in cent.items()}, 'branches': out}, open(prefix + '-branches.json', 'w'))

    fig = plt.figure(figsize=(W / 100, H / 100), dpi=100)
    ax = fig.add_axes([0, 0, 1, 1])
    ax.imshow(ink, cmap='gray', alpha=.22)
    cmap = plt.get_cmap('tab10')
    for b in out:
        p = np.array(b['pts'])
        ax.plot(p[:, 0], p[:, 1], '-', color=cmap(b['id'] % 10), lw=3)
        m = p[len(p) // 2]
        ax.text(m[0], m[1], str(b['id']), color='white', fontsize=15, weight='bold', ha='center', va='center',
                bbox=dict(boxstyle='round,pad=.15', fc='black', ec='none', alpha=.8))
    for k, (x, y) in cent.items():
        ax.plot(x, y, 'o', color='red', ms=7)
        ax.text(x + 10, y - 10, 'n%d' % k, color='red', fontsize=12, weight='bold')
    ax.set_xlim(0, W); ax.set_ylim(H, 0); ax.axis('off')
    fig.savefig(prefix + '-debug.png')
    print(len(out), 'branches;', cid, 'node clusters; lengths:', sorted(b['len'] for b in out))


def segments(kind, junc, nbrs):
    rest = {p for p in kind if p not in junc}
    comps = []
    while rest:
        p = rest.pop()
        comp = [p]; q = deque([p])
        while q:
            c = q.popleft()
            for r in nbrs(*c):
                if r in rest:
                    rest.discard(r); comp.append(r); q.append(r)
        comps.append(comp)
    return comps


def bfs_path(a, z, segset, nbrs):
    prev = {a: None}; q = deque([a])
    while q:
        c = q.popleft()
        if c == z:
            break
        for r in nbrs(*c):
            if r in segset and r not in prev:
                prev[r] = c; q.append(r)
    path = []; c = z
    while c is not None:
        path.append(c); c = prev.get(c)
    return path[::-1]


def order_loop(a, segset, nbrs):
    path = [a]; seen = {a}; c = a
    while True:
        nx = [r for r in nbrs(*c) if r in segset and r not in seen]
        if not nx:
            break
        nx.sort(key=lambda r: abs(r[0] - c[0]) + abs(r[1] - c[1]))
        c = nx[0]; path.append(c); seen.add(c)
    path.append(a)
    return path


if __name__ == '__main__':
    main(sys.argv[1], sys.argv[2])
