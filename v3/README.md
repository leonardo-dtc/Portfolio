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
first person, no en or em dashes, no superlatives. Detail links point into v2.

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
  sheet's flow position (a plain anchor jump cannot reach a sticky sheet). Tabbing
  into a sheet brings it to rest, so the sheet above it never covers the focused
  link, and the skip link (and any in-page link taken from the keyboard) moves
  focus to the sheet it lands on.
- **The rail.** On the right, blended with `difference` like the chrome: the
  folder button, one dot per sheet and, running down beside the dots, the
  current sheet's number and name ("04 Drug safety"), which follows the reader
  and fades through each change. The dots are 8px but each sits on an invisible
  cell one row tall that runs on toward the screen edge as far as the gutter
  allows, and the rail's padding and label widen the hover area further. The
  rows start at `50% - 6 rows + 16px` (`--row`: 22px, 20px in short windows, 28px
  on touch screens), the same line the cabinet's folders start on, so every dot
  is level with its own folder. Content keeps 33px clear of the rail and label.
  Below 900px the rail is only the round index button at the bottom right.
- **The cabinet (the index).** A compact paper file drawer, 324px wide, anchored
  beside the rail and sized to its content: one hairline folder per sheet with a
  trapezoid tab (each whole row is the folder's target), black divider tabs for
  the disciplines standing just behind their first folder, and the drawer front,
  "Portfolio · 12 sheets", with Close. The current sheet's tab is vermilion.
  Hovering the rail (dots, label or folder button) opens it after 120ms; it stays
  open while the pointer is over the rail or the cabinet and closes 300ms after
  the pointer leaves both. A click on the folder button keeps it open; a second
  click closes it. Clicking a dot still goes straight to its sheet. It is
  non-modal (`<nav>` with an `aria-expanded` disclosure button, no backdrop, no
  scroll lock, no focus trap): keyboard focus on the folder button opens it too,
  Enter or Space moves focus to the current folder, arrows, Home and End walk the
  folders, Tab moves through them and out (which closes it), Escape closes it
  and returns focus to where it came from, and a press anywhere else closes it.
  With the script the dots leave the tab order, so the rail is one stop and the
  cabinet is the keyboard path. Choosing a folder scrolls to the sheet with the
  page's own `go(i)` and closes the cabinet. Without the script it is not shown
  and the dots are plain anchors. It never prints.
- **Files.** Hovering a folder, hovering a dot, or focusing a folder pulls that
  folder's file up out of it: white paper with a slight tilt and a piece of tape,
  rising from behind the folder's own front (so its tab is never covered) with
  the record: sheet number ("You are here" on the current one), title in Anton,
  kicker, one line, "Open the sheet". It rises in 250ms ease-out and goes back in
  180ms; when one file replaces another the new one waits 60ms, so one moves at a
  time. Files are previews (no pointer events): the rows beneath stay hoverable,
  so moving the pointer up and down scrubs through them. Its lowest part stays in
  the folder, below the text. In windows too short for the top folder's file, the
  cabinet moves down just enough (only below 600px tall), and below about 450px
  the files leave out their summary line. Opened from the
  keyboard, focus lands on the current folder without a file until the reader
  moves. Reduced motion fades the files and the cabinet.
- **Phones (below 900px).** The index button opens the same cabinet as a bottom
  panel (at most 80% of the screen; rows 44px; the drawer front with Close stays
  in reach at the bottom). A tap on a folder goes straight to its sheet, so every
  sheet is two taps away: on a touch screen a preview would cost a third tap and
  the sheet itself is one tap further anyway. Files are not shown there.
- **The code panel.** The cover's tilted editor types a preset script character by
  character: the aducanumab analysis with the real counts, the Genuvalens
  controller and its five-repetition simulation with the reported results, a
  Loquar scene function and a Daedalus labyrinth rebuild. Hovering pauses it and
  frees the panel to scroll; leaving resumes; on touch screens a tap pauses and a
  second tap resumes. It waits while the cover is covered or the tab is hidden, and
  stops when the script ends. Reduced motion shows the whole script at once.
- **Details from the deck's tutorial** (GraphiqVibe, "How to create a Graphic Design
  PORTFOLIO in 2025"): the sliced letter in the title, the torn strip with recoloured
  letters, a tilted editor panel (here Leonardo's own analysis and controller
  code, typing itself), the profile cutout with a paper edge on a rounded
  red shape with text on a path, the crown, the star, tape on
  every overlapped image, and the end page reusing the mask, crown and star.
- **The archive.** Sheet 11: index cards taped to the paper, each one
  `<li class="entry">` with a year (Anton, vermilion), a kind tag, a title in the
  hand face, one line and an optional link to the sheet that describes it. An
  HTML comment above the list tells Leonardo how to add a card; tilt, tape and the
  reveal order come from the stylesheet and the script, so a copied card needs
  nothing else. Four cards a row on desktop, one or two on phones; two columns in
  print.
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
| `assets/js/site.js` | Headline wrapping, reveals, geometry, the recede, the rail label, the cabinet and its files, dots and keys |
| `assets/fonts/` | Anton (OFL, stands in for Impact), Metropolis from the deck package (Unlicense), Permanent Marker (Apache 2.0, stands in for the personal-use Shooting Star) |
| `assets/img/` | Derivatives copied from v2; the goalie mask stickers rendered from `assets/model/GMask.obj` by `tools/make-mask-sticker.py`; the portrait cutout from `tools/make-cutout.py` (paper edge added in the same pass); the OCAPEX mark redrawn in the site's three colours |

## Conventions

- Torn edges are three 2800 by 72 paths in the sprite, sliced from the middle so
  they never stretch; the cover strip is a percentage polygon in `--strip`.
- The crown, star and number badge are inline SVG symbols; the two mask stickers
  (three-quarter on the cover, head-on at the end) are renders of Leonardo's own
  mask model, posterized with a white sticker border.
- Sheets alternate `slide--dark` and `slide--paper`; each re-points the same role
  tokens. Cards, tickets and the red panel re-point them again inside.
- Text on vermilion is black (4.5:1); vermilion text on paper or white is used only
  at 24px and up (the archive years), where 3:1 applies. The folder numbers are
  black for that reason.
- The cabinet's z-order is arithmetic: folder `k` sits at `3k + 3`, its file at
  `3k + 2`, the divider standing just behind it at `3k + 1`, so a file always rises
  in front of the folders behind it and behind its own folder.
- To add a sheet: add the section, a dot in the rail (with `data-name`), a folder
  and its file in the cabinet, and update the counts ("12 sheets", "/ 12") and the
  `6 * var(--row)` centring if the number of rows changes.
- Keep `<meta name="robots" content="noindex">`.
