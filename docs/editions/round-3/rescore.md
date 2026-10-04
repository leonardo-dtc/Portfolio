# Re-score of v3 and v5 after round three (build 390851e)

One reviewer, one rubric (`docs/editions/decision-matrix.md`), both editions scored the same way, on 2026-10-03 after the round-three review fixes. Two findings below were fixed right after this re-score (see `round-3.md` section 9): the overlapping text when a v5 sheet closes, and the email missing from the v5 hockey print.

## Totals

| | Balanced | Impression-led | Round two (balanced) | Round-3 projection |
|---|---:|---:|---:|---:|
| v3 poster | 88.1 | 89.5 | 80.8 | about 87 to 90 |
| v5 glass | 82.6 | 82.3 | 74.4 | about 80 to 82 |

Design criteria mean: v3 4.60, v5 4.30. Use criteria mean: v3 4.25, v5 4.13.

## Scores (round two → now; what keeps each from the next half point)

### v3 poster
| Criterion | Score | Evidence; what keeps it from the next half point |
|---|---|---|
| Animation | 4.5 → 4.5 | Stacking, cut-then-slide jumps, file transitions, card settle, archive opening, the cabinet, none blurred; a half-revealed sheet flashes during a jump and entrances replay on every arrival. |
| UI/UX | 3.5 → 4 | 31 contrast failures fixed, code panel at 12 px, no dead clickable-looking ends, well-built files; dense 12 to 13 px text on record and music sheets, the key stat line set as small body text. |
| Creativity | 5 → 5 | One metaphor all the way down. |
| Ease | 3.5 → 4 | Index tab, cover links, Find, phone pill, 24 px targets, keyboard, reduced motion, no-JS; destinations unlabelled until the cabinet opens, dots unlabelled. |
| Organization | 4 → 4.5 | Six project files of its own, archive, Find, "you are here"; no labels at rest, Find does not search the files, file numbering skips 09. |
| Personality, design | 5 → 5 | The strongest point of view in the set. |
| Personality, personal use | 4.5 → 4.5 | Handwriting as links, his code typing itself, a one-block archive; cards open to one line and a link. |
| Design potential | 4 → 4.5 | The most iconic hero, now also a way in; derived counts, DESIGN.md, checks; the six files hand-copy tabs and numbers. |
| Audience fit | 3.5 → 4.5 | Role on the first screen, hockey in 1 click, a coach one-pager with contacts and email in 2 that prints on one page; no contacts or email on the hockey sheet itself. |
| Phone | 3.5 → 4 | Pill with "you are here", bottom-panel cabinet; contacts 3 screens into the file, the pill covers text, 18 screens long. |
| Performance | 4.5 → 4.5 | 348 / 545 KB, no third parties, no GPU; +17% this round. |
| Maintainability | 3.5 → 3.5 | Archive card one block, derived counts, DESIGN.md, checks; a project with its file touches 11 files, facts repeat across 3 files. |

### v5 glass
| Criterion | Score | Evidence; what keeps it from the next half point |
|---|---|---|
| Animation | 4 → 4.5 | Hero glide, calm crossfades, the full hover set; an empty-window beat on page change, text double exposure on sheet close, a ghost of the name on the CSS entry. |
| UI/UX | 4 → 4.5 | Consistent system, tab labels at rest, 15 px side text with a scroll cue, cards that settle; 24° side windows, a phone header that never collapses, the hero's only cue is a 14 px hint. |
| Creativity | 4.5 → 4.5 | Remarkable execution; the concept and the hero reference are Apple's. |
| Ease | 3.5 → 4 | Labelled tab bar and dock, tab bar first for the keyboard, every preference mode, no-JS; the hero gate on every reload, icons only below 946 px. |
| Organization | 3.5 → 4.5 | Five labelled tabs, "you are here", side parts placed by role, Résumé sections that follow; no search, the side window shows the parent while a project is open, experiments listed twice. |
| Personality, design | 4 → 4 | A striking neon moment; Apple's genre, system UI past the hero. |
| Personality, personal use | 3.5 → 3.5 | Experiments open, colour panel, Groton clock; no archive, nothing in his hand. |
| Design potential | 4 → 4 | Striking hero, documented system; the hero shows only the name, chrome copied into 12 pages. |
| Audience fit | 3.5 → 4 | The best single coach screen of either edition; only the name on the first screen, the print omits the email, email on 4 of 12 pages. |
| Phone | 3.5 → 4 | Labelled dock, measurables first; 490 of 844 px readable on Hockey, the hero tap. |
| Performance | 3 → 3.5 | 311 to 334 KB, budget, Save-Data and low-memory still, right-sized images; the first budget look is slow. |
| Maintainability | 2.5 → 3 | README checklist and tests; chrome in 12 pages, about 108 KB of dead files, experiments kept twice. |

Arithmetic (weight × score summed, ÷ 5). Balanced weights 10, 10, 10, 12, 12, 6, 6, 8, 12, 7, 4, 3; impression-led 12, 8, 15, 8, 8, 10, 8, 9, 8, 6, 4, 4.
- v3 balanced: 45 + 40 + 50 + 48 + 54 + 30 + 27 + 36 + 54 + 28 + 18 + 10.5 = 440.5 → 88.1
- v3 impression-led: 54 + 32 + 75 + 32 + 36 + 50 + 36 + 40.5 + 36 + 24 + 18 + 14 = 447.5 → 89.5
- v5 balanced: 45 + 45 + 45 + 48 + 54 + 24 + 21 + 32 + 48 + 28 + 14 + 9 = 413 → 82.6
- v5 impression-led: 54 + 36 + 67.5 + 32 + 36 + 40 + 28 + 36 + 32 + 24 + 14 + 12 = 411.5 → 82.3

## Top improvements (weight × gain over effort)

v3:
1. Contact on every view, and coach names and email on the hockey sheet (T4); lead the phone hockey file with measurables, stats, contacts. About +1.9.
2. Sheet names at rest beside the rail dots on wide desktops. About +1.2.
3. Jumps that land already readable (T13). About +1.0.
4. A legibility pass: the stat line in display type, more room on the record and music sheets. About +1.0.
5. The files' tabs, numbers and transition names generated from one list. About +1.1.

v5:
1. A hero that says who he is and offers a way in: the launcher row (T34, T27), and scroll, swipe, Down and Space proceed (T26). About +3.2; the input part alone about +1.2.
2. Transitions without overlapping text: the parent's text back only after the sheet's has gone; prefetch on hover to remove the empty beat. About +1.0.
3. An archive from a single list (T7). About +1.5.
4. A phone header that collapses on scroll. About +0.7.
5. The coach printout: print the email, measurables and contacts first; "Write to me" on Work and project sheets. About +0.6.

## Where the build departs from the plan's rules
1. Audience rule: v5's first screen shows only the name (it follows Leonardo's binding hero spec; T27, T34). v3's contact is not on every view (T4).
2. Labelled destinations at rest: not met by v3; v5 from 946 px.
3. Phone "where am I": v3's pill hides while scrolling down.
4. Arrivals 150 to 300 ms with 8 px or less: v3's file rises 40 px; its sheet entrances take 560 ms with a stagger.
5. v5's DESIGN.md says the sheet and parent texts barely overlap on close; a full-speed frame shows both legible.
6. Derived chrome: v3's six files and v5's 12 pages copy their chrome; v5 keeps the experiments twice.
7. v5's one-page print lacks the email address.
8. Copy (wording round): v3's Loquar sheet and résumé file still describe "three editions".

Method notes: Chromium only; v5 on WebGL (SwiftShader, judged by frames) and the CSS path at full speed; 1440x900 and 390x844 (touch, DPR 2); weight as summed encodedDataLength, cache off, uncompressed preview server; v5's system face rendered as DejaVu Sans here.
