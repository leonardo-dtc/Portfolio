# trace-name

How v5 writes "leonardo carvalho" the way Apple writes hello: Sacramento's letterforms, traced to their centre lines and chained into single pen strokes in writing order. The output is `v5/assets/js/name-data.js`, which is drawing data, not a font. Sacramento is by Astigmatic and licensed under the SIL Open Font License 1.1. The site never loads the font.

Run from the repository root, in order:

```sh
node tools/trace-name/render.mjs                                   # work/leonardo.png, work/carvalho.png (640px, baseline 590, x 110)
python3 tools/trace-name/skel.py tools/trace-name/work/leonardo.png tools/trace-name/work/leo
python3 tools/trace-name/skel.py tools/trace-name/work/carvalho.png tools/trace-name/work/car
python3 tools/trace-name/assemble.py                               # writes v5/assets/js/name-data.js
node tools/trace-name/svg.mjs                                      # v5/assets/img/name.svg and name-2.svg (two lines)
```

- `skel.py` thins each word to a one-pixel skeleton (Zhang-Suen), cleans the pixel graph, and splits it into numbered branches between junctions. It writes `<prefix>-branches.json` and a `<prefix>-debug.png` with every branch numbered.
- `assemble.py` holds the writing order for each word (`SPECS`): branch ids in pen order. A repeated id means the pen goes back over that branch on the same pixels, which is how the tops of a, v and o and the stems of l, h and d avoid doubled edges. `>` on a loop picks the direction whose first steps move right (the slanted upstroke of l and h). The script smooths each run, keeps sharp turns as cusps, converts pixels to name units (x-height 100) and writes the module.
- `svg.mjs` writes the name as SVG for scripts off, print and the title's layout slot: one line, and two lines for windows under 700px. It keeps the 14-unit margin that `hello.js` expects around the name.
- If Sacramento or Chrome ever changes, the branch numbers may change with it. Check the debug images against `SPECS` before trusting a regenerated file.

The pen orders in `SPECS` were read from the debug images on 2026-09-24. The `work/` folder keeps the branch files they refer to.
