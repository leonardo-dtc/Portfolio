# v3 · poster edition

The third edition of Leonardo Carvalho's portfolio, built beside the terminal
edition (repository root) and the editorial edition (`v2/`). One page of eleven
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
| `contact` | Let's talk, marquee, email, links, editions | `v2/` footer |

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
  on either colour; a dot rail on the right marks the current sheet. Arrow keys
  move one sheet; dots and `#id` links scroll to the sheet's flow position (a
  plain anchor jump cannot reach a sticky sheet).
- **The index drawer.** The folder button above the dots (bottom right on phones)
  slides a paper side panel in from the right, after the reference clip in
  Downloads: one hairline folder per sheet with a trapezoid tab, black divider
  tabs per discipline, and the drawer front labelled "Portfolio · 11 sheets".
  Folders rise out of the drawer on open. A hovered or focused folder lifts a
  little, staying in its own layer, and raises a dark record card (sheet number,
  title, kicker, one line); choosing it closes the panel and scrolls to the
  sheet. Escape closes, arrows walk the folders, focus returns to the button, and
  the page's own arrow keys are ignored while it is open.
- **The code panel.** The cover's tilted editor types a preset script character by
  character: the aducanumab analysis with the real counts, the Genuvalens
  controller and its five-repetition simulation with the reported results, a
  Loquar scene function and a Daedalus labyrinth rebuild. Hovering pauses it and
  frees the panel to scroll; leaving resumes; it waits while the cover is covered
  or the tab is hidden, and stops when the script ends. Reduced motion shows the
  whole script at once.
- **Details from the deck's tutorial** (GraphiqVibe, "How to create a Graphic Design
  PORTFOLIO in 2025"): the sliced letter in the title, the torn strip with recoloured
  letters, a tilted editor panel (here Leonardo's own analysis and controller
  code, typing itself), the profile cutout with a paper edge on a rounded
  red shape with text on a path, the crown, the star, tape on
  every overlapped image, and the end page reusing the mask, crown and star.
- **Small interactions.** Stickers and tape settle a beat after their sheet as it
  slides in (`translate`, composed with their rotate). The four disciplines run as
  a slow marquee on the contact sheet, paused on hover. The round contact buttons
  are lightly magnetic on fine pointers. Link underlines redraw on hover; quiet
  links thicken. A faint paper grain sits on every sheet.
- **Phones** read the page as a plain document with the same torn edges.
- **Reduced motion** keeps the fades and removes every transform, the strip
  wipe, the frame draw-on and the recede.

## Files

| Path | Purpose |
| --- | --- |
| `index.html` | The page: eleven sheets and an SVG sprite of torn edges and stickers |
| `assets/css/site.css` | Tokens, sheets, motion, the compact mode for short windows, print |
| `assets/js/site.js` | Headline wrapping, reveals, geometry, the recede, dots and keys |
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
- Keep `<meta name="robots" content="noindex">`.
