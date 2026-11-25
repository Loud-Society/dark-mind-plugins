# Recipe `nei-short` – The Never Ending Interview, short (9:16)

Machine-readable: [`nei-short.json`](nei-short.json) · chain: [NEI_CHAIN.md](NEI_CHAIN.md) · reference test:
`doc/mvp/E2E_REFERENCE_TEST.md` (result C, from the same chain as the episode).

| | |
|---|---|
| Profile | 1080 × 1920, 30 fps (`vertical`), −14 LUFS / −1 dBTP (`audio_master`) |
| Duration frame | 30–90 s |
| Captions | **word captions**: `captions.json` style `brand-word` + `caption_word` (word timings via MCP `get_word_timings` → `darkmind-agent captions-words`) |
| Music | optional slot; the template ships no music (T14) |
| Title | ends with ` \| The Never Ending Interview` (publishing) |

## Structure – one link

| # | Part | Blocks |
|---|------|--------|
| 1 | The question (the asker briefly) | `band_card` of the asker (`["MYLES KENNEDY", "alter bridge"]`, image box in the upper half; give a 9:16 `crop` of the face) |
| 2 | The answer | footage full frame (no `vertical_in_16x9`), `caption_word`, `wordmark_flash` over the first caption line |
| 3 | The new question for the next band | footage |
| 4 | End | `animal_scream` (sound) → `logo_end` (video + audio, optionally revealed by a `chevron_wipe`) |

Order the recipe check enforces: `band_card → wordmark_flash → animal_scream → logo_end`; the short ends with the
`logo_end`. Not part of the recipe: sting, lower third, format/cliffhanger cards, endcard.

## Agent rules

- The link comes from the **same reconstructed chain** as the episode ([NEI_CHAIN.md](NEI_CHAIN.md)); choose it by the
  strength of the answer and give the reason in the review report.
- No interviewer (editor decision, Phase 6 WP7): the asker's question on camera, the answer shortened to the
  punchline, the band's own new question – no read-out questions, prompts or hand-overs of the interviewer. Quotes
  verbatim; misheard band names are corrected with the editor (quote and caption).
- At most one emphasised word per caption group (`words[].emphasis`), part of the caption text review.
- Safe zones: the blocks keep them (captions 54–70 % H, top 15 % and bottom 20 % free).

## Checks, reviews, done

`recipe.mjs apply nei-short`, `recipe.mjs check` after every timeline change; done = editorial, captions text,
preview and final approved (plus the duration exception outside 30–90 s). The first pass renders without the editorial
review (F5).
