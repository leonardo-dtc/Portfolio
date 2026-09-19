# Leonardo Carvalho — portfolio

Static HTML, CSS and JavaScript. No build step, no dependencies. Open
`index.html` directly, or serve the folder:

```
python3 -m http.server 8000
```

## What is on the page

Eight panels, one on screen at a time (wheel, arrow keys, number keys,
or the nav), built on the Horizon controller in `references/repo`. Copy
follows the v4 copy deck: implied first person throughout, and no en or
em dashes anywhere in the copy (code comments keep them).

| # | Panel | What it holds |
| --- | --- | --- |
| 00 | Intro | the ASCII name card on the live field |
| 01 | About | the mark and two ledes, the character sketch, four facts, the contact block, links, the ASCII portrait |
| 02 | Athletics | the Groton crease, prep and showcase, the road to Groton with its timeline, crew, soccer, the mask |
| 03 | Academics | Groton, Advanced Placement exams, American Heritage, robotics and rocketry, the track ahead, the zebra |
| 04 | Leadership | OCAPEX, FreeCode Juniors, Imagina, the Congressional Award, the flag |
| 05 | Research | the aducanumab paper, Genuvalens, the question underneath, the toolkit, the helix |
| 06 | Music | Chamber Orchestra, Carnegie Hall, Amora, competitions, Florida Youth Orchestra, the metronome |
| 07 | Build | Loquar, Daedalus, this site (and a hidden blog entry) |

The order is for the people who read it. After About, Athletics comes first
because the site is a recruiting page before it is anything else and a coach
wants the crease within one move; Academics next, since a coach and an
admissions reader both need the eligibility figures early; then Leadership,
the most distinctive thing on the page, and Research, the deepest, where a
reader's attention is still high; Music and Build close, the concert as the
last strong note and the page's own making as a playful way out. Within a
panel the current or strongest role leads, plans and awards come last, and the
years run backwards from there.

Contact is **folded into About** rather than holding a panel of its own,
and the nav carries the eight panels and nothing else (the CV and CONTACT
links that used to sit at its right are gone; `data-quiet` is still honoured
should one come back). Panel count, the pager and the rail all derive from
the markup, so the table above is the only place the count is written down.

Every `.entry` on a chapter panel is its own page. Its title is a button;
clicking it deloads the panel, builds a page out of that entry
(`.entry__body` + `.entry__more`) and prints it back in under
`cat <slug>.md`. `back`, Escape, or leaving the panel unwinds it. The detail
lives in the markup, so it is still searchable and still there without JS.

Below 900px wide or 620px tall the same markup becomes an ordinary vertical
document. Content is Leonardo's record from `references/Leo-portfolio-website-v2.24.html`.

## Where the pieces come from

| Source | Taken | Where |
| --- | --- | --- |
| [priyandesai.com](https://www.priyandesai.com/) | the ASCII noise field (2D-canvas port of his Framer "ASCII Background" WebGL component), the letter-flip nav, the 3px orange progress bar | `assets/js/field.js`, `.nav` in `site.css` |
| [sergzorin.com](https://sergzorin.com/) | the name card: typed prompt, gradient-clipped ASCII block name, CRT scanlines, tmux-style status bar, tap-to-reroll, scramble-settle text; the `.hl` key-phrase highlight and the `// section` headings | `assets/js/namecard.js`, `.card / .crt / .sbar / .hl` |
| `references/repo` (Horizon) | the preloader counter, the panel controller and its input choreography, the bottom-bar counter + rail, the chapter typography (Bodoni Moda display; JetBrains Mono for everything else, per Leonardo), outlined numerals, stats, entries, ring cursor | `assets/js/app.js`, `.panel* / .preloader / .sbar / .cursor` |

```
index.html               markup and all copy
assets/css/site.css      every visual rule, tokens on :root
assets/js/field.js       the field: noise → glyphs, pointer, wave reveal, dim, tuner API
assets/js/namecard.js    ASCII name renderer, palettes, prompt, wave reveal of the name
assets/js/app.js         preloader, waves, panel controller, scramble-settle,
                         highlights, the figure/headline toggles, the gated
                         status bar, theme, cursor, nav
assets/js/portrait.js    reads the baked grid (or keys the photo) and hands it
                         to the field as ASCII, in the ground's polarity
assets/data/portrait.js  the baked grid — regenerate with tools/make-portrait.py
assets/js/mask.js        the goaltender's mask: eleven baked frames, turned by the cursor
assets/js/crest.js       reads the baked Groton arms and hands them to the field
assets/data/crest.js     the baked grid — regenerate with tools/make-crest.py
assets/js/subart.js      hands the field every subsection picture in the table
assets/data/subart.js    the table, one entry per "<panel>/<slug>"
assets/js/tuner.js       the T panel: sliders + element comments
tools/make-portrait.py   bakes assets/img/portrait.jpg into assets/data
tools/make-crest.py      bakes assets/img/crest.png into assets/data
tools/make-subart.py     bakes one subsection's picture into the table
tools/serve.py           a static server, for looking at it over http
references/              the material this was built from — untouched
```

## Motion

0. **Where the mystique lives.** The circular glyph wave is the **hero's
   alone** — on load, and on every return to panel 00. Going home does not
   unprint the panel you leave: the wave runs out from the corner and the
   leaving panel's parts are taken off the moment the front reaches them,
   each at its own distance, while the hero's parts come in behind the same
   front. One wiper, one pass, and the slate is clean.
0b. **Everywhere else: a typed command, then the buffer prints.** The prompt
   in the bottom-right types the command that got you here — `cd ./research`,
   or `cat genuvalens.md` going a level deeper — the shell answers by moving
   its `pwd`, and only then does the panel print. Blocks wipe in left to right
   in reading order behind a block caret (`#print-caret`), each one scrambling
   and settling its labels and figures as it lands, and its `.hl` highlights
   lighting behind that. Leaving reverses it, bottom block first.
   The causality is the point, so the print never starts before the line is
   typed and a beat has passed — and on the first move off the hero the
   command waits for the host line to finish typing itself.
   Chosen from `prototypes/`; those two files are kept for reference only.
1. **Load.** The curtain is a boot log — the command types itself, then each
   real milestone reports as it lands (`[ ok ] typeface  bodoni moda`, `[ ok ]
   field`, `[ ok ] document`), with a mono counter running 000 → 100 against
   the same progress (the font
   faces, window load) with a floor on how fast it may run and a 4.5s cap.
   At 100 a circular wave leaves the counter: field cells ahead of the front
   stay empty, cells on it flash as scrambled glyphs, cells behind it settle.
   The name's block glyphs do the same, and the chrome fades in by distance.
2. **Panel change.** Nothing slides. The current panel collapses toward the
   pager — farthest pieces first, the load wave in reverse — then the next
   blooms outward from it while the field runs a pulse from the same
   origin. Every piece rises and fades; labels, numbers and the big counter
   scramble and settle left to right (`data-scramble`, `data-num`). This
   replays on every entry, in both directions.
3. **Highlights.** Each `.hl` key phrase wipes its accent box in from the
   left once its line has arrived (`animateIn` schedules it 520ms behind
   that line's own delay), so the words settle first and the accent
   follows them out from the pager.
4. **The cursor decodes what it passes over.** One idea in two places.

   *On the field* (`field.js`, `cursorScr`): cells under the pointer stop
   reporting their density and flicker through the scramble set instead of `*`
   and `/`. The rate falls off cubically with distance — 85% of frames at the
   cursor, 9% at 130px, nothing past the radius.

   *On text* (`app.js`, `CS_*`): titles and links decode the same way, per
   character, and only while the pointer is on the words themselves — both are
   laid out inline so their box is the text, not the block around it. The loop
   is self-terminating: every frame it checks that its element is still hovered
   and stops itself if not. Without that a missed `pointerout` left a
   distance-driven loop running, so the element decoded again whenever the
   cursor merely passed *near* it. A title
   is large serif type someone is trying to read, so it gets a shorter reach
   and a gentler rate (`CS_TITLE`) than a link (`CS_LINK`): it shimmers rather
   than boils. Each character is locked to the width it had before the effect
   started, so swapping glyphs in a proportional serif can never shift the
   line, and the authored string is kept on the element (`_csText`) so anything
   reading a title — a sub-page, for one — never sees the scrambled DOM.
   `[row]` / `[text]` chooses whether a title answers to its own hover or to
   anywhere in its entry; a sub-page title and every link always answer to
   their own. Decoding is suspended while a panel prints, held as a deadline
   rather than a flag so a dropped timer cannot switch it off for good.

   An entry also draws a rule down its left edge and washes accent across
   itself; links keep a rule that wipes in from the left and retracts right.
5. **Trackpad.** One move per gesture: a wheel burst arms once, fires once,
   and stays disarmed until the deltas stop for a quarter second, so
   momentum can never skip a panel. Keys honour the same lock. Dragging does not
navigate — it collided with selecting text and with the entry titles.
6. **Flow mode** (phones, short windows): panels stack vertically and each
   populates as it scrolls into view — again every time it comes back.

`prefers-reduced-motion` skips all of it: everything is simply there.

## The path

The road-to-Groton entry carries a timeline ported from the v2.24 reference: a
rule of year stops, each a button. Hovering reads a season out, clicking or
focusing pins it, and the pin is what the readout falls back to when the pointer
leaves. It lives inside that entry's detail, so it only ever appears on the
sub-page.

Its handlers are **delegated from `document`**, not bound per element. The
sub-page is rebuilt from the entry's markup every time it is opened, so anything
bound to the old nodes would be bound to nothing.

## Looking at it

`index.html` opens straight off disk and works: every picture is baked to a grid
precisely so no `getImageData` on a `file://` image is ever needed. But a
browser caches `file://` assets as hard as any others, and after an edit it will
happily pair new markup with the previous stylesheet, which reads as text in
the wrong place or missing. For any session where the files are changing:

```
python3 tools/serve.py
```

and open `http://127.0.0.1:8777`. It serves everything `no-store`, so what is
on disk is what is on screen.

## When a panel comes up empty

A print that gets interrupted leaves its parts clipped shut with nothing left
to open them: a tab hidden mid-transition has its timers throttled to a crawl,
a resize can flip the mode under it, an animation can be cancelled before its
`onfinish` runs. `heal()` in `app.js` checks the active panel on a slow tick
and on `visibilitychange` and after a resize settles; parts still shut four
seconds after their print began, with nothing animating them, are opened.

## Fitting five entries

A chapter panel has to hold the same screen whether it carries three entries or
six. `.entries:has(.entry:nth-of-type(4))` tightens the row padding, the title
and meta margins and the body leading; a fifth entry drops the body a step
further. Hidden entries count toward that, which is right, since they take no
height either way. At 1440x900 that took the worst panel from 130px of overflow
to 57px and put four of the six at zero.

What is still taller than the window **scrolls**, and the scrolling is what
used to fail. A panel is its own scroll container in panel mode, with the bar
hidden, but it was centred with `align-content:center`, which overflows at both
ends once the content is taller than the box, and the top end cannot be
scrolled to; and the wheel turned the page rather than scrolling. So the
chapter and About grids are centred by an empty `1fr` row above and below the
content instead, which share the free space while there is any and shrink to
nothing when there is none, after which the panel scrolls from its top. A
sub-page does the same with `margin-block:auto`, which is what keeps `cd ..`
reachable on a long one: `justify-content:center` had been pushing it above
the edge. The wheel scrolls a panel that has room to scroll and turns the page
only from its end, and only on a fresh gesture, since the one that brought the
list to its end is spent; down, page down and space do the same by a screen at
a time, and left and right still turn. A panel comes up at its top.

## Legibility

Nothing on the page is set under 10px any more: the meta lines, the year
labels and the small caps keys went up a point or two, the entry bodies to 13
and 14px, the sub-page bodies to 14 and 16px. The pictures sit under all the
copy by design, and a dense one under a paragraph costs reading, so each block
of text (a sub-page, a chapter's side and its list, About's two halves) lays a
soft pool of the ground behind itself, a radial gradient of the background
colour that dims the picture there and leaves it whole around the edges. On
phones the fact and contact grids stack in one column, since two cannot hold
"English · Mandarin · Spanish" at 375px.

## The status bar

On the hero the bar holds nothing but the six toggles and the centred hint
(`scroll or use arrows`). Leaving the hero brings in the pager, the
centred rail and the prompt; coming back takes them away again. The middle
of the bar is one centred slot that the hint and the rail share — only ever
one of them is lit.

The bottom left is the page number and nothing else. It stays in `00`
format, so it never has to be read against the Roman figure at the head of
the panel.

The right-hand corner is a working prompt: `leonardo@carvalho ~ %`, typed
out a character at a time when the bar arrives, with a `pwd` that follows
you (`~/research/genuvalens`) and the command line that drives every
transition. Above it sit the toggles, each labelled with
what clicking it will do:

| Button | Does |
| --- | --- |
| `[roman]` / `[00]` | the figure at the head of a panel as `I…VI` (the default) or `01…06`. The pager never follows it |
| `[block]` / `[stroke]` | the numerals as outlined Bodoni, or rebuilt from the hero's 5×7 raster and clipped to the live palette gradient |
| `[grad]` / `[flat]` | the Bodoni headlines clipped to that same gradient, or flat ink |
| `[row]` / `[text]` | whether a title decodes from anywhere in its entry, or only under the words themselves |
| `[light]` / `[dark]` | the ground |
| `[tune]` | the field tuner |

All five display choices persist in this browser (`lc-numfmt`, `lc-numart`,
`lc-headgrad`, `lc-cshover`, `lc-theme`); Roman figures are the default. Sentence-length text cannot become block art —
the raster is 14 rows tall, so a headline would collapse to unreadable type
— which is why `[grad]` gives the headlines the gradient half of the hero
treatment and `[block]` keeps the raster for the figures. Below about 8px a
row, the figures switch to the 7-row raster so every bitmap pixel keeps its
height; that is what keeps About's and Contact's smaller numerals legible.

## The pictures in the background

The **portrait** on About, the **goaltender's mask** on Athletics, the **Groton
zebra** on Academics, and one per subsection that has been given one. They
register with `field.js` under a key and name the panel they belong to, and the
field swaps between them on `lc:panel` — one leaves on its diagonal front before
the next arrives on its own. A picture is either

- **fixed** — `{cols, rows, dens}`, reduced onto the field's grid once. The
  portrait, baked from a photograph, and the arms, baked from the artwork; or
- **live** — `{aspect, live(now, gw, gh, out)}`, filling the field's grid itself
  every frame. The mask, which turns.

A picture is sized by its height, 88% of the window's, and takes the width its
aspect gives it; one that would run past the sides of the window is fitted to
the width instead, so a wide picture shrinks rather than being clipped.

A fixed picture is baked far finer than the grid it lands on — the arms at 150
cells across arrive on about 33 — so `buildArt` **averages each source block**
rather than sampling a cell out of it. At that ratio a point sample keeps or
drops a feature depending on nothing but where the cells fall, which is what
turned the motto ribbon into noise and made the portrait shimmer on resize. A
block that is mostly backdrop stays backdrop, so a silhouette keeps its edge.

Re-registering the picture that is currently up repoints `art`, not only the
table `arts` — `buildArt` reads the former, so without that a re-register
rebuilds from the grid it was just handed a replacement for. That is the path
both baked pictures take to flip polarity on `lc:theme`.

A picture's glyphs are sprites with the palette baked in, exactly like the
noise's, so `buildSprites` drops them and every caller that rebuilds the noise
rebuilds the picture too. Without that the field recoloured on `lc:palette` and
the picture kept the colour of whatever palette it was mounted under — and the
vibrancy path went the same way, since `buildArt`'s own guard only rebuilds the
sprites when the *ramp* changes.

### Subsections

Drilling into an entry can change the picture. A picture may name a `sub` — the
entry's own `data-slug` — beside its `panel`, and `app.js` announces the current
one on `lc:sub`. The subsection's picture wins where there is one; **otherwise
the panel's stands**. That fallback is the point: there are twenty subsections,
and they can be given art one at a time without the other nineteen breaking or
needing placeholders.

Only `lc:panel` sets which panel is current. Leaving a panel unwinds its
subsection, and that unwind arrives *after* `lc:panel` has already moved on — so
an `lc:sub` naming a panel we are no longer on is about where we came from, and
following it would drag the old panel's picture onto the new one.

Adding one is a bake and nothing else — no new file, no script tag, no CSS:

```
python3 tools/make-subart.py academics assets/img/sub/zebra-head.jpg --seal 2 --fade left,bottom
python3 tools/make-subart.py academics/groton assets/img/sub/groton-schoolhouse.png
python3 tools/make-subart.py --list
python3 tools/make-subart.py --drop academics/groton
```

Entries live in one table keyed by `"<panel>"` for a whole panel or
`"<panel>/<slug>"` for one of its entries, which reads as the site's own table of
contents — a panel and its subsections are the same kind of thing to bake. The
bake reads the ground's polarity off the border rather than being told, so a mark
on white and a mark on black both work.

`[hide]` on the bar blanks everything but the field, the cursor, the button
itself, and one line of caption under the picture saying what it is (Escape
also brings the page back). The other toggles and `[tune]` are development
aids and are hidden unless the address carries `?dev`; `[light]` and `[hide]`
stay. Every picture carries its caption where it
registers: a drawn piece in its `mount` options, a baked one in the `CAPTIONS`
table at the top of `subart.js`, the mask and the portrait in their own files;
`field.js` announces the picture that is up on `lc:art`, and `app.js` writes the
sentence into `#bare-caption`. The bar's other toggles and the tuner are
development aids that will not be in the finished site; `[hide]` may stay.

## The games

"Sites and programs" ends in a prompt, `$ ./games`. Pressing it clears the
detail and opens a terminal (`assets/js/games.js`) with three programs, each
the original's rules in text: the **dinosaur game** from Chrome's offline page
(cacti to jump, pterodactyls at three heights once the score allows, speed
climbing with the score), **tetris** (the ten by twenty well, a seven-bag, the
NES speeds by level and the NES scores for one to four lines, soft drop on
down, hard drop on space, a piece locking the moment it cannot fall), and
**snake** (a walled field, one segment per meal, a little faster each time,
death on the wall or on itself). The dinosaur game is pixel art at eighty by
fifty-two, two pixel rows to a text row with half-block characters, so the
T-rex, the cacti and the pterodactyls are the shapes of the originals; tetris
draws its well the classic terminal way with `[]` blocks and empties a full row
from the middle outward before the stack settles, as the NES does; snake is one
continuous line with an arrowhead for its head, on two-character cells so a
step up is the same distance as a step across. One screen, one status line, one set of keys:
arrows, space, `q` back to the menu, `q` again to the text. Best scores are
kept in `localStorage` under `lc-games-best`. While the terminal is open it
takes the keyboard in the capture phase, so the arrows drive the game rather
than turning the page; leaving the subsection closes it.

The tuner's two brightness dials are `fieldLift` (how bright the noise burns)
and `artLift` (how far a picture stands off it). Both scale tone; above 1,
`artLift` also carries the picture's alpha up out of the chapter dim, reaching
full at 2. Tone alone could not do it: a drawn piece already paints at full
density, so scaling it clamps to nothing, and the dim was the whole reason the
pictures read as faded.

`--seal N` thickens the non-ground marks by N pixels before flooding and hands
the band back afterwards. A hairline outline blurs into something the ground test
walks straight through, and the flood then pours into an area it should have
stopped outside — which is how a logo's white face joins the white page and the
subject comes out full of holes.

`--fade left,bottom[:0.16]` is for a photograph cropped through its subject,
which otherwise ends in a hard line where the frame was. The picture dissolves
into the ground toward the named edges over that fraction of the width or
height, on an ordered dither laid down in blocks the size of one field cell so
it survives the block-average onto the grid. Luminance is left alone: which end
of it is ink is decided per theme at render time, so a tonal fade would run the
wrong way in one of them. The zebra is baked this way, since its photograph cuts
the neck at the left and bottom of the frame.

**Academics/groton** is the Schoolhouse itself, cut from the campus photograph
(`assets/img/sub/groton-schoolhouse.png`: the whole building from the cupola's
finial to the lawn, sky and lawn keyed out, on a black ground, since the bake
floods the ground by brightness from the border and a white cupola on white
would go with it) and baked at 300 cells across, where the panel behind it
carries the zebra. Three liberties, all in the cutout: cloud fragments and other
islands not joined to the building are dropped, the weathervane's rod is
thickened and painted light so a grid of any cell size keeps it, and nothing
else is touched. A photograph is the reference, so the picture is the photograph; nothing
there is drawn. It is far wider than tall, so the field fits it to the window's
width rather than its height, and the building lands as a long low band with
the cupola standing up from it. `assets/img/sub/groton-cupola.png` is the
cupola alone, cut the same way, which reads far better at this grid; switching
back is one bake.

Subsection art is held to the same limit as everything else on this grid. A
photograph needs a subject that separates from its background and a silhouette
that survives about 33 cells. `chapel.jpeg` was tried for this entry and does not
survive it: grey stone against a grey overcast sky leaves almost no luminance
between subject and ground, the pinnacles and tracery that identify the building
are exactly the fine detail the grid cannot hold, and a sky key cannot remove the
foreground lawn. At full size it reads as a grey slab. What works here is what
works elsewhere — flat marks with real tonal separation, or a subject keyed
against a uniform backdrop the way the portrait is.

**Music** is drawn too, all six of it, and its panel has a picture of its own:
a metronome, the pyramid case with its window, the pendulum on its pivot near
the foot and the weight on it, the beat marked on the scale beside it. The
cursor sets the tempo across the dial's own range, 40 to the minute at the left
edge of the window and 208 at the right, and the weight slides to where that
tempo sits on the scale; the swing is a phase that accumulates at the current
tempo, so a change bends the beat rather than jumping it, and out of the window
it settles to 72. The foot flashes at each end of the swing, which is the tick.
**The Chamber Orchestra** entry is the alto clef on its staff, drawn smaller
than the pictures around it, and a note the cursor puts where it likes: the
pointer's height picks a line or a space, the stem goes up from a low note and
down from a high one, and a note off the staff gets its ledger line; with the
cursor at rest the note sits on the middle line, which on this clef is middle
C. The clef is the printed glyph itself: its outline is a public-domain
engraving's (Wikimedia Commons, `Alto clef.svg`), set on the staff through
`Path2D` by that engraving's own staff metrics, so the uprights and the hooks
are the type's rather than a drawing of them. It replaces a bake of
`assets/img/sub/alto-clef.png`, kept but unread.
One drawing serves every member of the violin family, the body's two bouts and
the C-bouts between them from the classic outline in units of the body's
length, with the neck, pegbox and scroll above and the fingerboard, f-holes,
bridge and tailpiece as a lighter tone on the body; **Amora** is four of them
in a row, two violins, a viola and a cello on its endpin, at the instruments'
own relative sizes with the cello a touch under scale so the violins keep their
outline (the baked photograph of a quartet it replaces did not survive the
grid, and `assets/img/sub/quartet.png` is kept but unread), and **Florida
Youth Orchestra** is Florida, from a public boundary file and projected like
Mexico, with an eighth note pulsing at Fort Lauderdale, where the orchestra
plays: the note swells on every beat and a ring leaves it each beat and thins
into the ground. **Carnegie Hall** is the catalogue photograph of a grand piano itself, baked
from `assets/img/sub/piano-sk3.png` (the reference with its floor reflection
painted out) with `--ink dark`, so the black case is the dense part in both
themes and the white keys, the gold plate and the strings read as the light
parts inside it; a drawn one was tried three ways and none of them held the
keyboard at this grid. **Competitions and
festivals** keeps its laurel, with the branch floored at a cell's width: the
first drawing's stem was thinner than a cell and dropped out, leaving the
leaves floating in two arcs.

**Leadership** is drawn, all four of it, in `assets/js/pieces.js`. The panel's
own picture is a plain standard on its pole, flying. The cloth is a mesh whose
depth is a wave travelling from the hoist to the fly, pinned at the pole and
growing with distance, each quad lit by its slope and foreshortened by its
depth, so a ripple reads as a fold; with no device on the cloth the folds are
the whole picture, and the cursor is the wind. **OCAPEX** is the logo with the
lettering and the pale disc left out: the letters are noise at this grid, and a
faint disc shares cells with the ring and waters it down. What is left is
measured from the logo file in units of the ring's radius: the ring, closed
here where the logo's opens on the right; the five staff lines, sampled across
the disc as one wave that dips at the left and rises to the right, drawn light
and clipped to the ring; and the eighth note with its smile, the stem and the
flag as the logo's own outlines reduced to a few points each. It used to be a
bake of `assets/img/sub/ocapex.png`; that file is kept as the reference, and
nothing reads it now. **Imagina** is Mexico with León pulsing, the city the
Sound of Giving was streamed to: Natural Earth's 1:110m outline, projected flat
with the longitudes scaled by the cosine of the country's middle latitude and
reduced to the points the grid can tell apart, as a faint ground with its coast
a cell and a half wide; a ring leaves the city every two seconds and thins into
the ground as it grows. **The Congressional Award** is the Capitol's east front,
measured off the straight-on reference photograph: its skyline was read column
by column against the sky, so the widths and heights are the building's own,
in units of its height from the statue's crown to the ground. The Statue of
Freedom on the tholos, a narrow lantern a tenth of the height; the dome,
taller than a hemisphere; the peristyle round its foot and, wider than the
peristyle, the drum's base; the portico under its pediment with the grand steps
below; and the wings, a third of the height, with their rows of windows and a
pedimented pavilion at each end. Only the wings' length is a liberty, since at
the true proportion the dome would be six cells across; the walls behind the
columns are kept dark so the colonnades read as rows.

## The mask

Not built, not procedural: **frames pre-rendered from a real 3D model**
(`assets/model/GMask.obj`, 45k verts / 60k tris) by `tools/make-mask.py` and
baked into `assets/data/mask.js`. The browser never sees geometry — it picks one
of **eleven frames from where the cursor is horizontally** and resamples it onto
the field's grid. Discrete steps, the way the reference site swaps between
hand-made art variants, rather than solving an angle every frame. It is
**centred** (`align: 'center'`), where the portrait sits off the right edge.

It answers to the cursor and to nothing else — there is no idle drift. What it
does instead is **travel**: the frame on screen chases the frame the cursor asks
for at a capped rate (`TURN`, 11 frames/s — under one frame per tick at 30fps),
so it can never skip one, with an exponential ease under the cap so the last of
a turn settles rather than stops. The cap is the load-bearing half: an ease alone
covers ten frames in two ticks when the cursor jumps the width of the screen, and
the head reads as cutting rather than turning.

The cursor leaving the window is not a special case, only another destination —
`REST`, frame 0, head-left. So the mask turns back to head-left over about half a
second instead of snapping there, and turns out again the same way when the
cursor returns. Head-left is also where it loads, and where it sits on a phone or
under `prefers-reduced-motion`, which is what replaces the old drift.

```
python3 tools/make-mask.py assets/model/GMask.obj 11
```

Every frame shares one centre and scale, taken head-on, so the head turns in
place instead of jittering as the frame swaps.

Four things in the bake are load-bearing:

- **Sample the triangles, not the vertices.** This mesh is dense where it is
  detailed and sparse across the flat shell, so splatting vertices leaves whole
  patches unwritten and the shading comes out pocked.
- **One point list, one depth sort.** Scattering each splat offset separately
  lets a later pass clobber a nearer sample, and the surface comes out mottled.
- **Drop the back faces.** A surface whose normal points away is the *inside*
  of the shell seen through a gap in the cage; keeping it fills the cage in.
- **Darken by depth.** This is what makes it legible. The cage's lattice is far
  finer than the field's cells can hold — at 30 cells across, one wire is under
  a cell wide, and no amount of thresholding recovers it. But the cage sits
  *recessed* behind the brow and the cheeks, so shading by depth turns it into
  the dark band across the face that actually identifies a goaltender's mask.
  Without it the tone averages out and the whole thing reads as an egg.

The `.obj` is build input, never served. It is 6.7MB — gitignore it if you would
rather not carry it, and keep the baked `assets/data/mask.js` (28KB).

## The Groton arms (parked)

The school's arms. Nothing shows them at the moment — Academics carries the
zebra mark — but the bake and `assets/js/crest.js` are kept whole: set `ON_PANEL`
in that file to a panel's `data-sect` and they are back. Baked from
`assets/img/crest.png` by `tools/make-crest.py` into `assets/data/crest.js` — the
wreathed mark, shield and motto ribbon together.

```
python3 tools/make-crest.py
```

Same storage contract as the portrait: one hex digit of auto-levelled
**luminance** per cell, a space where the ground was keyed out, and which end
becomes heavy ink decided at render time. On the dark ground the wreath, the
cross, the three books of the chief and the ribbon carry the ink and the crimson
quarters recede; on paper it inverts, which is how the arms are actually printed.

Two things differ from the portrait's bake, both because this is a drawn mark
rather than a photograph:

- **The ground is flat black**, so there is no vignetting to defeat and no colour
  cast to match. Darkness plus the flood is the whole test.
- **Cells are averaged, not sampled.** The ribbon's lettering and the leaf veins
  are one or two pixels wide, and picking a single pixel per cell keeps or drops
  them at random.

The key is still a flood **inward from the border** rather than a threshold, for
the reason it is one on the portrait: the black chief, the crimson quarters and
the outlines around the leaves are all as dark as the ground, and a threshold
erases them. Only ground connected to the border is ground.

**On the motto.** At the field's cell size the arms land about 33 cells across.
That carries the wreath, the shield, the cross, the sword down the pale and the
books; it does not carry the words. *cui servire est regnare* needs something
near **90 cells** before the letters separate — measured, not guessed — which at
88% of a 900px viewport means about an 8px cell, and a whole field of those is
some 20,000 glyph draws a frame. So the ribbon reads as inscribed rather than as
readable, and that is the grid's limit rather than a setting to turn up. The
averaging above is what keeps even that much; point-sampling took the lettering
out entirely. Anyone who wants to see it resolve can drop `cell` in the tuner.

`assets/img/crest.png` is build input, never served — nothing but the bake tool
reads it. It is 1.4MB; gitignore it if you would rather not carry it, and keep
the baked `assets/data/crest.js` (25KB).

## The ASCII portrait

`assets/js/portrait.js` draws nothing. It turns a photograph into a grid of
densities and hands it to `field.js`, which renders it **into the background
canvas** — so it dims, reveals and lives with the field instead of sitting over
it in the DOM. Its keyed-out areas stay transparent, so the field's moving
glyphs show through and around it, and it is under all the copy.

The ramp is `" .\'`:;-~+=*#%&@$"` — sixteen steps of any characters at all,
because this is ASCII art rather than the field's two-glyph density ramp.

**It is not a layer at all.** It is drawn by the field's own cell loop, on the
field's grid, at the field's cell size and alpha — 34×36 of the field's cells at
a 900px viewport, resampled from the 150-column bake. Inside its rectangle a
cell paints a glyph from the picture's ramp instead of `*` or `/`; everywhere
else the noise carries on. Nothing is composited over anything: the background
simply takes the shape.

**Two floors keep the jacket and the hair as solid as the face.** On the dark
ground they are the darkest part of the photograph, so left alone they land at
the noise's own brightness and the lower half of the silhouette dissolves into
it. `ART_LEV_FLOOR` (0.62) is the lowest colour level any picture cell may take
and `ART_RAMP_FLOOR` (6) the lowest ramp index, which lifts the whole figure
clear of the noise while the face keeps the top of the range.

**It does not fade in.** A front sweeps the diagonal from the bottom-left corner
of the picture to the top-right — noise ahead of it, scrambled glyphs on it, the
picture behind — and runs backwards on the way out, so the top-right goes first.
`ART_BAND` is how much of the diagonal is mid-scramble at once, which is really
a duration: `BAND / (1 + 2·BAND) · ART_MS`, about **550ms of scrambling per
cell** over a **2.4s** sweep.

It costs nothing extra to draw: the picture replaces the glyph a cell was going
to paint anyway.

**The page reads a baked grid, not the photograph.** `assets/data/portrait.js`
holds one hex digit of auto-levelled luminance per cell (a space is backdrop),
generated by:

```
python3 tools/make-portrait.py [path/to/photo.jpg]
```

Re-run that after changing `assets/img/portrait.jpg`. Baking is not an
optimisation — it is the only way this works from disk: the live path needs
`getImageData`, and **a canvas that has drawn a `file://` image is tainted**, so
opening `index.html` straight off disk with the runtime keying would silently
produce nothing at all. If the baked file is absent the script falls back to
keying the photograph at runtime, which needs the folder served over http; if
both are missing it no-ops and says so once in the console.

**Which end is the ink flips with the ground.** On paper the dark parts of the
photograph are the ink; on the dark ground it is the bright parts, or the
portrait reads as its own negative. That is why luminance is stored rather than
density — `lc:theme` re-emits the grid with the other polarity.

Keying the backdrop out (in the generator, and in the runtime fallback) took
three passes to get right, and each one is load-bearing:

- **Flood fill from the border, not a luminance threshold.** Only backdrop
  actually connected to the edge is taken, so a light shirt enclosed by a dark
  suit is never reached.
- **Judged against one reference colour, not against the neighbour it came
  from.** Chained tolerance walks through the blended cells along the hairline
  straight into the face, which is how a portrait loses its features.
- **Matched on colour *cast*, not colour.** A studio backdrop is vignetted, so
  its luminance drifts across the frame while its chromaticity does not.
  Matching on raw distance leaves a band of un-keyed backdrop down the darker
  edge; matching on cast keeps that band and still rejects skin, which is
  strongly warm where a grey backdrop is neutral. The luminance floor is what
  keeps the (also neutral) suit.

What survives is then cleaned of speckle by dropping tiny components —
deliberately **not** by keeping the largest one. A bright collar keys out at
fine sampling and cuts the head off the body; keeping only the biggest piece
then throws the face away and leaves a portrait of a suit. `COLS`, `EDGE_LUM`
and `CHROMA` at the top of the file are the knobs if a photo keys badly.

The same file is what the Contact panel's portrait slot wants.

## Themes

Dark by default. `[light]` in the bottom bar (or `?theme=light`) switches to
the paper ground; the choice persists in this browser. Each palette derives
its light version — the accent is darkened until it clears 4.5:1 on paper,
the field's mid tone is paled and its alpha halved so the glyphs read as ink
rather than noise. Everything is token-driven (`--bg`, `--ink`, `--ac` …),
so both grounds share one stylesheet.

## The field

Same pipeline as the reference shader: simplex noise → |n| as hue → HSV
luminance → gamma → density; density picks the glyph (`*` low, `/` high)
and a 3-stop colour (grey → `#7C1E2A` → `#E61E32`, sampled from the
reference), sampled once per 2×2 block of cells, 30fps. Added: the cursor
lifts density inside a radius; the field dims behind the chapters.

**Tuner** — press **T**, click `[tune]` in the bottom bar, or open with
`?tune`. Movement speed, colour vibrancy, cell size, glyph size, noise
frequency, cursor radius, strength and decode, chapter dim. Settings persist in
this browser's localStorage; *copy json* gives you the values to paste into
`DEFAULTS` in `field.js` so they ship. *reset* clears them.

**Comments** — in the tuner, *+ comment* arms a crosshair; click any element,
write what should change, save. Notes are pinned on the page while the
tuner is open, listed with the panel they belong to (click one to jump
there), and *copy all* turns them into a Markdown list to paste into a
chat. They live in this browser's localStorage until cleared.

## The name

Rasterised from a 5×7 bitmap font (A–Z, 0–9, space, `-`, `.`, `'`), so
the name is two attributes on `#nameblock` (`data-line1`, `data-line2`).
Four of Zorin's art styles are cell renderers (`halftone` default).
Clicking the name glitches and re-rolls style + palette; the palette sets
`--ac` and friends on `:root`, so the tag, links, headlines, numerals,
stats, cursor and the field all recolour together. Default `crimson`
matches Priyan's reds. `RANDOM_ON_LOAD` in `namecard.js` restores Zorin's
per-reload shuffle.

## Editing

- **Copy**: all in `index.html`. Each chapter is a `.panel--chapter` with a
  side column (numeral, name, lede, three `.stat`s) and four `.entry`s.
  Adding a panel needs no other edit: the pager, nav index and progress
  derive from the panel count.
- **Colours**: `:root` tokens; palettes in `namecard.js`; field tiers via the
  canvas `data-*` attributes or `DEFAULTS` in `field.js`.
- **Type**: `--serif` and `--mono` on `:root` and the Google Fonts link in
  `index.html`. Descriptive text is mono by request; `.headline`, `.numeral`,
  `.entry__title`, `.stat__n`, `.fact__v` and the counter are the serif roles.
- **Portrait**: save a 3:4 photo as `assets/img/portrait.jpg` and add the
  `<img>` where the comment in the Contact panel says; the empty state hides
  itself.
- **Background pictures**: re-run the bake after changing the artwork —
  `tools/make-portrait.py` for the photograph, `tools/make-crest.py` for the
  arms, `tools/make-subart.py <panel>/<slug> <image>` for a subsection. The page
  reads the baked grid, never the image.
- **CV**: the nav's CV link and the Contact panel's résumé line point at a
  PDF that does not exist yet.

## Known gaps

- The résumé PDF and the portrait. The CV nav link points at About until the
  PDF exists.
- The About links row ends with `paper`, pointing at `#research` because the
  submitted paper has no public URL yet.
- Music still overflows about 57px at 1440x900 and Academics about 19px, so
  those two panels scroll a little; the honors and American Heritage bodies are
  the longest on the page.
- The 4.0 at Groton wants confirming against the school's own conversion.
- Build carries a hidden blog entry with placeholder text.
- The three coaches' addresses are published deliberately, on About and inside
  the goaltender entry. They will be scraped; that was a considered call.
