#!/usr/bin/env python3
"""Bake a goaltender's mask OBJ into assets/data/mask.js as ASCII frames.

The mask is a real 3D model (45k verts), not a procedural shape, so the browser
never sees geometry: it gets N pre-rendered frames across a yaw sweep and picks
one from the cursor's X position. Discrete steps, like the reference site's
hand-drawn art variants — not a continuous solve.

Every frame shares ONE centre and scale, taken from the head-on view, so the
head turns in place instead of jittering as frames swap.

    python3 tools/make-mask.py <model.obj> [frames]

Stored per cell: one hex digit of shaded value, a space where the mask is not.
"""
import json, math, sys
from pathlib import Path
import numpy as np

np.seterr(all='ignore')          # BLAS emits spurious matmul warnings on this data

SRC    = Path(sys.argv[1] if len(sys.argv) > 1 else 'assets/img/GMask.obj')
FRAMES = int(sys.argv[2]) if len(sys.argv) > 2 else 11
OUT    = Path('assets/data/mask.js')
GW, GH = 52, 58          # bake grid; the browser resamples to the field's own
RES    = 190             # pixels per side; low enough that 45k vertices
                         # cover it densely, since we splat points, not triangles
YAW_SPAN = 0.55          # radians either side of head-on (~31 degrees)
FRONT  = math.pi / 2     # this model faces +X, so head-on is a quarter turn
SPLAT  = 2
HEX    = '0123456789abcdef'
COVER  = 0.40            # a cell needs this share of hits to count as mask.
                         # High, so a cage cell that is mostly opening becomes a
                         # hole rather than an averaged grey — the only way the
                         # cage survives being resampled to the field's grid.

KEY  = np.array([-0.45, 0.55, 0.70]); KEY  /= np.linalg.norm(KEY)
FILL = np.array([ 0.62, 0.10, 0.45]); FILL /= np.linalg.norm(FILL)


def load(path):
    V = []; N = []; FV = []; FN = []
    for line in open(path):
        if line.startswith('v '):    V.append([float(x) for x in line.split()[1:4]])
        elif line.startswith('vn '): N.append([float(x) for x in line.split()[1:4]])
        elif line.startswith('f '):
            vi = []; ni = []
            for p in line.split()[1:]:
                a = p.split('/')
                vi.append(int(a[0]) - 1)
                ni.append(int(a[2]) - 1 if len(a) > 2 and a[2] else 0)
            for k in range(1, len(vi) - 1):
                FV.append([vi[0], vi[k], vi[k + 1]]); FN.append([ni[0], ni[k], ni[k + 1]])
    V = np.asarray(V, float); N = np.asarray(N, float)
    n = np.linalg.norm(N, axis=1, keepdims=True); n[n < 1e-9] = 1; N /= n
    FV = np.asarray(FV, np.int64); FN = np.asarray(FN, np.int64)
    VN = np.zeros_like(V)
    np.add.at(VN, FV.ravel(), N[FN.ravel()])          # one normal per vertex
    n = np.linalg.norm(VN, axis=1, keepdims=True); n[n < 1e-9] = 1; VN /= n
    assert np.isfinite(V).all() and np.isfinite(VN).all(), 'non-finite geometry'

    # Sample over the TRIANGLES rather than taking the vertices: this mesh is
    # dense in the detailed areas and sparse across the flat ones, so splatting
    # vertices leaves whole patches of the shell unwritten and the shading comes
    # out pocked.

    bar = np.array([[1/3,1/3,1/3],[.6,.2,.2],[.2,.6,.2],[.2,.2,.6],
                    [.5,.5,0],[.5,0,.5],[0,.5,.5],
                    [.8,.1,.1],[.1,.8,.1],[.1,.1,.8],
                    [.45,.45,.10],[.45,.10,.45],[.10,.45,.45]], float)
    A, B, C = V[FV[:,0]], V[FV[:,1]], V[FV[:,2]]
    An, Bn, Cn = VN[FV[:,0]], VN[FV[:,1]], VN[FV[:,2]]
    PT = np.concatenate([w[0]*A + w[1]*B + w[2]*C for w in bar])
    PN = np.concatenate([w[0]*An + w[1]*Bn + w[2]*Cn for w in bar])
    n = np.linalg.norm(PN, axis=1, keepdims=True); n[n < 1e-9] = 1; PN /= n
    return np.ascontiguousarray(PT), np.ascontiguousarray(PN)


def rot(yaw):
    c, s = math.cos(yaw), math.sin(yaw)
    return np.array([[c, 0, s], [0, 1, 0], [-s, 0, c]])


def project(V, VN, yaw):
    R = rot(yaw)
    return V @ R.T, VN @ R.T


def raster(P, Nn, centre, scale, W, H):
    """splat vertices with a correct z-buffer: one point list, one depth sort"""
    P = P - centre
    xs = []; ys = []; zs = []; ns = []
    for oy in range(SPLAT):
        for ox in range(SPLAT):
            xs.append(P[:, 0] * scale + W / 2 + ox - SPLAT / 2)
            ys.append(H / 2 - P[:, 1] * scale + oy - SPLAT / 2)
            zs.append(P[:, 2]); ns.append(Nn)
    X = np.concatenate(xs).astype(np.int32); Y = np.concatenate(ys).astype(np.int32)
    Z = np.concatenate(zs); NC = np.concatenate(ns)
    ok = (X >= 0) & (X < W) & (Y >= 0) & (Y < H)
    X, Y, Z, NC = X[ok], Y[ok], Z[ok], NC[ok]
    o = np.argsort(Z)                                  # far first; nearest writes last
    idx = Y[o] * W + X[o]
    depth = np.full(W * H, -1e9); nb = np.zeros((W * H, 3))
    depth[idx] = Z[o]; nb[idx] = NC[o]
    nrm = nb.reshape(H, W, 3)
    # A surface whose normal points away from the camera is the INSIDE of the
    # shell, seen through a gap in the cage. Dropping those makes the cage read
    # as real holes — the field's own noise shows through them — which is the
    # only thing that survives being averaged down to the field's cell grid.
    # Keep them and the whole cage greys out into an egg.
    hit = (depth > -1e8).reshape(H, W) & (nrm[:, :, 2] > 0.02)
    return hit, nrm, depth.reshape(H, W)


def smooth(a, k=2):
    out = a.copy()
    for _ in range(k):
        p = np.pad(out, ((1, 1), (1, 1)), mode='edge')
        out = (p[:-2, 1:-1] + p[2:, 1:-1] + p[1:-1, :-2] + p[1:-1, 2:] + 2 * out) / 6
    return out


def fill(hit, nrm, depth=None, passes=2):
    """Close the pinholes splatting leaves, and nothing else. Requiring all four
    neighbours means an isolated gap is filled while the cage's real openings —
    which are many cells across — are left alone."""
    h = hit.copy(); n = nrm.copy()
    for _ in range(passes):
        pad_h = np.pad(h, ((1, 1), (1, 1)))
        pad_n = np.pad(n, ((1, 1), (1, 1), (0, 0)))
        cnt = (pad_h[:-2, 1:-1].astype(int) + pad_h[2:, 1:-1] +
               pad_h[1:-1, :-2] + pad_h[1:-1, 2:])
        acc = (pad_n[:-2, 1:-1] + pad_n[2:, 1:-1] +
               pad_n[1:-1, :-2] + pad_n[1:-1, 2:])
        gap = (~h) & (cnt == 4)
        n[gap] = acc[gap] / cnt[gap][:, None]
        h = h | gap
    ln = np.linalg.norm(n, axis=2, keepdims=True); ln[ln < 1e-9] = 1
    return h, n / ln, depth


def shade(hit, nrm, depth=None):
    lam = np.clip(nrm @ KEY, 0, 1)
    fil = np.clip(nrm @ FILL, 0, 1)
    spec = lam ** 22
    v = 0.10 + 0.74 * lam + 0.22 * fil + 0.30 * spec
    if depth is not None:
        # Depth cue. The cage sits recessed behind the cheeks and the brow, so
        # darkening by depth turns it into the band across the face that makes a
        # goaltender's mask legible — the lattice itself is far below the
        # resolution the field's cells can hold, but the band is not.
        d = depth.copy()
        inside = hit & np.isfinite(d) & (d > -1e8)
        if inside.any():
            lo, hi = np.percentile(d[inside], [4, 96])
            t = np.clip((d - lo) / max(1e-6, hi - lo), 0, 1)
            v = v * (0.34 + 0.66 * t)
    return np.clip(smooth(v * hit), 0, 1)


def to_grid(hit, val, gw, gh):
    H, W = hit.shape
    rows = []
    for r in range(gh):
        y0, y1 = int(r * H / gh), max(int(r * H / gh) + 1, int((r + 1) * H / gh))
        line = ''
        for c in range(gw):
            x0, x1 = int(c * W / gw), max(int(c * W / gw) + 1, int((c + 1) * W / gw))
            m = hit[y0:y1, x0:x1]
            if m.mean() < COVER:
                line += ' '
            else:
                v = val[y0:y1, x0:x1][m].mean()
                line += HEX[max(0, min(15, int(round(v * 15))))]
        rows.append(line.rstrip())
    return rows


def main():
    V, VN = load(SRC)
    # one centre and scale for every frame, taken head-on, so the head turns in place
    P0, _ = project(V, VN, FRONT)
    centre = (P0.min(0) + P0.max(0)) / 2
    span = max(np.ptp(P0[:, 0]), np.ptp(P0[:, 1]))
    scale = RES / span / 1.04
    aspect = np.ptp(P0[:, 0]) / np.ptp(P0[:, 1])

    frames = []
    for i in range(FRAMES):
        f = 0 if FRAMES == 1 else (i / (FRAMES - 1)) * 2 - 1        # -1 .. +1
        P, Nn = project(V, VN, FRONT + f * YAW_SPAN)
        hit, nrm, dep = raster(P, Nn, centre, scale, RES, RES)
        hit, nrm, dep = fill(hit, nrm, dep)
        frames.append(to_grid(hit, shade(hit, nrm, dep), GW, GH))
        print('  frame %2d/%d  yaw %+6.1f deg  %5.1f%% covered'
              % (i + 1, FRAMES, math.degrees(f * YAW_SPAN), 100 * hit.mean()))

    OUT.parent.mkdir(parents=True, exist_ok=True)
    OUT.write_text(
        '/* Generated by tools/make-mask.py from %s — do not edit by hand.\n'
        '   %d frames across +/-%.0f degrees of yaw, one hex digit of shaded value\n'
        '   per cell and a space where the mask is not. The browser picks a frame\n'
        '   from the cursor, so the turn is discrete, not solved. */\n'
        'window.LCMask = %s;\n'
        % (SRC.name, FRAMES, math.degrees(YAW_SPAN),
           json.dumps({'cols': GW, 'rows': GH, 'levels': 16,
                       'aspect': round(float(aspect), 4), 'frames': frames}, indent=0)),
        encoding='utf-8')
    print('%s  %d frames  %dx%d  %.1f KB' % (OUT, FRAMES, GW, GH, OUT.stat().st_size / 1024))


if __name__ == '__main__':
    main()
