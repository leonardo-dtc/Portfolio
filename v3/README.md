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
| `cover` | The name on two lines, sliced letter, torn red strip, goalie mask, a tilted code panel that types itself (or, by design toggle, a desk whose objects open the project files) | |
| `about` | About me, cutout portrait on a red arch with text curved along it | `v2/about/` |
| `skills` | Skills, tools, how I work (red panel) | `v2/resume/#technical`, `v2/about/` |
| `research` | Drug safety: aducanumab pharmacovigilance, ARIA chart | `v2/work/aducanumab/` |
| `exoskeleton` | Knee exoskeleton: Genuvalens, sketch and results | `v2/work/genuvalens/` |
| `loquar` | Loquar, plus Daedalus and this site | `v2/work/loquar/`, `v2/resume/#projects` |
| `ocapex` | OCAPEX numbers and FreeCode Juniors | `v2/work/ocapex/`, `v2/resume/#freecode` |
| `hockey` | Goaltender: measurables, the season's line in the display face, team history, the coaches by name and role with how to write | `v2/hockey/` |
| `music` | Viola and violin, Carnegie Hall ticket, honors | `v2/resume/#music`, `#music-honors` |
| `record` | Education, honors, service and leadership | `v2/resume/` |
| `archive` | A personal archive on a Macintosh: each index card is a file, listed with its kind and year and opened as a page holding the card's whole text and a link to the sheet that describes it | `v2/resume/#class-projects`, `#robotics`, `#amora`, `#music`, `v2/work/daedalus/`, v1's robotics line |
| `contact` | Let's talk, clean: the framed words, the email slab, the three profiles, a plain end | `v2/` footer, v4 and v5 contact sections |

Every fact and caveat comes from the v2 pages and `CONTENT-REVIEW.md`. Copy is
first person, no en or em dashes, no superlatives. Detail links open v3's own project files (below).

## Design toggles

The choices Leonardo left open on the decision page, or asked to try, are design
toggles: data attributes on `<html>`, read by the stylesheets and the scripts,
set before the first paint by the page's head script, and kept in that browser
only (`localStorage`, `v3:toggles`), so visitors always see the defaults.
`assets/js/toggles.js` holds them, and runs before `site.js` and `mac.js`.

| Toggle | Question | Default | Choices |
| --- | --- | --- | --- |
| `archive` | T17 | `mac` | `mac` (the archive's Macintosh), `cards` (the wall of index cards) |
| `cover` | T40 | `poster` | `poster`, `desk` (the cover's objects open the six project files) |
| `talk` | T18 | `clean` | `clean` (the contact sheet, clean), `collage` (as round three left it: stickers, tape, the torn end) |
| `talkWords` | T18 | `lets-talk` | `lets-talk`, `get-in-touch`, `say-hello` |

- **In the console:**
  - `toggles` shows their values, and `toggles.list()` what each is and its
    choices, with a note on what the Mac would change;
  - `toggles.cover = 'desk'`, `toggles.set('cover', 'desk')` or
    `toggles.T40 = 'desk'` sets one;
  - `toggles.reset()` forgets them all.
- **In the address:** `?toggles=archive:cards,cover:desk`, for that visit only (a link never changes what a browser shows next time).
- **In the Elements panel:** edit the attribute on `<html>`. A value a toggle
  does not take goes back, with a note in the console.

**If the Mac is picked (T17), the rest of the site does not have to change.**
- It stays one object on one sheet, as the mask and the code panel are, and the
  deck stays paper.
- Its screen uses the site's own Metropolis, nothing on it under 13px.
- It adds no navigation: the index's Find opens its files.
- Print, scripts off and forced colours show the cards, each with its whole file.
- Its cost is about 15 KB compressed (script and style), for this sheet only.

What could tie it in further: a small Mac on the desk cover that opens the
archive. What would not: the project files opening as Mac windows, or a menu bar
for the deck. Either makes two systems for the same files.

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
  the sheet it cuts to is shown already read, since it is only passed (its entrance is
  for arriving), never blank or half revealed;
  any wheel, touch, press or scrolling key takes over, and reduced motion jumps. Coming
  back with the browser's Back or Forward (from a file, say) does not jump to the old `#id`:
  the browser puts the reader back where they were. On
  phones the chrome has a solid black strip and steps away while you scroll down (it
  comes back while its name has keyboard focus); on touch screens the name is a 44px
  target. Tabbing
  into a sheet brings it to rest, so the sheet above it never covers the focused
  link, and the skip link (and any in-page link taken from the keyboard) moves
  focus to the sheet it lands on.
- **The rail.** On the right, blended with `difference` like the chrome: the
  folder button, one dot per sheet and, running down beside the dots, the
  current sheet's number and name ("04 Drug safety"), which follows the reader
  and fades through each change. On screens 1880px wide and more, where the
  margin holds them clear of every sheet (by 54px or more), every sheet's name
  sits beside its dot at rest instead, the current one in bold, so the
  destinations are labelled without hovering. The dots are 8px but each sits on an invisible
  cell one row tall that runs on toward the screen edge as far as the gutter
  allows, and the rail's padding and label widen the hover area further. The
  rows start at `50% - n/2 rows + 16px` (`--row`: 24px, the WCAG 2.5.8 minimum, 28px
  on touch screens; `--n` is the number of sheets, written by the script), the same
  line the cabinet's folders start on, so every dot is level with its own folder.
  Above the folder button stands the **index tab**: a small paper tab reading
  "Index", not blended, so the index is visible without hovering the screen edge.
  Content ends at least 70px from the screen's edge (the gutter plus 40px where
  the gutter is wider), which keeps it 11 to 15px clear of the label and the tab at
  1440px and 5px clear of the tab at 1024px. Below 900px the rail gives way to the
  pill (see Phones).
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
  scroll lock, no focus trap). The Index tab is the keyboard's one way in (the
  folder button is for the pointer and stays out of the tab order): Enter on it
  opens the cabinet and moves focus to the current folder, arrows, Home and End walk the
  folders, Tab moves through them and out (which closes it), Escape closes it
  and returns focus to where it came from, and a press anywhere else closes it.
  With the script the dots and the folder button leave the tab order, so the Index
  tab is one stop, the cover's routes follow it, and the cabinet is the keyboard
  path. Choosing a folder scrolls to the sheet with the
  page's own `go(i)` and closes the cabinet. Without the script the dots are plain
  anchors and the index links point at `#cabinet`, which shows the cabinet as
  their target (Close links to `#shut` and hides it). It never prints.
- **Find.** The drawer front holds a label holder with a white slip: "Find" and the
  reader's word. `/` opens it from anywhere but a field. It searches the page's own
  text sheet by sheet, only what shows (not the desk while the cover is a poster),
  and each sheet's name; a word matches at the start of a word, accents aside, and
  the page's curly apostrophes and primes read as the keyboard's ("let's" finds LET'S,
  5'11 finds 5′11″). It searches the six project files too: their text is fetched
  on the first search, and a sheet found only in its file shows "In its file" and
  opens the file at the words (a text fragment the browser scrolls to and marks);
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
  was to the file's corners, anchored where the pointer rested if it paused for
  100ms; the point that crosses into a row counts too), those do not swap the file,
  and if it stops short
  for 320ms the row it rests on wins. Scrubbing straight up and down the dots stays
  immediate. Its lowest part stays in the folder, below the text. In windows too
  short for the top folder's file the cabinet moves down, when the drawer front
  would fall below the window it moves up, in very short windows the files leave
  out their summary line, and under 540px tall it becomes the bottom panel (with
  the pill in place of the rail, as on phones). Opened from the
  keyboard, focus lands on the current folder without a file until the reader
  moves. Reduced motion fades the files and the cabinet.
- **Phones (below 900px).** A solid black pill with a paper hairline rests at the
  bottom right, 12px from the edge, out of the middle of the reading column, and
  reads "Index · 08 Goaltender" (the current sheet; in windows under 540px tall or
  under 360px wide only the number, "Index · 08") and opens the same
  cabinet as a bottom panel (at most 80% of the screen; rows 44px; the drawer front
  with Find and Close stays in reach at the bottom, above the keyboard). A tap on a
  folder goes straight to its sheet, so every sheet is two taps away: on a touch
  screen a preview would cost a third tap and the sheet itself is one tap further
  anyway. Files are not shown there. The pill steps away while you scroll down and
  comes back on the way up, as soon as you stop, or while it has keyboard focus;
  sheets keep 64px at their foot
  so it never covers their last lines.
- **The cover's routes.** In the handwritten line, "portfolio" opens the index,
  "goaltender" goes to the hockey sheet, "researcher" to drug safety and "violist"
  to music. A vermilion marker stroke lies faintly under each word and draws
  through in 300ms on hover or focus (drawn already on touch screens). A dark halo
  (`text-shadow`) round each word keeps the code panel's lines from running through
  it. On touch screens each word is a 44px target (vertical padding on the inline
  word, so no line moves; where the line wraps, the word below takes the overlap).
- **The hover grammar.** The collage cards on drug safety, the knee exoskeleton and
  Loquar link where their sheet's own link goes. Pointing at one: the image settles
  in its still frame from 1.06 to 1 (800ms), the card eases toward flat and lifts
  3px, its tape presses, a round vermilion badge grows in while its arrow turns
  from 45 degrees (450ms), the caption brightens, and the card comes to the top of
  the collage (it drops back 800ms after the pointer leaves the collage, or at once
  when the pointer moves on to the other card). The other card steps
  back by colour, not opacity: its ink goes to the muted ink and the 486 card's
  vermilion pales, so its text keeps 4.5:1; only its pictures (a photograph, the
  sketch, the chart's bars) fade to .55. Nothing blurs. See `DESIGN.md`.
- **The code panel.** The cover's tilted editor types a preset script character by
  character: the aducanumab analysis with the real counts, the Genuvalens
  controller and its five-repetition simulation with the reported results, a
  Loquar scene function and a Daedalus labyrinth rebuild. Hovering pauses it and
  frees the panel to scroll; leaving resumes; on touch screens a tap pauses and a
  second tap resumes. It waits while the cover is covered or the tab is hidden, and
  stops when the script ends. Reduced motion shows the whole script at once, and so
  does the first key press anywhere on the page, so a keyboard reader never has
  two minutes of typing beside them. Its
  text is 12px, the site's floor; the "Scroll" hint below pulses three times and rests.
- **Details from the deck's tutorial** (GraphiqVibe, "How to create a Graphic Design
  PORTFOLIO in 2025"): the sliced letter in the title, the torn strip with recoloured
  letters, a tilted editor panel (here Leonardo's own analysis and controller
  code, typing itself), the profile cutout with a paper edge on a rounded
  red shape with text on a path, the crown, the star, tape on
  every overlapped image, and the end page reusing the mask, crown and star.
- **The archive's Macintosh (2026-10-05, second pass).** Sheet 11 is Leonardo's own computer: a Macintosh taped
  onto the paper (drawn in CSS, no logos), its screen the Platinum desktop of the mid-nineties drawn in the
  poster's colours. Leonardo found the first, one-bit System 1 screen too rudimentary and asked for it "slightly
  more comprehensible but still clean and stylistic".
  - **The screen:** grey bevelled windows (white along the top and left of a raised edge, grey along the bottom
    and right) with ruled title bars, the poster's black for the desk under a fine grid of dots, deep vermilion
    (`#B92B1C`, white on it 5.9:1) for the chosen file and the open menu, and the site's own Metropolis for every
    word: menus and titles 14px bold, lists 14px, a file's page 15 to 22px, nothing under 13px. The pictures are
    drawn on a grid of 32 dots, as the old icons were, now shaded in greys with a vermilion detail each: a page
    with its corner folded and its emblem (a screen with a play mark, bars, notes, a maze, a robot, a rocket,
    lines of text), the drive and the Trash.
  - **The menu bar:** the poster's star in vermilion, then File (Open, Close Window), View (as Icons, as List;
    by Name, by Kind, by Year) and Special (Restart). With a menu open, pointing at another title opens that one.
  - **The Archive window:** "7 items" and "Click a file to open it" (Tap on touch screens) in its header, then a
    list: a row a file, its picture, name, kind and year. It is sorted by Year, newest first, the order the cards
    stand in; a column's heading sorts by it (names A to Z, years newest first) and the same heading again turns
    it round. Up and Down move along the list, Home and End jump, typing a name's first letters goes to it, and
    one click or Return opens the file (as on a phone; the old Mac wanted two). View, as Icons shows the files as
    pictures in a grid instead.
  - **A file's window** is a page of plain type: the year and kind in small vermilion capitals, the title, the
    card's line, then the card's paragraphs and its list of details, copied as they are, and the card's link drawn
    as the old default button (rounded, with a heavy ring). Its zoom box (or a double click on its title bar) fills
    the screen with it, for reading, and puts it back.
  - **Windows** open with the old zooming outlines (dotted, inverting what is under them), come to the front when
    pressed, drag by their title bars (never past the screen's left edge) and close with their close boxes or
    Escape, the focus going back to the file. Arrow keys belong to the Mac while it has the focus; they never
    change the sheet.
  - **Coming on:** the first time the sheet arrives, the star badge on the desk with a bar filling under it
    (700ms), then the menu bar and the Archive window; Special, Restart does it again. Until then the desk's black
    covers the screen, but what is under it stays in the Tab order: the focus coming in (Tab from the sheet before,
    say) turns the screen on at once with the Archive window. Find going to a file waits for the screen to be on,
    so the Archive window coming on never covers the file it opened.
  - **Sizes:** on desktop the case is sized from the window's height, so the sheet still stacks; a screen under
    700px wide gives the names the kind column's room. A window under 600px tall keeps the desktop's screen at
    640px and this one sheet scrolls. Phones and tablets have a taller screen; there every window takes the whole
    desk, and the list puts each file's kind and year under its name, with Name, Kind and Year as a row of buttons
    that sort it.
  - **Fallbacks:** the cards stay the page's own text. Without the script, in print and in forced colours the
    cards below show instead, each with its whole file.
  - **Why not the whole site on a Mac:** a Mac as the landing page would have replaced the cover, the edition's
    strongest screen, and put a click before everything.
- **The archive cards** (the wall of cards, by design toggle; and without the script, in print and in forced
  colours). Sheet 11: index cards taped to the paper, each one `<li class="entry">` with a year (Anton,
  vermilion), a kind tag, a title in the hand face, its one line, its file (`<div class="entry__more">`: a
  paragraph or two and a list of details) and an optional link to the sheet that describes it. An HTML comment
  above the list tells Leonardo how to add a card; tilt, tape and the reveal order come from the stylesheet and the
  scripts, so a copied card needs nothing else.
  - **With the script** a card shows its year, kind, title and line; its title is the button that opens the card's
    file, and the whole card answers to it. The file is a sheet of paper over the dimmed deck (a native `<dialog>`):
    a vermilion tab with the year and kind, the title in the hand face, the line, the paragraphs and details, the
    link, and Close in its top right corner. Escape, Close or a press outside put it away, and the focus goes back
    to the card. Find going to a card rings it and opens its file once the deck has landed.
  - **Pointing at a card** straightens and lifts it while its tape presses, and the other cards step back by colour,
    not opacity: a greyer paper (`#F3F1F1`), the muted ink (6.05:1) and a muted kind tag (white on it 6.8:1); the
    24px vermilion years keep 3.59:1.
  - **Without the script, in print and in forced colours** every card shows its whole file under its line. Four
    cards a row on desktop, one or two on phones; two columns in print.
  - **The facts** come from the site's own pages only (the résumé, the Daedalus page, the music sheet, v1's
    robotics line); what is not on file is left out, and the comment above the list names what the files could
    still hold when Leonardo has it.
- **The contact sheet, clean (T18, 2026-10-05).** Leonardo found it "not great"
  and asked for it very clean, with the text inside its lines.
  - **Left column:** the framed words alone, in a calmer hand-drawn frame,
    centred and sized by container query units to the room it has. The frame's
    line wanders 3% across and 7.5% down, and it is padded by 0.2 em at the
    sides and 0.36 em above and below, so every letter stays 4 px or more from
    the line at any size and in any wording (the old frame's jitter reached 14%
    into its box and ran through the letters).
  - **Beside it, on the dark sheet:**
    - one large email action: the address in Anton on a vermilion slab, square
      to the page;
    - the note;
    - the three profiles as named rows, each marked as leaving the site.
  - **The end:** a hairline and outlined buttons on the dark sheet (back to the
    top, open the index), and the colophon.
  - **Phones** read words, reply, end. The slab and the end buttons are lightly
    magnetic on fine pointers.
  - **Two design toggles:** `talk = 'collage'` brings back round three's sheet,
    with the crown, the star, the mask, the tape and the torn paper end (its
    frame now wide enough to clear the letters too); `talkWords` sets LET'S
    TALK, GET IN TOUCH or SAY HELLO.
- **Email in the chrome (T4).** Beside the year, on every sheet. Narrow windows
  bring the chrome back while it has focus.
- **The desk (T40, a design toggle).** The poster stays: the name, the hand line
  and the year. Around them, six objects open the six project files, each named
  in marker like the hand line's words:
  - the code panel (Research), its link laid over the panel itself;
  - the mask (Hockey);
  - a page of the résumé;
  - a print of Loquar;
  - the exoskeleton's lined-paper sketch;
  - the OCAPEX sticker.

  Pointing at one picks it up. Wide screens lay them round the name, clear of
  its letters, the rail and the tag; phones and tablets set them in a grid of
  three under the name, with a drawn window for the code panel.
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
| `assets/js/site.js` | Counts from the page, headline wrapping, reveals, geometry, the recede, the rail label and index tab, the cabinet, its files, hover intent and Find (the deck and the six project files), the cards' links, the archive cards' files, the phone pill, navigation and keys |
| `files/<slug>/index.html` | The project files: `aducanumab`, `genuvalens`, `loquar`, `ocapex`, `hockey` (the coach one-pager) and `resume` |
| `assets/css/files.css` | The files' own stylesheet: tokens and faces as in `site.css`, the desk, drawer, paper, sections, figures, the pager, the view transition, print and the hockey one-page print |
| `assets/js/files.js` | The hockey file's print button, and eager figures before printing (the files work without it) |
| `assets/js/toggles.js` | The design toggles for the developer tools (above): `window.toggles`, the address, the attribute on `<html>`, and the contact sheet's words |
| `assets/js/mac.js`, `assets/css/mac.css` | The archive's Macintosh: the case, the Platinum screen, the menus, the list and its sorting, the windows and the files, built from the archive's cards |
| `DESIGN.md` | The system as built: tokens, type roles, the stack, the cabinet, the hover grammar, the archive, phones, and how to add a sheet, a file or a card |
| `../tools/v3-files.mjs` | Writes each project file's title, chrome, drawer, links back, pager and view transition name from the deck (`--check` names a file that drifts) |
| `../tests/v3/unit/files.test.mjs` | Runs that check, and checks the numbers, the pager and Email in every file's chrome (`node --test tests/v3/unit/*.test.mjs`) |
| `../tests/v3/check.mjs` | Browser checks: structure and counts, no links into other editions (the deck, the six files and both stylesheets), the 12px floor (the files on screen and in print too), contrast at rest and while a card steps back, the cabinet and its hover intent, the routes, Find, the pill, the keyboard walk, touch targets, the hockey file on one Letter page, Back from a file, console errors with and without the script |
| `assets/fonts/` | Anton (OFL, stands in for Impact), Metropolis from the deck package (Unlicense), Permanent Marker (Apache 2.0, stands in for the personal-use Shooting Star). Tiny5 (OFL, `OFL-tiny5.txt`), the first Mac's pixel face, is no longer loaded; the file stays until Leonardo says otherwise |
| `assets/img/` | Derivatives copied from v2; the goalie mask stickers rendered from `assets/model/GMask.obj` by `tools/make-mask-sticker.py`; the portrait cutout from `tools/make-cutout.py` (paper edge added in the same pass); the OCAPEX mark redrawn in the site's three colours |

## Project files

The deck curates; the files prove. Each project sheet's detail link ("Read the analysis", "Read the report",
"See the project", "See the organization", "Full profile with coach contacts", "Music on the résumé", "Full
résumé") opens a file of v3's own in `v3/files/<slug>/`, so nothing leaves the edition. A file is the
cabinet's file pulled out and laid on the black desk: a paper document with a torn top and foot, its vermilion
tab ("File 04 · Drug safety", the sheet's number and the rail's name) standing in the drawer among the other
files' tabs (each a link; below 1080px they show only their numbers, below 600px only the current tab shows: its
`<li>` carries `class="is-current"`, so this needs no `:has()`),
"Back to sheet 04" to the sheet's anchor on the deck, the title in Anton, the line under it, a stamp for the
stage taken from the status wording, the fact strip, the note that carries the caveat, the sections' own tabs,
then sections behind black divider tabs, and the previous and next files as two index cards at the end.

- **Copy** is moved unchanged from the editorial pages (`v2/work/<slug>/`, `v2/hockey/`, `v2/resume/`). The
  exceptions are only where the editorial wording would be untrue here: Figure 2's ARIA terms are "in
  vermilion", résumé links to work without a file (FreeCode, Daedalus, this site) point to their sheet, the
  résumé's "This portfolio" uses the Loquar sheet's sentence, and the hockey stat line is the hockey sheet's.
  The hockey file's coach contacts give each coach's name and role only, followed by "Addresses on request."
  (the line v5 uses): Leonardo decided on 2026-09-18 that coach addresses are not published and correspondence
  goes through a parent.
- **Order and numbers**: 04 Drug safety, 05 Knee exoskeleton, 06 Loquar, 07 OCAPEX, 08 Goaltender, 10 The
  record: each file has its sheet's number (09, Viola and violin, has no file). Previous and next follow that
  order; the descriptions on the cards are the cabinet's kickers. `tools/v3-files.mjs` writes all of it from the
  deck (a file's number is its sheet's place, its name the sheet's folder, its line that folder's kicker), with
  the chrome (the name, Email and the year, as on the deck) and the view transition name; run it after changing
  the deck, and `--check` (run by the unit test) names a file that drifts.
- **Hover**: the creamy grammar, rebuilt in paper. The cards settle flat from their tilt and lift 3px over
  800ms on `cubic-bezier(.22, 1, .36, 1)`, the arrow grows from .8 and turns from 45 degrees over 450ms, the
  card's line unfolds (grid rows 0fr to 1fr, 500ms) and the other card steps back by dimming its ink and paper
  (colour, so its text keeps 4.5:1). The line folds away only with the script (`html.js`), so without it every
  pager line shows. Product screenshots settle from 1.05 to 1 inside their still frame; research figures never
  crop. Drawer tabs rise 4px. Touch screens and reduced motion show everything at rest; nothing blurs. On touch
  screens the back links, the link row, any contact links and the chrome's name are 44px targets (the type
  does not change).
- **Page change**: the files' chrome is 44px tall in the same short windows as the deck's (900px wide and up
  to 820px tall, 52px otherwise), so the name and the year stay in one place and never show double while the
  pages crossfade. Both stylesheets carry `@view-transition { navigation: auto; }` (in `site.css` it is the
  delimited block at the very end). Coming from the deck, the deck stays put while the desk comes up over it
  (160ms), then the file and its drawer rise 40px and fade in (300ms, from 100ms in), so the file does not
  fade in over the deck's text. From file to file the old one sinks 16px and is gone in 110ms before the new
  one rises; the drawer holds still (no travel even from the foot of a long file) and only its current tab
  changes. Going home, the file and its drawer sink and are gone in 130ms while the deck comes back out of
  the black (220ms, from 90ms in; that part is `site.css`'s). Each file names its paper
  (`view-transition-name: file-04` and so on, listed in `files.css` and in that `site.css` block). Reduced
  motion keeps crossfades only, with no rise or sink; other browsers simply navigate.
- **To add a file**: copy the closest file's folder (research: `aducanumab`; product: `loquar`), change its
  description, stamp, facts and sections; add it (its folder and its sheet's id) to `FILES` in
  `tools/v3-files.mjs` in the deck's order and run `node tools/v3-files.mjs`, which writes its title, chrome,
  drawer, links back and pager, and every other file's drawer and pager; add its `view-transition-name`
  (`file-NN`) to the two `::view-transition-*(file-..)` lists in `files.css` and to the two in `site.css`'s
  "files: view transition" block; then point the sheet's detail link at `files/<slug>/`, add the slug to the
  `FILES` list at the top of `tests/v3/check.mjs` and run it. Images go in `v3/assets/img/` as derivatives; never
  link to another edition's files.
- **The hockey one-pager**: on screens in one column (phones and tablets) the season's stats come first after
  the measurables, then the coach contacts, then how I play and the rest. `files/hockey/` puts measurables, the stat line with its sample size, how I play,
  the academic snapshot, the coach contacts, Elite Prospects and NCSA, team history, prep and camps, and crew
  and soccer on one page. "Print the one-pager" is a real button that calls `print()` (hidden without the
  script and in print). The `@media print` block "Print: the hockey one-pager" in `files.css` lays it out on
  one Letter page at 12mm margins: the head across the top, the six measurables in one row, then two columns
  (the contacts and team history column a little wider, one line per coach), type at 9 to 25pt (nothing under
  9pt, the 12px floor), links printed with their addresses; the file's end and the desk are left out.
  `tests/v3/check.mjs` checks it with `page.pdf({ format: 'Letter' })`: one page, with about 57px of the 965px
  page to spare. If a section grows, run it again and tighten that block if it spills.
- **Print** (every file): no desk, torn edges, tape or shadows; black tabs become rules; outside links print
  their addresses; placeholders for photographs not yet supplied are left out; figures and charts print in
  colour; the stamp follows the title (on the hockey page it stands straight at the top right). The page is
  printed in a light colour scheme, so the margins stay white when background graphics are on. 1rem is 12pt
  on paper, so the file's type scales together and the 12px floor (`--micro`) prints at 9pt; printed link
  addresses are 9pt or more.
- Hidden-until-ready blocks stay hidden with a comment saying what fills them: the hockey file's 2026-27 stat
  tiles and schedule, the résumé's PDF button, and the film link (in the film note).

## Conventions

- Torn edges are three 2800 by 72 paths in the sprite, sliced from the middle so
  they never stretch; the cover strip is a percentage polygon in `--strip`.
- The crown, star and number badge are inline SVG symbols; the two mask stickers
  (three-quarter on the cover, head-on at the end) are renders of a downloaded
  goalie-mask model (`assets/model/GMask.obj`), not Leonardo's own mask,
  posterized with a white sticker border.
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
