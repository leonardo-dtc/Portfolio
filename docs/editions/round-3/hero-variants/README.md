# The three hero prototypes

In round three, three Glowtime-style treatments of the v5 hero's name were built and judged: A, B and C. B (Neon flow) won and is what v5 ships, refined after the review: it gained the reference's orange and cyan, and a dark stage by night. A and C are kept here in case Leonardo prefers one of them (round-3.md, T41). `compare-A-B-C.jpg` shows all three, by night, by day and on a phone, before B's refinements.

- `A-traced-light.patch`: four drifting contour ribbons, each in its own colour, over a translucent fill.
- `C-iridescent-glass.patch`: the glass letters lit by swirling iridescent light, with faint ghost outlines.

Both are plain `git diff` output against `d0e22b5`, the commit before round three, and touch only the hero: `v5/assets/js/hero.js`, the ink section of `v5/assets/js/shaders.js`, `v5/assets/js/room.js`, the hero rules in `v5/assets/css/site.css`, and `v5/index.html`.

To try one, apply it to a checkout of that commit: `git switch --detach d0e22b5 && git apply docs/editions/round-3/hero-variants/A-traced-light.patch`. Carrying it onto the current v5 means re-applying its ink section over the current one by hand, since B's has since changed in the same places.
