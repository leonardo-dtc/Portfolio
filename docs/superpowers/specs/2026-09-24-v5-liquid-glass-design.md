# v5 · the glass edition — design

*Written 2026-09-24 from the brainstorm with Leonardo (the companion screens are summarised below, with comps in `v5-comps/`). Status: **approved** by Leonardo on 2026-09-24 ("Looks good, build it.") and built the same day; section 14 records what changed during the build.*

## Bottom line

v5 opens on a dark cobalt room, out of focus, with **leonardo carvalho** written across it in liquid glass by an unseen pen. After about 2.4 seconds a glass **Enter** button appears. Pressing it, pressing Return, or scrolling pulls the room into focus. The name then flies into a floating glass window, and the portfolio arrives as visionOS windows in that room: a main window with a tab bar on its left edge, a toolbar across its bottom, and two side windows turned toward you. From then on you never leave the room. Pages change inside the windows, and projects open as sheets in front.

It is the fifth, and last, candidate edition. Like the others it stands alone: it shows, embeds or links nothing from v1 to v4, and shares only their content.

## 1. Decisions already made

| Question | Decision | Comp |
| --- | --- | --- |
| What is "liquid glass mode"? | The whole portfolio. The hello is the front door; one obvious control takes you in. | — |
| The background | D, redrawn: Apple's Liquid Glass wallpapers (the macOS Tahoe glass wave over out-of-focus forms, with the iOS 26 wallpapers' thin rims), in cobalt. The hello sits on the same scene out of focus; Enter pulls focus. | `0-hello-room.png`, `2-room-and-windows.png`, refs `ref-tahoe-wallpaper.png`, `ref-ios26-wallpapers.png` |
| Night or Day | Both. They follow the visitor's system appearance, the way Tahoe swaps its wallpaper. | — |
| 3D | Side windows sit turned toward you at 24°, as in the Spotify and dashboard shots, and the room shifts slightly with the pointer (a head-movement parallax). Nothing tilts on hover. | `2-room-and-windows.png` |
| The lettering | Sacramento (Astigmatic, SIL OFL 1.1), traced to single pen strokes and written in pen order. Lowercase, one line (two lines on narrow screens). | `1-hello-glass.png` |
| Its finish | Liquid glass that moves: drifting light that follows the pointer, a sheen along the strokes, a slow internal flow. | `1-hello-glass.png` |
| Its pace | Overlapped: the second word starts when the first is half written. Enter is ready at about 2.4 s. A click or any key finishes it at once. | — |
| Glass mode structure | **Proposed here** (section 4): one room, many windows. | `3-home.png`, `4-project-sheet.png`, `5-phone.png` |

## 2. The room

- **One scene, drawn in code** (WebGL2 fragment shader, no images): a sky from navy to a violet horizon, a far soft hill, large out-of-focus rounded forms in cobalt and periwinkle, a softer violet glass sheet behind, and the main glass wave in front. The wave is an S-curve sheet with one crisp bright edge. It bends what sits under it near the edge, and faint streaks of light run along its crest.
- **Day** keeps the geometry and swaps the palette to Tahoe's light version: sky blue to a cream horizon, brighter forms.
- **Motion:** the crest undulates and the forms drift very slowly (periods of 20 to 60 s). The whole scene moves a little against the pointer, the opposite way to the windows, for depth.
- **Out of focus** (the hello) and **in focus** (glass mode) are the same scene. The defocus is a blur the renderer can animate continuously, so Enter is a real focus pull.
- **Fallbacks:** a still of each palette (`room-night.webp`, `room-day.webp`, rendered from the shader) is the CSS background under the canvas. It shows before WebGL starts, without WebGL, and with scripts off.

## 3. The hello

- **The name** is Sacramento's own letterforms, traced to their centre lines and chained in writing order. It is drawn as one pen stroke per word. Where the pen goes back over its own line (the tops of a, v and o, the stems of l, h and d) it retraces the same points, so nothing doubles. The data is a small script, about 16 KB (`assets/data/name.js`), so no font file ships and no request goes to Google Fonts.
- **Liquid glass ink:** the strokes are clear glass tubes over the blurred room. They bend it and carry bright rims and a specular highlight. The light drifts on its own and leans toward the pointer, a sheen sweeps along the letters every 6.5 s, and the surface flows slowly. A soft shadow sits under the letters.
- **Pace:** one line on screens wider than about 700 px, two lines below that so the letters stay large. Overlapped timing: "leonardo" writes over 1.45 s and "carvalho" starts at 0.82 s, with a gentle ease-in and ease-out per word.
- **Enter:** a glass capsule button appears under the name when writing finishes (about 2.4 s after load). Return, a click on it, or a scroll or swipe down enters. During writing, a click or any key finishes the name at once.
- **Once per visit:** the hello writes on the first home view of a session. Later home views open straight into glass mode. The written name stays as the window title, and pressing it writes it again.
- **Reduced motion:** no writing and no focus pull. The name and windows appear with a short crossfade.

## 4. Glass mode: one room, many windows *(proposed)*

**Why this structure.** The room and the windows never move; only content scrolls, inside its window. That is what makes visionOS feel spatial, and it is what your references show. Every page is still its own address and HTML file: it reads without scripts, prints, deep-links, and Back and Forward work. With scripts on, moving between pages keeps you in the same room, like switching tabs in a visionOS app.

**Rejected alternatives.** One long page of glass panels would be simpler to build, but the windows would scroll away and the room would stop being a room. A spatial canvas you pan around would be the most immersive, and the worst for reading the record and for phones.

### The pieces

- **Main window.** Centred, 52% of the viewport width (clamped 720 to 1040 px), filling the height between 5 vh top and bottom margins. Radius 32 px. Its header holds the written name (home) or the page title. Its body scrolls inside the window, and the content dissolves into the glass at the top and bottom edges (Liquid Glass's scroll-edge effect).
- **Tab bar**, a vertical ornament hanging off the window's left edge with Home, Work, Hockey, About and Résumé. At rest it shows icons only. Pointing at it opens it to show names, and it closes again when the pointer leaves, as in visionOS. The selected tab sits in a glass bubble that stretches and slides to the next tab when you switch.
- **Toolbar**, an ornament across the window's bottom edge (overlapping it by 20 pt, Apple's figure) holding the page's own actions.
- **Side windows** (at 1280 px wide and above), turned 24° toward the viewer and holding supporting content. Between 900 and 1279 px their content becomes sections inside the main window.
- **Sheets.** A project opens as a smaller window in front. The window you came from steps back 10% and dims to about 50%. The close button sits top-left (the visionOS convention), and Escape or Back also closes it. The toolbar moves to the neighbouring projects.
- **Window bar** (the small dot and capsule under the window): drag it and the window follows up to 40 px, then springs back. It is a harmless visionOS nod, and nothing is actually moved.

### Pages

| Page | Main window | Side windows (left / right) | Toolbar |
| --- | --- | --- | --- |
| **Home** (`/`) | Written name, the introduction ("Goaltender at Groton School, Class of 2028. Outside the rink I do research on drug safety and rehabilitation, run a student music nonprofit and build software with friends."), portrait; Work (four cards on their screens' colours); Experiments; the record as five first-person leads over dated rows; contact. **No numbers.** | Now (form, from, live Groton clock) / This fall | Write to me · Elite Prospects · NCSA |
| **Work** (`/work/`, new) | All seven projects as cards; the eight experiments | Experiments list / In progress (Loquar, Daedalus) | All · Research · Build · Music · Community (filters the cards) |
| **Project sheets** (`/work/<slug>/` ×7) | Each project's page, in the same sections as v4's copy (Aducanumab and Genuvalens: abstract, question, method, numbers, findings, limitations, references; OCAPEX, Loquar, Daedalus, FreeCode, This site as in v4). Opening one directly shows it in front of the Work window. | — | ‹ previous · next › (and the project's public link where one exists) |
| **Hockey** (`/hockey/`) | Recruiting profile: how I play, stats with sample size, academic snapshot, team history | Measurables (style, catches, height, weight, born, number) / Coaches by name and role; profiles | Print profile · Elite Prospects · NCSA · Write to me |
| **About** (`/about/`) | The essay and Now, fall 2026 | Portrait and From / Interests with their verdicts | Write to me · Résumé |
| **Résumé** (`/resume/`) | The full record: Education, Research and experience, Selected projects, Leadership and service, Athletics, Music, Honors, Technical | Section index (jumps within the window) / Contact | Print |

**This site** gets new copy describing v5 itself (the traced name, the room, the glass). It does not mention the other editions.

### On phones and narrow tablets (below 900 px)

The window becomes a full-screen sheet with 10 px margins and a 40 px radius. The tabs become a floating Liquid Glass tab bar at the bottom, as in iOS 26, and side windows become sections inside the sheet. Nothing is angled and there is no pointer parallax. The hello writes on two lines below 700 px and on one line above it.

## 5. The glass itself

- **Rendered with the room.** Windows, ornaments and glass buttons are registered elements (`data-glass`). Every frame the renderer reads their positions (flat ones from their boxes; the angled side windows from the same 3D matrix CSS applies) and draws their glass into the room canvas. The HTML content sits on top.
- **What the shader does inside each panel:** frost (samples the room's blurred mip levels), lensing (bends the room near the panel edge, strongest within about 24 px of it, following the rounded-rectangle outline), a tint that keeps white text above 4.5:1 in both palettes, a bright rim, and a specular highlight whose light drifts and follows the pointer. When the pointer presses a control, the glass lights up from under the pointer (Apple's "illuminates from within").
- **Materialising:** glass appears and disappears by ramping its lensing and frost, not by fading, as Apple describes Liquid Glass.
- **Glass on glass is avoided.** Controls sitting on a window use fills and vibrancy, not a second layer of glass, per Apple's rule.
- **Fallbacks:** without WebGL2, with `prefers-reduced-transparency`, or when printing, the same elements use CSS glass (backdrop blur and saturation, tint, rim gradient) over the still wallpaper. Reduced transparency makes it frostier and more opaque.

## 6. Motion

One spring model everywhere, Apple's springs expressed as response and damping (for example 0.5 s at 0.86 for windows, 0.35 s at 0.8 for controls). Everything is interruptible. JavaScript drives the window and glass animations in the same frame as the renderer, so the glass never lags its window.

| Moment | Motion |
| --- | --- |
| Enter | The button squashes under the press, lights up and dematerialises. The room pulls focus over about 1.2 s. The name flies into the window's title slot. The main window materialises (from 14% of the viewport width back, at 96% scale) at 0.18 s, the side windows swing in from 52° to 24° at 0.34 s, then the tab bar (0.55 s), toolbar (0.62 s) and window bar (0.7 s) follow. |
| Changing page | Outgoing content drops back and blurs (180 ms). The window springs to its new size, the tab bubble slides, and the new content rises in (260 ms). Side windows swing out and back in with their new content. |
| Opening a project | The parent steps back and dims, and the sheet materialises in front. Closing reverses it. |
| Hover | The visionOS highlight: a soft light that follows the pointer inside the element, and a lift (scale 1.02) on cards. No tilt. |
| Press | Scale to 0.97, the glass lights up at the press point, then springs back. |
| Tabs | The bar opens on hover to show names and closes after the pointer leaves (300 ms delay). |
| Reduced motion | No parallax, writing, focus pull, lensing animation or springs; crossfades of 150 ms only. |

## 7. Type, colour, space

- **Type:** the system UI font, meaning SF Pro on Apple devices and each platform's own UI face elsewhere. No font files. Following visionOS: titles 34 px bold, section titles 22 px bold, body 17 px medium, secondary 15 px medium at 66% white, captions 13 px, nothing under 12 px. Slightly open tracking on small text over glass. Tabular figures for numbers and the clock.
- **Colour:** white text on glass (primary 100%, secondary 66%, tertiary 45%). The room palettes are as in section 2, and the project cards keep their screens' colours (Loquar gold `#CDAA6D`, Genuvalens blue `#1E63A8`, OCAPEX sand `#E4C4A2`, aducanumab on paper `#F2EFE8`). Focus is a white 2 px ring with a soft glow. There is no other accent.
- **Radii**, concentric per Apple (outer radius = inner radius + padding): windows 32, cards 20, controls 999 (capsules), the phone sheet 40.
- **Icons:** drawn for this site in SF Symbols' spirit. SF Symbols themselves may not be used on the web.

## 8. How it's built

- **Static HTML, CSS and vanilla JavaScript, no build step**, in `v5/`, previewed with `python3 tools/serve.py 8778` at `/v5/`.
- **Scripts:**
  - `room.js`: the WebGL2 room, glass panels and hello ink.
  - `name.js`: the traced strokes.
  - `hello.js`: writing, Enter and the hand-off to the title.
  - `windows.js`: layout, ornaments, side windows, springs.
  - `nav.js`: page changes. Same-edition link clicks fetch the target page, swap the window contents in place, update the address and title, move focus to the new heading and announce it, and restore scroll on Back. On any failure it falls back to a normal page load.
- **Pages:** `index.html`, `work/index.html` (new), `work/<slug>/index.html` ×7, `hockey/`, `about/`, `resume/`. Each is complete on its own.
- **The name's tools** are kept in the repo so it can be regenerated: `tools/trace-name/` (skeletonise, chain, export).
- **Images:** the existing derivatives (WebP and AVIF, with their JSON sidecars) are copied from the shared sources into `v5/assets/img/`, plus the two wallpaper stills.
- **Budgets:** the room renders at up to 1.5× device pixels, 60 fps while anything moves, 30 fps when idle, and pauses in a hidden tab. If the first second's frames average over 20 ms, it drops to 1× and stops the room's own motion. The name's ink canvas exists only during the hello.

## 9. Content rules (unchanged across editions)

First person, always "Leonardo", no en or em dashes, no superlatives. Caveats travel with their facts. Facts come from the existing pages and `CONTENT-REVIEW.md`. No numbers on the landing. Coaches by name and role only, hometown South Florida, correspondence via a parent. Hidden-until-ready material (film link, 2026-27 stats, résumé PDF) stays hidden, with an HTML comment saying what fills it. `noindex` on every page. No third-party requests.

## 10. Accessibility

- Text on glass is at least 4.5:1, checked by sampling the rendered glass in both palettes.
- Visible focus.
- Keyboard: Tab reaches the tab bar, window content, toolbar and side windows; Escape closes sheets; Return enters from the hello.
- The window's scroller is focusable. The wheel over the room scrolls the main window, so nobody is ever stuck.
- The written name is a heading with the label "Leonardo Carvalho".
- Skip link; `aria-current` on tabs; page changes announced.
- Reduced motion, reduced transparency and forced colours are honoured.
- Every page prints as plain text on white, and Hockey fits one Letter sheet.

## 11. How it's checked

- **Viewports:** 1440×900, 1280×800, 1024×768, 768×1024 and 390×844.
- **Browsers:** Chrome, Safari (WebKit) and Firefox.
- **Captures** of the hello mid-write and done, Enter, every page, a sheet, and the phone tab bar.
- **Modes:** no-JavaScript, reduced motion, reduced transparency and print.
- **Robustness:** a keyboard-only pass, zero console errors, and frame-time sampling on this Mac.
- **Finish:** a finish review against this document, then `README.md` and `DESIGN.md` recorded from the built pages.

## 12. Risks, and what I'd do about them

- **Glass and windows drifting apart during motion.** Handled by driving both from one frame loop (section 6).
- **Nested scrolling feeling foreign.** Handled with the wheel over the room scrolling the window, momentum left native, and the scroller focusable. If it still feels wrong in testing, the fallback is page scroll with fixed ornaments, at some cost to the room's stillness.
- **Weak GPUs.** Handled by the auto-degrade in section 8.
- **Direct loads of project pages.** They show the sheet over a dimmed Work window, so the space is the same however you arrive.

## 13. Out of scope

Sound, a custom cursor, 3D models, genuinely movable windows, a light/dark toggle (the system decides), and per-project room tints. Any of them can be added later without changing the structure.

## 14. Changes during the build

Recorded 2026-09-24 so this document matches what was built. The sections above keep the approved wording.

- **Side windows float at 1360 px and wider**, not 1280 px: at 1280 they collided with the tab bar. From 900 to 1359 px their content sits inside the main window.
- **Text levels:** secondary text is 78% white and tertiary 71% (not 66% and 45%), the fill panels are 6% white, and the glass caps its own brightness, so text keeps 4.5:1 over the bright day room as well as on the luminous night glass. Fact labels on the fill panels use the secondary level.
- **Night glass is luminous cobalt**, tinted toward the comps' blue rather than darkened; the finish review measured the first build about 40% darker than the comps.
- **Behind a sheet**, the parent window fades its contents as it steps back and dims, and its toolbar and window bar step away with it. The room draws glass under the page, so it cannot frost HTML content; without this the parent's text would show through the sheet. The tab bar and side windows stay, dimmed; on phones the bottom tab bar steps away too.
- **The phone's bottom tab bar uses CSS backdrop glass**, because content scrolls under it.
- **The name's ink** lives on after the hello as the home window's title (section 3). The mask canvas covers only the name's own area. The name data is `assets/js/name-data.js`.
- **The Enter button** uses a prominent glass: cobalt-tinted and brighter than the room, like Apple's prominent glass buttons, so it is easy to see. The title turns to white glass as it flies into the window.
- **Frame budget:** a machine averaging over 22 ms across its first 90 frames drops to 1× and stops the room's drift. Under reduced motion the room stops drifting and does not redraw while nothing moves.
- **Paging between projects** inside an open sheet replaces the history entry, so closing the sheet (or Back) returns to the page underneath in one step. Forward reopens the sheet.
- **The Work page's Experiments window** lists the eight experiments by title and year so it fits without scrolling; their descriptions are on Home.
- **Tablets (700 to 899 px)** use the phone layout with cards in as many 150 px columns as fit, and the written title at most 460 px wide.
- **Below 700 px the title is the two-line name** (`name-2.svg`), matching the hello's own switch, so the name always flies into a slot of the same shape; the phone home drops the avatar, as in the phone comp.
- **Lensing** bends the room within about 30 px of a window's edge and 20 px of smaller glass (section 5 says about 24 px).
- **Card metas take at most two lines** and always reserve two, so titles share a baseline; category chips sit on a dark frosted pill so they read over any screenshot.
- **The tab bar's glass is CSS backdrop glass** at every size: opened, it lies over the window's text, which the room's glass cannot frost. Glass is drawn in layers (windows, then ornaments, then controls), so a toolbar always sits over its window's rim. Side windows are 17vw wide with a 16px gap to the tab bar, and may grow to 94% of the window's height.
- **A color style control** (bottom right; beside the tab bar on phones) turns the room's palette for trying colors: eight palettes, hue, vibrance, and Auto, Night or Day. It was added on Leonardo's request after the build ("so I can play around with that").
