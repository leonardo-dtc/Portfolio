---
name: Leonardo Carvalho, fifth edition
description: A cobalt room drawn after Apple's Liquid Glass wallpapers, with glass windows floating in it and his name written in glass the way Apple writes hello.
colors:
  ground-night: "#0b1138"
  ground-day: "#2f64c2"
  room-night-sky: "#070933"
  room-night-mid: "#141773"
  room-night-horizon: "#6147d6"
  room-day-sky: "#0561c2"
  room-day-mid: "#5c99de"
  room-day-horizon: "#ebdebd"
  glass-night: "#2633e6"
  glass-day: "#1a2966"
  glass-prominent: "#2957ff"
  ink: "#ffffff"
  ink-2: "rgba(255, 255, 255, .78)"
  ink-3: "rgba(255, 255, 255, .71)"
  line: "rgba(255, 255, 255, .14)"
  fill: "rgba(255, 255, 255, .06)"
  fill-2: "rgba(255, 255, 255, .14)"
  fill-3: "rgba(255, 255, 255, .22)"
  tint: "rgba(10, 14, 48, .5)"
  tint-day: "rgba(14, 24, 76, .64)"
  tint-strong: "rgba(10, 14, 48, .84)"
  paper: "#f2efe8"
  gold: "#cdaa6d"
  blue: "#1e63a8"
  sand: "#e4c4a2"
  card-ink: "#1b1b1f"
  drawn-ink: "#151a3c"
  drawn-violet: "#4b3fb0"
  drawn-green: "#2f6e4f"
typography:
  title:
    fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Display', 'Segoe UI Variable Display', 'Segoe UI', Roboto, system-ui, sans-serif"
    fontSize: "34px"
    fontWeight: 700
    lineHeight: 1.08
    letterSpacing: "-0.012em"
  headline:
    fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Display', 'Segoe UI Variable Display', 'Segoe UI', Roboto, system-ui, sans-serif"
    fontSize: "22px"
    fontWeight: 700
    lineHeight: 1.2
    letterSpacing: "-0.008em"
  side-title:
    fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Display', 'Segoe UI Variable Display', 'Segoe UI', Roboto, system-ui, sans-serif"
    fontSize: "20px"
    fontWeight: 700
    lineHeight: 1.15
    letterSpacing: "-0.005em"
  card-title:
    fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Display', 'Segoe UI Variable Display', 'Segoe UI', Roboto, system-ui, sans-serif"
    fontSize: "18px"
    fontWeight: 700
    lineHeight: 1.15
  lede:
    fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI Variable Text', 'Segoe UI', Roboto, system-ui, sans-serif"
    fontSize: "19px"
    fontWeight: 500
    lineHeight: 1.45
    letterSpacing: "0.006em"
  lead:
    fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI Variable Text', 'Segoe UI', Roboto, system-ui, sans-serif"
    fontSize: "18px"
    fontWeight: 600
    lineHeight: 1.4
  body:
    fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI Variable Text', 'Segoe UI', Roboto, system-ui, sans-serif"
    fontSize: "17px"
    fontWeight: 500
    lineHeight: 1.47
    letterSpacing: "0.006em"
  control:
    fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI Variable Text', 'Segoe UI', Roboto, system-ui, sans-serif"
    fontSize: "15px"
    fontWeight: 650
    lineHeight: 1
  meta:
    fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI Variable Text', 'Segoe UI', Roboto, system-ui, sans-serif"
    fontSize: "14px"
    fontWeight: 500
    lineHeight: 1.35
  caption:
    fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI Variable Text', 'Segoe UI', Roboto, system-ui, sans-serif"
    fontSize: "13px"
    fontWeight: 500
    lineHeight: 1.3
  manuscript:
    fontFamily: "'Iowan Old Style', 'Palatino Linotype', Palatino, Georgia, serif"
    fontSize: "clamp(20px, 2.1vw, 24px)"
    fontWeight: 600
    lineHeight: 1.3
rounded:
  sheet-phone: "40px"
  win: "32px"
  side: "28px"
  card: "20px"
  row: "16px"
  inner: "12px"
  pill: "999px"
spacing:
  hair: "2px"
  xs: "8px"
  sm: "12px"
  md: "16px"
  lg: "24px"
  group: "30px"
  pad: "36px"
  pad-phone: "22px"
  section: "44px"
  win-top: "4.5svh"
  w-main: "clamp(720px, 52vw, 1040px)"
  side-w: "clamp(250px, 18.5vw, 330px)"
  measure: "44em"
components:
  window:
    rounded: "{rounded.win}"
    padding: "30px 36px 110px"
    width: "{spacing.w-main}"
  window-phone:
    rounded: "{rounded.sheet-phone}"
    padding: "26px 22px 130px"
  side-window:
    rounded: "{rounded.side}"
    padding: "24px 22px"
    width: "{spacing.side-w}"
  tab-bar:
    rounded: "32px"
    padding: "8px"
    width: "64px"
  tab-bar-open:
    width: "188px"
  tab:
    textColor: "{colors.ink-2}"
    rounded: "{rounded.pill}"
    padding: "0 12px"
    height: "48px"
    typography: "{typography.control}"
  tab-current:
    backgroundColor: "{colors.fill-3}"
    textColor: "{colors.ink}"
    rounded: "{rounded.pill}"
  tab-bar-phone:
    rounded: "{rounded.pill}"
    padding: "7px"
    height: "66px"
  toolbar:
    rounded: "{rounded.pill}"
    padding: "7px"
  button:
    backgroundColor: "{colors.fill}"
    textColor: "{colors.ink}"
    rounded: "{rounded.pill}"
    padding: "0 18px"
    height: "44px"
    typography: "{typography.control}"
  button-hover:
    backgroundColor: "{colors.fill-2}"
  button-primary:
    backgroundColor: "{colors.ink}"
    textColor: "{colors.ground-night}"
    rounded: "{rounded.pill}"
    padding: "0 18px"
    height: "44px"
  button-pressed:
    backgroundColor: "{colors.ink}"
    textColor: "{colors.ground-night}"
  more-link:
    backgroundColor: "{colors.fill}"
    textColor: "{colors.ink}"
    rounded: "{rounded.pill}"
    padding: "8px 14px"
    typography: "{typography.control}"
  enter:
    backgroundColor: "{colors.glass-prominent}"
    textColor: "{colors.ink}"
    rounded: "{rounded.pill}"
    padding: "0 30px 0 32px"
    height: "56px"
  close:
    backgroundColor: "{colors.fill-2}"
    textColor: "{colors.ink}"
    rounded: "{rounded.pill}"
    size: "44px"
  card:
    backgroundColor: "{colors.fill}"
    textColor: "{colors.ink}"
    rounded: "{rounded.card}"
    typography: "{typography.card-title}"
  card-paper:
    backgroundColor: "{colors.paper}"
    textColor: "{colors.card-ink}"
    rounded: "{rounded.card}"
  card-gold:
    backgroundColor: "{colors.gold}"
    textColor: "{colors.card-ink}"
    rounded: "{rounded.card}"
  card-blue:
    backgroundColor: "{colors.blue}"
    textColor: "{colors.ink}"
    rounded: "{rounded.card}"
  card-sand:
    backgroundColor: "{colors.sand}"
    textColor: "{colors.card-ink}"
    rounded: "{rounded.card}"
  list-group:
    backgroundColor: "{colors.fill}"
    rounded: "{rounded.row}"
  row:
    textColor: "{colors.ink}"
    padding: "13px 16px"
    typography: "{typography.body}"
  row-hover:
    backgroundColor: "{colors.fill}"
  side-row:
    backgroundColor: "{colors.fill}"
    rounded: "{rounded.row}"
    padding: "10px"
  side-row-icon:
    backgroundColor: "{colors.fill-2}"
    rounded: "{rounded.pill}"
    size: "38px"
  cv-entry:
    backgroundColor: "{colors.fill}"
    rounded: "{rounded.row}"
    padding: "15px 18px"
  facts-box:
    backgroundColor: "{colors.fill}"
    rounded: "{rounded.row}"
    padding: "18px 20px"
  table-wrap:
    backgroundColor: "{colors.fill}"
    rounded: "{rounded.row}"
  figure-tile:
    backgroundColor: "{colors.fill}"
    rounded: "{rounded.card}"
    padding: "clamp(16px, 3vw, 28px)"
  toc-link:
    textColor: "{colors.ink-2}"
    rounded: "{rounded.inner}"
    padding: "9px 12px"
  avatar:
    rounded: "{rounded.pill}"
    size: "60px"
  portrait:
    rounded: "{rounded.card}"
  skip-link:
    backgroundColor: "{colors.ink}"
    textColor: "{colors.ground-night}"
    rounded: "{rounded.pill}"
    padding: "10px 16px"
---

# Design System: Leonardo Carvalho, fifth edition

## Overview

**Creative North Star: "One Room, Many Windows"**

A cobalt room drawn the way Apple draws its Liquid Glass wallpapers: a navy sky falling to a violet horizon, soft out-of-focus cobalt and periwinkle forms, and a flat glass wave with one bright crest, all moving slowly. The room is one WebGL2 canvas behind everything, in two palettes that follow the system: Night (navy and violet) and Day (sky blue over a warm pale horizon). Into that room the site floats glass windows as visionOS does: one main window centred, a tab bar hanging off its left edge, a toolbar crossing its bottom edge, a small window bar under it that drags and springs home, and at 1360px and wider two side windows turned 24 degrees toward the reader. Projects open as sheets in front of the window you came from, which steps back and dims.

The front door is the hello. On the first home view of a session the room is out of focus and "leonardo carvalho" writes itself in lowercase script, traced from Sacramento into pen strokes and rendered as glass tubes that bend the room behind them. An Enter button in prominent cobalt glass waits beneath. Entering pulls the room into focus, flies the name into the main window's title slot where it turns to white glass, and materialises the windows in order. After that the written name is the home window's title and the only display type on the site; everything else is the system UI face, set the way visionOS sets it.

The material is glass drawn by the room itself: frost read from the blurred room, lensing at the rounded edge, a cobalt tint, a brightness cap that keeps white text legible, a bright rim, a light that follows the pointer, and a light from within when a control is pressed. Inside a window nothing is glass again: lists, cards, tables and buttons are white fills at 6, 14 and 22 percent. Motion is springs everywhere, described as Apple describes them (a response and a damping ratio) and stepped in the same frame as the glass.

**Key Characteristics:**
- A drawn cobalt room (Night and Day) behind every page; a still of each is the CSS background without WebGL or scripts.
- Glass windows, ornaments and one prominent control, drawn by the room under the HTML; CSS glass as the fallback.
- The name, written in glass, is the only display voice; the system face sets everything else in white at three levels.
- Concentric radii: phone sheet 40, window 32, side window 28, card 20, list group 16, pill for every control.
- One spring model (response, damping) for materialising, the tab bubble, sheets, parallax, drag and press.
- Every page reads without JavaScript, calms under reduced motion and transparency, and prints on white Letter.

## Colors

A room of navy, cobalt and violet at night and sky blue by day, glass tinted toward that cobalt, white text at three strengths, and the colours of the project screens on the cards.

### Primary
- **Night Glass Cobalt** (`{colors.glass-night}`): the tint mixed into every window and ornament at night (48% for windows and ornaments), so the glass reads as luminous cobalt rather than grey. It is light in a surface, never a flat fill in CSS.
- **Prominent Cobalt** (`{colors.glass-prominent}`): the one prominent glass, the Enter button in the hello, mixed at 46% and brightened by 16% so it stands above the room. By day it lifts to `#3d75ff`.
- **Day Glass Blue** (`{colors.glass-day}`): the day tint, deeper than the day sky, so the brightness cap has less to hold down.

### Secondary (the room)
- **Night Sky** (`{colors.room-night-sky}`), **Night Mid** (`{colors.room-night-mid}`) and **Night Horizon** (`{colors.room-night-horizon}`): the night room's vertical gradient, with a deep base `#040a47` at the foot and the cobalt forms and violet glass wave laid over it.
- **Day Sky** (`{colors.room-day-sky}`), **Day Mid** (`{colors.room-day-mid}`) and **Day Horizon** (`{colors.room-day-horizon}`): the same room by day, a warm pale horizon under a blue sky, with a deep base `#082994`.
- **Night Ground** (`{colors.ground-night}`): the html background colour under the night still, the theme colour, and the text colour on white controls (the primary button, a pressed filter, the skip link).
- **Day Ground** (`{colors.ground-day}`): the html background colour under the day still.

### Tertiary (the screens' own colours)
- **Paper** (`{colors.paper}`), **Gold** (`{colors.gold}`), **Blue** (`{colors.blue}`) and **Sand** (`{colors.sand}`): the aducanumab manuscript, Loquar, Genuvalens and OCAPEX cards, and the grounds of their figures on the project sheets (set per figure as `--c`). Paper, Gold and Sand carry **Card Ink** (`{colors.card-ink}`) text; Blue carries white.
- **Drawn Ink** (`{colors.drawn-ink}`), **Drawn Violet** (`{colors.drawn-violet}`) and **Drawn Green** (`{colors.drawn-green}`): the three Work cards for projects without screenshots, each drawn as a small picture on its colour, with white text.

### Neutral
- **Ink** (`{colors.ink}`): all primary text, titles, the written name as a title, focus rings, the primary button's fill.
- **Ink 2** (`{colors.ink-2}`, 78%): the second voice. The lede after its first sentence, prose, fact labels, side-window text, tabs at rest.
- **Ink 3** (`{colors.ink-3}`, 71%): the third voice. Dates, notes, captions, table heads, reference numerals, list bullets.
- **Line** (`{colors.line}`, 14%): dividers inside a list group, table rows, the side-window list.
- **Fill** (`{colors.fill}`, 6%), **Fill 2** (`{colors.fill-2}`, 14%) and **Fill 3** (`{colors.fill-3}`, 22%): the three fills on glass. Fill grounds list groups, cards without colour, résumé entries, fact boxes, tables and buttons at rest; Fill 2 is hover and the round icon wells; Fill 3 is the current tab's bubble and a hovered close button.
- **Tint** (`{colors.tint}`), **Tint Day** (`{colors.tint-day}`) and **Tint Strong** (`{colors.tint-strong}`): CSS glass only, under a 30px backdrop blur with `saturate(1.7) brightness(.8)`; Tint Day keeps the fallback dark enough over the bright day room; Tint Strong replaces it under reduced transparency.

### Named Rules
**The White on Glass Rule.** Text is white at 100, 78 or 71 percent and nothing else, on glass that caps its own brightness (relative luminance at most 0.22 before the rim and highlights are added), so every level keeps 4.5:1 over the night glass and the bright day room alike.

**The Room Is the Colour Rule.** The site's own saturated colour lives in the room and in the glass tint drawn from it. The only other colour is a project's own, on its card and its figures.

**The Fills Not Glass Rule.** Inside a window, surfaces are white fills (6, 14, 22 percent), never a second layer of glass or a coloured panel.

## Typography

**Display:** the written name, "leonardo carvalho" in lowercase script traced from Sacramento into pen strokes and rendered in glass. The site loads no font file; the name is stroke data (and an SVG for scripts off and print).
**Text and Titles Font:** the system UI face (SF Pro Display and SF Pro Text on Apple devices; Segoe UI Variable, Roboto and system-ui elsewhere).
**Manuscript Font:** Iowan Old Style (with Palatino, Georgia): the aducanumab manuscript's own title only.

**Character:** Apple's own voice for everything that is read, set at visionOS weights: bold titles, a medium 500 body that holds up on glass, and semibold 650 controls. The single flourish is the written name, which is drawn rather than typeset.

### Hierarchy
- **The written name** (stroke width 24 name units, round caps and joins): the hello, at 80% of the viewport width on one line, or two lines under 700px; then the home window's title at up to 460px wide (340px under 700px, two lines). White glass as a title; clear glass in the hello.
- **Title** (700, 34px, 1.08, -.012em): the window's title on every page other than home, and each sheet's title. 30px under 900px.
- **Headline** (700, 22px, 1.2, -.008em): section titles inside a window, and side-window titles when they sit inside the main window.
- **Side title** (700, 20px, 1.15, -.005em): the title of a floating side window.
- **Card title** (700, 18px, 1.15): the project name on a card.
- **Lede** (500, 19px, 1.45): the introduction and the contact sentence, max 44em, in Ink 2 with its first sentence bold in Ink. 17px under 900px.
- **Lead** (600, 18px, 1.4): the first-person sentence heading each group of the record, max 34em.
- **Body** (500, 17px, 1.47, +.006em): prose (max 40em), rows, résumé text (16px inside entries), facts at 16px.
- **Control** (650, 15px, line 1): buttons, the All work link, table of contents links; tabs and the close label at 16px; the Enter button at 19px.
- **Meta** (500, 14px): dates, sublines, side-window text, references, figure captions, side facts.
- **Caption** (500, 13px): card sublines (two lines always reserved), table heads, experiment dates. Nothing on the site is under 12px.
- **Manuscript** (600, `clamp(20px, 2.1vw, 24px)`, 1.3): the manuscript's title on its sheet, max 30em; 15px/1.22 on its card, clamped to three lines.

### Named Rules
**The Written Name Rule.** The only display type is the name written in glass. Headings never borrow a script, and the system face never goes above the 34px title.

**The One Face Rule.** Everything that is read is the system UI face. The serif appears only as the manuscript's own title, on its card and its sheet; the experiments' titles lean in italic at 550 in the same face.

**The Bold Is Ink Rule.** Inside Ink 2 text, a bold phrase is lifted to white at 650. Weight and ink rise together.

## Layout

One room, and on it a centred main window `clamp(720px, 52vw, 1040px)` wide, 4.5svh from the top, with a height of the viewport less 14svh. Its head carries 30px top and 36px side padding (`{spacing.pad}`); its body scrolls inside the window with 18px above and 110px below, masked to fade over 22px at the top and over the last 78px, so text slides under the toolbar rather than being cut. Wheel and keys anywhere in the room scroll the front window.

Three layout modes, set by script at 1360px and 900px:
- **Desktop (1360px and wider):** side windows `clamp(250px, 18.5vw, 330px)` wide float 2.6vw from each edge, 8% down the window's height, at most 84% of it tall, turned 24 degrees toward the reader. The room's space has a 120vw perspective; the pointer shifts its origin by up to 10% and moves the space against the pointer by up to 1vw, and the room shifts the other way.
- **Laptop (900 to 1359px):** no side windows; their content becomes sections inside the main window, 44px below the rest, with 22px titles.
- **Phone and narrow tablet (under 900px):** the window becomes a full-screen sheet 10px from every edge (plus safe areas) with a 40px radius and 22px padding; the tab bar becomes a floating capsule at the bottom, `min(380px, 100vw - 44px)` wide and 66px tall, icons only; the toolbar's actions sit inline in the content; nothing is angled or parallaxed. Under 700px the title is the two-line name and the avatar is dropped; under 600px the facts stack into one column.

Rhythm inside a window: 44px above each section, 16px under a section head, 30px between record groups, 12px under a lead, 16px between cards (12px on phones), 34px between prose blocks, 40px above a prose h2, 44px above a pager. Cards run four across (three on the Work page's filtered sets), and as many 150px columns as fit under 900px. Sheets sit 44px inside the main window's sides (capped at 920px wide) and 4svh inside its top and bottom.

Scripts off, the room becomes its still, and windows, side windows and tab bar stack in one centred column up to 980px wide.

## Elevation & Depth

Depth is the room itself: glass windows at the front, the room behind them, and each window casting a soft shadow into the room. With WebGL2 the room draws every glass surface under its HTML element (marked `data-glass` as window, ornament or prominent) in one composite pass: frost read from the room's mipmaps at about 26 device pixels of blur (one step less for controls), refraction that bends the room inward within 30px of a window's rounded edge (20px for ornaments), a cobalt tint, the brightness cap, a 1px bright rim that is brighter on the side facing the light, a faint glow along the edge, a 300px pool of light near the pointer, and on press a light from within (24%, a spot 7% of the viewport tall, under the pointer). Windows cast a shadow 22px down that reaches 90px at 34%; ornaments one that reaches 40px at 22%. Glass appears and leaves by ramping its lensing and frost, not by fading a box.

Behind a sheet, the parent steps back 10vw, its glass dims by 55%, its contents lose half their brightness, a fifth of their saturation and blur 1.5px, and fade out; its toolbar and window bar step away with it. The room cannot frost HTML, so the parent's content must fade rather than show through.

Without WebGL2, with scripts off, or under reduced transparency, the same elements draw CSS glass: the tint under `blur(30px) saturate(1.7) brightness(.8)`, a 1px gradient rim (72% white at the top left, 5% through the middle, 42% at the bottom right), and a soft shadow. The phone's bottom tab bar always uses CSS glass (24px blur), because content scrolls under it.

### Shadow Vocabulary
- **Window shadow** (drawn by the room: 22px down, reach 90px, 34%; CSS fallback `0 30px 80px rgba(0,0,0,.28), 0 2px 6px rgba(0,0,0,.12)`): every window and sheet.
- **Ornament shadow** (drawn: reach 40px, 22%; phone tab bar `0 18px 44px rgba(0,0,0,.32)`): tab bar, toolbar, Enter.
- **Card lift** (`0 10px 24px rgba(0,0,0,.16)`, hover `0 18px 40px rgba(0,0,0,.24)`): project cards, which sit on the window like objects.
- **Screenshot shadow** (`0 10px 26px rgba(0,0,0,.26)` on a card, `0 14px 34px rgba(0,0,0,.24)` on a sheet figure): a screenshot resting on its colour.
- **Hover light** (`radial-gradient(180px circle at pointer, rgba(255,255,255,.16), transparent 62%)`, plus-lighter; pressed 240px at 30%): cards, rows and buttons marked `data-hover`, the visionOS gaze light.
- **Focus glow** (`outline 2px #fff, offset 3px, box-shadow 0 0 0 6px rgba(255,255,255,.18)`): every focusable element.

### Named Rules
**The One Glass Layer Rule.** Glass is for windows and the controls that float over them. Nothing inside a window is glass: buttons, lists and cards are fills.

**The Legibility Cap Rule.** The glass holds its own brightness down before light is added to its edges, so white text reads whatever the room is doing behind it.

## Shapes

Corners are concentric, larger outside and smaller within: the phone sheet 40px (`{rounded.sheet-phone}`), the main window and sheets 32px (`{rounded.win}`), side windows 28px (`{rounded.side}`), cards, figure tiles and the portrait 20px (`{rounded.card}`), list groups, résumé entries, fact boxes, tables and side-window rows 16px (`{rounded.row}`), table of contents links 12px (`{rounded.inner}`), and every control a full capsule (`{rounded.pill}`): buttons, tabs and their bubble, the toolbar, the phone tab bar, the Enter button, the skip link. The desktop tab bar is a 64px column with a 32px radius, so its ends are round. Screenshots on cards take 9px (14px when tall, a phone screen); sheet figures 10px. The avatar and icon wells are circles.

Borders are almost absent: rows inside a group are divided by the Line, tables by the Line under each row, and the CSS glass rim is a masked gradient, not a border. The window bar is a pill pair of 11px dot and 96px bar at 62% white.

## Components

### The main window (signature)
- A 32px-radius glass window with a head (title and, on home, the written name and a 60px round avatar) and a scrolling body masked at both ends. On sheets a 44px round close button (Fill 2, Fill 3 on hover) sits top left, and the head moves 84px right to clear it.
- **Materialise:** from 14vw back and 96% scale to rest, opacity ramping 1.4 times faster than the spring, under a spring of response .55 and damping .86.
- **Page change:** the old contents fade to 0 over 180ms while blurring 8px and scaling to .985 (`cubic-bezier(.4, 0, 1, 1)`); the new ones rise 14px and unblur from 6px over 260ms (`cubic-bezier(.2, .8, .2, 1)`). The window itself never leaves.

### Side windows
- 28px radius, 24px by 22px padding, a 20px title, then side rows (a 38px round icon well in Fill 2 with a 19px stroked icon, a 15px bold line over 14px Ink 2), a divided list, facts at 14px, a table of contents, or the portrait. They swing in from 52 degrees to 24 and from 22vw back (response .7, damping .86), and fade out over their last 26px.

### Tab bar (ornament)
- A 64px glass column hanging 36px off the window's left edge, vertically centred, 8px padding, 48px tabs with 24px stroked icons (1.7 stroke, round caps). Pointing at it for 120ms widens it to 188px and the names slide in (opacity .16s, 6px travel .3s, 60ms delay); it closes 300ms after the pointer leaves. Keyboard focus opens it too.
- **The bubble:** a Fill 3 pill with a 1px inner top highlight at 32% marks the current tab, moved by a spring (response .45, damping .8) that stretches it along its travel by up to 30% while it moves.
- **Phone:** the floating bottom capsule, icons only, names kept for screen readers, the bubble 60px wide.

### Toolbar and buttons
- **Toolbar:** a glass capsule crossing the window's bottom edge by 28px, 7px padding, 6px gaps, scrolling sideways if it must. On sheets it pages to the neighbouring projects.
- **Button:** a 44px capsule, 18px sides, 650 at 15px, a Fill at rest and Fill 2 on hover (Fill 2 at rest and Fill 3 on hover inside the toolbar); pressing scales to .97 over a .35s ease.
- **Primary:** white with Night Ground text; at most one per toolbar. A pressed filter takes the same white.
- **More link:** a smaller capsule (8px 14px, Fill) beside a section title.
- **Enter:** the one prominent glass, 56px tall, 650 at 19px with an arrow, and a 1.5px ring at 34% white 7px outside it that breathes over 2.6s. It fades in from 94% scale when the name is written, and leaves by growing to 108% as it fades.
- **Window bar:** under the window, drags up to about 40px with rubber-band resistance and springs home (response .5, damping .7).

### Cards (projects on their own screens' colours)
- 20px radius, 4 to 5.1 aspect, the project's colour as the ground, the card lift shadow. A screenshot sits 8% in from the sides and 10% from the top (a phone screen 26% in, 9:17), with the name at 700 18px and a two-line 13px subline at 82% opacity pinned to the foot. The manuscript card is a page: its title in the serif over three grey rule lines.
- **Hover:** scales to 1.02 with the larger lift over .45s; press .98; the hover light follows the pointer.

### Lists (visionOS list groups)
- A Fill ground at 16px radius, rows divided by the Line, each row a two-column grid (title, then a nowrap 14px tabular date in Ink 3), 13px 16px padding; a row can carry a 14px Ink 3 subline. Hover lays a Fill over the row and the hover light.
- **Experiments:** the same rows with the title in italic at 550 and 13px dates.
- **Résumé entries:** separate Fill cards (15px 18px, 10px apart), a 650 17px head with its date right, a 14px Ink 3 subline, 16px Ink 2 text and bullets as 5px Ink 3 dots.

### Sheets' furniture
- **Facts:** a label column in Ink 2 and values in Ink, 10px by 24px gaps; boxed on a Fill at 16px radius, 18px by 20px padding. One column under 600px.
- **Tables:** 15px tabular, right-aligned except the first column, Line under each row, heads in Ink 3 at 13px, a caption beneath at 13.5px, inside a Fill wrapper at 16px radius that scrolls sideways.
- **Figures:** the image on its project colour tile (20px radius, `clamp(16px, 3vw, 28px)` padding), caption 10px below in Ink 3 at 14px.
- **References:** a numbered list at 14px in Ink 2 with Ink 3 numerals in a 26px column.
- **Links in text:** white, underlined 1px at 45% white, 3px offset; the underline goes white on hover.

### Motion (one spring model)
- Every geometric motion is a spring given as a response (seconds) and a damping ratio, stepped at 4ms substeps in the shared frame loop: windows .55 / .86, side windows .7 / .86, the tab bubble .45 / .8, a sheet's parent stepping back .5 / 1, parallax .9 / 1 and the pointer light .6 / 1, the window bar .5 / .7, press light .3 / 1. The hello uses .5 / .8 for the Enter glass, 1.1 / 1 for the room's focus pull, .8 / .92 for the name's flight, and .45 / 1 for the title fading with its page.
- **The hello's pace:** "leonardo" writes over 1.45s after .3s, "carvalho" starts .82s in and also takes 1.45s, eased in and out; Enter is ready at about 2.4s. A replay (pressing the title) runs 1.2 / .66 / 1.2. A sheen sweeps the glass name every 6.5s.
- **Entering:** the main window at .18s, side windows from .34s 60ms apart, then tab bar .55s, toolbar .62s, window bar .7s; ornaments grow from 90% scale.
- **CSS micro-motion** uses one curve, `cubic-bezier(.16, 1, .3, 1)`: the tab bar's width (.42s), button press (.35s), card hover (.45s), the Enter button (.6s fade, .9s scale).
- **Reduced motion:** no writing, focus pull, parallax, drift or springs; transitions become 150ms crossfades and the room does not redraw while nothing moves.

## Do's and Don'ts

### Do:
- **Do** let the written name be the display voice: in glass in the hello, in white glass as the home title, and as its SVG with scripts off and in print (The Written Name Rule).
- **Do** keep text white at 100, 78 or 71 percent on glass, and let the glass cap its own brightness (The White on Glass Rule).
- **Do** put surfaces inside a window on the three fills (6, 14, 22 percent) and keep glass for windows and the controls that float over them (The One Glass Layer Rule).
- **Do** keep corners concentric: 40, 32, 28, 20, 16, 12 and the capsule for controls.
- **Do** move geometry with springs given as response and damping, in the same frame as the glass, and give reduced motion 150ms crossfades.
- **Do** give a project card its own screen's colour, with its screenshot resting on it.
- **Do** turn side windows toward the reader as a resting position, and swing them in from further round as they arrive.
- **Do** keep every page readable with scripts off, under reduced transparency (CSS glass at 84% tint), in forced colours, and in print.

### Don't:
- **Don't** put glass inside glass: no frosted panel, card or button inside a window.
- **Don't** tint text or headings; colour belongs to the room, the glass and a project's card.
- **Don't** set a heading in a script or a display face, or set the system face larger than the 34px title.
- **Don't** tilt anything in response to hover; the side windows' angle is their place in the room, and hover answers with light and scale.
- **Don't** fade a sheet's parent through its glass without fading its contents; the room cannot frost HTML.
- **Don't** put a small label above a title or section heading; the title carries itself.
- **Don't** use tween durations for window, bubble or sheet motion; those are springs.
