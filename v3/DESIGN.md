# Design system: Leonardo Carvalho, poster edition (v3)

Recorded from the built page in round three (October 2026): `index.html`, `assets/css/site.css`,
`assets/js/site.js`, checked by `tests/v3/check.mjs`. The README tells the story of the edition; this file
is the reference for changing it.

## Overview

One page of twelve full-screen sheets in the look of Leonardo's "Portfolio 2025" Illustrator deck: black,
paper and vermilion, a condensed display face, torn edges, tape and stickers. On desktop the sheets stack:
each one is sticky and the next slides over it through its torn top edge. The index is a paper file cabinet
that opens beside the dot rail. Everything reads without the script and prints as a plain document.

Three rules hold the system together:

1. **Paper objects, paper behaviour.** Every control is drawn as something on the deck's desk: a tab, a
   folder, a file with tape, an index card, a label holder, a sticker. Nothing is drawn as a generic web
   control.
2. **Content moves inside a still frame.** Hovers are long and soft (450 to 800 ms on one ease-out curve)
   and move a few pixels in answer to the pointer. Nothing moves on its own except the reveals as a sheet
   arrives and the cover's typing code panel.
3. **What steps back dims; it never blurs.** Text being read and things in motion are never blurred.

## Tokens

### Colour

| Token | Value | Use | Measured |
| --- | --- | --- | --- |
| `--black` | `#151515` | dark sheets, text on paper and on vermilion | on vermilion 4.53:1 |
| `--paper` | `#E9E5E5` | paper sheets, the cabinet, tags, the index tab | black on paper 14.6:1 |
| `--red` | `#EA3D2E` | vermilion: panels, the strip, display accents, markers | on black 4.53:1, on paper 3.23:1 |
| `--white` | `#FFFFFF` | files, index cards, display type on vermilion | white on vermilion 4.03:1 (24px and up only) |
| `--red-ink` | `#B92B1C` | vermilion for small text on paper or white | 4.91:1 on paper, 6.1:1 on white |
| `--ink-2` | `#5E5A5A` | muted text on paper | 5.45:1 |
| `--stage-2` | `#B1ADAB` | muted text on black | 8.2:1 |
| `--paper-2` | `#D5D0CF` | rules on paper | |
| `--stage-well` | `#202020` | tiles on black | |

Roles (`--bg`, `--fg`, `--fg-2`, `--rule`, `--well`) are re-pointed by `.slide--dark`, `.slide--paper`,
and again inside cards, tickets and the red panels.

**Contrast rules.** Text under 24px on vermilion is black (4.53:1); white stays only on display type (the
panel headings, the OCAPEX figures, 486), where 3:1 applies. Vermilion text on paper is used only at 24px
and up (the archive years, the OCAPEX subtitle, held at 24px or more with `max(.4em, 1.5rem)`); smaller
vermilion on paper or white is `--red-ink` (the Genuvalens results, hovered links on paper, print). The
code panel sits on `#151515` so its vermilion keywords reach 4.53:1; its comments are `#8A8684` (5.06:1).
`tests/v3/check.mjs` measures these pairs and sweeps every text over a solid colour.

### Type

| Role | Face | Size | Where |
| --- | --- | --- | --- |
| Display | Anton (stands in for Impact) | `--title`: clamp(3rem, 9.4vw, 8.75rem) | sheet titles, the name, figures, files' titles |
| Subtitle | Anton, vermilion | `max(.4em, 1.5rem)` of the title | `.title__sub` |
| Text | Metropolis 300 to 700 | `--text`: clamp(.9375rem, .9rem + .2vw, 1.0625rem) | body |
| Small | Metropolis | `--small`: 13px | kickers, lists, quotes |
| Micro | Metropolis, capitals, tracked | `--micro`: 12px, the floor | labels, tabs, captions, the code panel |
| Hand | Permanent Marker | clamp(1.15rem, .9rem + 1.3vw, 2.1rem) on the cover | the cover's line, archive titles |

Nothing visible is set under 12px. The code panel is 12px monospace (it was 9px).

### Layout

`--gutter` clamp(16px, 2.6vw, 36px), `--max` 1400px, `--chrome` 52px (44px in short windows), `--tear`
64px (52px). On desktop, content keeps 40px clear of the rail and never comes within 70px of the screen's
right edge, which leaves room for the index tab (59px wide).

### Motion

| Token | Value | Use |
| --- | --- | --- |
| `--ease` | cubic-bezier(.22, 1, .36, 1) | the hover grammar: starts at once, arrives softly |
| `--ease-out` | cubic-bezier(.23, 1, .32, 1) | reveals, the cabinet, files |
| `--t-settle` | 800ms | an image settling, a card easing flat and lifting |
| `--t-arrow` | 450ms | the badge growing in, its arrow turning, tape pressing |
| `--t-open` | 500ms | an archive card unfolding |
| `--t-reveal` / `--stagger` | 560ms / 60ms | text rising as a sheet arrives |
| slide | 380ms, cubic-bezier(.3, 0, .2, 1) | the last sheet of a jump sliding over |

## The sheet stack

Each `<section class="slide">` holds a torn edge (`svg.tear`, three 2800 by 72 paths in the sprite), a
`.sheet` with a faint still grain, and a `.slide__dim`. From 900px wide and 600px tall, with the script,
every sheet is `position: sticky; top: 0`. The script measures each sheet's flow top (`tops`), marks
sheets taller than the window `is-tall` (they scroll normally), and on scroll scales the covered sheet to
0.95 and dims it to 45% (transform and opacity only). Stickers and tape lag up to 28px as their sheet
slides in. Reveals replay each time a sheet comes back.

**Navigation (`go`).** A move of one sheet slides it over (or off, going back) in 380ms. A longer jump
cuts instantly to one screen before the target (after it, going back) and slides only the last sheet:
cover to hockey moves the page 900px, where it used to sweep 6300px through six sheets. The page's own
scroll position moves (the sticky sheets do the rest); any wheel, touch, press or scrolling key stops the
slide at once. Reduced motion jumps. Keyboard focus landing in a stacked sheet brings it to rest.

## The rail, the index tab and the cabinet

**The rail** (`nav.rail`, difference-blended, z 100): the folder button, one dot per sheet, and the
current sheet's number and name running down beside them. Each dot sits on a hit cell `--row` tall (24px,
28px on touch screens at desktop widths) and 24 to 36px wide. The rows start at
`50% - var(--n) * var(--row) / 2 + 16px`, the line the cabinet's folders start on, so each dot is level
with its folder.

**The index tab** (`a.index-tab`, z 101): a paper tab with a black hairline standing on the rail above the
folder button, "Index" in 12px bold capitals, not blended, so it reads as paper on every sheet. It opens
the cabinet (click, Enter) and is part of the hover area. Without the script it links to `#cabinet`, which
shows the cabinet as its target. On phones it is the pill (below).

**The cabinet** (`nav.cabinet`, z 120, 336px wide): a paper drawer with one hairline folder per sheet
(trapezoid tab; each whole row is the folder's link), black divider tabs for the disciplines, and the
drawer front. The current sheet's tab is vermilion with black text.

- *Opening.* Hovering the rail, the tab or the cabinet opens it after 120ms; it closes 300ms after the
  pointer has left all three. A click on the folder button, the index tab, "portfolio" on the cover or
  "Open the index" pins it open. Keyboard focus on the folder button opens it; Enter moves focus to the
  current folder (no file until the reader moves); arrows, Home and End walk the folders; Tab moves on to
  Find and Close; Escape closes and returns focus to whatever opened it. Non-modal: no backdrop, no focus
  trap, no scroll lock.
- *Z-order.* Folder `k`'s link stacks at `3k + 3`; its file is inside that link at `z-index: -1`, so it
  paints behind its own folder's front and tab but in front of every folder with a smaller `k`; divider `k`
  stands at `3k + 1`; the drawer front at 100.
- *Files.* Hovering a folder or its dot, or focusing a folder, pulls that folder's file up out of it:
  white paper, a slight tilt, a piece of tape, rising 250ms (going back 180ms; a replacing file waits 60ms
  so one moves at a time). The file is part of its folder's link, so clicking anywhere on it, "Open the
  sheet" included, opens its own sheet.
- *Hover intent.* A pulled file covers the folders behind it, so on the way up to it the pointer may
  cross another folder's exposed edge or another dot. While the pointer is heading for the file (the
  current point lies in the hull of where it was a few moves ago and the file's corners: the safe
  triangle), crossing another row does not swap the file. If the pointer stops short for 320ms, the row it
  rests on wins. Moving straight up and down the dots is never "heading for the file", so scrubbing the
  dots stays immediate.
- *Placement.* In windows too short for the top folder's file, the cabinet moves down; when the drawer
  front would fall below the window, it moves up; in very short windows the files leave out their summary
  line. Under 540px tall it becomes the bottom panel, and the pill replaces the rail (see Phones).

**Find** (the drawer front's label holder): a white slip in a black frame held by two screws, "Find"
printed on it, the reader's word written after it. `/` opens the cabinet at Find from anywhere but a
field. It searches the page's own text sheet by sheet (tiles, timeline rows, table rows and figures as
units, otherwise the innermost headings, paragraphs and list items), matching each typed word at the
start of a word, accents aside. Matching folders keep their ink and carry a count; the others fade to the
muted ink (still 5.4:1). The best match (a sheet whose own name matches, then more matching lines, then
the earlier sheet) has its file out, quoting the matching line with the word marked in vermilion. Up and
Down step through the matches, Enter goes to the one that is out and rings the line in vermilion for a
moment (colour only), Escape clears the word, then closes. The drawer's label reads
"Found · 3 of 12"; a status line tells screen readers the same in words.

## The hover grammar (project cards)

The collage cards on the drug safety, knee exoskeleton and Loquar sheets become links to their sheet's own
"Read the analysis", "Read the report" or "See the project" destination (the href is read from that link
when the page loads, so the two never disagree) and carry a round vermilion badge with the sprite's arrow.
The card link stays out of the tab order and the accessibility tree; the sheet's link is the keyboard's
way.

On hover: the image settles inside its still, overflow-hidden frame from 1.06 to 1 (800ms); the card eases
60% of its tilt toward flat and lifts 3px as its shadow deepens (800ms); its tape presses down (scale .96,
a tighter shadow, 450ms); the badge grows from .8 to 1 while its arrow turns from 45 degrees to 0 (450ms);
the caption brightens to full ink. The other card in the collage steps back to .55 opacity (`filter:
opacity()`, so it does not fight the reveal's own opacity transition). Badges sit on the card's outer
corner, half off the paper like a sticker (bottom left on the first card, bottom right on the second).
Touch screens show the badge at rest. Reduced motion keeps the caption and the step back and drops every
movement.

## The cover's routes

The handwritten line's words are links: "portfolio" opens the cabinet (without the script it links to
`#cabinet`), "goaltender" goes to the hockey sheet, "researcher" to drug safety, "violist" to viola and
violin. Under each lies a vermilion marker stroke, faint (42%) at rest; hover or focus draws it through
in 300ms (left to right, a clip); touch screens show it drawn. Focus also draws a 2px vermilion ring. The
line stacks above the title so the whole word takes the pointer. The words are inline, so each separator
stays with the word before it when the line wraps. On phones "portfolio" is left out (the pill is the
index there).

## The archive

Index cards taped to the paper, four across on desktop. At rest a card shows its year (Anton, vermilion,
24px), its kind (a black tag) and its title (the hand face). Pointing at a card, or tabbing to its link,
unfolds its line and link (grid rows 0fr to 1fr, 500ms), straightens the card to 0 degrees and lifts it
4px while its tape presses (800ms), and steps the other cards back to .4 opacity, with no blur. The
unfolding part hangs below the card's resting edge, over the gap, so the grid never moves; the card stays
in front until it has folded again. A card near the foot of its sheet lifts as far as its line needs to
stay on the sheet (`--rise`, measured by the script). Cards without a link always show their line. Touch
screens, print and pages without the script show every line. The script wraps the line and the link
(`.entry__fold`), so the authored card stays one `<li>`.

## Phones (below 900px, and windows under 540px tall)

The page reads as a plain document with the same torn edges. Windows under 540px tall (a phone held
sideways, a short browser window) get the same treatment: the sheets no longer stack there, and the rail
with its tab would not fit beside the chrome. The rail gives way to **the pill**: the index
tab restyled as a solid black pill with a paper hairline at the bottom centre, reading
"Index · 08 Goaltender" (the current sheet, from the same names as the rail label), 44px tall. It opens
the cabinet as a bottom panel (rows 44px, at most 80% of the screen, Find and Close in the drawer front at
the bottom, lifted above the on-screen keyboard while Find has it). The chrome gets a solid black strip, so
the name never runs over text. While the reader scrolls down, the pill and the strip step away; the pill
comes back on the way up or 650ms after scrolling stops, the strip on the way up or near the top. The
direction must hold for 24px, and the position is clamped to the page, so rubber-banding past either end
never flips it. The pill also steps aside while the end row (with its own "Open the index") is on screen.
Each sheet keeps 64px more space at its foot, so the pill never covers its last lines.

## Without the script, reduced motion, print

- **No script.** Every sheet reads in order; the dots are plain anchors; the index tab and "portfolio" link
  to `#cabinet`, which shows the cabinet as the link's target (choosing a folder, or Close, which links to
  `#shut`, hides it). Archive cards show every line; the hand line's strokes are faint until hovered.
- **Reduced motion.** Fades stay, every transform goes: no recede, no reveals' travel, no slide (jumps are
  instant), no settle, lift or turn on hover; the cabinet and files fade; archive cards open in place.
- **Print.** A plain document of 14 Letter pages: chrome, rail, index tab, cabinet, badges, tape and the
  frame are hidden; archive lines are shown; small vermilion text prints in `--red-ink`.

## Adding things

**An archive card.** Copy one `<li class="entry">` in `#archive` and change its year, kind, title and line.
The link is optional; for a sheet on this page write `<a class="entry__link" href="#record">Sheet 10, The
record</a>` and the script rewrites the number and name from the sheet. Tilt, tape, the unfolding, the
reveal order and Find all follow without other markup.

**A file's wording.** Each folder's file is inside its link (`.folder__btn > .file`): edit its title,
kicker and one line. Leave the "Sheet NN / N" line as it is; the script writes it.

**A sheet.**

1. Add the `<section class="slide slide--paper">` (or `slide--dark`) in `<main>` where it belongs, with an
   `id`, a `<svg class="tear">` and a `.slide__dim` (copy a neighbour; alternate paper and dark).
2. Add its dot to `.rail` at the same position: `<a href="#id" data-name="Short name" aria-label="Full
   name"></a>`. `data-name` feeds the rail label and the phone pill.
3. Add its folder to the cabinet at the same position: copy one `<li class="folder">`, change the href,
   the tab's name, `--tx` (where the tab sits along the folder, 0 to .44) and the file's four lines. If it
   starts a new discipline, put a `<li class="divider">` before it.
4. The script writes `--n`, every folder's `--k` and number, every "Sheet NN / N", "N sheets" and the
   archive's sheet numbers. The HTML's own numbers are the fallback without the script: update them if you
   want that reading exact.
5. Run `node tests/v3/check.mjs` (with `python3 tools/serve.py 8778` running): it checks that sections,
   dots and folders match in number and order, the counts, links, text sizes, contrast, the cabinet, the
   routes, Find, the pill and the console.

Each sheet adds one 24px row to the rail and the cabinet; twelve need 401px of cabinet, and the drawer
switches to the bottom panel (and the rail to the pill) in windows under 540px tall.

## Don'ts

- Don't link to, embed or show another edition. Copy a file into `v3/assets` instead.
- Don't blur anything being read or moving; step things back with opacity.
- Don't tilt anything toward the pointer. Straightening a tilted card on hover is a settle and is fine.
- Don't set text under 12px, or small white text on vermilion.
- Don't add motion that runs on its own.
- Keep `<meta name="robots" content="noindex">`.
