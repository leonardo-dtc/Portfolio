# Decision matrix: the five editions

Scored 2026-10-02 on the editions as published from `main` at `b110536`, before the round of polish on v3 and v5 that follows it. Evidence: a screenshot tour of every edition at 1440×900 and 390×844 including its main interactions, the September audits of all five, measured page weights, Leonardo's notes on v4, the family's preference for v3 and v5, and the research listed at the end.

## How to read it

Each edition gets 1 to 5 per criterion (halves allowed): 1 is absent or harmful, 3 is sound but unremarkable or strong with a real flaw, 5 is the best a student portfolio could reasonably do. Weighted totals are out of 100. Two weightings are shown because the answer depends on what the portfolio is for:

- **Balanced** follows PRODUCT.md's definition of success: a reader knows within seconds who Leonardo is, each audience finds its material without wading through the others', and every fact reads exactly as true as it is.
- **Impression-led** weights what the family responded to: concept, personality and motion.

| Criterion | What it measures | Balanced | Impression-led |
| --- | --- | ---: | ---: |
| Animation and motion | Smooth, purposeful and comfortable motion | 10 | 12 |
| UI/UX and visual craft | Hierarchy, readability, consistency, affordances | 10 | 8 |
| Creativity and originality | How distinct the concept and its execution are | 10 | 15 |
| Ease of use and access | Getting around without instruction; contrast, keyboard, reduced motion, no-JS | 12 | 8 |
| Organization and wayfinding | Structure, labels, knowing where you are, finding one specific thing | 12 | 8 |
| Personality: design | Whether the design has a point of view | 6 | 10 |
| Personality: personal use | Whether it feels like Leonardo and leaves him room (play, an archive, updates he would enjoy making) | 6 | 8 |
| Design potential | Strength of the hero; how well the system takes new content and change | 8 | 9 |
| Audience fit | Coaches and admissions readers reach position, stats with sample size, academics, contacts and the stage of the work within seconds; credibility | 12 | 8 |
| Phone experience | The same, on a phone | 7 | 6 |
| Performance and reach | Weight, GPU and CPU cost, third-party requests, weak devices | 4 | 4 |
| Maintainability | How easily the content can be changed | 3 | 4 |

## Scores

| Criterion | v1 terminal | v2 editorial | v3 poster | v4 dim room | v5 glass |
| --- | :-: | :-: | :-: | :-: | :-: |
| Animation and motion | 3.5 | 2.5 | 4.5 | 4.5 | 3 |
| UI/UX and visual craft | 3 | 4.5 | 3 | 4 | 3.5 |
| Creativity and originality | 5 | 2 | 5 | 3 | 5 |
| Ease of use and access | 3 | 5 | 2.5 | 4 | 3 |
| Organization and wayfinding | 4 | 5 | 3 | 4.5 | 4 |
| Personality: design | 4 | 2.5 | 5 | 3 | 4 |
| Personality: personal use | 4 | 3 | 4 | 3.5 | 3.5 |
| Design potential | 2.5 | 3.5 | 4 | 4 | 4 |
| Audience fit | 2.5 | 5 | 3.5 | 4 | 3.5 |
| Phone experience | 3 | 4.5 | 3.5 | 4 | 3.5 |
| Performance and reach | 3 | 4 | 4.5 | 4 | 2.5 |
| Maintainability | 2 | 3.5 | 4 | 3.5 | 2.5 |
| **Balanced total** | **67.2** | **77.8** | **74.7** | **78.1** | **72.0** |
| **Impression-led total** | **69.9** | **70.7** | **79.6** | **75.8** | **73.6** |
| Design criteria, mean of 5 | 3.60 | 3.00 | **4.30** | 3.70 | 3.90 |
| Use criteria, mean of 4 | 3.12 | **4.88** | 3.12 | 4.12 | 3.50 |

Design criteria: animation, UI/UX, creativity, personality (design), design potential. Use criteria: ease, organization, audience fit, phone.

## What the numbers say

1. **The family picked the two strongest designs.** v3 and v5 lead the design criteria (4.30 and 3.90). Their weakest scores are the use criteria, which is exactly what this round's polish targets: v3's organization and v5's motion.
2. **v3 wins when impression matters and loses on finding things.** Its 2.5 for ease and 3 for organization come from hidden navigation: eleven unlabelled 8 px dots and an 18 px folder icon. Nielsen Norman Group found hidden navigation cut discoverability almost in half and slowed desktop users by about 39%. Fix that (organization 4.5, ease 3.5, personal use 4.5) and v3 leads the balanced weighting too, at 81.3.
3. **v4 is the best-balanced edition and the best donor.** It tops the balanced weighting on the strength of the qualities Leonardo named: the static, the creamy hover geometry, the experiments' expand-and-dim, and solid organization. Its ceiling is creativity ("bland"), so its parts are worth more transplanted than re-skinned.
4. **v2 is the recruiting backbone.** It is the best on every use criterion (4.88) and the plainest to look at. Its hockey one-pager, résumé rail and search are the parts a coach or admissions reader actually uses, and a final edition should carry them in its own design language.
5. **v5's cost is comfort and reach.** It is the most ambitious build, but the motion blurred text, windows swung on every page change, everything drifted with the pointer, and the WebGL room needs a capable GPU. The first three are fixable in this round; the GPU cost is the price of the concept.
6. **v1 is a playground, not a finalist.** Its games, ASCII art and palette shuffle are the most personal pieces anywhere in the site, and they belong in an archive or an easter egg rather than in front of a coach.

## Why each edition scored as it did

**Animation and motion.** v1: rich (reactive field, letter flips, wipes, 31 live illustrations, games) but busy and mechanical. v2: restrained 300 ms reveals and image settle; clean but scant. v3: sheet stacking through torn edges, the recede, replaying reveals, the self-typing code panel, stickers settling; cinematic and on brand. v4: the micro-interactions Leonardo called smooth and creamy (tile settle 1.05 to 1 with a turning arrow, experiments that open while their siblings dim and blur, rows that lean, spring previews) plus the living static. v5: technically the most ambitious, but text blurred during page swaps and behind sheets, side windows swung 52° on every page change and every window drifted with the pointer, which the family found disorienting.

**UI/UX and visual craft.** v1: small monospaced text and paged desktop scrolling slow reading; the detail views are good. v2: the best readability and hierarchy, with a search palette, filters, a cursor preview and the résumé rail. v3: strong hierarchy inside each sheet; weak between sheets, and the contact block is cramped. v4: clean, consistent and generous, though dark and small in places. v5: a coherent spatial metaphor; angled side windows and small side text reduce legibility.

**Creativity and originality.** v1, v3 and v5 are each unlike any neighbouring student portfolio. v4 is tasteful and recognisably in the family of the sites it studied. v2 is a classic editorial template.

**Ease of use and access.** v1 has the most thorough accessibility engineering (keyboard, reduced motion, no-JS and a whole low-detail mode), but its default mode asks a lot of a casual reader. v2 needs no instruction at all. v3 hides its navigation, and white on vermilion (`#EA3D2E`) is 4.03:1, under the 4.5:1 floor. v4 has a visible pill menu, but the name in its hero takes about 1.3 seconds to finish revealing (measured: 1.19 to 1.34 s over three loads). v5 gates the home page behind the hello, needs WebGL2 for its intended look and moves a lot.

**Organization and wayfinding.** v1: eight named, numbered chapters with entries and detail views. v2: a complete architecture (work index, two project templates, hockey, about, résumé). v3: a sensible sheet order and an index drawer, but nothing tells you where you are or what else exists, there is no archive, and project detail lives in another edition. v4: the home page curates (tiles, experiments, the record) and the sub-pages go deep. v5: inherits v4's architecture as tabs and sheets.

**Personality, design.** v3 has the strongest point of view (poster energy, tape, the mask, the crown). v1 and v5 have strong ones that belong to a genre (the terminal, Apple's glass) more than to Leonardo. v4 is subdued; v2 is neutral.

**Personality, personal use.** v1 has games, an ASCII portrait and crest, and a palette shuffle. v3 has the mask, the handwriting and his own code typing itself, but, as Leonardo noted, no place for an archive. v4's experiments and first-person record lines carry him. v5's colour style control is playful. v2 is the most impersonal.

**Design potential.** v3's cover is the most iconic hero, and its sheets are modular in one file. v4 and v5 have good heroes and documented systems; v5's engine makes every change more expensive. v2's architecture extends easily but its hero is plain. v1's look is a narrow lane for a final edition.

**Audience fit.** v2 gets a coach to the measurables, the stat line with its sample size, academics and contacts fastest, and its hockey page prints on one sheet. v4 is close. v3 and v5 impress admissions readers, but a coach has to find the hockey sheet (v3) or get past the hello (v5). v1 risks reading as a gimmick. Recruiters' first pass on a résumé averages 7.4 seconds in the Ladders eye-tracking study; that is the budget the landing page has.

**Phone experience.** v2 and v4 read naturally. v3 becomes a plain document with its torn edges intact. v5's iOS-style sheet and floating dock work well, with less room for content. v1's fixed bars take about 24% of an 844 px screen.

**Performance and reach.** Home page weights as measured: v4 342 KB; v5 418 KB plus a WebGL2 room that needs a capable GPU; v3 462 KB; v1 489 KB, of which 433 KB is JavaScript, plus Google Fonts (the only third-party request in the site); v2 683 KB, of which 461 KB is fonts.

**Maintainability.** v3 is one HTML file. v2 and v4 are multi-page with repeated chrome; v4 has a DESIGN.md and v2 has a search index to regenerate. v5 has thirteen modules, a shader pipeline and browser tests. v1 duplicates its copy across two pages.

## What would move the scores

| Edition | Change | Criteria it moves |
| --- | --- | --- |
| v3 | A labelled rail that opens the file system on hover, an on-page cabinet with files that come out of their folders, an archive, a real ending (this round) | Organization 3 → 4.5, ease 2.5 → 3.5, personal use 4 → 4.5 |
| v3 | Darker vermilion for small text, or black on vermilion (4.53:1) | Ease, audience fit |
| v3 | Its own project pages instead of links into v2 | Audience fit, organization |
| v5 | No blurred text in motion, still windows, one side window, the tab bar off the edge, a typographic glass hero with a clear way in (this round) | Animation 3 → 4 or more, ease 3 → 3.5, UI/UX |
| v5 | A lighter room for weak GPUs (static still, lower resolution) | Performance, phone |
| Either finalist | v4's hover grammar and experiments interaction | Animation, UI/UX |
| Either finalist | v2's hockey one-pager print and résumé rail | Audience fit |

Re-score v3 and v5 after this round's polish is reviewed; the decision between them should rest on the use criteria once their design lead is no longer offset by their flaws.

## Sources

- Nielsen Norman Group (Kara Pernice and Raluca Budiu), hidden-navigation study, December 2015, 179 participants: [Hamburger Menus Hurt UX Metrics](https://www.nngroup.com/videos/hamburger-menus/) and [methodology](https://www.nngroup.com/articles/hidden-navigation-methodology/). The figures above come from consistent search summaries; nngroup.com is not reachable from the build sandbox.
- Ladders 2018 eye-tracking study of recruiters, 7.4 seconds per first screen: [HR Dive summary](https://www.hrdive.com/news/recruiters-spend-74-seconds-looking-at-your-resume/541582/) and [the Ladders report (PDF)](https://csuglobal.edu/sites/default/files/blog-files/theladders-eyetracking-studyc2.pdf).
- Apple Human Interface Guidelines, [Materials](https://developer.apple.com/design/human-interface-guidelines/materials): Liquid Glass belongs to the functional layer of controls and navigation, not the content layer, and should be used sparingly. Quoted from a mirror of the guideline text ([materials.md](https://glama.ai/mcp/servers/@tmaasen/apple-dev-mcp/blob/b82f0efe2115dc4539c83a2374a714a84aeb350a/content/universal/materials.md)); Apple's page renders only with JavaScript.
- Apple Human Interface Guidelines, spatial layout for visionOS: windows stay fixed in space, because content that moves on its own causes discomfort ([mirror](https://glama.ai/mcp/servers/@tmaasen/apple-dev-mcp/blob/b82f0efe2115dc4539c83a2374a714a84aeb350a/content/universal/spatial-layout.md)).
- WCAG 2.1, [Success Criterion 2.3.3 Animation from Interactions](https://www.w3.org/WAI/WCAG21/Understanding/animation-from-interactions.html): motion animation triggered by interaction can be disabled unless it is essential.
- The nine-site study behind v4, summarised in `v4/README.md` ("Where it comes from").
