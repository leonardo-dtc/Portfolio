# v5 · the glass edition

The fifth edition of Leonardo Carvalho's portfolio, built beside the terminal
edition (repository root), the editorial edition (`v2/`), the poster edition
(`v3/`) and the dim-room edition (`v4/`). The editions are separate designs on
purpose: one will be chosen and the others archived, so **this edition shows,
embeds or links nothing from the other four**. Static HTML, CSS and vanilla
JavaScript, with one library (GSAP and its Flip plugin, self-hosted, for Work's
grid); no framework, no build step. Every page reads without JavaScript.

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

**Round three (October 2026): the creamy hovers, in glass, and side windows that
fit.** Leonardo liked the dim-room edition's hovers ("smooth and creamy (image
shape, subtitles, arrow, zoom)") and its experiments that open while the rest step
back, and disliked anything blurred in motion. The plan is
`docs/editions/round-3.md`; the rule it settles on is that a hover moves content
inside a still frame, over 450 to 800 ms on `cubic-bezier(.22, 1, .36, 1)`, and that
whatever steps back dims and never blurs. Rebuilt here in glass:

- **Cards settle instead of growing.** The frame no longer scales to 1.02. The
  screenshot (or drawing, or manuscript page) rests at 1.05 inside its rounded frame
  and settles to 1 over 800 ms; a 32 px white round arrow with a Night Ground glyph
  grows in at the top right from .8 while turning from 45 degrees (450 ms); the
  subline comes up from 82% to full; the light follows the pointer and the shadow
  deepens. Keyboard focus does the same; touch shows the arrow at rest; reduced
  motion keeps only the fades.
- **Rows lean.** A row in the record (and in any list of links) leans its title
  4 px to the right over 450 ms, brings its date to full ink, and steps the rest of
  its group back: their titles go to Ink 2. (The dim-room edition's 55% took them
  under 4.5:1 over the brightest glass; Ink 2 keeps them over it.)
- **Experiments open.** One component on Home and on Work: each shows its italic
  title and date; pointing at one, or focusing it, unfolds its line (500 ms), raises a
  Fill 2 wash and steps the other titles back to Ink 2. The list takes the line into the space
  below it, so nothing after it moves. Touch, phones, reduced motion, scripts off and
  print show every line. Each row opens its entry on the Archive page.
- **The archive (2026-10-05).** The experiments come from `archive/*.md`, one file an
  entry, shared with v3 (`archive/README.md` says how to add one; `node
  tools/archive.mjs` writes both editions), newest first: Home shows the newest four
  things made, Work all of them, and a page of its own, Archive (`archive/`; Request
  F made it a sixth tab and a sixth app on the hero, since as a sheet over Work it was
  hard to find; its old address, `work/archive/`, sends a reader there with the
  anchor kept), holds every entry in full: its year and kind, its title in the rows'
  italic, its cover, its line, a paragraph or two, its details in a Fill box, and
  buttons to where the rest of it lives (the résumé's entry, a sheet, or a page
  elsewhere). Songs and albums (Request E) never go in the rows: they sit in the
  page's side window, Listening (inside the window, after the entries, below
  1360 px), each with its artist, its cover and Listen on its service (Spotify,
  Apple Music, YouTube, Bandcamp, SoundCloud, Tidal or Deezer). The Experiments
  heading on Home and Work carries "Archive" to the page. A row opens the page
  already at its entry, and the entry takes the landing wash, as a résumé entry
  does. Every fact is the site's own; what is not on file is left out.
- **Side windows hold what fits.** Work's Experiments moved into the main window
  under the cards, so its side window is In progress alone; Hockey's side window no
  longer shows the Elite Prospects and NCSA rows (the toolbar carries both; they still
  print); About's portrait is cropped to 4:3 while it floats. Side-window text is
  15 px (it was 14). Where a side window still holds more than its room (About,
  Hockey and the Résumé at 1440×900, by 177, 50 and 36 px), a slim white capsule
  scrollbar says so, and its glass now stays in place when it scrolls.
- **Card images fit the card.** 320 px derivatives of the Loquar, Genuvalens and
  OCAPEX screenshots, and `sizes` set to the screenshot's real width (132 px at
  1440), so a 1440 or 390 screen at 1× or 2× loads the 320.
- **Checked afterwards** (the same round): the arrow is left out on cards under
  148 px wide, where it touched the tag (360 px phones, upright tablets); the
  pointer's light is half as strong over rows and stays off the words of a card,
  where it took white text under 4.5:1; focus and anchor jumps land clear of the
  window's fades and its toolbar; in print the drawn cards keep their colour and
  the room card's pane stays on its picture.

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
  it, and with scripts off. By day the hero's own copy is a soft one
  (`room-day-soft.webp`, 480 by 270, about the room's defocus), so the room no longer
  goes from sharp to soft as WebGL takes over (Request E).

## The hero

- **The name** is "Leonardo Carvalho" in Switzer at 780, tracked -0.03 em, one
  line from 700 px wide and two lines ("Leonardo" over "Carvalho") below. It is a
  real button ("Leonardo Carvalho. Enter the portfolio") holding the name as
  text: with the room that text is transparent and the room draws the name in
  light from it, so the hero, its layout and its control are one element.
- **Where it comes from:** in round three Leonardo asked for the feel of Apple's
  "It's Glowtime." art, animated and smooth: a logo traced several times in
  translucent neon (hot pink, magenta, orange, violet, electric blue, cyan) on
  near black, the overlaps burning toward white, a soft bloom. Three treatments
  were built and judged; this is the neon one, with the colour turns and the
  day pool of a traced-light version and the arrival of an iridescent-glass one.
- **The stage:** by night, while the hero shows, the whole room gives way to near
  black, as in the Glowtime art, and the name's light blooms into it: one mix of
  everything the room draws, 93% of the way toward `vec3(.010, .009, .026)`
  (turned by the colour style), so the room's shapes are only faintly there and
  no edge or shape outlines the name anywhere (the near-black pool that hugged
  the name's box, and read as a black slab on the cobalt room, is gone). It is a
  uniform in the composite and reads nothing more. It is there from the first
  frame: the page's CSS darkens the hero's copy of the room's still from the
  first paint (the home page's head script reads a stored Night or Day before
  that paint, so a choice against the system does not show the other room
  first), and the room's first frame is already dark. By day there is no stage.
- **The light:** the room reads a mask of the letters (the letters, a soft copy
  whose half level is their outline, a wide blur for the bloom and the day pool)
  seven times a pixel, and only inside the name's box:
  - one crisp tube of light locked to the letters' true edge (the visible edge
    never moves), with a white-hot core and a hair of red and blue split, its
    colour flowing along the name through orange, hot pink, magenta, violet,
    electric blue and cyan, with wide stretches of orange and cyan, a cycle in
    14 s;
  - three echoes tracing the outline again, each in its own colours: pink to
    magenta just inside the edge, orange to amber just outside it (given more
    strength than the other two), azure to cyan close to it. Each drifts about
    2% of the font size and breathes in and out of the edge, so it crosses the
    tube, and fades as it strays, so the name never reads double. Where traces
    cross, the light adds up and burns toward white on a soft tone curve;
  - the traces take turns being brightest, a 16 s cycle sliding along the name,
    each wandering from its turn on its own 10 to 19 s wave;
  - translucent faces in the tube's colour (crimson where it runs warm, violet
    where it runs cool), and behind them, leaning toward the pointer, the bloom:
    by night the light spreading into the dark round the name, in each
    stretch's own colour close to the letters (so orange and cyan stretches
    glow orange and cyan and keep their hue) and blue, violet and pink further
    out, easing off near the letters so it falls into the stage without a step,
    and gone before the blur runs out, so the mask's box never shows; by day a
    halo in blue, violet and pink over a pool: the bright room falls about 80%
    toward a saturated violet-blue that follows the halo, and the faces stay
    violet, so the light reads on it.
- **Measured** (`tests/v5/e2e/neon.mjs`; at 1440 by 900 unless named). The
  stage: by night the room outside the name's box measures a mean luminance of
  about 0.002, with the room or in the CSS hero, at 1440 and 390 (the cobalt
  room there measured 0.044, 0.045 at 390, and 0.040 in the CSS hero), and the
  hint 12:1 against it (7.4:1 before). The light falls into it smoothly:
  in bands 0.1 em wide by distance from the letters, in eight directions round
  them, from 0.1 em out (past the tube's own light) to 3 em, no step between
  neighbouring bands was over 0.007 in any frame of a 20 s sample, or 0.0093 on
  two lines at 390 (the pool's edge stepped by up to 0.015, and 0.023 at 390),
  and nothing rises. A screencast of the first frames of a first visit and of a
  reload never shows the bright room (0.002 at most outside the name, where
  the old first frames showed 0.046). The colour, a census of the bright,
  saturated pixels in the name's box: by night orange and cyan each held 10%
  or more of the lit pixels in every frame of the 20 s sample (orange 16 to
  29%, cyan 11 to 27%, pink and magenta 20 to 35%, blue and violet 19 to 35%),
  with 1 to 6% of the box burning toward white where traces cross; the
  reduced-motion still has 27% orange and 26% cyan; on two lines at 390 every
  frame was 19% orange or more and 13% cyan or more. By day the light stays
  mostly violet, blue and pink on the violet-blue pool, unchanged to the pixel.
- **Colour style:** the name takes the colours of the palette it opens on.
  Cobalt keeps the Glowtime colours above, to the pixel; every other palette has
  its own set of fourteen colours of light from its family (Violet: magenta,
  orchid, purple, violet and periwinkle; Rose: peach, coral, rose, hot pink and
  magenta; Red: orange red, scarlet, red, crimson, ruby and raspberry; Ember: gold,
  amber, orange and red with a hot pink end; Gold: lemon,
  gold, amber, orange and champagne; Emerald: lime, green, emerald, jade, teal
  and aqua; Teal: mint, aquamarine, turquoise, cyan and azure), and Graphite is
  Cobalt's set at its vibrance, a silver neon. The day pool takes the palette's
  deep colour. A custom Hue blends the two palettes either side of it in OKLCH,
  so no stretch passes through grey. Each set is held inside its own arc of
  hues, as Cobalt's is held from lime and green. Measured in every palette
  (`tests/v5/e2e/palettes.mjs`): with the room, by night, 100% of the lit pixels
  of each coloured palette lie within 75 degrees of its glass's hue, and 89% of
  Graphite's bright pixels are nearly grey.
- **Motion:** the light runs on the room's clock and the room draws at full rate
  while the hero shows. On a machine that tripped the room's budget the clock
  stops, so the light holds still until the pointer moves it. Under reduced
  motion it is one still, chosen with orange and at least two traces showing.
  The stage holds either way (it is part of every frame the room draws), and if
  the room gives way to the still the CSS hero's stage takes over.
- **Interaction:** hovering lifts the light by 22% and runs it hotter near the
  pointer; a press flares it and the burn rolls off. Nothing moves the letters.
  The light comes up over about 0.9 s, the echoes growing out of the outline as
  it does (at once under reduced motion), and the hint at the foot of the screen
  follows: "Click the title to proceed", or "Tap the title to proceed" on touch
  screens.
- **Entering:** click or tap the title (or its hint), or press Return. The room
  pulls focus; the name glides into the main window's title slot on one
  critically damped spring of about 0.7 s, turning white (white within about 0.2 s)
  and easing from weight 780 to 700, while the light goes out as (1 - v)³, the
  echoes folding back into the letters. The lights come up on the same term: the
  stage lifts as the neon goes out (half of it in about 90 ms, under 2% by
  270 ms, never overshooting), so the room's light rises as the window's glass
  forms under the name, and it is gone well before the name lands; then the
  window's contents, the side window and the tab bar fade in. Under reduced
  motion the stage and the name's light crossfade out over 150 ms as the windows
  fade in. Landed, it hands off to the HTML title (the same glyphs) and the
  effect switches off: after the hero the title is plain text, as Apple's
  guidance keeps Liquid Glass out of the content layer.
- **Fallbacks:** without WebGL2 the neon is CSS (so too on a weak device that
  starts on the still, a room that gives way, and reduced transparency). The hero
  carries its own copy of the room's still: by night the stage lies over it from
  the first paint (`rgba(3, 2, 10, .93)`, with no pool or shade, so no edge
  outlines the name); by day a pool under the whole name and a shade that hugs
  the letters in a deep violet-blue. Screened onto that: two neon traces of the
  name on slow orbits (a solid orange trace with stretches of hot pink and
  magenta crossfading over it, and a solid cyan one with electric blue and
  violet), faces crossfading between two sets of the colours (dark, tinted and
  translucent by night; light and nearly opaque by day), and a white-hot line
  on the edge. By night orange held 12 to 39% of the lit pixels in every frame
  sampled at 1440 and 390, on a stage measuring a mean luminance of about 0.002
  round it; by day the name's edge measured 6.9:1 or more
  against the ground just beyond its light at 1440 and 390, and the faces 3.4:1
  or more against the pool round the letters, the reduced-motion still
  included. Only transform and opacity animate, each on its own layer, and each
  palette gives it the shader's colours (`--neon-*`), its day pool included.
  Every copy of the name that
  draws the light is hidden from assistive technology, so the name is read
  once, as the button. Reduced motion holds it still; reduced transparency
  gives solid letters (white on the stage, or a deep navy on a soft light halo
  by day); forced colours give plain system text. Entering fades the hero out,
  its stage with it (250 ms; 150 ms under reduced motion). Without scripts there
  is no hero, and print shows the text title.
- Later home views (and `?nohello`) open straight into the windows; the session
  key is still `v5:hello`. Reloading the home page brings the hero back (the
  head script reads the navigation type), so it can be reviewed without
  clearing storage.

### Under the name: the line and the apps (2026-10-05)

- **The apps (T34):** Work, Hockey, About, Résumé, Archive (Request F) and Write
  to me, under the name. Each is a real link (`.apps`, written by `tools/v5-chrome.mjs` from the
  tab bar's list), so they work from the keyboard and without the room.
  - **A page's app:** choosing one puts that page in the window behind the
    hero, unseen (`nav.go(href, { quiet: true })`), with the tab bubble already
    on its tab. Then the light goes out as its windows arrive, while the app
    swells and fades. Home is never passed through.
  - **Write to me** opens mail, and the hero stays.
  - **Keys:** Return on an app opens it; Return anywhere else enters Home.
  - **Colour:** the apps take the colour style (`--style`, set by `hue.js`)
    with white glyphs (T35), and none shows a number (T36).
  - **Hover answers with light only** (Request F): a ring and a glow, or a
    deeper shadow on a widget; nothing grows or lifts (they grew 6% and the
    covers rose 8 px, against "nothing grows on hover"). A press still gives a
    little (.96), as a button does.
- **The line (T27):** "Goaltender at Groton School, Class of 2028.", the home
  page's own first words, with "Groton School" and "Class of 2028" each kept on
  one line (a 390 phone broke "Groton / School"). `hero.js` (`arrange()`) places the name and what is
  under it as one group, a little below the middle as in the launcher mock;
  the name never sits lower than its own place, 45%. By day the line stands on
  a capsule that darkens the room behind it (9.9:1 on a phone, where the soft
  halo alone gave 3:1).
- **Small screens:** every launcher keeps clear of the name, the hint and the
  screen's edges, from 320×568 to 1920×1080 and held sideways (DESIGN.md, Under
  the name). Held sideways, a phone sets the name on one line.
- **Getting past it (T26):** a click or a tap on the title, Return, a scroll that
  adds up to a deliberate move (40 px; a nudge does not), a swipe up of 48 px,
  Down, Page Down or Space.
- **Two looks for the name (T41):**
  - the neon above;
  - Liquid Glass, the glass name of round two, as in the launcher mock: solid
    glass letters with a light behind them in the colour style (`uGlassC`,
    turned with the room), in the lit room with no stage, and the same glide.
    By night a soft shade of the style's deep colour lies right round the
    letters, under that light; by day they are deep glass in the style's colour
    with a light rim, on a pale halo, as tinted glass looks against a bright sky
    (Request F: light glass on the bright day room measured 1.2 to 3.0:1; now
    every face keeps 3.4:1 or more beside it, in each colour style measured).

  Without WebGL each has its CSS version. The panel below switches them.
- **Portrait tablets** set the name on two lines, as phones do, at
  `min(15vw, 12svh, 150px)` (on one line at 768 by 1024 it was 63 px, smaller
  than on a phone).

## Design toggles

The choices Leonardo left open on the decision page, or asked to try, are design
toggles: data attributes on `<html>`, read by the stylesheet and the hero, set
before the first paint by every page's head script, and kept in that browser
only (`localStorage`, `v5:toggles`), so visitors always see the defaults.
`assets/js/toggles.js` holds them.

| Toggle | Question | Default | Choices |
| --- | --- | --- | --- |
| `heroContent` | T27 | `both` | `name` (a), `line` (b), `apps` (c), `both` (d): the name with the hint, the line, the apps, or both |
| `launcher` | T39 | `icons` | `icons` (round glass, as in the mock), `library` (a: covers, like Steam's library), `widgets` (b: a dashboard), `desktop` (c: a Mac desktop down the right edge) |
| `heroName` | T41 | `neon` | `neon`, `glass` (Liquid Glass) |
| `roomRes` | (a test) | `standard` | `standard` (the room at up to 1.5 times the screen's pixels), `sharp` (up to 2: a sharper neon on a phone, for about 1.8 times the pixels) |

- **On the page (Request F):** `?dev` in the address opens a panel, top right
  (at the foot on a phone, so the title shows above it): every toggle as a row
  of buttons, the one in use pressed, with Replay the hero, Reset, and a reading
  of the room's resolution and frame time (under about 17 ms keeps 60 frames a
  second). Its heading folds it to a tab in the corner. It stays in that
  browser (folded or not) until its Close; `?dev=0` forgets it too. Visitors
  never see it. The hero's keys, wheel and swipe leave it alone. In the console,
  `toggles.panel()` opens it. `roomRes` is there so the cost of a sharper room
  can be judged on a real phone before it is built in: switch to 2×, watch the
  hero, and read the frame time.
- **In the console:**
  - `toggles` shows their values, and `toggles.list()` what each is and its
    choices;
  - `toggles.launcher = 'widgets'`, `toggles.set('launcher', 'widgets')` or
    `toggles.T39 = 'b'` sets one (T27 and T39 take the decision page's
    letters);
  - `toggles.reset()` forgets them all.
- **In the address:** `?toggles=launcher:widgets,heroName:glass`, for that visit only (a link never changes what a browser shows next time). The head script applies a name and value before the first paint, so the page does not show the default first; a letter or a question's name (`?toggles=T39:b`) waits for `toggles.js`.
- **In the Elements panel:** edit the attribute on `<html>`. A value a toggle
  does not take goes back, with a note in the console.
- **While the hero shows,** a change takes effect at once. Reload the home page
  to see the hero again.

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

- **The main window** sits with the **tab bar** 14 px off its left edge, and a
  bubble that stretches and slides to the next tab. The tab bar shows its names
  at rest wherever the labelled bar fits to the window's left with 12 px to the
  screen's edge: at every desktop width, and on laptops from 946 px, where bar
  and window are centred as one group. Touch screens of 900 px and wider (an
  iPad) cannot point at it, so the window narrows to make the room. On a narrower
  laptop it shows icons, and its names when you point at it or focus it (it opens
  to the left, its icons staying put). It comes first in every page's source, so
  the keyboard reaches it right after the skip link. The **toolbar** crosses the
  window's bottom edge with the page's own actions. The **window bar** under it
  drags 40 px and springs back.
- **One side window**, turned 24° toward you, floats on the right at 1360 px and
  wider, and tab bar, main window and side window are centred as one group.
  Below 1360 px its content goes inside the main window, placed by its role
  (`data-inline` on the aside, one word for all of it or one per part):
  Hockey's Measurables and Coach contacts come first, before Stats; About's
  portrait comes first and its Interests last; the Résumé's Sections become a
  row of chips pinned under the window's head (in a window under 520 px tall,
  a row that leads the record and scrolls away with it; with a pointer, a thin
  scrollbar under it says it goes on); Home's This fall and Work's In
  progress come last.
- **The Résumé's Sections follow the reader:** the section under the reading
  line wears the tab bar's bubble (a Fill 3 capsule, `aria-current`), and a jump
  from Sections marks its target at once. A chip the keyboard reaches scrolls
  clear of the row's fades, ring and all. Landing on an entry from elsewhere
  (a record row to `resume/#carnegie`) lights it with a wash that fades over
  1.2 s (`assets/js/spy.js`, `nav.js`).
- **Changing page** crossfades the window's contents in place, and the side
  window's with them; no window moves and the tab bubble slides. Every page is
  still its own HTML file, so Back, Forward, deep links and printing all work.
- **Projects open as sheets** in front of the window you came from, which steps
  back about 3%, dims and lets its contents fade (nothing blurs). The close
  button (top left), Escape or Back closes a sheet, and its toolbar pages to the
  neighbouring projects. A project loaded directly opens as a sheet over Work.
- **Below 900 px** the window becomes a full-screen sheet with a floating tab bar
  at the bottom, as in iOS 26, each icon over its 12 px name, and nothing is
  angled. Below 700 px the title is the two-line name, as the hero sets it there.

## The color style control

A glass button in the bottom-right corner (beside the tab bar on phones, as in
iOS 26; under 400 px, where six labelled tabs take the whole dock, a fill
button with the window's actions at its foot, and on Work, whose inline toolbar
is its filters, in a row of its own at the foot) opens a small panel for trying
colors. On
desktop its name, "Color style", shows beside it while it is pointed at (after a
beat) or focused from the keyboard, since the swatch alone does not say what it
does. The panel has nine palettes (Cobalt, Violet, Rose, Red, Ember, Gold, Emerald,
Teal, Graphite; three across, as nine fill three rows), a Hue and a Vibrance slider,
and Auto, Night or Day. Red (Request E, for Leonardo to judge) is a true red, its
glass at hue 26 where pure red is 29, between Rose (pink, near 1) and Ember (orange,
near 35); it sits 14 degrees from Ember, so their swatches are the closest pair
(crimson beside orange red), and whichever of the two he keeps, the other goes. A palette
turns the whole room, so every pane of glass follows, and gives the hero's name
its own neon (`assets/js/palette.js`); the choice is kept in this browser only
(`assets/js/hue.js`). The turn is made in OKLab, where equal angles look equal:
every colour in the room turns by the same angle of hue and keeps its lightness,
so a palette looks the same by night and by day (the YIQ turn used before made
Teal blue by night and green by day, and dark blue went olive on its way to
Gold). The room is turned through a small table of colours, a 3D texture (17 to
a side once it rests, 9 while a palette crossfades), so it costs one texture
read a pixel; Cobalt needs none. The palettes sit at Cobalt 0, Violet +28, Rose
+92, Red +122, Ember +136, Gold +170, Emerald -120 and Teal -66 degrees, and Graphite
is Cobalt at 12% vibrance; each pair is at least 0.066 apart in OKLab (Teal and
Graphite, the closest) but Red and Ember, at 0.027 while Red is being judged. In every palette, by night and by day, every line of
text over the glass on Home and in the open panel keeps 4.5:1 (lowest 4.74:1).
Where the room never started (no WebGL2, reduced transparency, Save-Data, a weak
device) there is no control and the phone's tab bar is centred alone. That is
decided once, as the page starts (`html.no-room`): a room that gives way later
leaves the tab bar and the control where they are, the control turning the CSS
glass and Night or Day, so nothing jumps under a thumb. On touch screens its
Reset, Auto, Night, Day and sliders answer 44 px targets without changing how
they look, as do the All work and Résumé links.

## Pages

| Path | Page | Copy source |
| --- | --- | --- |
| `index.html` | Home: the hero, then the name as the title, the introduction, work cards, the four newest experiments, the record as five first-person leads over dated rows, contact. Side window: This fall, with Groton's live time | `v4/index.html` (copy only) |
| `work/` | All seven projects as cards, filtered by the toolbar (All, Research, Build, Music, Community), then the experiments (every one made; Home shows the newest four). Side window: In progress | new, from the project pages |
| `archive/` | The archive: everything made in full, newest first, each with its paragraphs, details and a link to the rest. Side window: Listening, the songs and albums | `archive/*.md`, written by `node tools/archive.mjs` (through `tools/v5-chrome.mjs`) |
| `work/archive/` | Its old address: sends a reader to `archive/`, the anchor kept | (a redirect) |
| `hockey/` | Recruiting profile: stats with the sample size, how I play, academic snapshot, team history. Side window: Measurables, then Coach contacts. Prints on one Letter sheet | `v4/hockey/` |
| `about/` | The essay, the facts and Now, fall 2026. Side window: the portrait and From, then Interests | `v4/about/` |
| `resume/` | The full record with an anchor on every entry. Side window: Sections (jumps within the window and follows the reader), then Contact | `v4/resume/` |
| `work/aducanumab/`, `work/genuvalens/` | Research sheets: abstract, question, method, the numbers, findings, limitations, references | `v4/work/…` |
| `work/loquar/`, `work/daedalus/`, `work/ocapex/`, `work/freecode/` | Product and community sheets | `v4/work/…` |
| `work/this-site/` | This edition: the room, the name, the glass | new copy |

Facts and caveats come from the earlier copy and `CONTENT-REVIEW.md`; the design
does not. Copy is first person, no en or em dashes, no superlatives, and no
numbers on the landing. Coaches are named with their roles only, the hometown is
South Florida, correspondence goes via a parent.

## Adding a project or an experiment

Every page repeats the same chrome (the tab bar first, then the main window, the
side window and the toolbar). The tab bar, the head script, the hero's apps and
Write to me in the headers of Work and the project sheets are written by
`node tools/v5-chrome.mjs` from one list (its `--check` names a page that drifts,
and the unit tests run it); the rest of a new item touches a few files by hand.
In order:

**A project** (a sheet over Work):

1. Copy the closest project page to `work/<slug>/index.html` (a research sheet
   from `aducanumab/` or `genuvalens/`, a product from `loquar/`). Keep the
   `<html>` attributes `data-kind="sheet" data-tab="work" data-parent="../"`,
   set `data-page="<slug>"`, the `<title>` ("Name · Leonardo Carvalho") and the
   description, and keep `<meta name="robots" content="noindex">`. Keep the tab
   bar where it is, before `<main>`, then run `node tools/v5-chrome.mjs`: it
   marks Work current and adds Write to me to the sheet's header.
2. Images go in `assets/img/` as WebP (and AVIF where it helps), EXIF stripped,
   each with a `.json` sidecar naming its origin. Every URL is relative and its
   case matches the file's exactly (GitHub Pages serves `/Portfolio/` and is case
   sensitive).
3. Pagers: the new sheet's own `.toolbar--sheet` and `.toolbar--inline` point to
   its neighbours, and each neighbour's two pagers point to it (four links in
   the neighbours, both directions).
4. Work (`work/index.html`): a card in `.cards` with its colour class
   (`card--paper`, `--gold`, `--blue`, `--sand`, `--ink`, `--violet`, `--green`
   or a new one in `site.css`), `data-cat` (research, build, music or community)
   for the filters, its tag and its screen or drawn art; and a line under In
   progress in the side window if it is unfinished.
5. Home (`index.html`), only if it belongs there: a row in the record's group
   for its kind, or a swap among the four cards.
6. Résumé (`resume/index.html`): an entry with an `id`, so rows elsewhere can
   land on it.
7. Tests: add `'work/<slug>/'` to `PAGES` in `tests/v5/e2e/lib.mjs`.

**An archive entry** (a song, an album, a project of my own, a small thing with no
sheet): add a file to `archive/` as `archive/README.md` says (its name is the archive
page's anchor), then run `node tools/archive.mjs`: it writes the rows on Home (the
newest four things made) and Work, the entry on `archive/` (music in its Listening
window), v3's card and Mac file, and copies any cover into both editions.
Facts only; leave out what is not on file.

**Then run** the unit tests and the browser checks against the preview server:
`pages` (every page loads, noindex, no overflow, no third-party requests),
`links` (every link and `#target` resolves), `nav` (sheets and pagers),
`layouts` and `modes` (scripts off, print); see Checks below.

## Files

| Path | Purpose |
| --- | --- |
| `assets/css/site.css` | The one stylesheet: Switzer's `@font-face`, tokens, the room, windows and ornaments, CSS glass, the hero, content components, sheets, layouts, preferences, print |
| `assets/fonts/` | `switzer-variable.woff2` (Switzer, Indian Type Foundry, via Fontshare; weights 100 to 900) and its licence, `FFL-switzer.txt` (the ITF Free Font License allows self-hosting and wordmarks). The name only; everything else is the system face |
| `assets/js/boot.js` | Entry: starts the room, the windows, the hero and navigation; the Work filters, print buttons, Groton's clock and the phone header's fold. Last, it marks the page `booted`: a page the scripts never finished (a file that failed to load, an error, a browser without modules) is put back to the page without scripts by the head script at `DOMContentLoaded`, rather than left hidden behind the hero |
| `assets/js/room.js`, `shaders.js` | The WebGL2 room: scene, composite, glass panels, the hero's dark stage and the ink (its name in neon light); frame budget |
| `assets/js/panels.js`, `geometry.js` | Where the glass is: element boxes and projected corners into inverse homographies |
| `assets/js/windows.js` | Layout modes, the side window, tab bar, materialising, sheets, the window bar, the pointer's light and the room's lean, hover and press light, scrolling from anywhere |
| `assets/js/hero.js` | The hero: the name's layout read glyph by glyph from the page, its mask, the stage, the light and its interaction, the glide into the title as the lights come up and the hand-off, the fallbacks |
| `assets/js/nav.js` | Page swaps (the side window kept in place), sheets, history, direct loads of projects, anchor landings and their wash |
| `assets/js/spy.js` | The Résumé's Sections following the reader (any page with a `.toc` gets it) |
| `assets/js/springs.js`, `frame.js` | Apple-style springs (response and damping) on one shared frame loop |
| `assets/js/palette.js` | The colour styles: the palettes, the turn in OKLab (and the room's table of colours), and each palette's neon for the hero |
| `assets/js/toggles.js` | The design toggles for the developer tools (above): `window.toggles`, the address, the attribute on `<html>` |
| `../tools/v5-chrome.mjs` | Writes the tab bar, the head script, the hero's apps, the headers' Write to me, each window body's name (a region called by the page's name), and the archive (the Experiments rows on Home and Work, and the archive sheet's entries) into every page from its lists |
| `assets/js/flip.js`, `assets/vendor/gsap/` | Work's grid reflowing when filtered, with GSAP's Flip (3.15.0, self-hosted, GreenSock's standard no-charge licence; `vendor/gsap/README.md` gives the source and checksums). Loaded only on a page with a grid to filter, once it is idle |
| `assets/img/` | The portrait (a 320px and a 600px square, AVIF and WebP, cut from `assets/img/portrait.jpg` at the same 608px crop), Loquar's landing page, ocapex.com, the Genuvalens figures, the two room stills. Each file has a `.json` sidecar naming its origin. The 320 px card derivatives are made by `tools/card-thumbs.mjs` (the largest derivative, resized with the browser's high-quality filter, saved as WebP without EXIF) |
| Kept, unreferenced | The written hello of the first round: `assets/js/hello.js` (the pen timeline and the Enter button), `name.js` and `name-data.js` (Sacramento traced to pen strokes), `assets/img/name.svg` and `name-2.svg` (the name as an SVG, one line and two), and `tools/trace-name/` outside the edition. Nothing imports or links them any more; they stay in case the written name comes back |
| `DESIGN.md` | The design system, recorded from the built pages |

Tools and checks live outside the edition: `tools/trace-name/` (kept, see
above) and `tools/room-stills.mjs` regenerate the written name and the stills,
`tools/card-thumbs.mjs` makes the 320 px card images, and
`tests/v5/` holds the unit tests and the browser checks.

## Checks

```sh
node --test tests/v5/unit/*.test.mjs
node tools/v5-chrome.mjs --check
node tests/v5/e2e/pages.mjs   # then links, room, glass, layouts, hello (the hero), launcher (its apps and the toggles), neon (its colour), nav, modes, contrast, keys, palettes, filters, perf, audit, fixes (the October 2026 bug audit's 21 findings, kept fixed)
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
  Hovers move content inside a still frame on the long ease (`--ease-long`, 450 to
  800 ms); what steps back dims. Springs integrate real frame time up to 120 ms
  (in 4 ms substeps), so a slow device skips frames rather than stretching a
  motion. Reduced motion means no glide, focus pull, lean, drift or settle, and
  150 ms crossfades: transitions run only on opacity and colour, so the tab
  bubble, the tab bar's width and names and a sheet's parent jump to their places.
- **Budget:** the room renders at up to 1.5× device pixels, 60 fps while
  anything moves (the hero's light included), 30 fps while only the room
  drifts, and not at all when nothing moves under reduced motion. A machine
  whose first 90 drawn frames average over 22 ms drops to 1× and stops the
  drift (each frame is timed by the tick after it, which carries its cost: while
  only the room drifts it draws every other tick, so the drawn tick's own time
  is the cheap tick before it); if the next 30 frames it draws still average
  over 37 ms (under about 27 fps: a device held to 30 fps to save power keeps
  the room), the room
  gives way to the still and the page carries on in
  CSS glass (the path a lost WebGL context takes). A device asking for less data
  (Save-Data) or with 2 GB of memory or less starts on the still.
  `html[data-still]` says why (`save-data`, `memory`, `slow`, `lost`) and
  `window.__room.log` records the budget's steps. A project loaded directly
  gives the page behind it 600 ms and at least four frames to arrive, so a slow
  first frame does not leave it without its parent. Hidden tabs draw nothing.
- Hidden-until-ready content (film link, 2026-27 stats, schedule, résumé PDF) is
  an HTML comment saying what fills it.
- Keep `<meta name="robots" content="noindex">` on every page, and make no
  requests to other servers.
