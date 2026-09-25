# v4 · a dim room with one lit window

The fourth edition of Leonardo Carvalho's portfolio, built beside the terminal
edition (repository root), the editorial edition (`v2/`) and the poster edition
(`v3/`). The editions are separate designs on purpose: one will be chosen and
the others archived, so **this edition shows, embeds or links nothing from the
other three**. Static HTML, CSS and vanilla JavaScript; no framework, no build
step. Every page reads without JavaScript.

## Preview

```sh
python3 tools/serve.py 8778
```

Then open `http://127.0.0.1:8778/v4/`.

## Where it comes from

Rebuilt 2026-09-21 after two rounds of feedback ("no personality", then "still
bland") and a measured study of nine sites Leonardo named for their feeling:
hasque.com, perryw-2023.webflow.io, rocky.framer.website, seyityilmaz.com,
altastudio.framer.website, creatiie.framer.website, myos.framer.website,
neiden.framer.media and lewius.framer.website. What they share, and what this
edition takes from each, is written up in the direction note in the Nexus vault
(`01 Projects/Resume Site - v4 Direction.md`) with the study beside it
(`00 Knowledge/Web Design - Nine Portfolio Feelings Study.md`). In short: a
ground with a material, one sentence set large with one contrasting word,
light, one living detail, numbers as objects, colour only where a real screen
supplies it, hover that changes geometry rather than colour, and generosity
with the small things a person makes.

Refined 2026-09-22 on Leonardo's review: his name in the hero instead of a
slogan, no numbers on the landing, Alta's settle on the tiles instead of a
tilt, experiments that open on hover, the static matched to Hasque's, Neiden's
bottom-edge blur, page transitions, cleaner microinteractions in the record,
and more space throughout.

## The room

- **Ground:** `#0d0d0f` under animated static (hasque.com's measure: a fixed canvas
  at one grain per CSS pixel, a new field every frame, 10% opacity, normal blend)
  and a light from above on every page. At the foot of the screen a progressive
  blur (neiden.framer.media's eight layers, .3 to 20px) dissolves content into
  the room; it fades out as the page ends so the last lines stay sharp.
- **The window:** the hero is a glass-barred frame (Perry Wang's recipe, measured)
  that introduces him: "Leonardo Carvalho" with a three-layer glow (cool below,
  warm above, a white halo), then one plain line about what he does, the first
  sentence in full ink; the light in the frame follows the pointer. Under it his
  portrait beside a status block (Now, From) and a live clock for Groton. No
  numbers on the landing: they wait on the pages that explain them.
- **Work as tiles:** four 44px-radius tiles in Hasque's 37/63 rhythm that swaps
  each row, each in the colour of its own screen: aducanumab on paper as the
  manuscript's first page (it has no screen), Loquar on gold in a Mac window,
  Genuvalens on blue with the hand-drawn layout lit like a page, OCAPEX on sand
  on an iPhone. On hover the screen settles from 1.05 to 1 and a corner arrow
  grows in and turns (altastudio.framer.website's image settle). Captions sit
  under the tiles.
- **Experiments:** an italic, numbered index of the smaller things (the class
  games, the music video, the sports index, the arrangements, Daedalus, the
  robots, the rocket). At rest only the titles show; hovering or focusing one
  opens it: the description unfolds, a wash of its own colour comes up behind
  it, and the rest dim and blur. An item can take a picture instead of the wash
  with `style="--img: url(...)"` on its `li`.
- **The record:** five first-person sentences from the About essay over dated
  rows. A hovered row leans in and the rest of its group steps back; three rows
  summon a preview that springs in at one fixed place on the right while the
  right-hand column steps back. Beside them, sticky, the interests with one-line
  verdicts and a This fall list of what the term looks like.
- **Close:** the email in red inside a sentence, the profile rows, and a giant
  "Leonardo" wordmark.
- **Between pages:** cross-document view transitions. The old page steps back
  and softens, the new one rises, the menu holds still and the current tab's
  mark slides to its new tab. Browsers without them get a short fade instead.

## Pages

| Path | Page | Copy source |
| --- | --- | --- |
| `index.html` | Home: menu, the window, work tiles, experiments, the record and interests, contact, the close | `v2/index.html`, `v2/about/`, `v2/resume/` (copy only) |
| `about/` | The essay, the facts, and Now | `v2/about/` |
| `hockey/` | Recruiting profile; prints white on one Letter sheet | `v2/hockey/` |
| `resume/` | The full record with a section rail and entry anchors | `v2/resume/` |
| `work/aducanumab/`, `work/genuvalens/` | Research pages: abstract, question, method, the numbers, findings, limitations, references | `v2/work/…` |
| `work/loquar/`, `work/daedalus/`, `work/ocapex/`, `work/freecode/`, `work/this-site/` | Product and community pages | `v2/work/…` |

Facts and caveats come from the v2 copy and `CONTENT-REVIEW.md`; the design
does not. Copy is first person, no en or em dashes, no superlatives. Coaches are
named by role only, the hometown is South Florida, correspondence goes via a
parent (Leonardo's 2026-09-18 decisions).

## Files

| Path | Purpose |
| --- | --- |
| `assets/css/site.css` | The one stylesheet: tokens, the static, the bottom edge, menu and pill, the window, tiles and devices, experiments, the record, interests, the close, previews, the reveal, page changes, sheets, print |
| `assets/js/site.js` | The static, the window's light, the reveal cascade, the clock, row previews, the bottom edge's fade, the sticky column, page changes. All decoration; the page reads without it |
| `assets/fonts/` | `switzer-variable.woff2` (Fontshare Free Font License, `FFL-switzer.txt`), Instrument Serif italic latin and latin-ext (OFL), JetBrains Mono (OFL). Self-hosted; no third-party requests |
| `assets/img/` | Loquar's landing page, ocapex.com at desktop and phone width, the Genuvalens figures and hardware sketch, the portrait. Each raster has a `.json` sidecar naming its origin |
| `DESIGN.md`, `.impeccable/design.json` | The design system, recorded from the built pages |

## Conventions

- Type: Switzer for everything that reads; Instrument Serif italic for one phrase in each sheet's title or dek, the paper tile's title and the experiments' titles; JetBrains Mono for the clock only. Sizes: 96px name (fluid), 20px introduction, 44px page titles, 22px section titles, 18px group leads, 16px body, 14px meta, 13px on the paper tile's byline and abstract; nothing smaller.
- Colour: the ground, one white at three strengths, hairlines at 10%, one red `#e03a52` for the email, the paper tile `#f2efe8`, the screen colours gold `#CDAA6D`, sand `#E4C4A2`, blue `#1E63A8`, and, as light behind experiments only, green `#4FB477` and violet `#8B6CF0`.
- Radii: 44 tiles, 24 windows, sheets and wells, 16 for the window's inner frame, 12 buttons and the portrait, pill controls. One long soft shadow, `0 54px 60px rgba(0,0,0,.35)`.
- Motion: one reveal (rise and fade on the `translate` property, 850ms, cascading in reading order, once); tiles settle from 1.05 to 1 with a turning arrow; experiments open and dim their siblings; rows lean and their group steps back; the window's light follows the pointer; pages cross-fade. Nothing rotates. All of it stops under `prefers-reduced-motion`.
- Space: 176px between sections (112px below 900px), 80px between record groups, 64px between tile rows.
- Hidden-until-ready content (film link, 2026-27 stats, schedule, PDF) is an HTML comment saying what fills it.
- Keep `<meta name="robots" content="noindex">` on every page.
