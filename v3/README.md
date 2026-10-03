# v3 · poster edition

The third edition of Leonardo Carvalho's portfolio, built beside the terminal
edition (repository root) and the editorial edition (`v2/`). One page of twelve
full-screen sheets, in the look of the "Portfolio 2025" Illustrator deck: black,
paper and vermilion, a condensed display face, torn edges, tape and stickers.
Static HTML, CSS and vanilla JavaScript; no framework, no build step. The page
reads fully without JavaScript.

## Preview

```sh
python3 tools/serve.py 8778
```

Then open `http://127.0.0.1:8778/v3/`.

## Sheets

| Id | Sheet | Source of the copy |
| --- | --- | --- |
| `cover` | The name on two lines, sliced letter, torn red strip, goalie mask, a tilted code panel that types itself | |
| `about` | About me, cutout portrait on a red arch with text curved along it | `v2/about/` |
| `skills` | Skills, tools, how I work (red panel) | `v2/resume/#technical`, `v2/about/` |
| `research` | Drug safety: aducanumab pharmacovigilance, ARIA chart | `v2/work/aducanumab/` |
| `exoskeleton` | Knee exoskeleton: Genuvalens, sketch and results | `v2/work/genuvalens/` |
| `loquar` | Loquar, plus Daedalus and this site | `v2/work/loquar/`, `v2/resume/#projects` |
| `ocapex` | OCAPEX numbers and FreeCode Juniors | `v2/work/ocapex/`, `v2/resume/#freecode` |
| `hockey` | Goaltender: measurables, stats, team history | `v2/hockey/` |
| `music` | Viola and violin, Carnegie Hall ticket, honors | `v2/resume/#music`, `#music-honors` |
| `record` | Education, honors, service and leadership | `v2/resume/` |
| `archive` | A personal archive: index cards for smaller work, each linked to the sheet that describes it | v4 and v5 experiments lists, `v2/resume/#projects`, `#robotics`, `#amora` |
| `contact` | Let's talk: the framed poster, the email slab, the three profiles, the end strip | `v2/` footer, v4 and v5 contact sections |

Every fact and caveat comes from the v2 pages and `CONTENT-REVIEW.md`. Copy is
first person, no en or em dashes, no superlatives. Detail links open v3's own project files (below).

## How the transitions work

- **Sheet stacking (desktop, 900px wide and 600px tall or more).** Every sheet is
  `position: sticky; top: 0`, so the next one slides up over the last through its
  torn top edge. A small script scales the covered sheet to 0.95 and dims it as it
  is covered (transform and opacity only). Scrolling stays native: there is no
  snapping and no wheel handling. A sheet whose content is taller than the viewport
  gets `is-tall` and scrolls normally.
- **Reveals.** When a sheet is 30% in view, headlines rise out of a clipped line
  box and text fades up with a 60 ms stagger. They replay every time a sheet comes
  back: on phones an observer removes the class once the sheet is fully out; on
  desktop the scroll geometry decides, since a covered sheet still intersects the
  viewport. The cover runs a short load sequence after the display face arrives:
  letters, the red strip wipe, year, stickers.
- **Chrome.** Name left, year right, fixed, blended with `difference` so it reads
  on either colour. Arrow keys move one sheet; dots and `#id` links scroll to the
  sheet's flow position (a plain anchor jump cannot reach a sticky sheet). A move of
  one sheet slides it over in 380ms; a longer jump cuts to one screen before the
  target and slides only the last sheet (cover to hockey travels 900px, not 6300px);
  any wheel, touch, press or scrolling key takes over, and reduced motion jumps. On
  phones the chrome has a solid black strip and steps away while you scroll down. Tabbing
  into a sheet brings it to rest, so the sheet above it never covers the focused
  link, and the skip link (and any in-page link taken from the keyboard) moves
  focus to the sheet it lands on.
- **The rail.** On the right, blended with `difference` like the chrome: the
  folder button, one dot per sheet and, running down beside the dots, the
  current sheet's number and name ("04 Drug safety"), which follows the reader
  and fades through each change. The dots are 8px but each sits on an invisible
  cell one row tall that runs on toward the screen edge as far as the gutter
  allows, and the rail's padding and label widen the hover area further. The
  rows start at `50% - n/2 rows + 16px` (`--row`: 24px, the WCAG 2.5.8 minimum, 28px
  on touch screens; `--n` is the number of sheets, written by the script), the same
  line the cabinet's folders start on, so every dot is level with its own folder.
  Above the folder button stands the **index tab**: a small paper tab reading
  "Index", not blended, so the index is visible without hovering the screen edge.
  Content keeps 40px clear of the rail, label and tab (and 70px of the screen's
  edge). Below 900px the rail gives way to the pill (see Phones).
- **The cabinet (the index).** A compact paper file drawer, 336px wide, anchored
  beside the rail and sized to its content: one hairline folder per sheet with a
  trapezoid tab (each whole row is the folder's target), black divider tabs for
  the disciplines standing just behind their first folder, and the drawer front,
  with the Find slip, "Portfolio · 12 sheets" and Close. The current sheet's tab
  is vermilion. Hovering the rail (dots, label, folder button or index tab) opens
  it after 120ms; it stays open while the pointer is over the rail or the cabinet
  and closes 300ms after the pointer leaves both. A click on the folder button,
  the index tab or "portfolio" on the cover keeps it open; a second click closes
  it. Clicking a dot still goes straight to its sheet. It is
  non-modal (`<nav>` with an `aria-expanded` disclosure button, no backdrop, no
  scroll lock, no focus trap): keyboard focus on the folder button opens it too,
  Enter or Space moves focus to the current folder, arrows, Home and End walk the
  folders, Tab moves through them and out (which closes it), Escape closes it
  and returns focus to where it came from, and a press anywhere else closes it.
  With the script the dots leave the tab order, so the rail is one stop and the
  cabinet is the keyboard path. Choosing a folder scrolls to the sheet with the
  page's own `go(i)` and closes the cabinet. Without the script the dots are plain
  anchors and the index links point at `#cabinet`, which shows the cabinet as
  their target (Close links to `#shut` and hides it). It never prints.
- **Find.** The drawer front holds a label holder with a white slip: "Find" and the
  reader's word. `/` opens it from anywhere but a field. It searches the page's own
  text sheet by sheet (a word matches at the start of a word, accents aside);
  matching folders keep their ink and show a count, and the best match's file comes
  out quoting the matching line. Up and Down step through the matches, Enter goes
  there and rings the line in vermilion for a moment, Escape clears, then closes.
  On the phone panel only the matching folders stay, each with its quote.
- **Files.** Hovering a folder, hovering a dot, or focusing a folder pulls that
  folder's file up out of it: white paper with a slight tilt and a piece of tape,
  rising from behind the folder's own front (so its tab is never covered) with
  the record: sheet number ("You are here" on the current one), title in Anton,
  kicker, one line, "Open the sheet". It rises in 250ms ease-out and goes back in
  180ms; when one file replaces another the new one waits 60ms, so one moves at a
  time. A pulled file is part of its folder's link: clicking it opens its own
  sheet. On the way up to it the pointer may cross other folders' exposed edges
  or other dots; while it is heading for the file (a safe triangle from where it
  was to the file's corners), those do not swap the file, and if it stops short
  for 320ms the row it rests on wins. Scrubbing straight up and down the dots stays
  immediate. Its lowest part stays in the folder, below the text. In windows too
  short for the top folder's file the cabinet moves down, when the drawer front
  would fall below the window it moves up, in very short windows the files leave
  out their summary line, and under 540px tall it becomes the bottom panel (with
  the pill in place of the rail, as on phones). Opened from the
  keyboard, focus lands on the current folder without a file until the reader
  moves. Reduced motion fades the files and the cabinet.
- **Phones (below 900px).** A solid black pill with a paper hairline at the bottom
  centre reads "Index · 08 Goaltender" (the current sheet) and opens the same
  cabinet as a bottom panel (at most 80% of the screen; rows 44px; the drawer front
  with Find and Close stays in reach at the bottom, above the keyboard). A tap on a
  folder goes straight to its sheet, so every sheet is two taps away: on a touch
  screen a preview would cost a third tap and the sheet itself is one tap further
  anyway. Files are not shown there. The pill steps away while you scroll down and
  comes back on the way up or as soon as you stop; sheets keep 64px at their foot
  so it never covers their last lines.
- **The cover's routes.** In the handwritten line, "portfolio" opens the index,
  "goaltender" goes to the hockey sheet, "researcher" to drug safety and "violist"
  to music. A vermilion marker stroke lies faintly under each word and draws
  through in 300ms on hover or focus (drawn already on touch screens).
- **The hover grammar.** The collage cards on drug safety, the knee exoskeleton and
  Loquar link where their sheet's own link goes. Pointing at one: the image settles
  in its still frame from 1.06 to 1 (800ms), the card eases toward flat and lifts
  3px, its tape presses, a round vermilion badge grows in while its arrow turns
  from 45 degrees (450ms), the caption brightens, and the other card steps back to
  .55 opacity. Nothing blurs. See `DESIGN.md`.
- **The code panel.** The cover's tilted editor types a preset script character by
  character: the aducanumab analysis with the real counts, the Genuvalens
  controller and its five-repetition simulation with the reported results, a
  Loquar scene function and a Daedalus labyrinth rebuild. Hovering pauses it and
  frees the panel to scroll; leaving resumes; on touch screens a tap pauses and a
  second tap resumes. It waits while the cover is covered or the tab is hidden, and
  stops when the script ends. Reduced motion shows the whole script at once. Its
  text is 12px, the site's floor; the "Scroll" hint below pulses three times and rests.
- **Details from the deck's tutorial** (GraphiqVibe, "How to create a Graphic Design
  PORTFOLIO in 2025"): the sliced letter in the title, the torn strip with recoloured
  letters, a tilted editor panel (here Leonardo's own analysis and controller
  code, typing itself), the profile cutout with a paper edge on a rounded
  red shape with text on a path, the crown, the star, tape on
  every overlapped image, and the end page reusing the mask, crown and star.
- **The archive.** Sheet 11: index cards taped to the paper, each one
  `<li class="entry">` with a year (Anton, vermilion), a kind tag, a title in the
  hand face, one line and an optional link to the sheet that describes it. An
  HTML comment above the list tells Leonardo how to add a card; tilt, tape, the
  unfolding and the reveal order come from the stylesheet and the script, so a
  copied card needs nothing else. At rest a card shows its year, kind and title;
  pointing at it (or tabbing to its link) unfolds its line and link (grid rows 0fr
  to 1fr, 500ms) below its resting edge, so the grid never moves, while it
  straightens, lifts and the other cards step back to .4 opacity. Touch screens,
  print and pages without the script show every line. Four cards a row on desktop,
  one or two on phones; two columns in print.
- **The contact sheet.** On desktop the framed LET'S TALK (crown, star, tape and
  mask, all sized in `em` so the group scales as one) keeps the left column at
  full size, sized by container query units to the room it has; the reply stands
  beside it on the dark sheet: one large email action (the address in Anton on a
  vermilion slab, taped down), the note, and the three profiles as named rows,
  each marked as leaving the site. The torn paper strip below is the end: back to
  the top, open the index, and the colophon. Phones read poster, reply, end. The
  slab and the end buttons are lightly magnetic on fine pointers. The old
  discipline marquee is retired: it was text moving on its own, and it crowded
  the actions.
- **Small interactions.** Stickers and tape settle a beat after their sheet as it
  slides in (`translate`, composed with their rotate). Link underlines redraw on
  hover; quiet links thicken; on the profile rows the other two step back. A
  faint paper grain sits on every sheet.
- **Phones** read the page as a plain document with the same torn edges.
- **Reduced motion** keeps the fades and removes every transform, the strip
  wipe, the frame draw-on and the recede; the cabinet and its files only fade and
  the rail label swaps without a fade.

## Files

| Path | Purpose |
| --- | --- |
| `index.html` | The page: the rail, the cabinet, twelve sheets and an SVG sprite of torn edges, stickers and the arrow |
| `assets/css/site.css` | Tokens, the rail and cabinet, sheets, motion, the compact mode for short windows, touch sizes, print |
| `assets/js/site.js` | Counts from the page, headline wrapping, reveals, geometry, the recede, the rail label and index tab, the cabinet, its files, hover intent and Find, the cards' links, the archive folds, the phone pill, navigation and keys |
| `files/<slug>/index.html` | The project files: `aducanumab`, `genuvalens`, `loquar`, `ocapex`, `hockey` (the coach one-pager) and `resume` |
| `assets/css/files.css` | The files' own stylesheet: tokens and faces as in `site.css`, the desk, drawer, paper, sections, figures, the pager, the view transition, print and the hockey one-page print |
| `assets/js/files.js` | The hockey file's print button, and eager figures before printing (the files work without it) |
| `DESIGN.md` | The system as built: tokens, type roles, the stack, the cabinet, the hover grammar, the archive, phones, and how to add a sheet, a file or a card |
| `../tests/v3/check.mjs` | Browser checks: structure and counts, no links into other editions, the 12px floor, contrast, the cabinet, the routes, Find, the pill, console errors |
| `assets/fonts/` | Anton (OFL, stands in for Impact), Metropolis from the deck package (Unlicense), Permanent Marker (Apache 2.0, stands in for the personal-use Shooting Star) |
| `assets/img/` | Derivatives copied from v2; the goalie mask stickers rendered from `assets/model/GMask.obj` by `tools/make-mask-sticker.py`; the portrait cutout from `tools/make-cutout.py` (paper edge added in the same pass); the OCAPEX mark redrawn in the site's three colours |

## Project files

The deck curates; the files prove. Each project sheet's detail link ("Read the analysis", "Read the report",
"See the project", "See the organization", "Full profile with coach contacts", "Music on the résumé", "Full
résumé") opens a file of v3's own in `v3/files/<slug>/`, so nothing leaves the edition. A file is the
cabinet's file pulled out and laid on the black desk: a paper document with a torn top and foot, its vermilion
tab ("File 04 · Drug safety", the sheet's number and the rail's name) standing in the drawer among the other
files' tabs (each a link; below 1080px they show only their numbers, below 600px only the current tab shows),
"Back to sheet 04" to the sheet's anchor on the deck, the title in Anton, the line under it, a stamp for the
stage taken from the status wording, the fact strip, the note that carries the caveat, the sections' own tabs,
then sections behind black divider tabs, and the previous and next files as two index cards at the end.

- **Copy** is moved unchanged from the editorial pages (`v2/work/<slug>/`, `v2/hockey/`, `v2/resume/`). The
  exceptions are only where the editorial wording would be untrue here: Figure 2's ARIA terms are "in
  vermilion", résumé links to work without a file (FreeCode, Daedalus, this site) point to their sheet, the
  résumé's "This portfolio" uses the Loquar sheet's sentence, and the hockey stat line is the hockey sheet's.
- **Order and numbers**: 04 Drug safety, 05 Knee exoskeleton, 06 Loquar, 07 OCAPEX, 08 Goaltender, 10 The
  record. Previous and next follow that order; the descriptions on the cards are the cabinet's kickers.
- **Hover**: the creamy grammar, rebuilt in paper. The cards settle flat from their tilt and lift 3px over
  800ms on `cubic-bezier(.22, 1, .36, 1)`, the arrow grows from .8 and turns from 45 degrees over 450ms, the
  card's line unfolds (grid rows 0fr to 1fr, 500ms) and the other card steps back by dimming its ink and paper
  (colour, so its text keeps 4.5:1). Product screenshots settle from 1.05 to 1 inside their still frame;
  research figures never crop. Drawer tabs rise 4px; coach contact rows step back the way the profile rows on
  the contact sheet do. Touch screens and reduced motion show everything at rest; nothing blurs.
- **Page change**: both stylesheets carry `@view-transition { navigation: auto; }` (in `site.css` it is the
  delimited block at the very end). Coming from the deck, the deck stays put while the desk comes up over it
  (160ms), then the file and its drawer rise 40px and fade in (300ms, from 100ms in), so the file does not
  fade in over the deck's text. From file to file the old one sinks 16px and is gone in 110ms before the new
  one rises; the drawer holds still (no travel even from the foot of a long file) and only its current tab
  changes. Going home, the file and its drawer sink and are gone in 130ms while the deck comes back out of
  the black (220ms, from 90ms in; that part is `site.css`'s). Each file names its paper
  (`view-transition-name: file-04` and so on, listed in `files.css` and in that `site.css` block). Reduced
  motion keeps crossfades only, with no rise or sink; other browsers simply navigate.
- **To add a file**: copy the closest file's folder (research: `aducanumab`; product: `loquar`), change its
  `<title>`, description, tab text, back link (`../../#<sheet id>`), stamp, facts and sections; give its
  article `view-transition-name: file-NN` and add that name to the two `::view-transition-*(file-..)` lists
  in `files.css` and to the two in `site.css`'s "files: view transition" block; add its tab to every file's drawer (in order) and fix the previous and next cards of its
  neighbours; then point the sheet's detail link at `files/<slug>/`. Images go in `v3/assets/img/` as
  derivatives; never link to another edition's files.
- **The hockey one-pager**: `files/hockey/` puts measurables, the stat line with its sample size, how I play,
  the academic snapshot, the coach contacts, Elite Prospects and NCSA, team history, prep and camps, and crew
  and soccer on one page. "Print the one-pager" is a real button that calls `print()` (hidden without the
  script and in print). The `@media print` block "Print: the hockey one-pager" in `files.css` lays it out on
  one Letter page at 12mm margins: the head across the top, the six measurables in one row, then two columns,
  type at 7 to 13pt, links printed with their addresses; the file's end and the desk are left out. It was
  checked with `page.pdf({ format: 'Letter' })`: one page, with about 80px of the 965px page to spare. If a
  section grows, print it again and tighten that block if it spills.
- **Print** (every file): no desk, torn edges, tape or shadows; black tabs become rules; outside links print
  their addresses; placeholders for photographs not yet supplied are left out; figures and charts print in
  colour; the stamp follows the title (on the hockey page it stands straight at the top right). The page is
  printed in a light colour scheme, so the margins stay white when background graphics are on. 1rem is 10pt
  on paper, so the file's type scales together.
- Hidden-until-ready blocks stay hidden with a comment saying what fills them: the hockey file's 2026-27 stat
  tiles and schedule, the résumé's PDF button, and the film link (in the film note).

## Conventions

- Torn edges are three 2800 by 72 paths in the sprite, sliced from the middle so
  they never stretch; the cover strip is a percentage polygon in `--strip`.
- The crown, star and number badge are inline SVG symbols; the two mask stickers
  (three-quarter on the cover, head-on at the end) are renders of Leonardo's own
  mask model, posterized with a white sticker border.
- Sheets alternate `slide--dark` and `slide--paper`; each re-points the same role
  tokens. Cards, tickets and the red panel re-point them again inside.
- Text under 24px on vermilion is black (4.53:1); white stays only on display
  type (3:1). Vermilion text on paper is used only at 24px and up (the archive
  years, the OCAPEX subtitle); smaller vermilion on paper or white is `--red-ink`
  (4.9:1). The folder numbers are black for that reason. Nothing visible is under
  12px.
- The cabinet's z-order is arithmetic: folder `k`'s link sits at `3k + 3` with its
  file inside it at `z-index: -1`, the divider standing just behind it at `3k + 1`,
  so a file always rises in front of the folders behind it and behind its own
  folder's front.
- The counts come from the page: the script writes `--n`, each folder's `--k` and
  number, each file's "Sheet NN / N", "N sheets" and the archive's "Sheet NN, name"
  links; the HTML keeps the same values as the fallback without the script.
- To add a sheet, a file or an archive card, follow the steps in `DESIGN.md`, then
  run `node tests/v3/check.mjs`.
- Keep `<meta name="robots" content="noindex">`.
