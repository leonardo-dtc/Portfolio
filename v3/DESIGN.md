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
   arrives, the cover's typing code panel (which the first key press finishes) and the Scroll hint's three
   pulses (opacity, then it rests).
3. **What steps back dims by colour; it never blurs.** Text being read and things in motion are never
   blurred, and text that steps back keeps 4.5:1 (3:1 at 24px and up): its ink and paper change colour, and
   only pictures fade with opacity.

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

`--gutter` clamp(16px, 2.6vw, 36px), `--max` 1400px, `--chrome` 52px (44px in short windows, in the files
too, so the chrome text never moves between the deck and a file), `--tear`
64px (52px). On desktop, content ends at least `max(gutter + 40px, 70px)` from the screen's right edge
(less the margin outside `--max`), which leaves the rail label and the index tab (59px wide, 6px from the
edge) clear of it: 11 to 15px at 1440px, 5px between the tab and the content at 1024px and below.

### Motion

| Token | Value | Use |
| --- | --- | --- |
| `--ease` | cubic-bezier(.22, 1, .36, 1) | the hover grammar: starts at once, arrives softly |
| `--ease-out` | cubic-bezier(.23, 1, .32, 1) | reveals, the cabinet, files |
| `--t-settle` | 800ms | an image settling, a card easing flat and lifting |
| `--t-arrow` | 450ms | the badge growing in, its arrow turning, tape pressing |
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
slide at once. Reduced motion jumps. Keyboard focus landing in a stacked sheet brings it to rest. A load
with a `#id` goes to that sheet, except a load from Back or Forward (`performance` navigation type
`back_forward`), where the browser's own restored position is where the reader was.

## The rail, the index tab and the cabinet

**The rail** (`nav.rail`, difference-blended, z 100): the folder button, one dot per sheet, and the
current sheet's number and name running down beside them. At 1880px wide and more every dot carries its
sheet's name at rest instead (`::after` from `data-name`, 12px, white at 62% through the blend, about 6.5:1 on
either colour; the current one white and bold), clear of every sheet by 54px or more; the names hide while
the cabinet is open, whose folders say the same. Each dot sits on a hit cell `--row` tall (24px,
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
  "Open the index" pins it open. The index tab is the keyboard's one way in: the folder button has
  `tabindex="-1"` (it is for the pointer), so the walk from the top is skip link, name, Index, then the
  cover's routes, and focus never opens the cabinet by itself. Enter on the tab opens it and moves focus to
  the current folder (no file until the reader moves); arrows, Home and End walk the folders; Tab moves on to
  Find and Close, and tabbing on out of the rail, the tab and the cabinet (onto "portfolio" on the cover
  too) closes it; Escape closes and returns focus to whatever opened it (the index tab when the pointer
  opened it). Non-modal: no backdrop, no focus trap, no scroll lock.
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
  triangle), crossing another row does not swap the file. The point that crosses into a row is part of
  that hull (each row's `pointerenter` records it before deciding), and after a pause of 100ms the hull
  starts again from where the pointer rested. If the pointer stops short for 320ms, the row it rests on
  wins. Moving straight up and down the dots is never "heading for the file", so scrubbing the dots stays
  immediate. `tests/v3/check.mjs` runs diagonal paths from the dots up to their files (`V3_AIM=full`: 108
  paths, none may swap the file).
- *Placement.* In windows too short for the top folder's file, the cabinet moves down; when the drawer
  front would fall below the window, it moves up; in very short windows the files leave out their summary
  line. Under 540px tall it becomes the bottom panel, and the pill replaces the rail (see Phones).

**Find** (the drawer front's label holder): a white slip in a black frame held by two screws, "Find"
printed on it, the reader's word written after it. `/` opens the cabinet at Find from anywhere but a
field. It searches the page's own text sheet by sheet (tiles, timeline rows, table rows and figures as
units, otherwise the innermost headings, paragraphs and list items), only what shows (the archive's cards
count while the Mac stands in for them), plus each sheet's name; it matches each typed word at the start of
a word, accents aside, curly apostrophes and primes read as straight ones. The six project files are
searched too: fetched once on the first search, each file says its sheet by its link back. A sheet found
only in its file quotes it after "In its file ·", and while the search lasts its folder links to the file at
the words (a `#:~:text=` fragment) and its file reads "Open the file"; a match on a sheet always ranks before
one only in a file. Matching folders keep their ink and carry a count; the others fade to the
muted ink (still 5.4:1), except the current sheet's vermilion tab, which keeps black (the muted ink would
be 1.6:1 on vermilion). The best match (a sheet whose own name matches, then more matching lines, then
the earlier sheet) has its file out, quoting the matching line with the word marked in vermilion. Up and
Down step through the matches, Enter goes to the one that is out and rings the line in vermilion for a
moment (colour only; a match with no place of its own to ring, such as a heading read only by screen
readers, rings the sheet's title), Escape clears the word, then closes. The drawer's label reads
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
the caption brightens to full ink; the card comes to the top of the collage (`z-index` 2 over a resting 1,
dropping back once it has settled, 800ms after the pointer leaves the collage; pointing at the other card
puts it at 0 at once, so the other card rises over it without waiting), so its overlapping sibling never
covers it. The other card in the collage steps back by colour, not opacity: its ink moves to `--ink-2` (5.45:1 on
paper), the 486 card's vermilion pales to `#EA6256` (black text 5.55:1, the white figure 3.29:1), its
shadow lightens, and only pictures fade to .55 (a photograph or the sketch, and the chart's bars as fill
colour). Badges sit on the card's outer
corner, half off the paper like a sticker (bottom left on the first card, bottom right on the second).
Touch screens show the badge at rest. Reduced motion keeps the caption and the step back and drops every
movement. `tests/v3/check.mjs` points at each card and checks that no text is dimmed by opacity and every
text still meets its threshold.

## The cover's routes

The handwritten line's words are links: "portfolio" opens the cabinet (without the script it links to
`#cabinet`), "goaltender" goes to the hockey sheet, "researcher" to drug safety, "violist" to viola and
violin. Under each lies a vermilion marker stroke, faint (42%) at rest; hover or focus draws it through
in 300ms (left to right, a clip); touch screens show it drawn. Focus also draws a 2px vermilion ring. The
line stacks above the title so the whole word takes the pointer. A dark halo (`text-shadow: 0 0 4px, 0 0
10px`, `#151515`) keeps the code panel's lines from running through the words. The words are inline, so
each separator stays with the word before it when the line wraps. On touch screens each word takes 44px
with 12px of vertical padding, which moves no line (the stroke is offset to stay under the word). On phones
"portfolio" is left out (the pill is the index there).

## The cover as a desk (a design toggle, T40)

`html[data-cover="desk"]` (see `README.md`, Design toggles). The poster stays: the name, the hand line, the year
and the tag. Around them lie six objects, each a link to its project file, each named in the hand face (16px or
more) with the routes' vermilion marker stroke under the name:
- the code panel (Research): its link is laid over the panel and under the title, as the panel is, so the
  panel keeps typing;
- the goalie mask (Hockey), which takes the place of the title's own mask;
- a page of the résumé (paper, a vermilion rule, grey lines);
- a print of Loquar (a white-bordered photo);
- the exoskeleton's sketch on its torn scrap of lined paper;
- the OCAPEX sticker.

Each has its own tilt. Pointing at one picks it up over 380ms: it lifts 8px, straightens by 60% and its shadow
deepens, and its stroke darkens; the code panel lifts with its link. Focus draws a 2px vermilion ring.

**Wide screens (900px and up):** round the name, placed from the name's own block:
- three down the right of the name (the mask, the page, the print), clear of the rail;
- the sketch under the code panel, clear of the tag;
- the sticker under the name, clear of the Scroll hint.

**Phones and tablets:** a grid of three under the name, the code panel standing in as a small drawn window
(phones do not show the panel). The cover grows to fit them. Print shows the poster.

## The contact sheet (T18)

**Clean (the default since 2026-10-05):**
- **The words:** LET'S TALK (or GET IN TOUCH, or SAY HELLO, by toggle) in Anton, red over white, inside a
  calmer hand-drawn frame. Its line wanders about 3% across and 7.5% down its box. The words are padded inside
  it by 0.2em at the sides and 0.36em above and below, so every letter stays 4px or more from the line at any
  size.
- **The size:** the frame, centred in its column, is sized by container query units:
  `min(84cqw / (width + .52), 100cqh / 2.7)`, where `--ww` is the pair's width in em (1.9, 2.75 or 2.4).
- **Taken away:** no stickers or tape; the address slab square to the page.
- **The end:** a hairline over outlined white buttons and the colophon, on the dark sheet.

**Collage (round three's, by toggle):** the crown, the star, the mask and the tape, the slab tilted and taped,
and the torn paper end. Its old jittery frame now sits at 130% by 152% of the words, so it clears them too.

## The archive

**The Mac, or the wall of cards, is a design toggle (T17); the Mac is the default.**

**On screen, with the script: a Macintosh of the mid-nineties** (`assets/js/mac.js`, `assets/css/mac.css`;
2026-10-05, after Leonardo found the one-bit System 1 screen too rudimentary). The case: platinum (`#EFEADF` to
`#D9D2C1`), the screen set in a recess, a floppy slot and a vermilion badge on the chin, two strips of tape. It
stands square; only the tape is askew. It is sized from the window's height on desktop (`min(900px,
max(640px, 1.6 × (100svh − 450px) + 64px))`) so the sheet still stacks; a window under 600px tall keeps a 640px
case and the sheet scrolls; phones and tablets have a taller screen (7:10.5, or 4:3.6 from 560px).

The screen is Platinum in the poster's colours:
- **Face** `#DEDEDE`; a raised edge is white along its top and left and `#9A9A9A` along its bottom and right (a
  sunk one the other way round); windows have a 1px ink edge and a 3px shadow.
- **Desk** the poster's black (`#211F1F`) under a 6px grid of faint dots.
- **Chosen** deep vermilion `#B92B1C` with white letters (5.9:1): a file in the list, an open menu title, a
  menu item under the pointer.
- **Type** the site's Metropolis: menus and window titles 14px bold, the list 14px, headers and the window's
  header 13px, a file's page 15px (its title 22px, its line 16px). Nothing is under 13px.
- **Pictures** 32 dots, at 1px a dot in the list and 2px as icons, in ink, white, three greys and vermilion: a
  page with its corner folded and a shadow, carrying an emblem chosen by the card's kind (music video, statistics,
  arrangement, game design, robotics, rocketry, games; `data-icon` on the card names one; anything else is lines
  of text), the drive and the Trash.

What is on the screen:
- **The menu bar:** the poster's star in vermilion, File (Open, Close Window), View (as Icons, as List; by Name,
  by Kind, by Year, a tick on the current ones) and Special (Restart). Each title is a button that opens its
  list; arrows move through it, Escape closes it, and with one open, pointing at another title opens that one.
- **The desk:** the Archive disk and the Trash down its right side, their names on white labels.
- **The Archive window:** a header with "7 items" and "Click a file to open it" ("Tap" on touch screens), the
  columns' headings (Name, Kind, Year; the sorted one pressed in with a triangle for its direction), then a row a
  file: its picture, name, kind and year, rows alternating white and `#F5F5F5`. Sorted by Year, newest first
  ("Now" first, then "2026 to now"; ties keep the cards' order), which is the order the cards stand in. A
  heading sorts by its column (names and kinds A to Z, years newest first); the same heading again turns it
  round. Under 700px wide the kind column gives way to the names; under 520px the list has one column, each
  file's kind and year under its name, and the headings become a row of buttons. View, as Icons lays the files
  out as 64px pictures with their names under them, two lines at most.
- **A file's window:** a page of plain type: the year and kind in 13px vermilion capitals, the title, the card's
  line, then the card's paragraphs and details list (`.entry__more`, copied), and the card's link drawn as the
  old default button (rounded, with a heavy ring). It scrolls inside the window.

Windows:
- The front window alone has the ruled title bar and its boxes; the others' titles are muted.
- A window comes to the front when pressed. It drags by its title bar with a mouse or pen, its left edge and
  title bar staying on the screen; on a screen under 520px wide it takes the whole desk and stays put.
- The zoom box (or a double click on the title bar) fills the screen with the window and puts it back.
- Opening draws four zooming outlines (180ms, dotted, inverting what is under them). Closing draws them back to
  the file, and the focus returns there.

Opening a file:
- One click or Return opens it, as on a phone; the old Mac wanted two.
- Up and Down move along the list (arrows across the grid as icons), Home and End jump, a name's first letters
  go to it, and while the focus is on the Mac the arrows never change the sheet.

The screen coming on, the first time the sheet arrives: the poster's star badge on the desk with a bar filling
under it (700ms; 800ms on Restart), then the menu bar and the Archive window zooming open from the disk. Until
then the desk's black covers the screen, but its controls stay in the Tab order: focus coming in turns the
screen on at once. Find going to a file opens it once the screen is on, in front.

Reduced motion: no outlines and no coming on; the screen is on from the first frame.

**The wall of cards (with the script, by toggle), and the cards without the script, in print and in forced
colours.** Index cards taped to the paper, four across on desktop. A card is one `<li class="entry">`: its year
(Anton, vermilion, 24px), its kind (a black tag), its title (the hand face), its line, its file
(`.entry__more`: paragraphs and a details list) and its link.
- *With the script* (screen, colours not forced) a card shows its year, kind, title and line; the file and the
  link are the card's file. The title is a button (`.entry__open`, its `::after` covering the card, so the whole
  card answers), and its focus ring rings the card. Pointing at a card straightens it to 0 degrees and lifts it
  4px while its tape presses (800ms), and steps the other cards back by colour, with no blur: `#F3F1F1` paper,
  `--ink-2` titles (6.05:1), the kind tag on `--ink-2` (white 6.8:1), the 24px vermilion year at 3.59:1.
- *The card's file* is a `<dialog>` over the deck: white paper up to 40rem wide and 84vh tall, a vermilion tab
  standing on it with the year and kind (black on vermilion, 12px bold capitals), the title in the hand face
  (up to 36px), the line at 17px, a vermilion rule, the paragraphs at the body size, the details as ruled rows
  (their names in 12px capitals), the link, and Close in the top right corner, in view however far the file
  scrolls. It rises 12px as it fades in (280ms) over a 72% black; Escape, Close or a press outside put it away,
  and the focus goes back to the card. Keys stay with it while it is open (the deck's arrows wait), and the deck
  behind does not scroll.
- *Without the script, in print and in forced colours* every card shows its whole file under its line.

## Phones (below 900px, and windows under 540px tall)

The page reads as a plain document with the same torn edges. Windows under 540px tall (a phone held
sideways, a short browser window) get the same treatment: the sheets no longer stack there, and the rail
with its tab would not fit beside the chrome. The rail gives way to **the pill**: the index
tab restyled as a solid black pill with a paper hairline resting at the bottom right (12px from the edge,
out of the middle of the reading column), reading "Index · 08 Goaltender" (the current sheet, from the same
names as the rail label; in windows under 540px tall only "Index · 08", about 115px wide), 44px tall. It opens
the cabinet as a bottom panel (rows 44px, at most 80% of the screen, Find and Close in the drawer front at
the bottom, lifted above the on-screen keyboard while Find has it). The chrome gets a solid black strip, so
the name never runs over text. While the reader scrolls down, the pill and the strip step away; the pill
comes back on the way up or 650ms after scrolling stops, the strip on the way up or near the top. The
direction must hold for 24px, and the position is clamped to the page, so rubber-banding past either end
never flips it. The pill also steps aside while the end row (with its own "Open the index") is on screen.
Keyboard focus never rests on something off screen: the strip comes back while its name has focus
(`:focus-within`) and the pill while it has focus (`:focus-visible`). On touch screens the chrome's name is
a 44px target.
Each sheet keeps 64px more space at its foot, so the pill never covers its last lines.

## Without the script, reduced motion, print

- **No script.** Every sheet reads in order; the dots are plain anchors; the index tab and "portfolio" link
  to `#cabinet`, which shows the cabinet as the link's target (choosing a folder, or Close, which links to
  `#shut`, hides it). Archive cards show their whole files; the hand line's strokes are faint until hovered.
- **Reduced motion.** Fades stay, every transform goes: no recede, no reveals' travel, no slide (jumps are
  instant), no settle, lift or turn on hover; the cabinet and files fade; a card's file opens without rising.
- **Print.** A plain document of 13 Letter pages (the phones' clearance for the pill stays off paper): chrome, rail, index tab, cabinet, badges, tape and the
  frame are hidden; archive cards print with their files; small vermilion text prints in `--red-ink`; the
  research chart's bars print in their colours, the tools as outlined tiles, and the clean contact sheet's words
  at 28pt. Before printing, pictures still waiting to load lazily are asked to load.

## Adding things

**An archive card.** Copy one `<li class="entry">` in `#archive` (newest first) and change its year, kind,
title and line, and its file: a paragraph or two in `<div class="entry__more">`, then the details list, one
`<div><dt>Name</dt><dd>What</dd></div>` a row (rows that cannot be filled are left out; the whole file is
optional). The link is optional; for a sheet on this page write `<a class="entry__link" href="#record">Sheet
10, The record</a>` and the script rewrites the number and name from the sheet. Tilt, tape, the card's file,
the reveal order and Find all follow without other markup. The card is also a file on the Mac, with nothing
more to do: its kind picks its picture (games, music video, statistics, arrangement, game design, robotics,
rocketry; anything else is a page of text), or add `data-icon="maze"` (games, film, chart, notes, maze,
robot, rocket, text) to the `<li>` to choose one.

**A file's wording.** Each folder's file is inside its link (`.folder__btn > .file`): edit its title,
kicker and one line. Leave the "Sheet NN / N" line as it is; the script writes it.

**A project file.** Copy the closest file's folder in `files/`, write its sections, add it to `FILES` in
`tools/v3-files.mjs` and run `node tools/v3-files.mjs`: it writes the file's title, chrome, drawer, links back
and pager from the deck, and every other file's drawer and pager. Add its `file-NN` view transition name to the
lists in `files.css` and `site.css`. The unit test (`node --test tests/v3/unit/*.test.mjs`) fails if a file
drifts from the deck.

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
   dots and folders match in number and order, the counts, links, text sizes, contrast (at rest and while
   cards step back), the cabinet and its hover intent, the routes, Find, the pill, the keyboard walk, the
   six project files and the console.

Each sheet adds one 24px row to the rail and the cabinet; twelve need 401px of cabinet, and the drawer
switches to the bottom panel (and the rail to the pill) in windows under 540px tall.

## Don'ts

- Don't link to, embed or show another edition. Copy a file into `v3/assets` instead.
- Don't blur anything being read or moving; step things back by colour (opacity only for pictures), so
  dimmed text keeps 4.5:1.
- Don't tilt anything toward the pointer. Straightening a tilted card on hover is a settle and is fine.
- Don't set text under 12px, or small white text on vermilion.
- Don't add motion that runs on its own.
- Keep `<meta name="robots" content="noindex">`.
