---
name: Leonardo Carvalho, fifth edition
description: A cobalt room drawn after Apple's Liquid Glass wallpapers, with glass windows floating in it and his name in heavy Switzer, traced in neon light after Apple's "It's Glowtime".
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
  side-text:
    fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI Variable Text', 'Segoe UI', Roboto, system-ui, sans-serif"
    fontSize: "15px"
    fontWeight: 500
    lineHeight: 1.36
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
  name-hero:
    fontFamily: "Switzer, -apple-system, BlinkMacSystemFont, 'SF Pro Display', 'Segoe UI Variable Display', 'Segoe UI', Roboto, system-ui, sans-serif"
    fontSize: "min(8.2vw, 24svh, 160px)"
    fontWeight: 780
    lineHeight: 1
    letterSpacing: "-0.03em"
  name-title:
    fontFamily: "Switzer, -apple-system, BlinkMacSystemFont, 'SF Pro Display', 'Segoe UI Variable Display', 'Segoe UI', Roboto, system-ui, sans-serif"
    fontSize: "46px"
    fontWeight: 700
    lineHeight: 1.04
    letterSpacing: "-0.03em"
  hint:
    fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI Variable Text', 'Segoe UI', Roboto, system-ui, sans-serif"
    fontSize: "14px"
    fontWeight: 500
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
  side-w: "clamp(240px, 20vw, 350px)"
  gap-side: "clamp(40px, 3.4vw, 64px)"
  gap-tabs: "14px"
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
  hero-name:
    textColor: "{colors.ink}"
    rounded: "0.2em"
    padding: "0.05em 0.12em"
    typography: "{typography.name-hero}"
  hero-hint:
    textColor: "{colors.ink-2}"
    typography: "{typography.hint}"
  name-title:
    textColor: "{colors.ink}"
    typography: "{typography.name-title}"
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
  experiment-open:
    backgroundColor: "{colors.fill-2}"
    textColor: "{colors.ink}"
    padding: "13px 16px"
  card-arrow:
    backgroundColor: "{colors.ink}"
    textColor: "{colors.ground-night}"
    rounded: "{rounded.pill}"
    size: "32px"
  side-scrollbar:
    backgroundColor: "rgba(255, 255, 255, .5)"
    rounded: "{rounded.pill}"
    width: "4px"
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

A cobalt room drawn the way Apple draws its Liquid Glass wallpapers: a navy sky falling to a violet horizon, soft out-of-focus cobalt and periwinkle forms, and a flat glass wave with one bright crest, all moving slowly. The room is one WebGL2 canvas behind everything, in two palettes that follow the system: Night (navy and violet) and Day (sky blue over a warm pale horizon). Into that room the site floats glass windows as visionOS does: one main window, a tab bar just off its left edge, a toolbar crossing its bottom edge, a small window bar under it that drags and springs home, and at 1360px and wider one side window turned 24 degrees toward the reader; tab bar, main window and side window are set as one group, centred on the screen. Projects open as sheets in front of the window you came from, which steps back a little and dims.

The front door is the hero. On the first home view of a session the room is out of focus and "Leonardo Carvalho" stands in the middle of it in Switzer at 780, heavy and blocky, traced by the room in neon light, after Apple's "It's Glowtime." art: a crisp tube of flowing colour (orange, hot pink, magenta, violet, electric blue, cyan) locked to every letter's edge, three echoes tracing it again in their own colours and burning toward white where they cross, translucent violet faces, and a halo over a pool that falls near black by night and violet-blue by day. The light moves slowly and never stops; the letters never move. The halo leans gently toward the pointer, hovering lifts the light and a press flares it. At the foot of the screen one quiet line says "Click the title to proceed" ("Tap" on touch screens). The title is the control: clicking it (or Return) pulls the room into focus while the name glides into the main window's title slot, its light going out as it turns white, and the window's glass forms around it; the window's contents, the side window and the tab bar follow, and the name hands off to the HTML title, which is plain text from then on. Liquid Glass stays out of the content layer, as Apple asks. Everything else is the system UI face, set the way visionOS sets it.

The material is glass drawn by the room itself: frost read from the blurred room, lensing at the rounded edge, a cobalt tint, a brightness cap that keeps white text legible, a bright rim, a light that follows the pointer, and a light from within when a control is pressed. Inside a window nothing is glass again: lists, cards, tables and buttons are white fills at 6, 14 and 22 percent. Motion is springs everywhere, described as Apple describes them (a response and a damping ratio) and stepped in the same frame as the glass. Nothing that carries text blurs or moves on its own: page changes crossfade, windows stay where they are when the pointer moves (only the light follows it, and the room behind leans), and anything with text settles without overshoot.

**Key Characteristics:**
- A drawn cobalt room (Night and Day) behind every page; a still of each is the CSS background without WebGL or scripts.
- Glass windows and ornaments drawn by the room under the HTML, and the hero's name in neon light; CSS glass and CSS neon as the fallback.
- The name in Switzer is the only display voice: neon light in the hero, white text as the home title; the system face sets everything else in white at three levels.
- Concentric radii: phone sheet 40, window 32, side window 28, card 20, list group 16, pill for every control.
- One spring model (response, damping) for materialising, the hero's glide, the tab bubble, sheets, drag and press; no blur on text in motion.
- Every page reads without JavaScript, calms under reduced motion and transparency, and prints on white Letter.

## Colors

A room of navy, cobalt and violet at night and sky blue by day, glass tinted toward that cobalt, white text at three strengths, and the colours of the project screens on the cards.

### Primary
- **Night Glass Cobalt** (`{colors.glass-night}`): the tint mixed into every window and ornament at night (48% for windows and ornaments), so the glass reads as luminous cobalt rather than grey. It is light in a surface, never a flat fill in CSS.
- **Prominent Cobalt** (`{colors.glass-prominent}`): the prominent glass kind (mixed at 46% and brightened by 16%; by day `#3d75ff`). It was the hello's Enter button; since the hero made the title the control, no element carries it, and the shader keeps it for a primary control drawn in glass.
- **The name's neon** (the hero only): the Glowtime colours as light: orange `vec3(1.0, .40, .05)`, hot pink `vec3(1.0, .12, .46)`, magenta `vec3(.88, .12, .92)`, violet `vec3(.52, .20, 1.0)`, electric blue `vec3(.13, .34, 1.0)` and cyan `vec3(.08, .80, 1.0)`; the halo keeps to blue, violet and pink. The colour style turns them a third as far as the room, at three quarters of its vibrance, and holds them inside that arc of hues (YIQ -4 to 196 degrees), so a palette changes which colours lead and never makes them lime or green. The CSS hero takes the same colours, turned the same way, from `--neon-pink`, `--neon-orange`, `--neon-violet`, `--neon-blue` and `--neon-cyan`.
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
- **Ink** (`{colors.ink}`): all primary text, titles, the name as the home title, focus rings, the primary button's fill.
- **Ink 2** (`{colors.ink-2}`, 78%): the second voice. The lede after its first sentence, prose, fact labels, side-window text, tabs at rest, the hero's hint by night.
- **Ink 3** (`{colors.ink-3}`, 71%): the third voice. Dates, notes, captions, table heads, reference numerals, list bullets.
- **Line** (`{colors.line}`, 14%): dividers inside a list group, table rows, the side-window list.
- **Fill** (`{colors.fill}`, 6%), **Fill 2** (`{colors.fill-2}`, 14%) and **Fill 3** (`{colors.fill-3}`, 22%): the three fills on glass. Fill grounds list groups, cards without colour, résumé entries, fact boxes, tables and buttons at rest; Fill 2 is hover, the round icon wells and the wash under an opened experiment; Fill 3 is the current tab's bubble and a hovered close button.
- **Tint** (`{colors.tint}`), **Tint Day** (`{colors.tint-day}`) and **Tint Strong** (`{colors.tint-strong}`): CSS glass only, under a 30px backdrop blur with `saturate(1.7) brightness(.8)`; Tint Day keeps the fallback dark enough over the bright day room; Tint Strong replaces it under reduced transparency.

### Named Rules
**The White on Glass Rule.** Text is white at 100, 78 or 71 percent and nothing else, on glass that caps its own brightness (relative luminance at most 0.22 before the rim and highlights are added), so every level keeps 4.5:1 over the night glass and the bright day room alike.

**The Room Is the Colour Rule.** The site's own saturated colour lives in the room and in the glass tint drawn from it. The only other colour is a project's own, on its card and its figures.

**The Fills Not Glass Rule.** Inside a window, surfaces are white fills (6, 14, 22 percent), never a second layer of glass or a coloured panel.

## Typography

**Display:** the name, "Leonardo Carvalho" in Switzer (Indian Type Foundry, through Fontshare; the variable font self-hosted from `assets/fonts/` under the ITF Free Font License, which allows self-hosting and wordmarks), heavy and blocky with tight tracking. It is the site's one font file.
**Text and Titles Font:** the system UI face (SF Pro Display and SF Pro Text on Apple devices; Segoe UI Variable, Roboto and system-ui elsewhere).
**Manuscript Font:** Iowan Old Style (with Palatino, Georgia): the aducanumab manuscript's own title only.

**Character:** Apple's own voice for everything that is read, set at visionOS weights: bold titles, a medium 500 body that holds up on glass, and semibold 650 controls. The single flourish is the name, set big and heavy in Switzer and traced in neon light in the hero.

### Hierarchy
- **The name in the hero** (Switzer 780, `min(8.2vw, 24svh, 160px)`, line 1, -.03em): about 70% of the viewport's width on one line from 700px wide; under 700px two lines ("Leonardo" over "Carvalho") at `min(18vw, 15svh, 120px)`, line .98. Neon light drawn by the room; CSS neon without it.
- **The name as the home title** (Switzer 700, 46px, 1.04, -.03em; 42px under 900px; 44px on two lines under 700px; 30px on short landscape phones): plain white text, the glyphs the hero lands on.
- **The hint** (500, 14px, Ink 2; by day Ink over a soft dark halo, since the drifting day room can be bright behind it on a phone): "Click the title to proceed", or "Tap the title to proceed" on coarse pointers, centred 32px above the foot of the screen and its safe area.
- **Title** (700, 34px, 1.08, -.012em): the window's title on every page other than home, and each sheet's title. 30px under 900px.
- **Headline** (700, 22px, 1.2, -.008em): section titles inside a window, and side-window titles when they sit inside the main window.
- **Side title** (700, 20px, 1.15, -.005em): the title of a floating side window.
- **Card title** (700, 18px, 1.15): the project name on a card.
- **Lede** (500, 19px, 1.45): the introduction and the contact sentence, max 44em, in Ink 2 with its first sentence bold in Ink. 17px under 900px.
- **Lead** (600, 18px, 1.4): the first-person sentence heading each group of the record, max 34em.
- **Body** (500, 17px, 1.47, +.006em): prose (max 40em), rows, résumé text (16px inside entries), facts at 16px.
- **Control** (650, 15px, line 1): buttons, the All work link, table of contents links; tabs and the close label at 16px.
- **Side text** (500, 15px, 1.36): everything a side window says under its titles and bold lines: list text in Ink 2, side facts, notes and the side rows' second lines. Raised from 14px in round three so the angled window reads at a glance. The clock line ("9:41 AM in Groton") stays a 14px meta line.
- **Meta** (500, 14px): dates, sublines, references, figure captions, the experiments' lines (on a 20px line box).
- **Caption** (500, 13px): card sublines (two lines always reserved), table heads, experiment dates. Nothing on the site is under 12px.
- **Manuscript** (600, `clamp(20px, 2.1vw, 24px)`, 1.3): the manuscript's title on its sheet, max 30em; 15px/1.22 on its card, clamped to three lines.

### Named Rules
**The Name Rule.** The only display type is the name in Switzer: neon light in the hero, white text as the home title. Headings never borrow it, and the system face never goes above the 34px title.

**The One Face Rule.** Everything that is read is the system UI face, the name apart. The serif appears only as the manuscript's own title, on its card and its sheet; the experiments' titles lean in italic at 550 in the same face.

**The Bold Is Ink Rule.** Inside Ink 2 text, a bold phrase is lifted to white at 650. Weight and ink rise together.

## Layout

One room, and on it a main window `clamp(720px, 52vw, 1040px)` wide, 4.5svh from the top, with a height of the viewport less 14svh. Its head carries 30px top and 36px side padding (`{spacing.pad}`); its body scrolls inside the window with 18px above and 110px below, masked to fade over 22px at the top and over the last 78px, so text slides under the toolbar rather than being cut. Wheel and keys anywhere in the room scroll the front window.

Three layout modes, set by script at 1360px and 900px:
- **Desktop (1360px and wider):** one side window `clamp(240px, 20vw, 350px)` wide floats `clamp(40px, 3.4vw, 64px)` right of the main window, 3% down the window's height, at most 94% of it tall (it scrolls past that), turned 24 degrees toward the reader about its near edge, so it projects about 4.5% wider than its box. The tab bar sits 14px off the main window's left edge. The three are one group: the main window moves left of centre by half the difference between the side window's reach (its gap plus its projected width) and the tab bar's 78px, which centres the group's outline and, with it, the visual weight of its three pieces. It stops where the opened tab bar (188px, 14px off the window, 12px from the screen's edge) would no longer fit to the window's left, so under about 1460px the group sits up to 21px right of centre. The room's space has a 120vw perspective from 50% 45%. The pointer moves the light and leans the room a little against it (up to 1.2% across, desktop only); the windows never move with it, as visionOS keeps windows fixed in space.
- **Laptop (900 to 1359px):** the main window centred, the tab bar 14px off its left edge; no side window, its content sections inside the main window, 44px below the rest, with 22px titles. Opened, the tab bar keeps its right edge where the screen has room (from about 1150px); narrower, it keeps 12px from the screen's edge and leans over the window's edge, its backdrop deepened so the window's text stays frosted beneath it.
- **Phone and narrow tablet (under 900px):** the window becomes a full-screen sheet 10px from every edge (plus safe areas) with a 40px radius and 22px padding; the tab bar becomes a floating capsule at the bottom, `min(320px, 100vw - 110px)` wide and 66px tall, icons only, with the color style control beside it as a 66px circle (the capsule sits centred alone when there is no room to colour); the toolbar's actions sit inline in the content; nothing is angled. During the hero the color style control waits in the corner at its 46px desktop size, clear of the hint. Under 700px the title is the two-line name and the avatar is dropped; under 600px the facts stack into one column.

Rhythm inside a window: 44px above each section, 16px under a section head, 30px between record groups, 12px under a lead, 16px between cards (12px on phones), 34px between prose blocks, 40px above a prose h2, 44px above a pager. Cards run four across (three on the Work page's filtered sets), and as many 132px columns as fit under 900px (two on a 360px phone). Sheets sit 44px inside the main window's sides (capped at 920px wide) and 4svh inside its top and bottom.

Scripts off, the room becomes its still, and the window, side window and tab bar stack in one centred column up to 980px wide.

## Elevation & Depth

Depth is the room itself: glass windows at the front, the room behind them, and each window casting a soft shadow into the room. With WebGL2 the room draws every glass surface under its HTML element (marked `data-glass` as window, ornament or prominent) in one composite pass: frost read from the room's mipmaps at about 26 device pixels of blur (one step less for controls), refraction that bends the room inward within 30px of a window's rounded edge (20px for ornaments), a cobalt tint, the brightness cap, a 1px bright rim that is brighter on the side facing the light, a faint glow along the edge, a 300px pool of light near the pointer, and on press a light from within (24%, a spot 7% of the viewport tall, under the pointer). Windows cast a shadow 22px down that reaches 90px at 34%; ornaments one that reaches 40px at 22%. Glass appears and leaves by ramping its lensing and frost, not by fading a box.

Behind a sheet, the parent steps back 4vw (about 3% smaller), its glass dims by 55%, its contents lose half their brightness and a fifth of their saturation and fade out by a quarter of the way back (so the sheet's text and the parent's barely overlap, opening or closing); its toolbar and window bar step away with it. Nothing behind a sheet is blurred: the side window and tab bar stay sharp, only dimmed. The room cannot frost HTML, so the parent's content must fade rather than show through.

Without WebGL2, with scripts off, under reduced transparency or in forced colours, the same elements draw CSS glass: the tint under `blur(30px) saturate(1.7) brightness(.8)`, a 1px gradient rim (72% white at the top left, 5% through the middle, 42% at the bottom right), and a soft shadow. The tab bar always uses CSS glass (22px blur), at every size, because it lies over content: the window's text when it opens, and scrolling content on phones.

### Shadow Vocabulary
- **Window shadow** (drawn by the room: 22px down, reach 90px, 34%; CSS fallback `0 30px 80px rgba(0,0,0,.28), 0 2px 6px rgba(0,0,0,.12)`): every window and sheet.
- **Ornament shadow** (drawn: reach 40px, 22%; the tab bar's CSS glass `0 16px 40px rgba(0,0,0,.28)`): tab bar, toolbar.
- **The halo and the pool behind the name** (the hero only): a Gaussian blur of the letters 40% of the font size wide, lit in blue, violet and pink (breathing over 10s) and leaning up to 5% of the font size toward the pointer; under it the room falls toward near black by night (a soft oval, deepest round the letters) and, by day, about 80% toward a saturated violet-blue that follows the halo and hugs the letters. Hover lifts the light by 22%, a press flares it and it settles back within about 250ms. The CSS hero draws the pool as a dark oval and a `text-shadow` shade hugging the letters.
- **Card lift** (`0 10px 24px rgba(0,0,0,.16)`, hover and focus `0 18px 40px rgba(0,0,0,.24)`): project cards, which sit on the window like objects. The lift deepens; the card does not grow.
- **Card arrow** (`0 6px 16px rgba(0,0,0,.26)`): the white round arrow at a card's top right.
- **Screenshot shadow** (`0 10px 26px rgba(0,0,0,.26)` on a card, `0 14px 34px rgba(0,0,0,.24)` on a sheet figure): a screenshot resting on its colour.
- **Hover light** (`radial-gradient(180px circle at pointer, rgba(255,255,255,.16), transparent 62%)`, plus-lighter; pressed 240px at 30%): cards, rows and buttons marked `data-hover`, the visionOS gaze light (not the experiments, where the Fill 2 wash answers instead).
- **Focus glow** (`outline 2px #fff, offset 3px, box-shadow 0 0 0 6px rgba(255,255,255,.18)`): every focusable element.

### Named Rules
**The One Glass Layer Rule.** Glass is for windows and the controls that float over them. Nothing inside a window is glass: buttons, lists and cards are fills.

**The Legibility Cap Rule.** The glass holds its own brightness down before light is added to its edges, so white text reads whatever the room is doing behind it.

## Shapes

Corners are concentric, larger outside and smaller within: the phone sheet 40px (`{rounded.sheet-phone}`), the main window and sheets 32px (`{rounded.win}`), the side window 28px (`{rounded.side}`), cards, figure tiles and the portrait 20px (`{rounded.card}`), list groups, résumé entries, fact boxes, tables and side-window rows 16px (`{rounded.row}`), table of contents links 12px (`{rounded.inner}`), and every control a full capsule (`{rounded.pill}`): buttons, tabs and their bubble, the toolbar, the phone tab bar, the skip link. The hero's focus ring rounds at .2em, 12px out from the name. The desktop tab bar is a 64px column with a 32px radius, so its ends are round. Screenshots on cards take 9px (14px when tall, a phone screen); sheet figures 10px. The avatar and icon wells are circles.

Borders are almost absent: rows inside a group are divided by the Line, tables by the Line under each row, and the CSS glass rim is a masked gradient, not a border. The window bar is a pill pair of 11px dot and 96px bar at 62% white.

## Components

### The main window (signature)
- A 32px-radius glass window with a head (title and, on home, the name and a 60px round avatar) and a scrolling body masked at both ends. On sheets a 44px round close button (Fill 2, Fill 3 on hover) sits top left, and the head moves 84px right to clear it.
- **Materialise:** from 98.5% scale to rest (8px at most at its corners), opacity ramping 1.4 times faster than the spring, under a critically damped spring (response .5, damping 1).
- **Page change:** the old contents fade out over 140ms (`cubic-bezier(.4, 0, 1, 1)`); the new ones fade in over 220ms rising 6px (`cubic-bezier(.2, .8, .2, 1)`). No blur and no scale. The window itself never leaves, and neither does the side window: its contents crossfade with the window's.

### The side window
- One per page, on the right, holding only what fits beside the window: Home's This fall (with a line for Groton's live time, "9:41 AM in Groton"), Work's In progress (its Experiments moved into the main window, under the cards), Hockey's Measurables then Coach contacts (the Elite Prospects and NCSA rows print with it but are not shown on screen, where the toolbar carries both), About's portrait (cropped to 4:3 while it floats, `object-position: 50% 40%`) and From then Interests, the Résumé's Sections then Contact. Two parts sit 30px apart (44px as sections inside the window).
- 28px radius, 24px by 22px padding, a 20px title, then side rows (a 38px round icon well in Fill 2, 34px in a floating side window, with a 19px stroked icon, a 15px bold line over 15px Ink 2), a divided list (15px Ink 2 under 15px bold lines), facts at 15px, notes at 15px, a table of contents, or the portrait. It arrives turning from 32 degrees to its 24 as it fades in (response .55, damping 1) and fades out over its last 26px.
- **When it holds more than its room** it says so: a slim white capsule (4px wide, 50% white, 72% under the pointer, at least 44px long) runs in a 14px gutter at its right edge, 30px clear of the top and bottom corners. The gutter is kept whether or not it scrolls (`scrollbar-gutter: stable`, 8px of padding beside it), so the text keeps one measure; Firefox draws its own thin scrollbar in the same white. The window is then a tab stop, so the keyboard scrolls it. Its far corner probes are set from the window's width (the scroll box stops at the scrollbar), and the room shifts the glass back down the window's plane by however far it has scrolled, so the glass stays where the window is. In CSS glass its rim is a 1px border (white at 50% on top, 20% right, 34% below, 42% left) instead of the masked rim other panes draw, which the scroller would cut at its scrollbar and carry along as it scrolls.
- **Fit at 1440×900** (content against its 728px room): Home 541, Work 331, Résumé 764 (scrolls 36px), Hockey 778 (scrolls 50px), About 905 (scrolls 177px). At 1680×1050 and wider only About scrolls (59 to 73px).

### Tab bar (ornament)
- A 64px glass column whose right edge sits 14px off the window's left edge, vertically centred on it, 8px padding, 48px tabs with 24px stroked icons (1.7 stroke, round caps). Pointing at it for 120ms widens it to 188px toward the left: its right edge and its icons stay put, and each name slides in beside its icon on the open side (opacity .16s, 6px travel .3s, 60ms delay); it closes 300ms after the pointer leaves. Keyboard focus opens it too. It never covers the window where the screen has room; on laptops under about 1150px it leans over the window's edge, its backdrop deepening from `brightness(.74)` to `(.42)` as it widens so its names keep 4.5:1 over a light card. Its glass is always CSS glass (`data-glass-off`), so it stays true to its box at every width.
- **The bubble:** a Fill 3 pill with a 1px inner top highlight at 32% marks the current tab, moved by a spring (response .45, damping .8) that stretches it along its travel by up to 30% while it moves.
- **Phone:** the floating bottom capsule, icons only, names kept for screen readers, the bubble 60px wide.

### Toolbar and buttons
- **Toolbar:** a glass capsule crossing the window's bottom edge by 28px, 7px padding, 6px gaps, scrolling sideways if it must. On sheets it pages to the neighbouring projects.
- **Button:** a 44px capsule, 18px sides, 650 at 15px, a Fill at rest and Fill 2 on hover (Fill 2 at rest and Fill 3 on hover inside the toolbar); pressing scales to .97 over a .35s ease.
- **Primary:** white with Night Ground text; at most one per toolbar. A pressed filter takes the same white.
- **More link:** a smaller capsule (8px 14px, Fill) beside a section title.
- **Window bar:** under the window, drags up to about 40px with rubber-band resistance and springs home (response .5, damping .7).

### The hero
- **The name** is a real `<button>` ("Leonardo Carvalho. Enter the portfolio") holding the name as text, centred at 45% of the screen's height. With the room it is transparent text, the control and the layout the light is drawn from; Enter, Space or a click activates it, and Return anywhere on the hero does too. Its focus ring is the site's white 2px ring, 12px out, rounded at .2em.
- **The neon:** the room draws the name from a mask (the letters; a soft copy, a blur 2.4% of the font size, whose half level is their outline and whose log-odds give the distance from it; and a blur 40% of it for the halo and the pool), seven reads a pixel, only inside the name's box:
  - **The tube:** one crisp band of light about 4% of the font size wide, centred on the letters' true edge, with a white-hot core and its red and blue a hair apart (the split turns in 16s). Its colour flows along the name through the ramp (a cycle in 14s, through a warp of 15s and 19s), with a wide stretch of orange.
  - **The echoes:** three thin traces of the outline, each read at an offset that drifts 2% to 2.6% of the font size (periods 10.5s to 19s) and at a level that breathes in and out of the edge: pink to magenta about 1.2 softnesses inside, orange 1.25 outside, blue to cyan 0.55 outside, so they cross the tube. Each fades by up to 45% as it strays, so the name never reads double, and where light piles up it spills into every channel and burns toward white on a soft tone curve (1 - e^-x).
  - **The turns:** the traces take turns being brightest, a 16s cycle sliding along the name a quarter apart for each, each wandering from its turn on its own 10s to 19s wave.
  - **The faces** are translucent violet light, lit a little by the tube's colour; the halo and the pool are under Shadow Vocabulary.
  - **The arrival:** the echoes' drift, level and strength grow with the light, so they come out of the outline as it arrives and fold back into it as it goes. The light runs on the room's clock from a moment chosen with orange and at least two traces showing, which is also the one still under reduced motion; the room draws at full rate while the hero shows, unless its budget has tripped (then its clock stops and the light holds).
- **The hint** below it (see Typography) proceeds when clicked, without being a tab stop.
- **Without the room** (no WebGL2) the same text is CSS neon over the hero's own copy of the room's still: a dark oval and a `text-shadow` shade hugging the letters (violet-blue by day); two traces of the name (a stroke under a black fill, `paint-order: stroke fill`, screened) on orbits of .024em and .022em (13s and 17s), each a pink and orange (or blue and cyan) pair crossfading over 11s and 15s; light translucent faces, a gradient of the colours clipped to the letters with a soft violet glow, and a second face crossfading over them in 16s; and a white-hot line on the edge. Every copy of the name lives in an `aria-hidden` span (or, inside the button, is generated content with empty alt text), so the name is read once. Only transform and opacity animate. Reduced motion holds it still; reduced transparency gives solid letters (white; by day deep navy `#142a85` on a soft light halo); forced colours give system text. Entering is a fade. Without scripts there is no hero.

### Cards (projects on their own screens' colours)
- 20px radius, 4 to 5.3 aspect, the project's colour as the ground, the card lift shadow. A screenshot sits 8% in from the sides and 10% from the top (a phone screen 26% in, 9:17), with the name at 700 18px and a two-line 13px subline at 82% opacity pinned to the foot. The manuscript card is a page: its title in the serif over three grey rule lines, kept 30px clear of the top right corner for the arrow.
- **The settle (hover and keyboard focus):** the card's frame stays still. What it shows (the screenshot, a drawing, the manuscript page) rests at 1.05 inside its rounded frame and settles to 1 over 800ms on the long ease. A 32px white round arrow (the primary button's white, a 16px Night Ground glyph, its own small shadow, no glass) sits 12px in from the top right: it grows from .8 while it turns from 45 degrees to 0 and fades in, over 450ms. The subline goes from 82% to full over 450ms, the lift deepens, and the visionOS light follows the pointer. Press .98. Focus adds the white ring and its glow.
- **Touch** (no hover, or a coarse pointer) shows the arrow at rest and the screen at its size. **Reduced motion** keeps only the opacity: the arrow fades in, nothing scales or turns. Print drops the arrow.
- **Images:** card screenshots ship a 320px derivative beside the 640 and 960 (or 720) ones, with `sizes="(min-width: 1385px) calc(10.9vw - 25px), (min-width: 900px) 126px, (min-width: 340px) 142px, 216px"`, the screenshot's real width: 132px at 1440, so the 320 serves 1440 and 390 at 1× and 2×, and the 640 serves a 320px phone at 2× and 1920 at 2×.

### Lists (visionOS list groups)
- A Fill ground at 16px radius, rows divided by the Line, each row a two-column grid (title, then a nowrap 14px tabular date in Ink 3), 13px 16px padding; a row can carry a 14px Ink 3 subline. Hover lays a Fill over the row and the hover light.
- **A row under the pointer or the keyboard** (the record, the contact links, the side windows' link rows): its title leans 4px to the right over 450ms on the long ease, its date comes up to full ink over 450ms, and the rest of its list group steps back to 55% over 400ms. Other groups stay. Nothing blurs. Reduced motion keeps the date and the dim, without the lean; touch has none of it.
- **Experiments** (one component, `ul.rows.exp`, the same list on Home and on Work): each row is its title in italic at 550 with its 13px date, and its line beneath them, spanning both columns (14px Ink 3 on a 20px line box, 2px under the title). At rest, on screens 900px and wider with a fine pointer and scripts, the line is folded away. Pointing at a row, or focusing it, unfolds the line (`grid-template-rows: auto 0fr` to `auto 1fr`, 500ms on the long ease) while it fades in (350ms), raises a Fill 2 wash under the row (500ms), brings its line and date to full ink (Ink 3 would fall to about 3.5:1 on the brighter wash; white keeps 5:1, Night and Day), and dims the other rows to 35% (300ms). The wash replaces the pointer's light on these rows, which on top of it would take white text under 4.5:1. The title never moves. While the pointer is over the list it decides which row is open; otherwise the focused row is. The list takes the opened line into the space below it (its bottom margin goes from 0 to -22px on the same curve and timing), so nothing after the list moves and the window's scroll height stays the same; moving from one row to the next swaps the two lines in step. Touch screens, phones, reduced motion, scripts off and print show every line at rest. Add one by copying an `<li>` into both lists.
- **Résumé entries:** separate Fill cards (15px 18px, 10px apart), a 650 17px head with its date right, a 14px Ink 3 subline, 16px Ink 2 text and bullets as 5px Ink 3 dots.

### Sheets' furniture
- **Facts:** a label column in Ink 2 and values in Ink, 10px by 24px gaps; boxed on a Fill at 16px radius, 18px by 20px padding. One column under 600px.
- **Tables:** 15px tabular, right-aligned except the first column, Line under each row, heads in Ink 3 at 13px, a caption beneath at 13.5px, inside a Fill wrapper at 16px radius that scrolls sideways.
- **Figures:** the image on its project colour tile (20px radius, `clamp(16px, 3vw, 28px)` padding), caption 10px below in Ink 3 at 14px.
- **References:** a numbered list at 14px in Ink 2 with Ink 3 numerals in a 26px column.
- **Links in text:** white, underlined 1px at 45% white, 3px offset; the underline goes white on hover.

### Motion (one spring model)
- Every geometric motion is a spring given as a response (seconds) and a damping ratio, stepped at 4ms substeps in the shared frame loop, which runs the springs first, then whatever reads their layout, then the room, so the glass is drawn where its window is in that same frame. Anything carrying text is critically damped: windows .5 / 1, the side window .55 / 1, ornaments .45 / 1, a sheet's parent stepping back .5 / 1, the pointer light .6 / 1 and the room's lean .9 / 1. The tab bubble (.45 / .8) and the window bar (.5 / .7) carry no text and may overshoot a little; press light .3 / 1.
- **The motion rules:** text never blurs while it moves and content never moves on its own; blur belongs to the room. UI transitions run 150 to 300ms with at most about 8px of travel; bigger motion only answers the reader's own action (the hero's glide). Where several things move they stagger by 40 to 80ms.
- **The hero's arrival:** the light, the halo and the pool come up together on a critically damped spring (response .8, about 0.9s), the echoes growing out of the outline with them; the hint follows from .75s over .5s. Then the light keeps moving on periods of 10s to 19s, slowly, while the letters stay put.
- **Entering:** on the click the hint fades (120ms) and the room pulls focus (1 / 1); the name glides on one critically damped spring (response .65, about 0.7s, no overshoot), its size in log space, its weight from 780 to 700 and its colour to white (white within about 0.2s), while the light goes out as (1 - v)³, the echoes folding back into the letters and the pool lifting with it, redrawn at screen resolution every frame and read after the window has moved, so it never trails its slot. The main window's glass forms under it at once (from 98.5% scale); its contents fade in (240ms) once the name is within about half a line of its slot, then the side window (+60ms), the tab bar (+120ms) and the toolbar and window bar (+180ms). Landed, the name hands off: the HTML title fades in over the identical glyphs (150ms), then the ink goes from under it (100ms), and the effect is switched off.
- **CSS micro-motion** uses one curve, `cubic-bezier(.16, 1, .3, 1)`: the tab bar's width (.42s), button and card press (.35s), the hero's hint (.5s).
- **Hovers that move content inside a still frame** use the long ease, `cubic-bezier(.22, 1, .36, 1)` (`--ease-long`), over 450 to 800ms, which covers most of the way in the first 100ms and then settles: the card's settle (800ms) and its arrow (450ms), a row's lean (450ms), an experiment opening (500ms). The frame (the card, the list group, the window) never moves; what steps back dims and never blurs. These are reveals answering the pointer, so they are longer than arrivals, which stay 150 to 300ms with at most 8px of travel.
- **Reduced motion:** no glide, focus pull, lean, drift or springs; the hero's name is there at once and entering, page changes and sheets are 150ms crossfades (or none); the room does not redraw while nothing moves. Hovers keep only colour and opacity: no settle, no turning arrow (it fades in), no row lean, and every experiment shows its line at rest.

## Do's and Don'ts

### Do:
- **Do** let the name be the display voice: Switzer in neon light in the hero, white text as the home title, with scripts off and in print (The Name Rule).
- **Do** keep text white at 100, 78 or 71 percent on glass, and let the glass cap its own brightness (The White on Glass Rule).
- **Do** put surfaces inside a window on the three fills (6, 14, 22 percent) and keep glass for windows and the controls that float over them (The One Glass Layer Rule).
- **Do** keep corners concentric: 40, 32, 28, 20, 16, 12 and the capsule for controls.
- **Do** move geometry with springs given as response and damping, in the same frame as the glass, and give reduced motion 150ms crossfades.
- **Do** give a project card its own screen's colour, with its screenshot resting on it.
- **Do** turn the side window toward the reader as a resting position, keep it in place across page changes, and turn it in from a little further round (32 degrees) when it first arrives.
- **Do** keep every page readable with scripts off, under reduced transparency (CSS glass at 84% tint), in forced colours, and in print.

### Don't:
- **Don't** put glass inside glass: no frosted panel, card or button inside a window.
- **Don't** tint text or headings; colour belongs to the room, the glass and a project's card.
- **Don't** set a heading in a script or a display face, or set the system face larger than the 34px title.
- **Don't** tilt or grow anything in response to hover; the side window's angle is its place in the room, and hover answers with light and with content settling inside a still frame.
- **Don't** blur text or a window's contents while they move, and don't move windows with the pointer: blur and lean belong to the room behind. What steps back (a row's group, the other experiments, a sheet's parent) dims; it never blurs.
- **Don't** fade a sheet's parent through its glass without fading its contents; the room cannot frost HTML.
- **Don't** put a small label above a title or section heading; the title carries itself.
- **Don't** use tween durations for window, bubble or sheet motion; those are springs.
