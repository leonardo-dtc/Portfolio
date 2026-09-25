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
- Every page carries `<meta name="robots" content="noindex">` while the site is a comparison build; it has not been deployed.
- Updated dates on the record: September 2026.

## Capabilities and Constraints

- Every page reads without JavaScript. Fonts are self-hosted latin subsets. No analytics, no third-party requests, no CDN fonts.
- Images ship as derivatives only (WebP and AVIF, EXIF stripped); source photographs stay in place. Hockey photographs carry no treatment.
- Hidden-until-ready content stays hidden with an HTML comment saying what fills it: 2026-27 stat tiles, the season schedule, the résumé PDF button, the film link.
- Placeholders exist for photographs not yet supplied (OCAPEX performance, viola, crease, FreeCode session, Carnegie Hall, team-history photos). They are labeled, never faked.
- Keep completed work, submissions, plans and simulation results distinct. Organization-wide impact is attributed to the team.
- Undecided: which edition becomes the default (*open*; Leonardo called v5 "the final version of the portfolio before we make a choice between the options"), a deployment target (*open*).

## Brand Commitments

- Name: Leonardo Carvalho. Voice: first person, plain, specific, no superlatives, no dashes.
- v4 brief, binding: "Apple style, super minimal and super simple ... a consistent design scheme that is not generic AI", and, after the first build, "personality": white as the base with his real, colourful screens inside Apple devices to contrast, and a hero with interactive Apple-like features. References the user named as good: seyityilmaz.com, ethanchng.com, hasque.com, perryw.ca, rocky.framer.website, and Framer's free templates.
- v5 brief, binding (2026-09-24): "an Apple Vision style design, with liquid glass UI and clean styling"; a hero saying Leonardo Carvalho "in the same way the Apple does their 'hello'" over an Apple-style background; "when something happens, easy for the user to see, let them go into the liquid glass mode"; animations "smooth, sensible, interactive, visually aesthetic and like Apple or iOS design". References he named: four Dribbble Vision Pro concepts (Spotify Spatial UI, Steam for visionOS, a Vision Pro dashboard, a Vision Pro vitamins shop). His choices: the whole site is glass mode; the Tahoe glass wave in cobalt, flat rather than 3D, Night and Day; visionOS side windows at an angle, no hover tilt; the name in traced Sacramento, lowercase, liquid glass with a moving surface.
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
