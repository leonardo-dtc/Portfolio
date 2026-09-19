# Leonardo Carvalho · Portfolio

A static student portfolio for Groton School Class of 2028. HTML, CSS and JavaScript, with no build step.

## Preview

```sh
python3 tools/serve.py 8778
```

Open [the terminal portfolio](http://127.0.0.1:8778) or [low-detail mode](http://127.0.0.1:8778/low-detail.html). The preview server disables caching. Both pages also work from their HTML files.

## Two reading modes

**Terminal is the default.** The original ASCII name, palette shuffle, reactive field, Roman chapter numbers, letter-flip navigation, typed commands, interactive illustrations, timeline and three games remain. Text has more space, stronger contrast and consistent sizing. Artwork has a dedicated canvas, a permanent caption and an enlargement viewer.

Desktop chapter navigation supports the top links, left/right arrows, number keys 1 to 8 and scrolling. Long chapters scroll before advancing; a fresh gesture at the boundary advances. Entry titles open details, with a labeled Back button and Escape to return. Short and narrow windows use an ordinary scrolling document. Transitions can be interrupted, and content never waits behind a loading curtain.

**Low detail** preserves the quieter redesign as a separate reading mode: normal scrolling, native disclosures, seven static ASCII figures, optional artwork visibility and a contact footer. Mode links carry the open entry and theme between pages, including when browser storage is unavailable.

Both modes include dark/light themes, reduced-motion support, keyboard focus handling, direct detail links and print styles. Google Fonts is optional; local fallbacks are provided. Content remains readable without scripts; low-detail mode also supplies static artwork without scripts.

## Files

| File | Purpose |
| --- | --- |
| `index.html` | Terminal page, all copy and entry details |
| `low-detail.html` | Quiet reading page and static artwork |
| `assets/css/site.css` | Terminal layout, typography, responsive behavior and print rules |
| `assets/js/app.js` | Chapter navigation, history, themes, detail views and accessibility |
| `assets/js/artwork.js` | Separate ASCII art renderer, routing, captions and enlargement |
| `assets/js/field.js`, `namecard.js` | Original ambient field and interactive name |
| `assets/js/live.js`, `pieces.js`, portrait/mask/crest/subart scripts | Original illustration sources and renderers |
| `assets/js/games.js` | Dino, Tetris and Snake, with keyboard and on-screen controls |
| `assets/css/low-detail.css`, `assets/js/low-detail.js` | Quiet mode styling and progressive enhancements |
| `assets/data/reading-art.json` | Static character grids for the quiet page |
| `CONTENT-REVIEW.md` | Wording analysis, factual follow-ups and verification |
| `references/before-cleanup/` | Preserved original implementation and documentation |

Original source images, prototypes and references remain available. Source photographs are rendered as ASCII rather than displayed as photographs.

## Editing

Keep shared factual copy synchronized between `index.html` and `low-detail.html`. Terminal entries use `data-slug` and a hidden `.entry__more` source; the controller builds the accessible detail view. Quiet entries use native `details`. A route such as `#research/genuvalens` works in either mode.

Keep completed work, submissions, plans and simulation results distinct. Attribute organization-wide impact to the team. Captions belong in `artwork.js`; renderer metadata supplies fallbacks. Describe illustrations as illustrations, and avoid implying that a conceptual image is a project photograph or tested hardware.

## Verification

Desktop and mobile checks cover 320, 390, 768, 1024 and 1440-pixel widths, plus a 1024×620 laptop window. All 26 terminal entries and all 31 registered illustrations were reviewed. Checks include mode round trips, themes, reduced motion, blocked storage, no-script text, keyboard return, history, games, local references and duplicate IDs. See the content review for the exact scope and remaining factual follow-ups. The site has not been deployed; the existing `noindex` remains.
