# Recipe `short-anecdote` – Short "Anecdote" (9:16)

Machine-readable: [`short-anecdote.json`](short-anecdote.json) · analysis: `doc/mvp/brand/ANALYSIS_YOUTUBE_SHORTS.md`.

| | |
|---|---|
| Profile | 1080 × 1920, 30 fps (`vertical`), −14 LUFS / −1 dBTP (`audio_master`) |
| Duration frame | 15–60 s |
| Captions | word captions: style `brand-word` + `caption_word` |
| Music | optional slot; the template ships no music (T14) |

## Structure

| # | Part | Blocks |
|---|------|--------|
| 1 | **Hook** (first ~3 s): the strongest sentence | `caption_word`, `wordmark_flash` over the first caption line; no lower third |
| 2 | Context | punch-out (crop), optionally an album sticker as a free extension (episode layer); optional `lower_third` after the hook |
| 3 | Story | B-roll that illustrates literally what is said |
| 4 | Punchline | footage |
| 5 | End | `animal_scream` → `logo_end` (optionally revealed by a `chevron_wipe`) |

Order the recipe check enforces: `wordmark_flash → animal_scream → logo_end`; the short ends with the `logo_end`; no
`lower_third` in the first 3 s.

## Agent rules

- Hook = the strongest sentence of the anecdote, placed first even if it comes later in the interview (the editorial
  review shows the reordering).
- B-roll illustrates literally (the review report names what each insert shows); no transitions other than wipe/glitch.
- Brand-layer parameters only within the `brand.json` limits.

## Checks, reviews, done

`recipe.mjs apply short-anecdote`, `recipe.mjs check`; done = editorial, captions text, preview and final approved
(plus the duration exception outside 15–60 s).
