# Product

<!-- impeccable:product-schema 1 -->

Written 2026-09-20 from repository evidence (the three shipped editions, `CONTENT-REVIEW.md`, the v2 copy) and the v4 brief. The user was not available for an interview in this session, so every fact below is either quoted from the repo or marked *inferred*.

## Platform

web

## Stack

Static HTML, CSS and vanilla JavaScript with no build step, one folder per edition (`/`, `v2/`, `v3/`, `v4/`, now `v5/`), previewed with `python3 tools/serve.py 8778`. *Inferred* from the shipped editions and the requests for "a v4 of the portfolio" and "v5" beside them. v5 adds WebGL2 for its room and glass, with CSS glass as the fallback.

## Users

- **College hockey coaches and recruiters.** Arrive from Elite Prospects, NCSA or an email. Want position, measurables, stats with sample size, film, academics and coach contacts, fast and printable.
- **College admissions readers.** Want to know what the work is, what Leonardo did himself, at what stage it is, and whether it holds up.
- **Peers and collaborators.** Want the projects and how the site was made.
- **Leonardo himself**, who calls the whole site "the résumé" and keeps the editions beside each other for comparison.

## Product Purpose

The personal portfolio of Leonardo Carvalho, Groton School Class of 2028: goaltender, student researcher (drug safety, rehabilitation robotics), founder and president of OCAPEX, violist, and builder of software with friends. Success is that a reader knows within seconds who he is and what he does, that each audience finds its material without wading through the others', and that every fact reads exactly as true as it is.

## Positioning

The record is specific work with named collaborators, a stated stage and its caveats attached: a sole-author pharmacovigilance analysis of 486 FDA adverse-event cases advised at Harvard, a simulated assist-as-needed knee exoskeleton with guidance from Georgia Tech's EPIC Lab, a founded 501(c)(3) with organization-wide totals, a butterfly goaltender's recruiting profile, a Carnegie Hall recital. Four disciplines held together by one habit, "read early, then commit." No neighboring student portfolio can copy the specifics.

## Operating Context

- Preview: `python3 tools/serve.py 8778`, often already running; editions at `/`, `/v2/`, `/v3/`, `/v4/`, `/v5/`.
- Copy conventions (from `v2/README.md`): first person, always "Leonardo", no en or em dashes, no superlatives; facts come from the v2 pages and `CONTENT-REVIEW.md`; caveats travel with their facts.
- Every page carries `<meta name="robots" content="noindex">` while the site is a comparison build. It is published to GitHub Pages (`https://leonardo-dtc.github.io/Portfolio/`) from `main` as an outlet for review, not as the chosen site.
- Updated dates on the record: September 2026.

## Capabilities and Constraints

- Every page reads without JavaScript. Fonts are self-hosted latin subsets. No analytics, no third-party requests, no CDN fonts.
- Images ship as derivatives only (WebP and AVIF, EXIF stripped); source photographs stay in place. Hockey photographs carry no treatment.
- Hidden-until-ready content stays hidden with an HTML comment saying what fills it: 2026-27 stat tiles, the season schedule, the résumé PDF button, the film link.
- Placeholders exist for photographs not yet supplied (OCAPEX performance, viola, crease, FreeCode session, Carnegie Hall, team-history photos). They are labeled, never faked.
- Keep completed work, submissions, plans and simulation results distinct. Organization-wide impact is attributed to the team.
- Undecided: which edition becomes the default (*open*; Leonardo called v5 "the final version of the portfolio before we make a choice between the options"). GitHub Pages is the current outlet (Leonardo, 2026-09-25); a final domain is *open*.

## Brand Commitments

- Name: Leonardo Carvalho. Voice: first person, plain, specific, no superlatives, no dashes.
- v4 brief, binding: "Apple style, super minimal and super simple ... a consistent design scheme that is not generic AI", and, after the first build, "personality": white as the base with his real, colourful screens inside Apple devices to contrast, and a hero with interactive Apple-like features. References the user named as good: seyityilmaz.com, ethanchng.com, hasque.com, perryw.ca, rocky.framer.website, and Framer's free templates.
- v5 brief, binding (2026-09-24): "an Apple Vision style design, with liquid glass UI and clean styling"; a hero saying Leonardo Carvalho "in the same way the Apple does their 'hello'" over an Apple-style background; "when something happens, easy for the user to see, let them go into the liquid glass mode"; animations "smooth, sensible, interactive, visually aesthetic and like Apple or iOS design". References he named: four Dribbble Vision Pro concepts (Spotify Spatial UI, Steam for visionOS, a Vision Pro dashboard, a Vision Pro vitamins shop). His choices: the whole site is glass mode; the Tahoe glass wave in cobalt, flat rather than 3D, Night and Day; visionOS side windows at an angle, no hover tilt; the name in traced Sacramento, lowercase, liquid glass with a moving surface.
- Round two, binding (Leonardo, 2026-10-02): the family preferred v3 and v5, so they are the finalists; the others are donors (see `docs/editions/`). v4 kept as a source of what he enjoys: the static, the smooth and creamy hovers, the experiments that open while the rest dim and blur, the solid organization. v3: guidance on the rail, the file system on the page (opened by hovering the dots) with files that come out of their folders, a personal archive, a better ending. v5: no text or UI blurred by motion, the tab bar off the main window's edge, two blocks (the main window and one side window), and a hero in v4's heavy type as Liquid Glass glowing from behind, entered by clicking the title ("Click the title to proceed") instead of an Enter button. This replaces the Sacramento hello in the v5 brief above.
- Round three, binding (Leonardo, 2026-10-03): wording waits until one final design is chosen; this round refines v3 and v5 in design and organization for general audiences, records what worked where, tracks every element he named with how each finalist matches it, and lists the questions that depend on his taste (`docs/editions/round-3.md`). A desktop with "apps" (after myos.framer.website) is wanted only if it improves organization, adds personality or serves the site's purpose: it was proposed for v5 as a visionOS Home View, not built. The v5 hero returns on every reload of the home page, and its title should have the feel of Apple's "It's Glowtime." art (layered neon light, additive glow), animated and smooth.
- After round three (Leonardo, 2026-10-04): he likes the v5 hero's look and wants it to match the colour style chosen, so each palette gives the name its own neon (Cobalt keeps the Glowtime colours he liked); the colour options must be optimal for visitors (the palettes now turn in OKLab and are re-tuned, see `docs/editions/round-3.md`, section 10); and GSAP "can and should be used if it improves the feel": self-hosted, each edition its own copy, used only where it measurably improves the motion (v5's Work grid uses Flip; v3 has none, because its motion is already CSS-native and GSAP would change nothing a visitor sees).
- The desktop, revisited (Leonardo, 2026-10-04): in v3 the desktop would be "on a macintosh computer"; v5 "would remain a modern computer". Built in v3 as the archive's Macintosh (a classic one-bit Mac taped onto the archive sheet, its desktop holding the archive's cards as files), not as the landing page, which would have replaced the cover. v5's launcher still waits on T34, T27 and T35 (`docs/editions/round-3.md`, section 11).
- The taste questions, answered (Leonardo, 2026-10-05, on the decision page; `docs/editions/round-3.md`, section 12): v5 gets the launcher row on the hero (T34), its apps in the colour style with white glyphs (T35) and no numbers (T36); the hero proceeds on a scroll, a swipe, Down or Space too (T26); a way to write shows from every view in both editions (T4); the class games are left out of the showcases, kept as coursework on the résumé (T6); v5's tab bar is generated from one list (T33); v3's contact sheet is to be "very clean", with its words inside their lines (T18). Where he asked to try options, or an answer reads two ways, each is a design toggle in the browser's developer tools (`toggles` in the console; kept in that browser only, so visitors see the defaults): v5's hero content (T27), the apps' look (T39) and the glass name of the launcher mock (T41); v3's archive as cards or the Mac (T17), the cover as a desk (T40), and the contact sheet's look and words (T18). The unused hello files (T30, "Delete them") wait for his confirmation in chat; sheet order (T15) and phones (T16) wait for the final design.
- The archive holds the personal ideas (Leonardo, 2026-10-05: "Let the items in the archive actually have information on them, as that is where personal ideas are"; `docs/editions/round-3.md`, section 13): each item carries a file of what the site's own sources say about it, and nothing more; what is not on file is left out and listed for him to supply. v3's Macintosh is to be "slightly more comprehensible but still clean and stylistic", not a rudimentary one: the Platinum desktop of the mid-nineties in the poster's colours, in the site's own type. v5's archive is written from one list, as its chrome is.
- Existing editions: v1 terminal (ASCII, games), v2 editorial (paper, Inter/Newsreader/JetBrains Mono, oxblood hairline), v3 poster (black, paper, vermilion, torn edges), v4 dim room (a dark ground with one lit window). v4 and v5 are new worlds beside them, not polishes of any.
- Editions are separate designs on purpose (Leonardo, 2026-09-21): one will be chosen and the others archived, so an edition must never show, embed, screenshot or link to another edition. Content is shared; design identity is not.


## Evidence on Hand

- Copy: `v2/index.html`, `v2/about/`, `v2/hockey/`, `v2/resume/`, `v2/work/*` (canonical facts); `CONTENT-REVIEW.md` (wording and factual follow-ups).
- Images: `v2/assets/img/` (studio portrait 480x600 and 320 square; Loquar landing screenshots 1440x900 and 1280x720; Genuvalens hand-drawn hardware layout 1600x794 and a 960x640 crop; control block diagram 1800x932; capacity and deficit charts; results plot 1200x1656). `v3/assets/img/` (goalie mask renders 560px from `assets/model/GMask.obj`, a downloaded model with rough geometry, not Leonardo's own mask; portrait cutout 501x514, OCAPEX sticker 320). Source photograph `assets/img/portrait.jpg`. Screenshots of his real screens (the three earlier editions, ocapex.com) in `v4/assets/img/`.
- Data: aducanumab figure values and Table 1; Genuvalens Tables 1 and 2; OCAPEX totals as of September 2026; hockey measurables and the 2025-26 two-game line; academic snapshot (GPA 4.0, SAT 1490, nine AP 5s).
- Links: Elite Prospects `https://www.eliteprospects.com/player/836323/leonardo-carvalho`, NCSA `https://recruit-match.ncsasports.org/clientrms/athlete_profiles/13086136`, `https://ocapex.com`, `https://www.youtube.com/@OCApex`, FDA AEMS pages, reference DOIs.
- Absent, wanted for v4's experiments and hero: short captures of the class games, a frame of the Calculus BC music video, the AP Statistics index chart, a page of the Vivaldi and Phantom arrangements, the Daedalus design document; and one line in Leonardo's handwriting, photographed. Until they exist the experiments list ships without previews and the home page's one handmade object is the Genuvalens sketch.
- Absent, must not be fabricated: résumé PDF, film link, published paper URL, most photographs, 2026-27 statistics, a Groton GPA conversion (Honor Roll is the documented record), any awarded Congressional medal.

## Product Principles

1. The work first; the person emerges from the specifics, not from self-description.
2. Every number carries its caveat and its owner: sample size, model versus patient, team versus individual.
3. Three audiences at three speeds: the home page curates, the résumé catalogues, the project pages prove.
4. Reads without scripts, prints cleanly, loads fast, requests nothing from third parties.
5. Absent material stays absent or clearly labeled; nothing is invented to fill a slot.

## Accessibility & Inclusion

Established across editions and kept: keyboard focus visible, `prefers-reduced-motion` honored, text contrast at or above 4.5:1, nothing set below 12px, content readable without JavaScript, print styles on every page. *Inferred* as a requirement from `CONTENT-REVIEW.md` and the v2 README rather than stated by the user.
