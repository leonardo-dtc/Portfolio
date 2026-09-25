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

Then open `http://127.0.0.1:8778/v5/`. The hello plays on the first home view of
a browser session; add `?nohello` to skip it.

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

## The room

- **One WebGL2 canvas behind everything.** The first pass draws the scene (a
  navy sky to a violet horizon, a far hill, soft cobalt and periwinkle forms, a
  violet sheet, and the glass wave with one bright crest) into a mipmapped
  texture. The second pass composites it, reading the mips at any blur, so the
  hello's defocus and every pane's frost cost one texture read.
- **Motion:** the crest undulates and the forms drift over 20 to 60 seconds, and
  the room leans a little against the pointer, the other way to the windows.
- **Night and Day** follow `prefers-color-scheme`. A still of each
  (`room-night.webp`, `room-day.webp`, rendered from the shader by
  `tools/room-stills.mjs`) is the CSS background before WebGL starts, without
  it, and with scripts off.

## The hello

- **The name** is Sacramento's letterforms traced to their centre lines and
  chained into pen strokes in writing order (`tools/trace-name/`, output
  `assets/js/name-data.js`). Where the pen goes back over a line it retraces the
  same points, so nothing doubles. The site never loads the font. Sacramento is
  by Astigmatic, under the SIL Open Font License 1.1.
- **The ink** is a small mask canvas (the stroke, a soft height and a shadow)
  that the room turns into glass tubes: they bend the blurred room, carry bright
  rims and a highlight whose light drifts and leans toward the pointer, and a
  sheen sweeps along them every 6.5 seconds while the surface flows.
- **Pace:** "leonardo" writes over 1.45 s and "carvalho" starts at 0.82 s; the
  Enter button is ready at about 2.4 s. A click or a key while it writes
  finishes it at once.
- **Enter:** Return, the button, or a scroll or swipe down. The room pulls focus
  over about 1.2 s, the name flies into the window's title slot and turns to
  white glass, and the windows materialise in order: the main window, the side
  windows swinging in from 52° to 24°, then the tab bar, toolbar and window bar.
- Later home views open straight into the windows. The name stays as the title,
  and pressing it writes it again.

## The glass

- Every glass element carries `data-glass` (`window`, `ornament`, `control` or
  `prominent`). Each frame, once everything that moves has moved, `panels.js`
  reports where they are (the angled side windows through four corner probes
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
  size, because it lies over content (the window's text when it opens, scrolling
  content on phones) and only backdrop glass can frost HTML.

## Glass mode: one room, many windows

- **The main window** is centred. The **tab bar** hangs off its left edge: icons
  at rest, names when you point at it, and a bubble that stretches and slides to
  the next tab. The **toolbar** crosses its bottom edge with the page's own
  actions. The **window bar** under it drags 40 px and springs back.
- **Side windows**, turned 24° toward you, float at 1360 px and wider. Below
  that their content becomes sections inside the main window.
- **Changing page** swaps the window's contents in place: the old content drops
  back and blurs, the new one rises, the side windows swing out and back, and
  the tab bubble slides. Every page is still its own HTML file, so Back, Forward,
  deep links and printing all work.
- **Projects open as sheets** in front of the window you came from, which steps
  back, dims and lets its contents fade. The close button (top left), Escape or
  Back closes a sheet, and its toolbar pages to the neighbouring projects. A
  project loaded directly opens as a sheet over Work.
- **Below 900 px** the window becomes a full-screen sheet with a floating tab bar
  at the bottom, as in iOS 26, and nothing is angled. Below 700 px the title is the
  two-line name, as the hello writes it there.

## The color style control

A glass button in the bottom-right corner (beside the tab bar on phones, as in
iOS 26) opens a small panel for trying colors: eight palettes (Cobalt, Violet,
Rose, Ember, Gold, Emerald, Teal, Graphite), a Hue and a Vibrance slider, and
Auto, Night or Day. It turns the whole room in the shader, so every pane of
glass, the written name and the Enter button follow; the choice is kept in this
browser only (`assets/js/hue.js`).

## Pages

| Path | Page | Copy source |
| --- | --- | --- |
| `index.html` | Home: the written name, the introduction, work cards, experiments, the record as five first-person leads over dated rows, contact. Side windows: Now (with Groton's time) and This fall | `v4/index.html` (copy only) |
| `work/` | All seven projects as cards, filtered by the toolbar (All, Research, Build, Music, Community). Side windows: In progress, Experiments | new, from the project pages |
| `hockey/` | Recruiting profile: stats with the sample size, how I play, academic snapshot, team history. Side windows: Measurables, Coach contacts. Prints on one Letter sheet | `v4/hockey/` |
| `about/` | The essay, the facts and Now, fall 2026. Side windows: the portrait and From, Interests | `v4/about/` |
| `resume/` | The full record with an anchor on every entry. Side windows: Sections (jumps within the window), Contact | `v4/resume/` |
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
| `assets/css/site.css` | The one stylesheet: tokens, the room, windows and ornaments, CSS glass, the hello, content components, sheets, layouts, preferences, print |
| `assets/js/boot.js` | Entry: starts the room, the windows, the hello and navigation; the Work filters, print buttons and Groton's clock |
| `assets/js/room.js`, `shaders.js` | The WebGL2 room: scene, composite, glass panels and the ink; frame budget |
| `assets/js/panels.js`, `geometry.js` | Where the glass is: element boxes and projected corners into inverse homographies |
| `assets/js/windows.js` | Layout modes, side windows, tab bar, materialising, sheets, the window bar, parallax, hover and press light, scrolling from anywhere |
| `assets/js/hello.js`, `name.js`, `name-data.js` | The written name: layout, pen timeline, Enter, the title and replay |
| `assets/js/nav.js` | Page swaps, sheets, history, direct loads of projects |
| `assets/js/springs.js`, `frame.js` | Apple-style springs (response and damping) on one shared frame loop |
| `assets/img/` | The portrait, Loquar's landing page, ocapex.com, the Genuvalens figures, the name as an SVG for scripts off and print, the two room stills. Each file has a `.json` sidecar naming its origin |
| `DESIGN.md` | The design system, recorded from the built pages |

Tools and checks live outside the edition: `tools/trace-name/` and
`tools/room-stills.mjs` regenerate the name and the stills, and `tests/v5/` holds
the unit tests and the browser checks.

## Checks

```sh
node --test tests/v5/unit/*.test.mjs
node tests/v5/e2e/pages.mjs   # then links, room, glass, layouts, hello, nav, modes, contrast, keys, perf
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

- **Type:** the system UI font (SF Pro on Apple devices); no font files. Titles
  34 px bold, section titles 22 px bold, body 17 px medium, secondary text at 78%
  white, tertiary at 71%, captions 13 px, nothing under 12 px.
- **Colour:** white text on glass; the two room palettes; the project cards keep
  their screens' colours (paper `#f2efe8`, gold `#cdaa6d`, blue `#1e63a8`, sand
  `#e4c4a2`, and violet, green and ink for the drawn cards). Focus is a white
  2 px ring with a soft glow.
- **Radii**, concentric: windows 32, cards 20, rows 16, controls as capsules, the
  phone sheet 40.
- **Motion:** one spring model everywhere, JavaScript-driven in the same frame as
  the glass. Reduced motion means no writing, focus pull, parallax or drift, and
  150 ms crossfades.
- **Budget:** the room renders at up to 1.5× device pixels, 60 fps while
  anything moves, 30 fps while only the room drifts, and not at all when nothing
  moves under reduced motion. A machine averaging over 22 ms across its first 90
  frames drops to 1× and stops the drift. Hidden tabs draw nothing.
- Hidden-until-ready content (film link, 2026-27 stats, schedule, résumé PDF) is
  an HTML comment saying what fills it.
- Keep `<meta name="robots" content="noindex">` on every page, and make no
  requests to other servers.
