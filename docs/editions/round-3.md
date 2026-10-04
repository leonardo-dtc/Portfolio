# Round three: refining the finalists, v3 and v5

Written 2026-10-03, after round two shipped (`d0e22b5`). This round improves design and organization only; wording waits until one edition is chosen. It answers five requests from Leonardo:

- list what worked in some editions and not in others;
- track the design elements he named and lay out how each edition can match them;
- optimize v3 and v5 for general audiences;
- list the questions that depend on his taste;
- suggest a method for a desktop with "apps", like myos.framer.website, if it improves organization, adds personality or serves the site's purpose.

**Evidence.** Five research passes ran over the code and the built pages:

- a tracker of every element he named;
- a gap analysis per finalist with audience walkthroughs;
- a criterion-by-criterion study of all five editions;
- a review of desktop and "OS" portfolios;
- a critic who checked the others.

Measurements come from headless Chromium at 1440×900, 1280×800, 1024×620 and 390×844. WebGL ran in software, so motion was judged frame by frame, never by speed. Where this document corrects `foundation.md` or the decision matrix, the correction is listed in [section 8](#8-corrections-to-earlier-documents).

Contents:

1. [What worked where](#1-what-worked-where)
2. [Leonardo's design elements, tracked](#2-leonardos-design-elements-tracked)
3. [Rules that settle the conflicts](#3-rules-that-settle-the-conflicts)
4. [The desktop and "apps" idea: recommended method](#4-the-desktop-and-apps-idea-recommended-method)
5. [The v5 hero](#5-the-v5-hero)
6. [Backlog, in priority order](#6-backlog-in-priority-order)
7. [Taste questions](#7-taste-questions)
8. [Corrections to earlier documents](#8-corrections-to-earlier-documents)
   - [The adversarial review, and what it changed](#8b-the-adversarial-review-and-what-it-changed)
9. [Scores](#9-scores)

---

## 1. What worked where

Each criterion gives the edition that did it best, what fell short, the rule the finalists take from it, and what that means for v3 and v5.

### Animation and motion

- **Worked:**
  - **v4: hovers that move content inside a still frame.** A tile's image rests at 1.05 and settles to 1 over 800 ms. The corner arrow grows from 0.8 and turns from 45° over 450 ms, and the caption brightens. All of it runs on `cubic-bezier(.22,1,.36,1)`, and the 44 px rounded frame never moves.
  - **v4: experiments that open.** The line unfolds with `grid-template-rows` 0fr→1fr over 500 ms while the other rows step back.
  - **v4: record rows.** A row leans 6 px and its siblings drop to 55%.
  - **v3: page-level motion.** Sheets slide over each other through torn edges, and the covered one recedes to 0.95 and dims.
  - **v5: one spring model on one frame loop.** Everything that carries text is critically damped.
- **Fell short:**
  - Round one of v5 blurred incoming text and drifted windows with the pointer, which is what Leonardo called disorienting. Round two removed it.
  - v5 cards grow the whole frame on hover, the opposite of v4's still frame.
  - v3's hovers are short colour changes (150 to 240 ms).
  - A v3 jump to a far sheet scrolls through every sheet in between: 6,300 px from the cover to Hockey.
- **Rule:**
  - Hovers move content inside a still frame, over 450 to 800 ms, on a steep ease-out.
  - Arrivals take 150 to 300 ms with 8 px of travel or less.
  - Only what steps back may change; never blur the item being read or anything in motion.
  - "Creamy" comes from duration and where the motion happens, not from the curve. v3's own curve is nearly identical to v4's.
- **v3:** paper settles under its tape (cards, archive cards). A long jump becomes a cut plus one sheet sliding over.
- **v5:** the screenshot settles inside the card, rows lean, and experiments open while the others dim.

### UI/UX and visual craft

- **Worked:**
  - **v2:** readable measure (66 characters) and hierarchy.
  - **v4:** one restrained system with three ink strengths, four radii and one shadow, and no contrast failures.
  - **v5:** concentric radii and capsule controls, text on fills rather than on a second glass layer, and every control 44 px or more.
  - **v3:** strong in-sheet hierarchy (Anton title, vermilion subtitle, kicker, lede).
- **Fell short:**
  - **v3 contrast:** small white text on vermilion measures 4.03:1 in 31 places, against its own README's rule of black text on vermilion.
  - **v3 cover code:** the panel's text is 9 px.
  - **v3 cabinet:** the file's "Open the sheet" line looks clickable but opens a different sheet.
  - **v3 contact sheet:** the hand-drawn frame around LET'S TALK is clamped by a global `max-width`, so the words stick out.
  - **v5:** side windows hide 30 to 225 px of content with no scroll cue.
- **Rule:** one ink scale; every text pair measured at 4.5:1 or better; nothing with letters under 12 px; nothing that looks clickable and isn't.

### Creativity and originality

- **Worked:** v1, v3 and v5 each carry one metaphor all the way down, including the navigation:
  - v1: the shell prompt.
  - v3: torn paper, tape and a file cabinet.
  - v5: every element is a window, an ornament or a control.
- **Fell short:** v4's parts are named after the sites they came from; v2 is a standard template.
- **Rule:** every borrowed mechanism is rebuilt in the finalist's own material, and the navigation is made of that material too. Nothing should read as a Framer template.

### Ease of use and access

- **Worked:**
  - v2 needs no instruction: a labelled nav and a search on ⌘K or `/`.
  - v1 has the deepest accessibility engineering.
  - v5 scrolls the front window from anywhere and degrades to a labelled bar without scripts.
  - v3's cabinet works well from the keyboard (arrows, Home, End, Escape).
- **Fell short:**
  - v3's index lives at the screen edge with nothing pointing to it, and its targets are 22 px tall (WCAG 2.5.8 asks for 24).
  - v5's tab names appear only on hover.
  - The v5 hero responds to click, tap and Return, but a wheel, Down Arrow or Space does nothing.
  - v5's tab bar comes after the content in the source: 41 Tab presses to reach it.
- **Rule:** every way forward has a visible label, a target of at least 24 px (44 on touch), a keyboard path and a reduced-motion version.

### Organization and wayfinding

- **Worked:**
  - **v2: the complete architecture.** Work index with filters, project templates with a fact strip, a hockey page, a résumé rail that follows the reader, and search.
  - **v4: three audiences at three speeds.** Home curates, and sub-pages go deep.
  - **v5:** location always visible (the tab bubble, window titles, sheets over their parent).
  - **v3:** a fitting index (the cabinet) and a current-sheet label.
- **Fell short:**
  - v3 shows no labelled destinations at rest, and seven links leave for v2.
  - v5 tab icons are unlabelled at rest.
  - Below 1360 px, v5 appends the side window after all the main content: Hockey's Measurables sit 3,229 px down a phone.
  - v5's Résumé "Sections" never marks where you are.
- **Rule:** labelled destinations visible at rest, a "you are here" at every width, any item within two actions, and no project depth borrowed from another edition.

### Personality: design

- **Worked:**
  - v3: the sliced O, the torn red strip, the mask sticker and the hand lettering. The strongest point of view in the set.
  - v5: the glass name lit from behind, and a room every pane frosts.
  - v1: scanlines and the ASCII name.
  - v4: the static and the glow on the name.
- **Fell short:** v4 was "bland" by the family's verdict: its personality is ambient, not authored.
- **Rule:** exactly one ambient "living" detail at 10% strength or less, plus objects only this person could have. v3's living detail is the code panel typing his code; v5's is the room. Neither needs a second.

### Personality: personal use

- **Worked:**
  - v1: games and a name that restyles when clicked.
  - v3: the Archive of index cards. Adding one means copying one `<li>`.
  - v4: the experiments index.
  - v5: the colour style control.
- **Fell short:** v5 has no archive and nothing to play with; v3's archive cards don't open.
- **Rule:** Leonardo can add a personal item by copying one block, with the design coming from CSS.

### Design potential

- **Worked:**
  - v4 and v2 heroes state the role.
  - v1 and v5 heroes carry a hint line.
  - v3's archive takes new items in one block.
  - v4 and v5 record their systems in `DESIGN.md`.
- **Fell short:**
  - Adding a v3 sheet means about 17 hand edits (counts, centring maths).
  - Twelve v5 pages each repeat the tab bar, and about 33 KB of unused hello files remain.
- **Rule:** a new section is one block plus derived counts, with a short "how to add" next to every repeatable block.

### Audience fit (coaches, admissions)

Measured paths from the landing page:

| | Hockey stats | Email | One-page hockey print |
|---|---|---|---|
| v2 | 1 click | footer | 1 page |
| v4 | 1 click | menu, every page | 1 page |
| v5 | 2 on first visit (title, then an unlabelled icon), 1 after | toolbar, 4 of 12 pages | 1 page |
| v3 | hover the edge plus 1 click, or scroll 7 sheets | sheet 12 only | 14 pages |

- **Rule:** position, school and year are on the first screen; hockey is one labelled action away; contact is always reachable; the hockey profile prints on one page.
- A coach who arrives through a direct link never sees a hero or cover: `/v5/hockey/` opens on the stats. So **the URL on his recruiting profiles matters more than the home page** (taste question T3).

### Phone experience

- **Worked:** v2 reads as a plain document; v4 shows experiment lines on touch; v5's floating dock is always visible.
- **Fell short:**
  - v3's only phone navigation is a faint 44 px icon with no "you are here", and its chrome runs over text.
  - v5's dock is icons only, its labels hidden.
  - On a v5 phone, coach material sits 6 swipes down.
- **Rule:** every hover-only reveal gets a resting or tap equivalent, and "where am I" stays on screen.

### Performance and reach

- **Measured home pages:**
  - v5: 315 to 383 KB, plus WebGL2;
  - v4: 342 KB;
  - v3: 302 KB on load, 503 KB after scrolling;
  - v1: 489 KB;
  - v2: 683 KB.
- **Fell short:** v5 never falls back to its still image on a weak device, and its springs slow down below 20 fps.
- **Rule:** no perpetual loop without a budget; a slow device falls back to the still.

### Maintainability

- **Worked:**
  - v3's archive how-to comment;
  - v2's generated search index with a check mode;
  - v4 and v5's `DESIGN.md`;
  - v5's tests.
- **Fell short:** v3's hand-typed counts; v5's 12 copies of the chrome and its three dead files.
- **Rule:** derive counts and chrome from content, and keep a one-paragraph "how to add X" beside every repeatable block.

---

## 2. Leonardo's design elements, tracked

Every element he named, where it stands in each finalist, and how each can match it. "This round" says what was built in this round; ❓ marks a question in [section 7](#7-taste-questions).

### Motion and hover

| Element, in his words | v3 now | v5 now | How v3 matches | How v5 matches | This round |
|---|---|---|---|---|---|
| "The movement of the UI can be disorienting, as the text and UI can become blurred" | Nothing blurs; long jumps travel 6,300 px | Fixed in round two: no blur, windows still | A long jump cuts to the sheet before the target, then one sheet slides over | Keep | v3 jump |
| Animations "smooth, sensible, interactive ... like Apple or iOS" (v5 brief) | Own ease curve | One spring model, critically damped | v4's 450 to 800 ms ease on every hover | Keep | — |
| "The hover effects ... are smooth and creamy (image shape, subtitles, arrow, zoom)" (v4) | Cards and archive cards have no hover | Card grows 1.02, nothing settles | Image settles 1.06→1 inside its frame, arrow badge grows and turns, caption brightens, the other card dims | Screenshot settles 1.05→1 inside the card, arrow grows and turns, subline brightens | Both ❓T2 |
| Experiments "open on hover", "the UI expansion and blur" (v4) | Archive cards are static | Rows only gain a fill | Archive cards unfold their line and straighten; the others dim | Titles at rest; the line unfolds; the others dim | Both ❓T1 |
| "Alta's settle on the tiles instead of a tilt"; "no hover tilt" (v5) | Nothing settles | Grows instead of settling | Straightening a tilted card is a settle | Settle replaces the grow | Both ❓T20 |
| "Cleaner microinteractions in the record" (v4) | Record items aren't links | Rows fill only | Later, if record items become links | Row leans 4 px; its group steps back to 55% | v5 |
| "Many subtle animation effects" (v4) | Present | Thin | Covered by the hovers above | Covered by the hovers above | Both |
| "Page transitions" (v4) | Sheets slide over each other | 140/220 ms crossfade | Plus a file rising over the deck | Keep | v3 files |

### Material, type and the hero

| Element, in his words | v3 now | v5 now | How v3 matches | How v5 matches | This round |
|---|---|---|---|---|---|
| "The background static adds a bit of life" (v4) | Still paper grain | None (the room's drift) | Keep still: the typing code panel is the living detail | None: the room is the living detail | ❓T5 |
| Neiden's bottom-edge blur | n/a | A fade, no blur | — | Keep the fade: a blur band would blur moving text | — |
| "Apple Vision style ... liquid glass UI and clean styling" | n/a | Present | — | Keep | — |
| His real, colourful screens inside Apple devices (v4 brief) | Taped prints | Screens on colour cards | Not needed in the poster language | Optional thin device bezel | ❓T31 |
| "The big text (font) from v4, or other similar blocky text" for the hero | n/a | Switzer 780 as glass | — | Kept; the bevel softens the corners | Hero |
| "Liquid Glass or metallic form, glowing from behind" | n/a | Glass lit from behind | — | Becomes the Glowtime light (section 5) | Hero |
| "A subtle interaction" | Code panel pauses on hover | Light leans toward the pointer (faint) | — | Part of the Glowtime work | Hero |
| "Click the title to proceed", "a clean transition" | n/a | Present | — | Keep; scrolling to enter is a question | ❓T26 |
| "With a reload for dev purposes, allow it to bring back the hero" | n/a | **Done** (`93be48c`) | — | A reload of home shows the hero; `?nohello` skips it | Done ❓T28 |
| "The title effects and style to have the feel from the image [It's Glowtime], but animated and smooth" | n/a | Built: neon flow (section 5) | — | Three prototypes, judged (section 5) | Hero |
| Not "Apple's hello or cursive text" | Hand face is the deck's own | Present | — | — | — |

### Organization and navigation

| Element, in his words | v3 now | v5 now | How v3 matches | How v5 matches | This round |
|---|---|---|---|---|---|
| "The organization is solid" (v4) | Project depth lived in v2 | Present | Own project files in poster form | Keep | v3 files |
| "The lack of guidance may make it difficult for the user to click to what they are looking for" (v3) | Rail label and cabinet | Icons, labels on hover | Cover routes, an Index tab, a phone pill reading "Index · 08 Goaltender", Find | Labels at rest where they fit; labelled dock on phones and touch tablets | Both ❓T8 T21 |
| "Hovering on the dots would bring up the file system" | Present | n/a | Keep | — | — |
| "The popups should be files coming out of the folders" | Present, but the file is a false target | n/a | The file becomes clickable with hover intent | — | v3 ❓T9 |
| "A UI on the page rather than a full window extension" | Present | n/a | Keep | — | — |
| "An archive for personal purposes" | Archive sheet, 8 cards | None | Cards that open | Archive window, or app (section 4) | v3 ❓T7 |
| "The 'let's talk' section and bottom of the page are also not great" | Rebuilt in round two; frame clamped | n/a | Fix the frame clamp | — | v3 ❓T18 |
| Tab bar "slightly off the edge of the main block" | n/a | Present (14 px) | — | Keep | — |
| "The 'Now' UI on the left can be removed ... two blocks" | n/a | Present | — | Side windows hold only what fits | v5 |
| "More space" (v4) | Short windows compress type | Present | Let the record run tall | Keep | — |
| "No numbers on the landing" (v4) | Present | Present | Keep | Keep; no counts on app icons | ❓T36 |
| "A desktop type setup with 'apps'" | Absent | Absent | Routes, Find and files as windows | A Home View launcher | Proposed (section 4) |
| An edition never links to another | Seven links to v2 | Present | Replaced by v3's own files | — | v3 files |

### Elements from his approved v5 spec that the method must respect

- The window bar can be dragged 40 px and springs back, as "a harmless visionOS nod" (spec line 54).
- **Out of scope, his choice:**
  - sound;
  - a custom cursor;
  - 3D models;
  - windows that really move;
  - a light/dark toggle;
  - room tints per project.
  These bear directly on MyOS's pet cursor and music player (❓T38).
- **Pointer parallax.** He chose side windows "with pointer parallax". Round two removed the windows' drift; the room's lean stays.
- **"One room with many windows."** Any apps layer has to live inside that frame.
- **His four Dribbble Vision Pro references:** Spotify Spatial UI, Steam for visionOS, a Vision Pro dashboard and a vitamins shop. They are the closest precedent he picked for a launcher or grid (❓T39).

---

## 3. Rules that settle the conflicts

These decide where his notes pull in different directions. Each is reversible and has a matching question.

1. **Blur.** He loved v4's experiments, which blur their siblings, and disliked blurred text in v5. v4's blur ramps in while the rows below move, so it is blur in motion. **Rule:** whatever steps back dims and does not blur. A static blur that arrives only after the row has finished opening is the alternative (T1).
2. **Creamy means a still frame.** Keep the frame still and move the content inside it. v5 cards stop growing; the screenshot settles instead (T23).
3. **Settle, not tilt.** v3's deck look depends on tilted paper at rest. Easing a card toward flat on hover is a settle, not a tilt toward the pointer (T20).
4. **One living detail.** v3: the typing code panel. v5: the room. No grain is added to either until he asks (T5).
5. **No numbers on the landing.** App icons carry names, not counts (T36).
6. **Nothing points to another edition.** Carry behaviour over, rebuilt in each edition's code and look. Copying a font or image file is allowed; linking is not.
7. **The 12 px floor is absolute.** Decorative text included; v3's code panel goes to 12 px.
8. **Hover reveals have a resting twin.** On touch, in print and without scripts, every hidden line shows.
9. **Nothing moves on its own.** The one-time peeks some reports proposed (a v3 drawer, a v5 tab bar opening itself) are not built; permanent labels are used instead.

---

## 4. The desktop and "apps" idea: recommended method

**Verdict: build it in v5, as a visionOS Home View. Do not build a desktop in v3; take two pieces of the OS idea into v3's paper.**

**Why not a myOS-style desktop:**

- **What MyOS is.** A $59 Framer template ("Desktop OS Inspired Portfolio"), one of at least nine in that genre. Its listing names:
  - a desktop with an interactive dock;
  - glassmorphism;
  - a pet cursor;
  - a pet-herding mini game;
  - a music player;
  - CMS pages for projects, résumé, about and contact.
  The site itself was blocked from the research sandbox, so this comes from its listing.
- **Where OS portfolios fail:**
  - things get hard to find (icon-only docks, hidden navigation);
  - the desktop becomes a gate before the content;
  - phones lose the metaphor (about half of all web traffic);
  - dragging excludes people (WCAG 2.5.7);
  - crawlers cannot read a virtual file system;
  - the result looks like a template.
- **Where they work:**
  - every app is a real page with its own address (PacificaOS);
  - windows become sheets on phones;
  - icons always carry labels;
  - windows stay still;
  - a label always says where you are.

**v5 already is an operating system.** It has windows, ornaments, a dock, sheets and a room. An apps layer completes that metaphor in its own material. In v3 a desktop would be a third metaphor fighting the poster and the cabinet.

### v5: a Home View launcher

![v5 launcher on the hero, 1440](round-3/v5-launcher-hero-1440.jpg)

- **Where:** under the glass name on the hero, a row of round glass app icons with their names always shown. Proposed apps:
  - Work, Hockey, About, Résumé;
  - Archive, once it exists;
  - Write to me.
  Phones show a 3×2 grid under the two-line name.
- **Behaviour:** "Click the title to proceed" stays the default. Choosing an app runs the same glide as the title, but lands on that page's window, with the tab bubble already on it.
- **Plain links:** each icon is a real `<a href="hockey/">`, so it works without scripts and from the keyboard.
- **Who it helps:** it turns the hero from a gate into a launcher. A first-time coach reaches Hockey in one action instead of two, which matters more now that a reload brings the hero back.
- **The labelled dock goes with it.** Phones show names under the dock icons, as iOS does, and touch tablets show the tab names at rest beside the window. Built this round regardless.
- **Later, a second Home View page: the Archive.** Experiments and personal work float in the room as icons. Each opens one small auxiliary window. Icons must be drawn glyphs, not invented screenshots, until real captures exist.
- **Possible extra: the colour style control as a "Color" app.** That would free its slot in the phone dock.
- **Not recommended:**
  - a menubar;
  - windows that drag, resize, minimise or stack;
  - a pet cursor or music player.
  They go against his spec, Apple's windowing guidance, WCAG 2.5.7 and v5's calm-motion rules.
- **The fuller grid version (below) is the alternative.** It puts ten apps in the room. It is the most "desktop" option, but it adds a step for everyone if it becomes the front door, and its counts break "no numbers on the landing".

![v5 Home View grid, 1440](round-3/v5-home-view-1440.jpg)

### v3: the OS pieces, made of paper

- **Routes on the cover (built).** The words already in his handwritten line become doors: "goaltender" goes to Hockey, "researcher" to Research, "violist" to Music, and "portfolio" opens the index. Each has a marker underline. No new copy and no new objects.
- **The alternative is taped label stickers** in the cover's empty corner. It is more "desktop icon", and busier.

![v3 cover with taped shortcuts, 1440](round-3/v3-cover-stickers-1440.jpg)

- **Find on the cabinet's drawer front (built).** The OS search field, in paper. It searches every sheet's text; matching folders keep their ink and quote the matching line, and Enter goes there.
- **Project files as the "windows" (built).** Each project opens as a paper file rising over the deck, with its own address.
- **Archive cards that open (built).** Later they can hold images, arrangement pages or class games, once real captures exist.
- **Not recommended: a desk as the landing page.** It would throw away the cover and the slide-over, add a click before everything, and collapse into a list on phones.

### What it would do to the scores

These are estimates, to be re-scored after the change:

- **v5 launcher plus labelled dock:**
  - Organization +0.5;
  - Audience fit +0.5;
  - Ease +0.5;
  - Personality (design) +0.5;
  - Creativity 4.5 → 5.
- **v5 Archive:** Personal use +1.
- **v3 routes plus Find:** Organization +0.5, Phone +0.5.

### How to test it

- Three people (a coach-like adult, an unfamiliar adult, a peer) each find:
  - the save percentage;
  - the GPA and SAT;
  - how to make contact.
  Run it on the current hero and on the launcher, on desktop and phone. Record the first click and the seconds taken.
- A five-second test: show each hero for five seconds, then ask what Leonardo does.

**Status:** proposed, not built. The launcher changes his hero spec ("the name plus Click the title to proceed"), so it waits for T34, T27 and T35.

---

## 5. The v5 hero

- **Reload brings it back (done, `93be48c`).** The head script reads the navigation type. A reload of the home page shows the hero; later home views in the session, Back, and `?nohello` skip it. `tests/v5/e2e/hello.mjs` checks both.
- **Glowtime.** His reference is Apple's "It's Glowtime." art:
  - the logo traced three or four times in translucent neon ribbons (hot pink, magenta, orange, violet, electric blue, cyan) on near-black;
  - overlaps adding up toward white;
  - a soft bloom;
  - white glowing text.

  Three treatments of the name were prototyped in isolated copies and scored by three judges (fidelity and feel; general audience and legibility; motion craft and robustness):

  | Variant | What it is | Scores (out of 10) |
  |---|---|---|
  | A, Traced light | four drifting contour ribbons over a translucent fill | 7, 6, 6 |
  | **B, Neon flow** | one crisp neon tube on the true outline, colour flowing along the name | **8, 8, 7.5** |
  | C, Iridescent glass | the glass letters lit by swirling iridescent light | 6, 3.5, 4 |

  **B won unanimously and is built** (`v5/assets/js/hero.js`, the ink section of `shaders.js`). Its weak points were fixed with ideas from the other two:
  - **The tube:** one crisp band of light on the letters' true edge, with a white-hot core and a hair of red/blue split. The letters' visible edge never moves.
  - **The echoes:** three thin traces of the outline, one per colour family (pink to magenta, orange, blue to cyan). Each drifts 1.6 to 2.6% of the font size over 10.5 to 19 s and breathes in and out of the edge, so it crosses the tube. Where light piles up it burns toward white.
  - **No doubled name:** each trace fades as it strays.
  - **Colour cycle:** the traces take turns on a 16 s cycle sliding along the name.
  - **Arrival and entry:** the traces grow out of the outline as the hero arrives and fold back as it enters.
  - **Day:** the room behind the name falls toward a saturated violet-blue that hugs the letters, instead of a grey smudge.
  - **Colour styles:** the neon turns a third as far as the room and stays within the Glowtime colours, so Rose and Gold no longer turn it lime.
  - **Frame rate:** the room draws at full rate while the hero shows, unless the device is slow.
  - **Without WebGL2:** CSS neon over the room's still image, with screened traces and a white-hot edge. Only transform and opacity animate.
  - **Cost:** seven texture reads per pixel, only inside the name's box.

  **After the review, two refinements:**
  - **The colours of the reference.** The first build measured 0% orange and under 1% cyan on an indigo ground. The neon now holds orange and cyan at 10% or more of its lit pixels in every sampled frame, with pink, magenta and white-hot crossings.
  - **A dark stage by night.** The near-black pool first hugged the name, so on the cobalt room it read as a black slab. Now the whole room gives way to near black while the hero shows (mean luminance about 0.002 outside the name, with no edge anywhere), and the light blooms into it in the tube's own colours, as in the Glowtime art.
    - **Entering:** the room's light comes up on the glide's own spring as the name turns white, so the window's glass forms in a lit room: no flash, gone by about half a second.
    - **By day** there is no stage; the violet aura stays as it was.
    - **Without WebGL2** the hero's copy of the room's still darkens the same way.

  Screenshots of all three went to Leonardo; he can still pick A or C (T41).

---

## 6. Backlog, in priority order

Priority is the balanced weight times the expected gain, divided by effort.

**Status key:**
- **Now:** built this round, with no taste question in the way.
- **Now, default:** built this round on a reversible default; the question is listed.
- **Waits:** needs his answer first.

### v3 poster

| # | Change | Criteria it moves | Effort | Status |
|---|---|---|---|---|
| 1 | Cabinet file is clickable, with hover intent (fixes the file that opens the wrong sheet) | Ease, Organization, UI/UX | S | Now, default (T9) |
| 2 | Own project files (six pages in poster form, content moved from v2 unchanged), replacing the seven links into v2 | Organization, Audience, Potential, UI/UX | L | Now, default (T10) |
| 3 | Hockey file as a coach one-pager: measurables, sample-size stat line, academics, coach contacts, one-page print | Audience, Phone | M | Now, default (T11) |
| 4 | Cover routes from the handwritten words | Ease, Audience, Organization | S | Now, default (T8) |
| 5 | A permanent "Index" tab on the rail | Ease, Organization | S | Now, default (T19) |
| 6 | Phones: a solid pill reading "Index · 08 Goaltender"; a backdrop on the chrome | Phone, Ease | S | Now |
| 7 | Small text on vermilion becomes black (v3's own documented rule); vermilion text on paper reaches 4.5:1 | Ease, UI/UX | S | Now, default (T12) |
| 8 | Craft: the LET'S TALK frame, the Record and Archive heads, the code panel at 12 px, the Scroll hint stops after three pulses, 24 px targets | UI/UX, Ease | S | Now |
| 9 | Creamy hover on project cards: paper settle, arrow badge, the other card dims | Animation, UI/UX, Personality | M | Now, default (T1, T20) |
| 10 | Archive cards open like v4's experiments | Personal use, Animation | M | Now, default (T1) |
| 11 | Long jumps: a cut, then one sheet slides over | Animation, Ease | S | Now, default (T14) |
| 12 | Find on the drawer front (also `/`) | Organization, Ease | M | Now |
| 13 | Counts derived from the page; `tests/v3/check.mjs`; `v3/DESIGN.md` | Maintainability, Potential | M | Now |
| 14 | Taped label stickers on the cover, or the cover as a desk | Organization, Personality | M | Waits (T8, T40) |
| 15 | Archive filter by kind; media in archive cards | Personal use | M | Waits (T7, T17) |
| 16 | Moving paper grain | Personality | S | Waits (T5) |
| 17 | Email in the chrome; sheet order | Audience | S | Waits (T4, T15) |

### v5 glass

| # | Change | Criteria it moves | Effort | Status |
|---|---|---|---|---|
| 1 | Glowtime hero (section 5) | Personality, Creativity, Potential | M | Now (T41 chooses) |
| 2 | Below 1360 px the side window goes where it serves: Hockey's Measurables and coach contacts before Stats, Résumé's Sections as a chip row, About's portrait first | Organization, Audience, Phone | S | Now |
| 3 | Labels: names under the phone dock icons, touch tablets get a labelled dock, desktop shows names at rest where they fit | Ease, Organization, Phone | S | Now, default (T21) |
| 4 | Card hover: the screenshot settles 1.05→1, an arrow grows and turns, the subline brightens; the frame stops growing | Animation, UI/UX | S | Now, default (T22, T23) |
| 5 | Record rows lean 4 px and their group steps back | Animation | S | Now |
| 6 | Experiments open on hover; the others dim (one component, used in both places) | Animation, Personality | S | Now, default (T1) |
| 7 | Side windows hold only what fits, with a visible cue when they scroll; side text at 15 px | UI/UX, Organization | S | Now, default (T24) |
| 8 | Tab bar first in the source, so keyboard users reach it first | Ease | S | Now |
| 9 | Résumé Sections follow the reader; an anchor landing is marked | Organization | S | Now |
| 10 | Weak devices: fall back to the still when the budget trips; springs keep real time; right-sized card images | Performance, Phone | S | Now |
| 11 | An "add a project" checklist in the README | Maintainability | S | Now |
| 12 | Home View launcher on the hero (section 4) | Organization, Audience, Creativity, Personality | L | Waits (T34, T27, T35) |
| 13 | An Archive Home View page | Personal use, Potential | M | Waits (T7, T34) |
| 14 | Sheet contents in the side window while a project is open | Organization, Audience | M | Next round |
| 15 | Spotlight search in the tab bar | Organization, Ease | M | Waits (T32) |
| 16 | Side-window previews of what you point at | Animation, Organization | M | Waits (T25) |
| 17 | "Write to me" on Work and project sheets | Audience | S | Waits (T4) |
| 18 | Hero proceeds on scroll, swipe, Down or Space | Ease, Phone | S | Waits (T26) |
| 19 | Chrome generated from one list (committed static output) | Maintainability | M | Waits (T33) |
| 20 | Grain in the room; device bezels; delete the unused hello files | Personality, Maintainability | S | Waits (T5, T31, T30) |

---

## 7. Taste questions

Each question shows the default this round uses, or my recommendation where nothing is built yet.

**The six that change the most:**

| | Question | Default or recommendation |
|---|---|---|
| T34 | **Apps in v5:** a launcher row on the hero (one step for everyone), a full Home View grid as the front door (one extra step for everyone), or a room inside the site (an Archive)? | Launcher row on the hero, plus the Archive later |
| T41 | **Glowtime hero:** which of the three variants? | The judges' pick, sent with screenshots |
| T21 | **v5 tab names on desktop:** shown at rest where they fit, or icon-only until pointed at, as in visionOS? | Shown at rest where they fit; icon-only on narrow desktops |
| T1 | **Blur on what steps back:** dimming only, or a static blur that arrives once the opening has finished? | Dimming only |
| T3 | **Which link goes on Elite Prospects, NCSA and emails:** the home page or the hockey page? | The hockey page: coaches skip any hero or cover |
| T27 | **v5 hero content:** only the name and "Click the title to proceed", or also a row of apps or a line saying who you are? | Name, hint, and the app row if T34 is yes; no slogan |

**Both editions:**

- **T2.** In your v4 note, "image shape": the preview that morphs from a pill to a card, the rounded tile, or the screen settling inside it? *Built: the settle inside the frame.*
- **T4.** Should a way to email you be visible from every view (v3's chrome; v5's Work page and project sheets)? *Unchanged for now.*
- **T5.** Moving static: v3's paper grain animated, or grain in v5's room? *No: each already has one living detail.*
- **T6.** If your class games appear, browser re-creations clearly labelled as such, or only recordings of your Python and Java versions? *Recordings, or labelled re-creations; v1's games are not shown to be your code.*
- **T7.** The archive: a public shelf of smaller work, or a quieter personal corner? With images and video?

**v3:**

- **T8.** Cover routes: the underlined words in your handwritten line (built), or taped label stickers (mock above)?
- **T9.** A file rising out of its folder (kept), or sliding out sideways to lie beside the drawer?
- **T10.** Project files as their own pages (built: own address, clean print, no script), or overlays drawn over the deck like v5's sheets?
- **T11.** Coach email addresses: published (on the hockey sheet, or only in the hockey file and its print), or names and roles only? *Built: names and roles with "Addresses on request.", as v5 does (Leonardo's 2026-09-18 decision).*
- **T12.** Small text on the red panels: black (built, v3's own rule), or a deeper red so the text can stay white?
- **T13.** Should sheets replay their entrance every time you come back, or only the first time? *Unchanged: every time.*
- **T14.** A long jump: a quick cut and one sheet sliding (built), or seeing every sheet flick past?
- **T15.** Is the sheet order fixed, or can Hockey and Research move nearer the front?
- **T16.** Phones: a plain scrolling document, or more of the poster's energy (a fuller cover, the slide-over)?
- **T17.** An archive filter by kind (Games, Music, Robotics), or a simple wall of cards?
- **T18.** Does the rebuilt LET'S TALK and the torn end strip fix what felt "not great"? What bothered you specifically?
- **T19.** A permanent "Index" tab (built), or a one-time peek of the drawer when the page opens?
- **T20.** Tilted cards: straighten on hover (built), or keep the tilt while only the image settles?
- **T40.** Should the cover act like a desk whose objects open files (a v3 take on myOS), or stay a poster?

**v5:**

- **T22.** The card's corner arrow: white like the primary button (built), or a clear glass-tinted circle?
- **T23.** Card hover: only the screen settles (built), or keep a small lift of the whole card?
- **T24.** Side window: keep 24° with larger text (built, 15 px), or flatten to about 18°?
- **T25.** Side-window previews of what you point at (v4's fixed-place preview), or a steady block of facts?
- **T26.** Should scrolling, swiping, Down or Space also proceed from the hero, or only clicking the title?
- **T28.** Reload brings the hero back for everyone (built), or only for you (on localhost or with `?hero`)?
- **T29.** The window bar that drags 40 px and springs back: keep it as a visionOS nod, or remove it?
- **T30.** Delete the unused hello and Sacramento name files now, or keep them until the hero is final?
- **T31.** Your screens inside drawn Apple devices on the cards (your v4 brief)?
- **T32.** A Spotlight-style search in the tab bar, given there are twelve pages?
- **T33.** Should the repeated tab bar be generated by a small script (static output committed), or stay hand-copied?

**Apps:**

- **T35.** App icons: each in its project's colour like real visionOS icons, or the same cobalt glass with white glyphs?
- **T36.** May app icons carry counts ("7 projects"), or does "no numbers on the landing" hold?
- **T37.** Windows that stay still (recommended), or windows you can drag like MyOS?
- **T38.** Your v5 spec left out sound and a custom cursor. Does that still stand, given MyOS's music player and pet cursor?
- **T39.** Of your Vision Pro references, is the "apps" feeling closer to the Steam library grid or the dashboard's widgets than to MyOS's Mac desktop?

---

## 8. Corrections to earlier documents

1. **What makes v4 "creamy".** The secret is duration and location (450 to 800 ms, content moving inside a still frame), not the curve: v3's curve is nearly the same. `foundation.md` is corrected.
2. **The 150 to 300 ms rule.** It describes arrivals, not hovers. v4's experiments take 500 ms and its tile settle 800 ms. Corrected.
3. **Blur.** v4's own page transition and experiments blur things in motion. The rule is now "never blur what is read or moving; what steps back dims". Corrected.
4. **v3 contrast.** v3 did not meet 4.5:1 after the September audit (31 runs of white on vermilion at 4.03:1), and its README's "Text on vermilion is black" was not true in code. Fixed this round.
5. **Extending v3.** v3 is the easiest edition for archive cards, not for sheets: a new sheet takes about 17 edits. Counts are derived from the page this round.
6. **Printing.** v3's hockey sheet prints as part of 14 pages. The hockey file prints on one page this round.
7. **Page weights.** These depend on method. From now on, one method: uncompressed transfer on a cold load, and again after a full scroll.
8. **The decision matrix's v5 numbers.** v5's re-scores in the gap analysis (Organization, Creativity, Performance) were given without reasons. Both finalists get one re-score, with the same reviewer and rubric, after this round.

---

## 8b. The adversarial review, and what it changed

After the build, five reviewers checked both finalists through one lens each:
- the standing rules;
- the accessibility floor;
- layout at 16 sizes against the published version;
- Leonardo's intent and this plan;
- deployment under `/Portfolio/`.

A separate skeptic then tried to refute each finding. Of 38 findings, 36 held up; all were fixed except the four noted below.

**Fixed:**
- **Rules:**
  - v3's new hockey file had published the three coaches' email addresses, against Leonardo's 2026-09-18 decision (coaches by role only, correspondence via a parent). It now lists names and roles with "Addresses on request.", as v5 does.
  - v5's "This site" sheet still described the old glass hero; that clause now describes the neon.
  - The Pages build no longer publishes the notes, design records and image provenance files.
- **v3:**
  - Hover intent no longer swaps the pulled file on the way up to it: 25 of 108 test paths before, 0 of 648 after.
  - Cards and archive cards step back by colour instead of opacity, so dimmed text keeps 4.5:1.
  - Keyboard focus never lands on a hidden name or pill, and the Index tab is the one keyboard entry to the index.
  - Touch targets are 44 px.
  - The files print with nothing under 12 px, and the hockey file still fits one page.
  - Pager lines show without scripts.
  - The first key press finishes the typing code panel.
  - The phone pill rests in the corner.
  - The routes have a dark halo over the code.
  - A hovered card comes to the top.
  - The chrome no longer doubles in the transition.
  - Back returns to where the reader was.
  - The drawers no longer depend on `:has()`.
  - `tests/v3/check.mjs` now loads all six files (94 checks).
- **v5:**
  - The hockey profile prints on one page on the CSS path too.
  - A focused Sections chip scrolls clear of the fades.
  - Reduced motion no longer slides the tab bubble or names.
  - Touch targets are 44 px.
  - The chips show a scrollbar on pointer devices and scroll away in short windows.
  - The experiment line no longer dips while it opens.
  - The frame budget times the frames it draws.
  - The dock no longer jumps when the room gives way.
  - The pinned row no longer depends on `:has()`.
- **v5 hero (finding intent-2):** the built neon had no orange, almost no cyan and an indigo ground. It now holds orange and cyan at 10% or more of lit pixels in every sampled frame, on near black. The CSS fallback by day reaches 6.9:1 at the letters' edges.

**Not fixed, by decision:**
- Two findings did not reproduce: a clipped card title at touch widths of 900 to 945 px, and v3 sheets that stopped stacking.
- Two were accepted as small:
  - The weak-device path still downloads the room's code (about 12 KB gzipped).
  - The CSS neon looks doubled in Chrome versions older than 123, which lack `paint-order` on HTML text.

**Still worth knowing:**
- **The v3 phone pill** still covers the ends of lines at most resting points on portrait phones. It is out of the middle of the column, but its label is long.
- **The v3 cover routes** stay 17 to 28 px tappable where the hand line wraps, as before.
- **v5's chips:** on macOS, overlay scrollbars give no cue at rest.
- **Untested:** Safari, Firefox and real phones. Chromium was the only browser available.

## 9. Scores

Re-scored after the review fixes (build `390851e`) by one reviewer, with the matrix's rubric and the same method for both editions:
- the three audience walks at 1440×900 and 390×844, counting clicks to each target;
- the first five seconds of each landing page;
- motion frame by frame;
- page weight measured cold;
- the files touched to add a project, an archive item or an experiment.

| | Matrix (before round two) | After round two | After round three, measured | Projected |
|---|---:|---:|---:|---:|
| v3 poster, balanced | 74.7 | 80.8 | **88.1** | about 87 to 90 |
| v3 poster, impression-led | 79.6 | | **89.5** | |
| v5 glass, balanced | 72.0 | 74.4 | **82.6** | about 80 to 82 |
| v5 glass, impression-led | 73.6 | | **82.3** | |

| Criterion (balanced weight) | v3 | v5 |
|---|:-:|:-:|
| Animation and motion (10) | 4.5 | 4.5 |
| UI/UX and visual craft (10) | 4 | 4.5 |
| Creativity and originality (10) | 5 | 4.5 |
| Ease of use and access (12) | 4 | 4 |
| Organization and wayfinding (12) | 4.5 | 4.5 |
| Personality: design (6) | 5 | 4 |
| Personality: personal use (6) | 4.5 | 3.5 |
| Design potential (8) | 4.5 | 4 |
| Audience fit (12) | 4.5 | 4 |
| Phone experience (7) | 4 | 4 |
| Performance and reach (4) | 4.5 | 3.5 |
| Maintainability (3) | 3.5 | 3 |

**What the numbers say:**
- **v3 now leads on use as well as on impression.** Use criteria mean: v3 4.25, v5 4.13. The reason is its first screen: the cover already says who Leonardo is, and its words lead to the sheets. v5's first screen shows only the name, on the first view and on every reload.
- **v5 gained the most this round,** but its ceiling is the hero gate and Apple's genre. Its single largest gain would be the launcher row with a line of who he is (T34, T27), and letting scrolling or a key proceed (T26): about +3 points.
- **Some changes did not move the scores the plan expected:**
  - The Glowtime hero is striking, but it is Apple's own art, and the hero still gates the content.
  - v3's archive cards open to only one line and a link.
  - v3's six project files hand-copy their tabs and numbers, which offsets its derived counts.

**Highest-value next steps:**
- **v3:**
  - Contact on every view, and the coaches' names and the email on the hockey sheet itself (T4).
  - Sheet names beside the rail dots at rest on wide screens.
  - Jumps that land already readable (T13).
  - A legibility pass on the record and music sheets.
  - The files' tabs and numbers generated from one list.
- **v5:**
  - The hero launcher, a line of who he is, and more ways to proceed (T34, T27, T26).
  - An archive from a single list (T7).
  - A phone header that collapses on scroll.
  - "Write to me" on Work and the project sheets (T4).

**Fixed after the re-score:**
- Closing a v5 project sheet showed its text and the Work page's text at once, and its toolbar's glass overlapped the parent's. Each now fades only while the other is gone: measured 0 overlapping frames on both paths, against 2 before.
- v5's one-page hockey print now carries the email address in the header's free corner, at 10 pt, still on one page.

The full report, with the evidence behind every score, is in [`round-3/rescore.md`](round-3/rescore.md).
