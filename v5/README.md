# v5 · the glass edition

The fifth edition of Leonardo Carvalho's portfolio, built beside the terminal
edition (repository root), the editorial edition (`v2/`), the poster edition
(`v3/`) and the dim-room edition (`v4/`). The editions are separate designs on
purpose: one will be chosen and the others archived, so **this edition shows,
embeds or links nothing from the other four**. Static HTML, CSS and vanilla
JavaScript; no framework, no build step. Every page reads without JavaScript.

## Preview

```sh
python3 tools/serve.py 8778
```

Then open `http://127.0.0.1:8778/v5/`. The hero plays on the first home view of
a browser session and on every reload of the home page; add `?nohello` to skip
it.

## Where it comes from

Built 2026-09-24 from Leonardo's brief: an Apple Vision Pro style with Liquid
Glass and clean styling, a hero that writes his name the way Apple writes
"hello" over an Apple-style background, a clear moment that takes you into
glass mode, and motion that feels like iOS. The references were four Dribbble
concepts (a spatial Spotify, Steam for visionOS, a Vision Pro dashboard and a
Vision Pro shop), Apple's Liquid Glass and visionOS guidance, and the macOS
Tahoe and iOS 26 wallpapers.

His decisions in the brainstorm: the whole portfolio is glass mode and the
hello is its front door; the background is the Tahoe glass wave over
out-of-focus cobalt forms, drawn flat like Apple's rather than as 3D ribbons,
with Night and Day following the system; side windows turned toward you as in
visionOS, with pointer parallax and no hover tilt; the name in Sacramento,
lowercase, traced into pen strokes, one line (two on phones), in liquid glass
with a moving surface and an overlapped pace; and one room with many windows.
The spec is `docs/superpowers/specs/2026-09-24-v5-liquid-glass-design.md`, with
the approved comps beside it in `v5-comps/`, and the build plan is
`docs/superpowers/plans/2026-09-24-v5-liquid-glass.md`.

**Round two (October 2026), Leonardo's polish notes.** The movement blurred text
and UI; the tab bar sat centred on the window's edge; the Now window could go;
and the hero wanted a different name than Apple's hello: big blocky text (the
face from the dim-room edition) in Liquid Glass or metal, glowing from behind
with a subtle interaction, and "click the title to proceed" instead of an Enter
button, leading into the windows with a clean transition. What changed, with the
research behind it (visionOS keeps windows fixed in space; Apple's Liquid Glass
guidance keeps glass out of the content layer and to controls and navigation;
WCAG 2.3.3 asks that motion set off by interaction can be turned off):

- **Nothing blurs in motion.** Page changes are a crossfade (140 ms out, 220 ms
  in, 6 px of rise, no blur or scale); a sheet's parent steps back about 3% and
  dims without blurring; windows no longer follow the pointer (only the light
  does, and the room leans behind them); first arrivals are short and critically
  damped. The room's own defocus during the hero stays: it is background.
- **The tab bar sits 14 px off the main window's left edge** and opens to the
  left, its right edge and icons fixed, so it never covers the window (on
  windows narrower than about 1150 px there is no room for that, and the opened
  bar leans over the window's edge, frosted).
- **One side window per page**, on the right, kept in place across page changes
  (its contents crossfade with the window's). Home lost Now and keeps This fall,
  with Groton's live time; the other pages fold their two side windows into one.
  Tab bar, main window and side window are centred as one group.
- **The hero** is "Leonardo Carvalho" in Switzer, drawn as solid Liquid Glass
  with a light behind it. Glass rather than metal: it belongs to the room and
  the rest of the edition, and with frosted faces, bright rims and the light
  behind it reads at a glance in every palette, Night and Day.

## The room

- **One WebGL2 canvas behind everything.** The first pass draws the scene (a
  navy sky to a violet horizon, a far hill, soft cobalt and periwinkle forms, a
  violet sheet, and the glass wave with one bright crest) into a mipmapped
  texture. The second pass composites it, reading the mips at any blur, so the
  hero's defocus and every pane's frost cost one texture read.
- **Motion:** the crest undulates and the forms drift over 20 to 60 seconds, and
  the room leans a little against the pointer while the windows stay still.
- **Night and Day** follow `prefers-color-scheme`. A still of each
  (`room-night.webp`, `room-day.webp`, rendered from the shader by
  `tools/room-stills.mjs`) is the CSS background before WebGL starts, without
  it, and with scripts off.

## The hero

- **The name** is "Leonardo Carvalho" in Switzer at 780, tracked -0.03 em, one
  line from 700 px wide and two lines ("Leonardo" over "Carvalho") below. It is a
  real button ("Leonardo Carvalho. Enter the portfolio") holding the name as
  text: with the room that text is transparent and the room draws the glass
  from it, so the hero, its layout and its control are one element.
- **The glass:** a mask of the letters (the letters, a soft height for their
  bevel, a wide blur for the light behind) that the room turns into solid glass:
  frosted faces lit from behind, a bright rim on the side facing the light, a
  shaded far bevel, a soft highlight and a shimmer of moving surface. The light
  behind spills round the letters in the color style's hue. By day the faces are
  a deeper cobalt so the name reads against the bright room.
- **Interaction:** the highlight and the glow lean gently toward the pointer,
  hovering lifts the light, a press flares it briefly; nothing moves the letters.
  The glass and the light come up over about 0.9 s (at once under reduced
  motion), and the hint at the foot of the screen follows: "Click the title to
  proceed", or "Tap the title to proceed" on touch screens.
- **Entering:** click or tap the title (or its hint), or press Return. The room
  pulls focus; the name glides into the main window's title slot on one
  critically damped spring of about 0.7 s, turning white and easing from weight
  780 to 700; the window's glass forms under it, then its contents, the side
  window and the tab bar fade in. Landed, it hands off to the HTML title (the
  same glyphs) and the glass switches off: after the hero the title is plain
  text, as Apple's guidance keeps Liquid Glass out of the content layer.
- **Fallbacks:** without WebGL2, under reduced transparency or in forced colours
  the hero is the same text in CSS glass with a CSS glow, the same hint, and a
  fade into the windows. Reduced motion shows the name at once and fades in
  150 ms. Without scripts there is no hero, and print shows the text title.
- Later home views (and `?nohello`) open straight into the windows; the session
  key is still `v5:hello`. Reloading the home page brings the hero back (the
  head script reads the navigation type), so it can be reviewed without
  clearing storage.

## The glass

- Every glass element carries `data-glass` (`window`, `ornament`, `control` or
  `prominent`). Each frame, once everything that moves has moved, `panels.js`
  reports where they are (the angled side window through four corner probes
  that the browser projects), and the room
  draws their glass under the HTML: frost from the blurred room, lensing within
  about 30 px of a window's rounded edge (20 px on smaller glass), a tint, a bright rim, a highlight near the
  pointer, soft shadows, and a light from within when a control is pressed.
- At night the glass is luminous cobalt, as in the comps; by day a deeper blue.
  It caps its own brightness, so text keeps 4.5:1 or more whatever the room
  behind it.
- Glass appears and disappears by ramping its lensing and frost, as Apple
  describes Liquid Glass. Content inside a window never gets a second layer of
  glass.
- Without WebGL2, with reduced transparency or forced colours, or in print, the
  same elements use CSS glass over the still. The tab bar always does, at every
  size, because it can lie over content (the window's edge when it opens on a
  narrow laptop, scrolling content on phones) and only backdrop glass can frost
  HTML; it is also why its glass keeps its true shape while it widens.

## Glass mode: one room, many windows

- **The main window** sits with the **tab bar** 14 px off its left edge: icons at
  rest, names when you point at it (it opens to the left, its icons staying
  put), and a bubble that stretches and slides to the next tab. The **toolbar**
  crosses its bottom edge with the page's own actions. The **window bar** under
  it drags 40 px and springs back.
- **One side window**, turned 24° toward you, floats on the right at 1360 px and
  wider, and tab bar, main window and side window are centred as one group.
  Below 1360 px its content becomes sections inside the main window.
- **Changing page** crossfades the window's contents in place, and the side
  window's with them; no window moves and the tab bubble slides. Every page is
  still its own HTML file, so Back, Forward, deep links and printing all work.
- **Projects open as sheets** in front of the window you came from, which steps
  back about 3%, dims and lets its contents fade (nothing blurs). The close
  button (top left), Escape or Back closes a sheet, and its toolbar pages to the
  neighbouring projects. A project loaded directly opens as a sheet over Work.
- **Below 900 px** the window becomes a full-screen sheet with a floating tab bar
  at the bottom, as in iOS 26, and nothing is angled. Below 700 px the title is the
  two-line name, as the hero sets it there.

## The color style control

A glass button in the bottom-right corner (beside the tab bar on phones, as in
iOS 26) opens a small panel for trying colors: eight palettes (Cobalt, Violet,
Rose, Ember, Gold, Emerald, Teal, Graphite), a Hue and a Vibrance slider, and
Auto, Night or Day. It turns the whole room in the shader, so every pane of
glass and the hero's name and the light behind it follow; the choice is kept in this
browser only (`assets/js/hue.js`).

## Pages

| Path | Page | Copy source |
| --- | --- | --- |
| `index.html` | Home: the hero, then the name as the title, the introduction, work cards, experiments, the record as five first-person leads over dated rows, contact. Side window: This fall, with Groton's live time | `v4/index.html` (copy only) |
| `work/` | All seven projects as cards, filtered by the toolbar (All, Research, Build, Music, Community). Side window: In progress, then Experiments | new, from the project pages |
| `hockey/` | Recruiting profile: stats with the sample size, how I play, academic snapshot, team history. Side window: Measurables, then Coach contacts. Prints on one Letter sheet | `v4/hockey/` |
| `about/` | The essay, the facts and Now, fall 2026. Side window: the portrait and From, then Interests | `v4/about/` |
| `resume/` | The full record with an anchor on every entry. Side window: Sections (jumps within the window), then Contact | `v4/resume/` |
| `work/aducanumab/`, `work/genuvalens/` | Research sheets: abstract, question, method, the numbers, findings, limitations, references | `v4/work/…` |
| `work/loquar/`, `work/daedalus/`, `work/ocapex/`, `work/freecode/` | Product and community sheets | `v4/work/…` |
| `work/this-site/` | This edition: the room, the name, the glass | new copy |

Facts and caveats come from the earlier copy and `CONTENT-REVIEW.md`; the design
does not. Copy is first person, no en or em dashes, no superlatives, and no
numbers on the landing. Coaches are named with their roles only, the hometown is
South Florida, correspondence goes via a parent.

## Files

| Path | Purpose |
| --- | --- |
| `assets/css/site.css` | The one stylesheet: Switzer's `@font-face`, tokens, the room, windows and ornaments, CSS glass, the hero, content components, sheets, layouts, preferences, print |
| `assets/fonts/` | `switzer-variable.woff2` (Switzer, Indian Type Foundry, via Fontshare; weights 100 to 900) and its licence, `FFL-switzer.txt` (the ITF Free Font License allows self-hosting and wordmarks). The name only; everything else is the system face |
| `assets/js/boot.js` | Entry: starts the room, the windows, the hero and navigation; the Work filters, print buttons and Groton's clock |
| `assets/js/room.js`, `shaders.js` | The WebGL2 room: scene, composite, glass panels and the ink (the hero's glass name); frame budget |
| `assets/js/panels.js`, `geometry.js` | Where the glass is: element boxes and projected corners into inverse homographies |
| `assets/js/windows.js` | Layout modes, the side window, tab bar, materialising, sheets, the window bar, the pointer's light and the room's lean, hover and press light, scrolling from anywhere |
| `assets/js/hero.js` | The hero: the name's layout read glyph by glyph from the page, its glass mask, the light and its interaction, the glide into the title and the hand-off, the fallbacks |
| `assets/js/nav.js` | Page swaps (the side window kept in place), sheets, history, direct loads of projects |
| `assets/js/springs.js`, `frame.js` | Apple-style springs (response and damping) on one shared frame loop |
| `assets/img/` | The portrait, Loquar's landing page, ocapex.com, the Genuvalens figures, the two room stills. Each file has a `.json` sidecar naming its origin |
| Kept, unreferenced | The written hello of the first round: `assets/js/hello.js` (the pen timeline and the Enter button), `name.js` and `name-data.js` (Sacramento traced to pen strokes), `assets/img/name.svg` and `name-2.svg` (the name as an SVG, one line and two), and `tools/trace-name/` outside the edition. Nothing imports or links them any more; they stay in case the written name comes back |
| `DESIGN.md` | The design system, recorded from the built pages |

Tools and checks live outside the edition: `tools/trace-name/` (kept, see
above) and `tools/room-stills.mjs` regenerate the written name and the stills, and
`tests/v5/` holds the unit tests and the browser checks.

## Checks

```sh
node --test tests/v5/unit/*.test.mjs
node tests/v5/e2e/pages.mjs   # then links, room, glass, layouts, hello (the hero), nav, modes, contrast, keys, perf, audit
node tests/v5/e2e/capture.mjs # screenshots of every page at five widths into .impeccable/review/v5/
```

The browser checks use the installed Chrome through playwright-core and expect
the preview server on port 8778. Elsewhere, `PLAYWRIGHT_MODULE`, `PW_CHANNEL`,
`PW_ARGS` and `V5_SLOW` point them at another Playwright, another browser (empty
for Playwright's own Chromium), extra launch flags (WebGL through SwiftShader on
a machine without a GPU) and a slower machine; `V5_CAPTURE_OUT` moves the
captures. See `tests/v5/e2e/lib.mjs`. Under software rendering the timing and
frame-rate checks do not mean anything. Safari and Firefox have not been checked
by machine yet.

## Conventions

- **Type:** the system UI font (SF Pro on Apple devices) for everything that is
  read; Switzer only for the name (780 in the hero, 700 as the home title, 46 px).
  Titles 34 px bold, section titles 22 px bold, body 17 px medium, secondary text
  at 78% white, tertiary at 71%, captions 13 px, nothing under 12 px.
- **Colour:** white text on glass; the two room palettes; the project cards keep
  their screens' colours (paper `#f2efe8`, gold `#cdaa6d`, blue `#1e63a8`, sand
  `#e4c4a2`, and violet, green and ink for the drawn cards). Focus is a white
  2 px ring with a soft glow.
- **Radii**, concentric: windows 32, cards 20, rows 16, controls as capsules, the
  phone sheet 40.
- **Motion:** one spring model everywhere, JavaScript-driven in the same frame as
  the glass, critically damped for anything with text. Text never blurs while it
  moves, content never moves on its own, and windows stay put under the pointer.
  Reduced motion means no glide, focus pull, lean or drift, and 150 ms crossfades.
- **Budget:** the room renders at up to 1.5× device pixels, 60 fps while
  anything moves, 30 fps while only the room drifts, and not at all when nothing
  moves under reduced motion. A machine averaging over 22 ms across its first 90
  frames drops to 1× and stops the drift. Hidden tabs draw nothing.
- Hidden-until-ready content (film link, 2026-27 stats, schedule, résumé PDF) is
  an HTML comment saying what fills it.
- Keep `<meta name="robots" content="noindex">` on every page, and make no
  requests to other servers.
