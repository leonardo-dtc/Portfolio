# Foundation: what each edition does well

Written 2026-10-02 alongside the [decision matrix](decision-matrix.md), as the base for the final portfolio. The family preferred v3 and v5, so those two are the finalists; the other three are donors. Each item says what it is, why it works, and where it lives, so it can be carried into the final edition and rebuilt in that edition's own design language. Editions never link to or embed each other, but their ideas and copy can move freely.

## Principles that hold across editions

1. **The name is the hero object.** Every edition's most remembered moment is the name made out of its own material: v1's ASCII name, which changes style and palette when clicked; v3's Anton name with the sliced O and the torn red strip; v4's Switzer name glowing in a lit window; v5's name in glass. A final hero should be the name, built from the final edition's material, and it should be the way in.
2. **One living detail, kept subtle.** v4's static at 10% opacity (Leonardo: it "adds a bit of life"), v1's reactive field, v5's drifting room, the live Groton clock in v4 and v5. One slow, ambient thing makes a page feel alive; two compete.
3. **Hover changes geometry, not just colour.** v4's tiles settle from 1.05 to 1 while a corner arrow grows and turns; v3's stickers and tape settle a beat after their sheet; v3's contact buttons are lightly magnetic. Leonardo calls v4's version "smooth and creamy": eased, never jumping, and long (450 to 800 ms) because the content moves inside a frame that stays still. (Corrected in round three: the duration and the still frame make it creamy, not the curve; v3's own curve is nearly the same.)
4. **Focus by stepping the rest back.** v4's experiments dim their siblings to 16% and blur them 3 px while the hovered one opens; v4's record rows step their group back to 55%; v5's sheets dim the window behind. (Corrected in round three: v4's blur ramps in while the rows below are still moving, so it is blur in motion. The finalists dim what steps back and do not blur it; see `round-3.md`, rule 1.)
5. **Navigation you can see.** v2's header and search, v4's pill menu with its sliding mark, v5's tab bar, v1's numbered chapters. v3's unlabelled dots are the counter-example: in Nielsen Norman Group's study, hiding navigation cut its discoverability almost in half.
6. **Calm motion.** Text never blurs while it moves; content does not move on its own; arrivals and transitions that move or replace content take 150 to 300 ms with a few pixels of travel; hover responses may be long and soft (v4's 800 ms settle) because they move a few pixels in direct answer to the pointer; large motion only answers the user's own action; everything has a reduced-motion version (WCAG 2.3.3; Apple's visionOS guidance keeps windows still).
7. **Colour comes from the work.** v4 and v5 colour each project by its real screen: Loquar gold, OCAPEX sand, Genuvalens blue, the aducanumab manuscript's paper. The palette stays honest and never feels templated.
8. **Numbers as objects, with their caveats attached.** v3's "486" card, v2's HTML bar charts, v4 keeping numbers off the landing until the page that explains them, "a two-game sample" next to every stat line.
9. **Three audiences at three speeds** (PRODUCT.md): the home page curates, the résumé catalogues, the project pages prove. v2, v4 and v5 are built this way; v3 needs it.
10. **The accessibility floor is part of the design**: nothing under 12 px, 4.5:1 contrast, visible focus, reduced motion, readable without JavaScript, clean print. (Corrected in round three: v3 did not meet it after the September audit: white on vermilion measured 4.03:1 in 31 runs and its code panel was 9 px. Both are fixed in round three.)
11. **Small personal artifacts make it his**: the mask sticker, the crown, the handwritten tagline, his own analysis code typing itself, the games, the colour control, the clock.

## v3 poster (finalist)

- **The cover.** The huge Anton name with the sliced O, the torn red strip with recoloured letters, the tilted editor typing his real aducanumab and Genuvalens code, the goalie mask sticker, the handwritten tagline. The strongest first impression in the site. `v3/index.html` `#cover`, `v3/assets/js/site.js` (code panel).
- **Sheets that slide over each other through torn edges**, the covered sheet receding to 0.95 and dimming, with native scrolling (no scroll hijacking). Feels like turning a poster deck. `v3/assets/css/site.css` (sticky sheets), `site.js` (the recede).
- **Reveals that replay** when a sheet comes back, headlines rising out of a clipped line.
- **The cut-out portrait on a red arch with text on a curved path**, crown and star stickers, tape on every overlapped image.
- **Numbers as objects**: the "486" card overlapping the ARIA chart, the stat tiles on the hockey sheet, the Carnegie Hall ticket.
- **The file system metaphor**: hairline folders, black divider tabs per discipline, a record for each sheet. Being rebuilt in this round as an on-page cabinet that opens from the rail, with files that come out of their folders and an archive.
- **Difference-blended chrome** (name left, year right) that reads on black and on paper alike.
- **One HTML file of modular sheets**: the easiest edition to extend with archive cards (one `<li>`). (Corrected in round three: a new sheet took about 17 hand edits; round three derives the counts from the page.)
- **Phones get a plain document** that keeps the torn edges.

## v5 glass (finalist)

- **One WebGL2 room with a mip chain**: every pane's frost, the hero's defocus and the glass refraction cost one texture read each. `v5/assets/js/room.js`, `shaders.js`.
- **Glass registered to HTML boxes**, angled windows included (projected corner probes into inverse homographies), and the frame order that keeps it registered: motion first, then layout readers, then the room. `panels.js`, `geometry.js`, `frame.js`.
- **Springs with response and damping on one shared frame loop**: the iOS feel, reusable in any edition. `springs.js`.
- **The tab bar ornament** with a Liquid Glass bubble that stretches while it travels.
- **Project sheets over a stepped-back parent**, paging to neighbouring projects, deep links that open as sheets, Back that closes them. `nav.js`, `windows.js`.
- **The colour style control**: eight palettes, hue, vibrance, Day and Night, kept per browser. The most playful personal touch in the glass edition. `hue.js`.
- **Day and Night following the system**, stills of the room as the CSS fallback, CSS glass under reduced transparency.
- **The phone layout**: an iOS 26 style full-screen sheet with a floating dock.
- **Tests**: unit tests and a browser harness that now runs off the original Mac (`tests/v5/`).

## v4 dim room (donor)

Leonardo's notes, as he wrote them:

> - The background static adds a bit of life to the website.
> - The hover effects and animations are smooth and creamy (image shape, subtitles, arrow, zoom).
> - The experiments section is very clean – the hover animation is amazing, including the UI expansion and blur.
> - The organization is solid and there are many subtle animation effects.

Where each lives and what makes it work:

- **The static**: a fixed canvas at one grain per CSS pixel, a new field every frame, 10% opacity, normal blend (measured from hasque.com). `v4/assets/js/site.js` section 1, `.grain` in `site.css`. It reads as material, not noise, because it is faint and full-screen.
- **Creamy hovers**: tiles settle from 1.05 to 1 inside a 44 px radius while the corner arrow grows in and turns from 45°; captions sit under the tiles; device screens zoom inside their frames. It runs on one long ease-out curve, `cubic-bezier(.22, 1, .36, 1)`, on transform and opacity only, but the curve is not the secret (v3's is nearly identical); the length and the still frame are: the settle takes 800 ms, the arrow 450 ms, so motion starts at once and spends most of its time arriving softly. `--ease`, `--t-settle`, `a.tile`, `.tile__go` in `site.css`.
- **The experiments**: at rest only the italic, numbered titles show. Hovering or focusing one unfolds its description (a grid row from 0fr to 1fr over 500 ms on the same curve), raises a wash of its own colour behind it, and dims and blurs the others; the touching hairlines disappear. On touch screens the descriptions are simply shown. `.exp__list`, `.exp__d` in `site.css`.
- **Organization and subtle effects**: the home page curates (window, tiles, experiments, the record, interests, the close); record rows lean in while their group steps back; three rows summon a preview that springs in at one fixed place; the interests column sticks; a progressive blur dissolves the bottom edge and fades out as the page ends; cross-document view transitions hold the menu still while the tab mark slides.
- **The window hero**: the name in Switzer with a three-layer glow (cool below, warm above, a white halo) and a light that follows the pointer. Its face carries into v5's new hero in this round.
- **Typographic discipline**: Switzer for everything that reads, one Instrument Serif italic phrase per title, JetBrains Mono only for the clock.
- **DESIGN.md**: the system recorded from the built pages, the best documented edition.

## v2 editorial (donor)

- **Readability**: Newsreader display, Inter text, mono metadata, a real measure, generous leading. The easiest edition to read.
- **The search palette** (⌘K or /) over an index generated from the pages (`tools/build_search.py`).
- **The work index** with category filters and a cursor-following preview that flips at the screen edge.
- **Two project templates**: research (abstract, question, method, figures, findings, limitations, references) and product (problem, approach, concepts, interaction, visual design, implementation, iterations, current state). Exactly what an admissions reader needs to judge a project.
- **The hockey recruiting profile**: untreated photographs, stats with the sample size, coach contacts, and a print stylesheet that fits one page.
- **The résumé** with a section rail that tracks the reader and an anchor on every entry.
- **Honest placeholders** (`.ph` blocks labelled with ratio and subject) and hidden-until-ready blocks with a comment saying what fills them.
- **HTML bar charts**: accessible, sharp at any size, printable.

## v1 terminal (donor)

- **The ASCII name** that changes style and palette when clicked, with a hint line saying so.
- **The prompt as wayfinding**: the status bar reads like a shell (`~/research % cat aducanumab.txt`), so location is also personality.
- **Fast structure**: eight numbered chapters, number keys 1 to 8, arrow keys, detail views with a labelled Back and Escape, and focus returned to where you were.
- **Interactive ASCII illustrations with honest captions**: illustrations are labelled as illustrations, never passed off as project photographs.
- **Three games** (Dino, Tetris, Snake) with on-screen controls. The most personal pieces in the site, and natural archive or easter-egg material for a finalist.
- **Low-detail mode as a real alternative**, carrying the open entry and the theme across the switch. Accessibility offered as a choice rather than a fallback.

## What to carry into the finalists next

| Carry | From | Into v3 | Into v5 |
| --- | --- | --- | --- |
| Creamy hover grammar (settle, turning arrow) | v4 | "Read the analysis" links, the archive's files, the contact actions | Work cards and rows |
| Experiments that open while the rest step back | v4 | The archive sheet | The Experiments list |
| A recruiting one-pager that prints on one sheet | v2 | A print stylesheet for the hockey sheet | Exists; keep it |
| Search over the whole site | v2 | Inside the file cabinet | Inside the tab bar |
| Project pages of its own (research and product templates) | v2, v4 | Replace the links into v2 | Exists as sheets |
| Games or other playful pieces | v1 | Archive entries | Optional easter egg |
| Springs on one frame loop | v5 | Only if v3 adopts JS-driven motion | Exists |

## Decisions to make before a final edition

- Hometown wording: v1 to v3 say Lake Worth, Florida; v4 and v5 say South Florida (Leonardo's 2026-09-18 decision).
- v4 and v5 hockey read "Born 2009. South Florida", which says he was born there; he was born in Beijing.
- v3 still links into v2 for project detail; v2 and v3 copy still mentions two or three editions.
- ~~`v3/README.md` calls the goalie mask renders "Leonardo's own mask model"; PRODUCT.md says the model was downloaded.~~ Fixed in round three: the README now calls it a downloaded model.
- v3's vermilion fails 4.5:1 for small white text (4.03:1) and as small text on paper (3.23:1).
- v1 loads Google Fonts, the only third-party request in the site.
- The repository's `references/repo` is a submodule pointer with no URL, which breaks GitHub's own Pages builder (the published site uses the Actions workflow and is unaffected).
