# The archive

One file here is one entry, and both editions are written from these files: v3's Macintosh (and its wall of cards), v5's Archive page and its Experiments rows. Things made sit together, newest first; songs and albums go on their own shelf: on v5, the Archive page's Listening window, drawn after Spotify on Vision Pro (a card for one at a time, with Previous, Next and Listen on its service, then every one as a row); on v3, each is a CD, on its card (on the wall, after the things made) and in the CD Player, which comes onto the Mac's desk with the first of them. The two newest things still being made (their year runs to now) also lie out on the Mac's desk.

## Adding an entry

1. Make a new file here named for the entry, in lower case with hyphens: `my-entry.md`. The name becomes its address on v5 (`archive/#my-entry`).
2. Copy one of the three starts below into it and fill it in.
3. From the repository, run `node tools/archive.mjs`, look at both editions, and commit.

A song:

```
---
kind: Song
title: The song's name
by: The artist
year: 2026
line: One line about it, shown at rest
listen: https://open.spotify.com/track/...
---
A paragraph on why it is here, if you want one.
```

An album, on a streaming service or on CD:

```
---
kind: Album
title: The album's name
by: The artist
year: 2026
line: One line about it, shown at rest
listen: https://open.spotify.com/album/...
cover: the-album.jpg
---
- Format: CD
- The track: The one I come back to
```

A project of your own:

```
---
kind: Project
title: what it is, as you would say it
year: 2026
line: One line about it, shown at rest
link: https://github.com/...
link-text: The code
cover: the-project.jpg
alt: What the picture shows
---
What it is and what you did, in a paragraph or two.

- Built with: ...
- Status: ...
```

## The head (between the two `---` lines)

| Field | | What it holds |
|---|---|---|
| `kind` | needed | What it is, in a word or two. Song, Album, EP, Single, Playlist and Mixtape are music; anything else (Project, Arrangement, Game design...) is a thing made. |
| `title` | needed | As you would say it. |
| `year` | needed | `2026`, `2021 to 2025`, `2026 to now` or `Now`. The archive runs newest first; for music, the year it found you. |
| `line` | needed | One line, shown at rest, with no full stop at the end (each edition adds one where it needs it). |
| `by` | | The artist, for music; for a project, who you made it with. |
| `listen` | | The song's or album's page on Spotify, Apple Music, YouTube, Bandcamp, SoundCloud, Tidal or Deezer. The link reads "Listen on Spotify", and so on. |
| `cover` | | A picture in `archive/covers/` (make the folder the first time; .jpg, .png, .webp or .gif; square for music, 600px is plenty). It is copied into both editions, and the copy goes again if the entry does. For music, it is the CD case's insert on v3 and the artwork on v5, in place of the drawn ones; only a picture you may publish (your own photo or drawing), never a record's cover art. |
| `hue` | | For music: the colour of its drawn artwork on v5, a number from 0 to 360 round the colour wheel (20 red, 60 orange, 140 green, 200 teal, 250 blue, 300 violet, 340 pink). Left out, one is picked from the file's name. |
| `alt` | | What the picture shows, for anyone who cannot see it. A music cover that has none reads "Cover of (title) by (artist)". |
| `link`, `link-text` | | A page elsewhere (a full `https://` address) and what its link says (its site's name if left out). |
| `v3` | | One of v3's sheets, in quotes: `"#record"`, `"#music"`, `"#hockey"`, `"#loquar"`. The link reads as the deck names the sheet. |
| `v5` | | A page of v5, from `v5/`: `resume/#amora`, `work/daedalus/`. The link reads as the page names itself. |
| `icon` | | The picture of its file on v3's Macintosh: games, film, chart, notes, maze, robot, rocket, disc, song or text. Its kind picks one if left out. |
| `draft` | | `true` keeps the entry here without publishing it (the class games wait this way). |

Under the head: paragraphs, with a blank line between them, then the details, one `- Name: what` a line. Both are optional.

## Keeping it right

- First person, no en or em dashes (the run refuses them), and every fact true.
- Never link to another edition of this portfolio.
- Only pictures you may publish.
- `node tools/archive.mjs --check` names anything in either edition that has drifted from these files; the tests run it.
