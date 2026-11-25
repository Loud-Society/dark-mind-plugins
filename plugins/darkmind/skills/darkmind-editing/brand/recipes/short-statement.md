# Recipe `short-statement` – Short "Statement with cold open" (9:16)

Machine-readable: [`short-statement.json`](short-statement.json) · analysis: `doc/mvp/brand/ANALYSIS_YOUTUBE_SHORTS.md`
(reference yt-shorts/04 and 05: sting with `>brazil`, lower third name + handle, phrase captions).

| | |
|---|---|
| Profile | 1080 × 1920, 30 fps (`vertical`), −14 LUFS / −1 dBTP (`audio_master`) |
| Duration frame | 30–65 s |
| Captions | **one** caption overlay: `caption_word` (style `brand-word`) **or** `caption_phrase` (style `brand-phrase`) |
| Music | optional slot; the template ships no music (T14) |

## Structure

| # | Part | Blocks |
|---|------|--------|
| 1 | **Cold open**: the attitude sentence, 2–4 s | footage + captions; no lower third |
| 2 | Sting | `logo_sting` full screen (`suffix` optional, e.g. `brazil`), video + audio clip |
| 3 | Who speaks | `lower_third` `{ "people": [{ "name": "Gustavo Hill", "role": "@gustahill" }] }` |
| 4 | Argument / story | footage and B-roll with the captions; optional `wordmark_flash` |
| 5 | End | `animal_scream` → `logo_end` |

Order the recipe check enforces: `logo_sting → lower_third → animal_scream → logo_end`; ends with the `logo_end`; no
`lower_third` before the sting.

## Agent rules

- Mixed word and phrase captions in one short are not possible yet (one `style` per `captions.json`): choose one.
- Statement captions need word timings for `brand-word`; without them (`word-timings-unavailable`) use `brand-phrase`.

## Checks, reviews, done

`recipe.mjs apply short-statement`, `recipe.mjs check`; done = editorial, captions text, preview and final approved
(plus the duration exception outside 30–65 s).
