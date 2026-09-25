---
name: Leonardo Carvalho, fourth edition
description: A dim room with one lit window; his name, four coloured screens, experiments that open when you reach for them, and a record in first person.
colors:
  bg: "#0d0d0f"
  ink: "#f2f2f2"
  ink-2: "rgba(242, 242, 242, .64)"
  ink-3: "rgba(242, 242, 242, .56)"
  hair: "rgba(242, 242, 242, .1)"
  well: "rgba(242, 242, 242, .06)"
  red: "#e03a52"
  paper: "#f2efe8"
  paper-ink: "#1d1d1f"
  loquar-gold: "#CDAA6D"
  genuvalens-blue: "#1E63A8"
  ocapex-sand: "#E4C4A2"
  wash-green: "#4FB477"
  wash-violet: "#8B6CF0"
  glass: "rgba(16, 16, 16, .72)"
  frame-line: "rgba(242, 242, 242, .28)"
  dot-red: "#f46b5d"
  dot-amber: "#f9bd4e"
  dot-green: "#57c353"
  device-body: "#1d1d1f"
  device-bar: "#2b2b2e"
  screen-black: "#000000"
  light-white: "#ffffff"
  glare: "rgba(255, 255, 255, .8)"
  mac-light-red: "#ff5f57"
  mac-light-amber: "#febc2e"
  mac-light-green: "#28c840"
typography:
  display:
    fontFamily: "Switzer, system-ui, -apple-system, 'Segoe UI', Helvetica, Arial, sans-serif"
    fontSize: "clamp(44px, 6.6vw, 96px)"
    fontWeight: 600
    lineHeight: 0.94
    letterSpacing: "-0.035em"
  intro:
    fontFamily: "Switzer, system-ui, sans-serif"
    fontSize: "clamp(17px, 1.45vw, 20px)"
    fontWeight: 400
    lineHeight: 1.5
    letterSpacing: "-0.012em"
  wordmark:
    fontFamily: "Switzer, system-ui, sans-serif"
    fontSize: "clamp(88px, 17vw, 250px)"
    fontWeight: 600
    lineHeight: 0.84
    letterSpacing: "-0.06em"
  headline:
    fontFamily: "Switzer, system-ui, sans-serif"
    fontSize: "clamp(32px, 4vw, 44px)"
    fontWeight: 600
    lineHeight: 1.02
    letterSpacing: "-0.035em"
  accent-italic:
    fontFamily: "'Instrument Serif', 'Iowan Old Style', Georgia, serif"
    fontSize: "1.06em"
    fontWeight: 400
    letterSpacing: "-0.005em"
  index-italic:
    fontFamily: "'Instrument Serif', 'Iowan Old Style', Georgia, serif"
    fontSize: "clamp(28px, 3.4vw, 48px)"
    fontWeight: 400
    lineHeight: 1.05
    letterSpacing: "-0.02em"
  paper-title:
    fontFamily: "'Instrument Serif', 'Iowan Old Style', Georgia, serif"
    fontSize: "clamp(24px, 2.1vw, 30px)"
    fontWeight: 400
    lineHeight: 1.1
    letterSpacing: "-0.01em"
  title:
    fontFamily: "Switzer, system-ui, sans-serif"
    fontSize: "22px"
    fontWeight: 600
    lineHeight: 1.2
    letterSpacing: "-0.02em"
  section-h2:
    fontFamily: "Switzer, system-ui, sans-serif"
    fontSize: "20px"
    fontWeight: 600
    letterSpacing: "-0.02em"
  lead:
    fontFamily: "Switzer, system-ui, sans-serif"
    fontSize: "18px"
    fontWeight: 600
    lineHeight: 1.4
    letterSpacing: "-0.015em"
  body:
    fontFamily: "Switzer, system-ui, sans-serif"
    fontSize: "16px"
    fontWeight: 400
    lineHeight: 1.5
    letterSpacing: "-0.01em"
  meta:
    fontFamily: "Switzer, system-ui, sans-serif"
    fontSize: "14px"
    fontWeight: 400
    lineHeight: 1.45
    letterSpacing: "-0.01em"
  index-number-italic:
    fontFamily: "'Instrument Serif', 'Iowan Old Style', Georgia, serif"
    fontSize: "20px"
    fontWeight: 400
  clock:
    fontFamily: "'JetBrains Mono', ui-monospace, SFMono-Regular, Menlo, monospace"
    fontSize: "13px"
    fontWeight: 500
    lineHeight: 1.5
    letterSpacing: "0"
rounded:
  tile: "44px"
  win: "24px"
  frame: "16px"
  btn: "12px"
  pill: "999px"
  bar: "2px"
spacing:
  hair: "4px"
  xs: "8px"
  sm: "12px"
  md: "16px"
  lg: "24px"
  xl: "32px"
  2xl: "40px"
  tile-row: "64px"
  group: "80px"
  section: "176px"
  section-compact: "112px"
  gutter: "clamp(20px, 5vw, 56px)"
  measure: "640px"
  wrap: "1200px"
components:
  pill-nav:
    backgroundColor: "rgba(242, 242, 242, .05)"
    textColor: "{colors.ink-2}"
    rounded: "{rounded.pill}"
    padding: "4px"
    typography: "{typography.meta}"
  pill-nav-item:
    textColor: "{colors.ink-2}"
    rounded: "{rounded.pill}"
    padding: "9px 18px"
  pill-nav-item-hover:
    textColor: "{colors.ink}"
  pill-mark:
    backgroundColor: "rgba(242, 242, 242, .08)"
    textColor: "{colors.ink}"
    rounded: "{rounded.pill}"
  window:
    rounded: "{rounded.win}"
    padding: "8px"
  window-frame:
    backgroundColor: "{colors.glass}"
    rounded: "{rounded.frame}"
  window-body:
    padding: "112px 72px 64px"
    height: "548px"
  tile:
    backgroundColor: "{colors.well}"
    rounded: "{rounded.tile}"
    padding: "48px"
    height: "560px"
  tile-paper:
    backgroundColor: "{colors.paper}"
    textColor: "{colors.paper-ink}"
    rounded: "{rounded.tile}"
    padding: "40px"
  tile-loquar:
    backgroundColor: "{colors.loquar-gold}"
    rounded: "{rounded.tile}"
  tile-genuvalens:
    backgroundColor: "{colors.genuvalens-blue}"
    rounded: "{rounded.tile}"
  tile-ocapex:
    backgroundColor: "{colors.ocapex-sand}"
    rounded: "{rounded.tile}"
  tile-go:
    backgroundColor: "{colors.bg}"
    textColor: "{colors.ink}"
    rounded: "{rounded.btn}"
    size: "32px"
  experiment-row:
    textColor: "{colors.ink}"
    padding: "26px 0"
    typography: "{typography.index-italic}"
  experiment-wash:
    rounded: "{rounded.win}"
  row:
    textColor: "{colors.ink}"
    rounded: "{rounded.btn}"
    padding: "11px 12px"
  interest-well:
    backgroundColor: "{colors.well}"
    rounded: "{rounded.win}"
    padding: "22px 24px"
  preview:
    rounded: "{rounded.win}"
    width: "280px"
  email-link:
    textColor: "{colors.red}"
  portrait:
    rounded: "{rounded.btn}"
    size: "72px"
  avatar:
    rounded: "{rounded.win}"
    size: "88px"
  skip-link:
    backgroundColor: "{colors.ink}"
    textColor: "{colors.bg}"
    rounded: "{rounded.btn}"
    padding: "8px 12px"
---

# Design System: Leonardo Carvalho, fourth edition

## Overview

**Creative North Star: "One Lit Window"**

One person in a dim room, lit by one screen. The ground is near-black under a film of fine animated static, with a single soft light falling from the top of every page and a progressive blur where the room meets the bottom of the screen. Into that room the home page sets one glass-barred window that introduces him by name, with one plain line about what he does, his portrait and a live clock; everything after it is the record: four colour tiles in the colours of the screens they hold, an italic index of small experiments that open when you reach for them, five sentences over dated rows beside interests and Now, and a giant wordmark to close. The other ten pages are sheets: one 640px column in the same room, same menu, same light, same type. Pages change by cross-fading in place: the old page steps back and softens, the new one rises, the menu holds still and the current tab's mark slides to its new tab.

The material is glass, grain and light rather than paper and card. Depth comes from blur, alpha and light (a pointer-following radial inside the window, a glare line under its bar, glowing dots, a colour wash behind an opened experiment), not from borders or drop shadows on content. Colour is rationed: one white at three strengths does all the reading, hairlines sit at 10% white, one red marks the email, and saturated colour appears only where a real screen supplies it or as a soft wash of light behind an experiment. Hover changes geometry and light (a screen settles to size, an arrow grows in and turns, a title leans in, the rest of a list steps back), never a tilt.

Density is generous everywhere: 176px between sections, 80px between record groups, 64px between tile rows. No numbers stand on the landing; they wait on the pages that explain them. The build refuses the hero slogan, a stat wall, buttons, and the card grid.

**Key Characteristics:**
- Ground #0d0d0f under 10% static, one grain per CSS pixel, a new field every frame; a top radial light on every page; an eight-layer progressive blur on the bottom edge that fades out as the page ends.
- The hero is his name in Switzer 600 with the three-layer glow, then a 20px introduction whose first sentence is in full ink.
- Colour from real screens (paper, gold, blue, sand) and, as light only, two wash colours for experiments; one red for the email.
- Radii 44 / 24 / 16 / 12 / pill; one long soft object shadow, plus the window's own and two small lifts.
- One reveal grammar on the `translate` property (rise and fade, 850ms), cascading in reading order; hover settles, leans and dims; nothing tilts.
- Cross-document view transitions between pages with a fade fallback; every page reads without JavaScript, rests under reduced motion, and prints white.

## Colors

A near-black ground, one white at three alphas, one red, four colours borrowed from the screens the work lives on, and two wash colours used only as light.

### Primary
- **Signal Red** (`{colors.red}`): the only accent the room owns. It carries the email address in the contact sentence, the favicon stroke, and the text-selection wash at 45%. It never fills a surface.

### Secondary (screen colours and washes)
- **Loquar Gold** (`{colors.loquar-gold}`): the Loquar tile and its row preview. Set as `--tile` inline on the tile; the tile's colour is the product's, not the site's.
- **Genuvalens Blue** (`{colors.genuvalens-blue}`): the Genuvalens tile and preview, holding a white page.
- **OCAPEX Sand** (`{colors.ocapex-sand}`): the OCAPEX tile and preview, holding a phone.
- **Paper** (`{colors.paper}`) with **Paper Ink** (`{colors.paper-ink}`): the aducanumab tile, the one tile without a screen, set as the manuscript's first page.
- **Wash Green** (`{colors.wash-green}`) and **Wash Violet** (`{colors.wash-violet}`): with the four colours above, the light behind an opened experiment, set per item as `--c` and mixed at 36% and 14% into two radial gradients. Never a fill at strength.

### Neutral
- **Ground** (`{colors.bg}`): the html background, the theme colour, the tile arrow's fill, the skip link's text, and the colour the bottom edge fades toward.
- **Ink** (`{colors.ink}`): all primary text, focus outlines, the active tab's glowing bar, the tile arrow's stroke, the first sentence of the introduction, a hovered row's date.
- **Ink 2** (`{colors.ink-2}`, 64%): the second voice. The introduction after its first sentence, body copy inside record groups, captions, deks, experiment descriptions, facts terms, table headers, menu links at rest, row dates at rest.
- **Ink 3** (`{colors.ink-3}`, 56%): the third voice. The clock's place name, the scroll arrow, footers, the experiments' index numerals at rest, reference markers.
- **Hair** (`{colors.hair}`, 10%): every divider: list rows, the experiments' rules, table rows, facts, the This fall list, footer rules, the close line.
- **Well** (`{colors.well}`, 6%): a wash, not a card. The interest wells and the default tile ground.
- **Glass** (`{colors.glass}`) and **Frame Line** (`{colors.frame-line}`, 28%): the window's inner frame fill and its one visible border.
- **Window Dots** (`{colors.dot-red}`, `{colors.dot-amber}`, `{colors.dot-green}`): the three glowing dots in the window's bar, each throwing a 20px glow in its own colour.
- **Device chrome** (`{colors.device-body}`, `{colors.device-bar}`, `{colors.screen-black}`): the drawn Mac, iPhone and tablet that hold screenshots.

### Named Rules
**The Borrowed Colour Rule.** Saturated colour enters the room only as the colour of a real screen or object being shown (a product's colour on its tile, a photograph inside a device), or as a soft wash of light behind an opened experiment. The site's own palette is ground, ink at three strengths, hairline, well and one red.

**The Three Voices Rule.** Text is set in Ink, Ink 2 or Ink 3 and nothing else. Hierarchy is carried by alpha and size, never by a fourth grey or a coloured heading.

**The Red Is a Mark Rule.** Red appears on words and strokes, at most a few per screen: an address, a selection. It never fills a button, a tile, or a background.

## Typography

**Display Font:** Switzer variable (with system-ui, Helvetica, Arial)
**Body Font:** Switzer variable (same face; the whole site reads in one family)
**Accent Font:** Instrument Serif italic (with Iowan Old Style, Georgia): one phrase per sheet title or dek, the paper tile's title, and the experiments' titles
**Mono Font:** JetBrains Mono (with ui-monospace, Menlo): the clock only

**Character:** A tight grotesk at 600 for everything that must be read, tracked in as it grows (-.01em at body to -.06em on the wordmark), with a single serif italic phrase on sheet titles set about 6% larger than its neighbours so it reads as the spoken emphasis. The hero is his name, set plainly, with no italic flourish. All three faces are self-hosted latin subsets; no third-party requests.

### Hierarchy
- **Display** (600, `clamp(44px, 6.6vw, 96px)`, 0.94, -.035em): "Leonardo Carvalho" in the window, balanced, with the three-layer glow. One line from about 900px up, two below. Home only.
- **Intro** (400, `clamp(17px, 1.45vw, 20px)`, 1.5, -.012em): the line under the name, max 32em, in Ink 2 with its first sentence in Ink. Home only.
- **Wordmark** (600, `clamp(88px, 17vw, 250px)`, 0.84, -.06em): "Leonardo" at the close, at 96% opacity with a faint upward halo, nowrap. Home only.
- **Headline** (600, `clamp(32px, 4vw, 44px)`, 1.02, -.035em): every sheet's title, balanced, max 18em, with the small upward halo and one italic phrase.
- **Index italic** (400, `clamp(28px, 3.4vw, 48px)`, 1.05, -.02em): the experiments' titles in Instrument Serif, lowercase; the numerals beside them are serif italic at 20px in Ink 3, Ink when opened.
- **Paper title** (400, `clamp(24px, 2.1vw, 30px)`, 1.1, -.01em): the manuscript title on the paper tile, in Instrument Serif italic in Paper Ink, balanced.
- **Accent italic** (400, 1.06em in sheet titles and deks): the one serif phrase, in Ink.
- **Title** (600, 22px, 1.2, -.02em): section titles on the home page (Work, Experiments, Interests, This fall), with an optional 14px 400 subtitle in Ink 2 below (max 52ch). Sheet prose h2 is the same voice at 20px.
- **Lead** (600, 18px, 1.4, -.015em): the five first-person sentences that head each record group and the contact sentence; max 34em (30em for contact), pretty-wrapped. Sheet deks are 18px at 400 in Ink 2.
- **Body** (400, 16px, 1.5, -.01em): prose, rows, tile captions, experiment descriptions when opened, interest names. Measure 640px on sheets.
- **Meta** (400, 14px, 1.45, -.01em): dates on rows, captions, facts, tables, references, footers, menu and pill text, experiment descriptions on touch screens, the paper tile's subtitle.
- **Clock** (500, 13px, mono): the live Groton time, place name above in Ink 3, time in Ink.

### Named Rules
**The One Word Rule.** Each sheet's title or dek carries exactly one phrase in Instrument Serif italic, set slightly larger than the surrounding Switzer. The serif never sets a sentence of body copy or a label; its other homes are the paper tile's title and the experiments' titles. The hero, being his name, carries none.

**The Mono Is Data Rule.** JetBrains Mono appears only where the content is a reading: the clock. Never for prose, headings, labels or navigation.

**The Tighter As It Grows Rule.** Tracking tightens with size: -.01em at 14 to 20px, -.02em at 20 to 22px, -.035em at 44 to 96px, -.06em on the wordmark. Nothing on the site is set below 13px.

## Layout

One centred column of 1200px (`{spacing.wrap}`) with a fluid gutter of `clamp(20px, 5vw, 56px)` for the home page; sheets narrow to a 640px measure (`{spacing.measure}`) plus the same gutters. The menu is a three-column grid (name, pill, links) with 32px above it (24px at 700px and below); the window sits 56px under the menu (36px below 900px) and its body carries 112px top, 72px sides, 64px bottom padding with a 548px minimum height.

Vertical rhythm on the home page runs in large steps: 176px above each section (`{spacing.section}`, 112px below 900px), 80px between record groups, 72px above the This fall heading, 176px above the close. Inside blocks the steps are 40px under a section title, 64px between tile rows and 40px between tile columns, 20px from tile to caption, 28px from name to introduction, 64px from introduction to status, 16px under a lead sentence, 32px above the contact rows, 11px row padding, 26px experiment padding. Sheets open 104px below the menu, put 40px above prose, 48px above each prose h2, 32px around figures and the facts list, 64px above the pager and 88px above the footer.

Grids as built:
- **Tiles:** three tracks of 37fr / 26fr / 37fr with 64px row and 40px column gaps; items alternate small then large per row (1 | 2-3, then 1-2 | 3), so each row reads 37/63 and the next 63/37. Single column below 900px with a 4:5 aspect and 56px gaps.
- **The record:** 7fr / 5fr with a 128px column gap from 900px up; the right column is sticky (by its top when it fits the screen, by its bottom when it does not); stacked below 900px with 88px between columns. Rows bleed 12px into the gutter on both sides.
- **Interests:** two columns with 14px gaps; one column at 520px and below.
- **Facts:** an 8em term column (6.5em at 480px and below), 24px column gap, 8px row gap.

Breakpoints are 900px (the structural one), 700px (menu collapses to two rows with the pill on the second; the bottom edge shortens to 88px; the close line stacks), 520px and 480px (single-column interests, narrower facts terms). Below 900px the window drops its minimum height and scroll arrow, pads 56px / 24px / 96px, and the clock moves to the bottom-left. Tables scroll horizontally inside a wrapper that bleeds into the gutter; the experiments section clips sideways so its wash can never cause horizontal scroll.

## Elevation & Depth

Depth is made of light, blur and alpha, with one soft shadow reserved for objects. Content surfaces (rows, tiles, tables) carry no shadow; they are washes of white at 6% or a flat product colour. The window is the exception and is built like glass: a 28% white hairline, a 72% dark fill under a 20px backdrop blur, a bar with a horizontal light gradient peaking at 50% white with a glare line under it, and a pointer-following radial highlight on the outer ring and inside the body. The menu's pill is the same glass at smaller scale (5% fill, 10% border, 15px blur). A fixed canvas of static at 10% opacity, normal blend, one grain per CSS pixel, sits above everything; a radial light at 13% white falls from the top edge of every page to 80vh.

**The bottom edge** is a fixed 120px band (88px at 700px and below) of eight stacked backdrop blurs (.3, 1.3, 2.8, 5, 7.8, 11.3, 15.3 and 20px), each masked to begin 8.75% lower than the last and each taking a little colour out (`saturate(.85)`, compounding to about a quarter at the foot), over a fade to the ground that starts clear at the band's top edge (55% ground at 45%, 92% at the foot). Content, and above all a bright colour tile, sinks into the room at the foot of the screen instead of blooming into a halo; text is blurred, not cut by a line. Neiden's own band saturates by 1.2 per layer, which suits a white page and glows on a dark one; this is its inverse. The script fades the band out as the page runs out (opacity = remaining scroll / 160px), so the last lines are never blurred. It is hidden under reduced transparency, increased contrast, and in print.

### Shadow Vocabulary
- **Object shadow** (`box-shadow: 0 54px 60px rgba(0, 0, 0, .35)`, `--shadow`): the one shadow of the system. Under drawn devices, the white page inside tiles, and row previews.
- **Window ring** (`box-shadow: inset 0 0 8px rgba(0,0,0,.4), 0 0 60px rgba(0,0,0,.2), 0 30px 120px rgba(0,0,0,.8)`) and **Window frame** (`inset 0 0 10px rgba(0,0,0,.1), 0 0 12px rgba(0,0,0,.4)`): the window's own; not reused.
- **Text glow** (`text-shadow: 0 5px 10px rgba(0,87,255,.15), 0 -5px 10px rgba(255,90,0,.10), 0 -5px 25px rgba(255,255,255,.30)`, `--glow`): the display name only. Cool below, warm above, a white halo.
- **Title halo** (`text-shadow: 0 -2px 10px rgba(255,255,255,.12)`): sheet titles and the wordmark; a faint upward light.
- **Dot glow** (`box-shadow: 0 0 20px 2px <dot colour>`): each of the window's three dots glows in its own colour; the active tab's 24x3px bar glows white (`0 2px 25px 2px #fff`).
- **Lift** (`0 16px 32px rgba(0, 0, 0, .35)`): an interest well while it is lifted under the pointer, and only then.
- **Small lifts** (`0 8px 20px rgba(0,0,0,.25)` on the tile arrow, `0 10px 25px rgba(0,0,0,.15)` on the pill): recorded as built; small objects over a surface, not a second scale to extend.

### Named Rules
**The Light Not Shadow Rule.** Depth on content is made with alpha washes, hairlines and blur. Drop shadows belong to objects (devices, pages, previews, the window) and to a well only while it is lifted; never to rows, tiles or text blocks at rest.

**The Glow Is the Name Rule.** The three-layer glow exists for the display name. Other large type gets at most the faint title halo.

## Shapes

Five radii, nested by scale: 44px for tiles (`{rounded.tile}`), 24px for the window's outer ring, interest wells, the sheet avatar, row previews and the experiments' wash (`{rounded.win}`), 16px for the window's inner frame (`{rounded.frame}`), 12px for rows, the portrait, the tile arrow, the skip link, the drawn Mac and the white page (`{rounded.btn}`), and a full pill for the menu, its items and the current tab's mark (`{rounded.pill}`). Dots are circles. Drawn devices use proportional radii (`22% / 10.2%` for the phone body, `18% / 8.4%` for its screen, `6.5% / 8.6%` and `3.2% / 4.2%` for the tablet) so they hold their silhouette at any width; the phone's notch is a full-radius black bar 34% wide. The row preview springs in from a 99px radius and settles at 24px.

Borders are hairlines at 10% white and appear only as horizontal rules (list rows, the experiments, table rows, facts, the This fall list, footers) and on the two glass surfaces (window frame at 28%, pill at 10%); the paper tile's running head has its own hairline at 14% paper ink. Nothing else is outlined. Tiles and wells clip their contents (`overflow: hidden`) and keep their radius. Nothing on the site rotates on hover. Drift noted: the active tab's indicator bar uses a one-off 2px radius, and the 12px, 16px and 24px values are written as literals in several places rather than through the tokens.

## Components

### Navigation (menu and frosted pill)
- **Style:** three-column grid at the top of every page, 14px Switzer. Name at left at 600; Résumé and Email at right in Ink 2 with a 12px stroked arrow (1.8 stroke, round caps).
- **Pill:** a glass capsule (5% white fill, 10% border, 15px backdrop blur, 4px padding, full radius) holding three links at 500 weight, 9px 18px padding, Ink 2.
- **Hover:** links go to Ink over 300ms; the arrow translates 2px up-right on the site ease.
- **Current:** the current tab carries its own mark element (an 8% white pill with a 24x3px white bar floating 7px above it, glowing), named for view transitions so a page change slides it from the old tab to the new one over 560ms. Work is current on the home page and the work pages; Hockey and About on theirs; on the résumé, the Résumé link in the right-hand group is lit to Ink instead.
- **Mobile (700px and below):** name and right links share row one; the pill drops to row two, left-aligned.
- **Under contrast or reduced-transparency preferences:** the blur is dropped and the pill fills `#141416`.

### The Window (signature)
- The hero and only instance. Outer ring: 24px radius, 8px padding, a radial 18% white highlight centred at `--mx/--my` (defaults 50% / 0%; the script eases the pointer position in at 6% per frame and clamps `--my` between -20% and 60%). Inner frame: 16px radius, 28% white border, 72% dark glass with 20px blur, clipped. Bar: 40px tall, horizontal light gradient (10% to 50% to 10% white), 40px blur, a 1px glare line at the bottom, three 12px dots glowing red, amber and green. Body: 112px / 72px / 64px padding, a second pointer-following radial at 8%, then the name, the introduction 28px below, and a status line 64px below that (72px portrait at 12px radius, two stat blocks with 18px stroked icons and a 600 heading over Ink 2 text), the mono clock pinned bottom-right, and a bobbing scroll arrow to the work (2.4s, hidden on small screens).
- **Ships without JS:** the light stays at its default position and the clock shows its static text.

### Tiles (work as coloured screens)
- **Shape:** 44px radius, 560px tall on desktop (4:5 below 900px), centred content with 48px padding, background from the inline `--tile` colour, default Well.
- **Contents:** a drawn Mac (12px radius, 32px bar in `{colors.device-bar}` with 11px Apple-coloured dots, 16:10 black screen), a drawn iPhone (52% wide, max 240px, proportional radii, 5.2% bezel, 9:19.5 screen with notch), or a white page (12px radius, 4% padding), each carrying the object shadow.
- **The paper tile** is the manuscript's first page on paper, with no label above it: the title in serif italic at the top, the subtitle at 14px, the byline at 13px (the name at 600, then "· Submitted, 2026" at 500 in 66% paper ink), and the abstract at 13px/1.55 pushed to the foot, clipped at 9.6em and faded out by a mask so the page reads as continuing. It is decorative (`aria-hidden`); the caption names the work.
- **Caption:** 20px below, 16px, name at 600 in Ink then description in Ink 2; the description goes to Ink on hover.
- **Hover and focus (fine pointers):** Alta's settle. The screen rests at `scale(1.05)` and settles to 1 over 800ms on the site ease; a 32px arrow button (Ground fill, 12px radius, Ink stroke) grows in at the bottom-right from `scale(.8)` and 0 opacity while its arrow turns from pointing right to pointing up-right, 450ms. Focus draws a 2px Ink outline around the tile box at a 4px offset. **Touch:** the screen sits at 1 and the arrow is always shown.
- **On sheets:** tiles are figures, not links; they lose the fixed height and pad `clamp(20px, 6%, 56px)`; a `tile--pair` variant sets a phone at 22% beside a wide screen.

### Experiments (an index that opens)
- A hairline-ruled list; each item a two-column link (title left, two-digit serif numeral right) with 26px vertical padding. At rest only the titles and numerals show.
- **Opening (hover or keyboard focus):** the description unfolds under the title through a `grid-template-rows` 0fr to 1fr transition (500ms, site ease), 16px in Ink 2 with 12px above and 8px below, fading in and rising 6px; the row grows downward only, so the title never moves under the pointer. Behind it a wash comes up (opacity 0 to 1, `scale(.985)` to 1): a 24px-radius slab reaching 24px past the text on both sides, lit by two radial gradients of the item's `--c` colour (36% from the top-left, 14% from the bottom-right) over 3.5% white. The numeral goes to Ink; the hairlines touching the open row hide. Every other item drops to 16% opacity with a 3px blur over 300ms (`:has()`).
- **Keyboard:** focus opens the item the same way, and the focus ring is drawn on the wash (2px Ink) rather than on the text.
- **Touch:** descriptions are always shown at 14px and the wash is never drawn.
- **Images:** an item can carry `style="--img: url(...)"` to replace its wash with a picture on the right under a dark left-to-right gradient.

### Rows (the record, pagers, profile links)
- **Shape:** flex line, baseline-aligned, 11px 12px padding, 12px radius, title in Ink left and 14px tabular date in Ink 2 right, nowrap.
- **Hover (fine pointers) and focus:** the title leans in 6px (450ms, site ease), the date goes to Ink, and the other rows of the same group step back to 55% (400ms). No wash. **Press:** `scale(.985)`.
- **Reveal:** on the home page each row rises 12px as it arrives, 40ms after the one above it.
- **Preview:** rows carrying `data-peek` summon a 280px preview at one fixed place (vertically centred, aligned to the content's right edge) holding a tile in the product's colour with the drawn device and the object shadow. It drops in from above while growing and sharpening (from `translateY(-100%) scale(.2)`, 15px blur, 99px radius, to `translateY(-50%) scale(1)`, 24px radius, over 750ms on `cubic-bezier(.22, .61, .36, 1)`), and leaves by fading and blurring 5px where it stands over 300ms. While it is up, the record's right column steps back to 14% with a 4px blur. Fine pointers only; the screens are fetched while the page is idle.

### Interest wells and This fall
- **Wells:** 24px radius, Well fill, 22px 24px padding, two-column grid with 14px gaps; a 600 name over a 14px Ink 2 verdict. Hover lifts 2px with the lift shadow (450ms). They arrive rising 16px, 60ms apart.
- **This fall:** a titled list 72px below the wells (School, Rink, Music, Build), hairlines above each item and below the last, 14px vertical padding, a 600 Ink term followed by Ink 2 text, max 42em. It does not repeat the hero's Now line; the page has one Now.

### Sheets (every other page)
- A 640px column. Optional 88px avatar at 24px radius; headline title with one italic phrase; an 18px Ink 2 dek 16px below; a `.note` for status caveats; facts as an 8em / 1fr definition grid bounded by hairlines at 14px; prose with 20px h2s; hairline lists; decimal references at 14px in Ink 2 with Ink 3 markers; tables at 14px, tabular, hairline rows, left-aligned with numeric columns right-aligned, scrolling in a gutter-bleed wrapper; the CV list (baseline-aligned head with a nowrap 14px date, a 14px subline, en-dash bullets in Ink 3); a rows pager 64px below; a 14px Ink 3 footer with a hairline. Under `.hockey` the print stylesheet compresses to one Letter sheet at 9pt.

### Links
- **Inline prose link:** underline 1px at 35% white, offset .22em; the underline goes to currentColor on hover. Footer links the same at 25%.
- **Email:** red at 500, underlined 1px in red at 40%, to currentColor on hover.
- **Skip link:** Ink fill, Ground text, 12px radius, 8px 12px padding, appears at 16px on focus.
- **Focus:** a 2px Ink outline offset 3px, everywhere except tiles (on the box, offset 4px) and experiments (on the wash).

### Motion (one grammar)
- **Reveal:** elements marked `.rv` start down (28px; rows 12px; wells 16px) at 0 opacity and rise over 850ms on `cubic-bezier(.22, 1, .36, 1)` with a 600ms fade, once, on entering view at .18 threshold with an 8% bottom margin. The motion is on the `translate` property, so an element can arrive and still move on hover; once arrived, the script hands its transitions back. Whatever enters in the same moment cascades in reading order, each a step after the one before (100ms by default, 40ms for rows, 60ms for wells, capped at 600ms). Anything in the first screen is shown after one second regardless; if the script never runs, everything is shown after 2.5 seconds. Sheets carry no reveal.
- **Static:** four 512px noise tiles made once, laid over the full-viewport canvas at a random offset every frame.
- **Page changes:** cross-document view transitions. The old page fades out over 340ms while it steps back (`scale(.985)`, 6px blur); the new one fades in over the same 340ms on the same curve, so the two always add up to one screen of light, while it rises 12px over 520ms. The menu holds its place and the current tab's mark slides (560ms); the static cross-fades in place. If the menu is off screen when a link is followed, it travels with the page instead. Where cross-document transitions are missing, a click fades the page out over 220ms before leaving and the next page's content rises in over 480ms; Back restores the page at full opacity. In-page anchors scroll smoothly.
- **Site ease and duration:** `cubic-bezier(.22, 1, .36, 1)` for geometry (300ms for nudges, 450ms for leans and arrows, 500ms for opening, 800ms for the settle); plain `ease` at 300ms for colour and underline.
- **Reduced motion:** the reveal, the static's refresh, the scroll arrow, the pointer light, the settle, the unfold and lean transitions, the preview's spring and the page changes all stop; content is shown at rest and in-page scrolling jumps.

## Do's and Don'ts

### Do:
- **Do** introduce him by name on the landing, in plain Switzer with the glow, and let one factual line say what he does (The Glow Is the Name Rule).
- **Do** set every sheet title with exactly one phrase in Instrument Serif italic, about 6% larger than the Switzer around it (The One Word Rule).
- **Do** take colour from the screen being shown: set `--tile` to the product's own colour and put the screenshot inside a drawn device or a white page with the object shadow (The Borrowed Colour Rule).
- **Do** keep numbers on the pages that explain them, each with its caveat in a sentence beside it; the landing carries none.
- **Do** use the five radii as nested scales: 44px tile, 24px window ring, wells, previews and washes, 16px inner frame, 12px rows and small objects, full pill for controls.
- **Do** divide with 10% white hairlines and lift with 6% white washes; keep content surfaces flat at rest.
- **Do** keep hover as settle, lean and step back: the screen settles, the title leans, the rest of the list or group dims; give the keyboard the same state.
- **Do** put the reveal class on the object that arrives (a title, a tile, a lead sentence, a row) and let things that arrive together cascade.
- **Do** keep the whole page legible with JavaScript off and at rest under `prefers-reduced-motion`; provide a white print sheet for anything a reader would print.

### Don't:
- **Don't** put a slogan or a statistic in the hero; the halo of the first screen belongs to the person.
- **Don't** put a small uppercase label (an eyebrow) above a heading or a title, on a tile or anywhere else; the heading carries itself.
- **Don't** rotate anything on hover; tilts were removed from tiles and wells.
- **Don't** introduce a fourth text colour or a coloured heading; text is Ink, Ink 2 or Ink 3 (The Three Voices Rule).
- **Don't** fill any surface with red, or use it for more than a handful of words on a screen (The Red Is a Mark Rule).
- **Don't** set the three-layer glow on anything other than the display name; sheet titles and the wordmark get the faint halo only.
- **Don't** put drop shadows on rows, tiles or text; shadows belong to devices, pages, previews, the window, and a well only while lifted (The Light Not Shadow Rule).
- **Don't** use JetBrains Mono for anything but the clock (The Mono Is Data Rule).
- **Don't** animate padding, margin or height for an opening. The one layout property the site animates is `grid-template-rows` (0fr to 1fr) for an unfold, and only for the row being opened; everything else moves with `transform`, `translate` and `opacity`.
- **Don't** add buttons, a card grid or a hero photograph; the world refuses them.
