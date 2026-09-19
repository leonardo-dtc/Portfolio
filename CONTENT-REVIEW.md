# Portfolio design and content review

Updated September 16, 2026 for college admissions, recruiting and student readers. Changes are implemented in the local page.

## Audience judgment

The record is strong enough to stand on specific work, contributions and results. The earlier text sometimes competed with that record through self-description, prestige cues, sweeping statements and repeated numbers. The revised page puts the activity first, credits collaborators and names the stage of each project.

Following Leonardo’s clarification, the terminal design is the default. The quiet redesign remains available as Low detail. The terminal retains its ASCII name, reactive field, chapter navigation, typed commands, live illustrations, timeline and games, with larger reading text, separate artwork, permanent captions and clearer controls. The loading curtain and continuous scrambling of readable text are removed.

## Wording changed

| Previous wording or presentation | Concern for an outside reader | Implemented revision |
| --- | --- | --- |
| “rehabilitation is the part nobody designs for” | Dismisses an established field and implies unsupported originality. | States the personal interest in rehabilitation and the specific simulated design. |
| “run as a venture, not a class project” | Sounds defensive and devalues other students’ work. | Explains Loquar’s purpose, responsibilities and development status. |
| “the loudest voice on the bench”; “welcome the argument”; “goldfish memory” | Self-awarded character claims and metaphors can overshadow evidence of teamwork. | Uses concrete examples of organizing, teaching, training and collaboration. |
| “teachers’ comments single out preparation, intuition…” | Selective self-praise without the supporting report in view. | Leads with Honor Roll and actual coursework. |
| “The instructors called the asymmetry term an original idea” | Praise carries more weight than the description of the work. | Describes the controller and its limitations directly. |
| “98% knee extension under adaptive assist” as a large statistic | Can look like a patient outcome or validated rehabilitation result. | Moves the numbers into a labeled simulation table with conditions, units and limitations. |
| “Silver requirements met”; “It waits only…” | Presents an unfinished award as substantially earned. | Identifies Bronze as submitted and Silver as in progress, including the remaining participation period. |
| “nine languages”; “two ventures co-founded” | Counts mix tools, programming languages, learning environments and projects; the totals are less informative than demonstrated work. | Describes the actual projects and most-used tools. |
| “created a contender for nationals” | Could imply a qualification that did not happen. | States participation in the American Rocketry Challenge and that the team did not qualify. |
| “complete … every FDA adverse-event report” | A reporting dataset is not a complete account of all adverse events in patients. | Describes the 486 analyzed cases and the 2016–2024 window. The manuscript’s exact title is retained in the detail. |
| Near-even sex split described as “the mark” of trial reporting | Presents an inference as an established source attribution. | Removes that causal interpretation from the portfolio summary. |
| OCAPEX metrics repeated beside the founder’s title | Can blur individual contribution and collective impact. | Attributes performances, audience reach and service hours to OCAPEX students; specifies personal responsibilities. |
| “five years on viola, twelve on violin” | Conflicts with starting ages and the current date. | Uses the reported starting ages, six and thirteen. |
| Carnegie Hall presented with a generic grand-piano image | Could imply piano was the featured instrument or that the image showed the actual performance. | Clearly says violin, Bruch, Weill Recital Hall and piano accompaniment. Labels the piano as an illustration of the accompaniment, without implying it shows the performance. The quiet mode uses its section illustration. |

## Research accuracy

The FDA explains that adverse-event reports cannot establish causation or incidence rates. The revised research detail distinguishes percentages within the reporting datasets from patient risk and avoids ranking clinical safety from those percentages. [FDA adverse-event dashboard guidance](https://www.fda.gov/drugs/fdas-adverse-event-reporting-system-faers/fda-adverse-event-reporting-system-faers-public-dashboard).

Genuvalens is described as an individual design and simulation project, with named guidance. It is not presented as a tested medical device or evidence of clinical benefit. Extension percentages refer to the modeled target; values above 100% are explicitly explained as overshoot.

## Artwork and captions

All 31 terminal illustrations were inspected together in a browser contact sheet, alongside the seven static figures retained in Low detail. Their character grids are separated from text and have permanent captions and accessible enlargement controls. Photographic shading reverses appropriately in the light theme. Small lettering within crests remains illustrative texture, as the captions explain; it is not used to convey essential information.

| Low-detail artwork | Caption meaning |
| --- | --- |
| Leonardo’s portrait | ASCII portrait of Leonardo, without claims about when or where photographed |
| Hockey mask | Illustration rendered from a 3D model, without implying it is his personal equipment |
| Zebra | Rendered from a photograph, without misidentifying it as a crest |
| OCAPEX symbol | Interpretation of the music mark, rather than an exact logo reproduction |
| DNA helix | Thematic illustration, rather than a research figure or project result |
| Four instruments | Two violins, a viola and a cello, rather than a photograph of Amora |
| Labyrinth | Illustration for Daedalus, rather than a screenshot of released gameplay |

Removed the need to hide the entire interface to read captions. Re-rendered the quartet with sufficient space for the cello’s scroll. Reduced the character grid and used stronger block shading so silhouettes remain readable at small sizes. The terminal restores the full set of live illustrations. Additional caption corrections identify the MRI as a schematic, the exoskeleton as conceptual, the rocket as an illustration rather than the team’s vehicle, the rink as a diagram, and the bar chart values as reporting proportions rather than patient risks.

## Factual follow-ups

These are not presented as verified achievements beyond the supplied record:

- **Groton GPA:** the source notes explicitly leave the 4.0 conversion unconfirmed. The public page now uses the documented three-term Honor Roll record. American Heritage’s reported 4.0 is labeled unweighted.
- **Manuscript submission:** “submitted” follows the supplied instruction and existing page. The research notes alternate between “ready for submission” and “presented as submitted”; a receipt would resolve that discrepancy. The page does not claim acceptance or publication.
- **Congressional Award:** no medal is described as awarded. Update only after an official decision.
- **FreeCode title:** the intake says “President” was not finalized. The page uses co-founder and instructor and describes the work.
- **Athlete measurements:** weight is labeled approximate because the intake says it had not been measured recently. Height and weight should be refreshed for recruiting.
- **Résumé and publication link:** no completed résumé PDF or public article URL was supplied. No placeholder download or misleading “paper” link is shown.
- **Site indexing:** the existing `noindex` directive remains in place.

## Terminal checks, September 15

- All eight sections at 320, 390, 768, 1024 and 1440-pixel widths: no horizontal overflow in the tested reading views. The short 1024×620 hero was adjusted to keep its final instruction above the footer.
- All 26 entries open, show one detail view, accept Escape and return focus to their source title. Browser Back restores the previous section. The interactive hockey timeline updates its readout.
- All 31 registered illustrations were inspected as a contact sheet. The full-size viewer uses the current artwork and caption, accepts Escape and restores focus.
- Low-detail round trips preserve Genuvalens and the selected theme at all five widths, including with storage blocked. The 24 quiet disclosures and seven quiet figures retain the previous checks below.
- Fixed the mobile reading-position race and double header offset. Entry artwork stays associated with the open detail when changing between desktop and phone layouts.
- Left/right navigation and number keys preserve ordinary focused-button behavior. Wheel navigation allows text scrolling first and requires a fresh gesture at a chapter boundary; modifiers preserve browser zoom. Transitions are cancellable.
- All three games launch and render. Exit restores the launch button’s focus. Added semantic game-selection buttons and on-screen direction/action controls; game simulation pauses when focus leaves the game. The ASCII game screen fits its container by column count.
- Reduced-motion visits have no active document animations. Blocked storage does not prevent theme or mode controls. No-script text and all entry details remain available.
- Main light-theme color ratios: primary text 16.38:1, secondary text 5.98:1 and initial crimson accent 5.40:1. Highlight foreground chooses the higher-contrast light or dark ink. Artwork shading is decorative and has a readable caption.
- Both pages have no duplicate IDs, missing local resources or unresolved section anchors in the static audit. Print lifecycle exposes all eight sections and restores the prior hidden states. No application errors were logged in the final successful browser pass.
- A late browser reload encountered temporary `ERR_NETWORK_CHANGED` resource failures; a fresh navigation restored all 31 illustrations and the page controller. No application exception was observed during the successful interaction checks.

## Low-detail checks, September 14

- Browser layout at 320×740, 390×844, 768×1024, 1024×768 and 1440×960: no horizontal page overflow, clipped heading widths or artwork overflow.
- All seven main-navigation links reached their sections without headings hidden under the sticky header.
- All 24 disclosures opened and closed; all seven artwork viewers opened, closed with Escape and returned keyboard focus.
- All seven figures have visible captions and accessible descriptions.
- Dark and light palette contrast: body text 7.95:1 and 5.95:1 respectively; primary text 16.12:1 and 14.39:1; accent 6.89:1 and 6.56:1. These are foreground/background color ratios; individual shaded artwork cells are decorative.
- Mobile simulation table fits its 342-pixel container without horizontal scrolling.
- No duplicate IDs, unresolved internal anchors, missing local resources or observed JavaScript errors.
- Without scripts: content, native details and all seven figures remain available; unsupported image-enlargement controls are disabled.
- With blocked local storage: theme and artwork controls still work without errors.
- Reduced-motion mode: no active animations; direct detail links open correctly.
- Printing opens the full record and restores the reader’s previous disclosure states afterward.

External link requests returned HTTP 200 for NCSA, OCAPEX, YouTube and the FDA source. Elite Prospects returned HTTP 403 to the automated request, so that profile’s availability could not be verified; its supplied URL is preserved. Private submission and award records were not independently verified. No deployment was performed.


## Localhost follow-up, September 16

Continued only on the local preview. Limited the source fixes to the navigation/game integration added in this cleanup. The page markup, styles, artwork and low-detail files were unchanged in this follow-up.

- Opening a game on a phone no longer triggers scroll-based chapter navigation or closes the game.
- Closing a game always restores the original text, and explicit Exit returns keyboard focus to its launcher.
- The game screen uses the measured height of its controls and instructions to fit the viewport. Switching games updates both column and row sizing.
- At 320×740, Dino, Tetris and Snake each fit horizontally and keep all controls above the footer. All three stay in the Build section; exit restores text and focus. No browser errors in the final pass.
