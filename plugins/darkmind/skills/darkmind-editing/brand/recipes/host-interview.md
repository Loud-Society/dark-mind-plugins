# Recipe `host-interview` – Host interview "jensen x <guest>" (16:9)

Machine-readable: [`host-interview.json`](host-interview.json) · analysis: `doc/mvp/brand/ANALYSIS_YOUTUBE_LONGFORM.md`
(section B, reference NeQ3LGhyRrw "jensen x mark tremonti").

| | |
|---|---|
| Profile | 1920 × 1080, 25 fps (`landscape`), −14 LUFS / −1 dBTP (`audio_master`) |
| Duration frame | 10–25 min (reference ≈ 15 min) |
| Captions | none by default; optional `subtitles_16x9` (style `brand-16x9`) |
| Music | optional slot; the template ships no music (T14) |
| Deliverables | the interview, the **thumbnail** (headline `JENSEN X <GUEST>`) and the **chapter list** (topic blocks) |

## Structure

| # | Part | Blocks | Length |
|---|------|--------|--------|
| 1 | **Cold open**: a quote of the guest (core sentence) | footage only | ~6 s |
| 2 | Sting | `logo_sting` (video + audio) | ~3 s |
| 3 | Title | `title_card` `{ "title": "jensen x mark tremonti" }` over black-and-white B-roll (`"background": "transparent"` on an overlay track) or on black | ~5 s |
| 4 | Arrival, two-shot | **double** `lower_third` `{ "people": [{ guest }, { host }] }` (guest left, host right) | ~15 s |
| 5 | **Topic blocks** (= YouTube chapters) | conversation with inserts (music videos, live – with source credit and cleared rights, T14), `chevron_wipe` between blocks, optional `subtitles_16x9` | 1.5–2.5 min each, 7–8 blocks |
| 6 | Goodbye | handshake, black-and-white exit B-roll | ~15 s |
| 7 | Outro | `loud_sounds` → `logo_end` → `endcard` | ~15 s |

Order the recipe check enforces: `logo_sting → title_card → lower_third → loud_sounds → logo_end → endcard`; ends with
the `endcard`; no lower third or title card in the cold open; the first lower third has two people.

## Chapters

Topic blocks are editorial: write `chapters.json` with a title per block and the first clip of the block
(`{ "schemaVersion": 1, "kind": "darkmind-chapters", "chapters": [{ "title": "Intro", "frame": 0 }, { "title":
"Growing up in Detroit", "clipId": "<first clip of the block>" }, …] }`). `recipe.mjs chapters --out chapters.txt`
prints the list for the YouTube description; it follows edits because it is anchored to clips. YouTube: first chapter
0:00, at least three, each ≥ 10 s.

## Checks, reviews, done

`recipe.mjs apply host-interview`, `recipe.mjs check` (chapters stay pending until `chapters.json` exists); done =
editorial, captions text (if captions), preview, final and **thumbnail** approved (plus the duration exception outside
10–25 min).
