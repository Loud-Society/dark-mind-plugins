# Recipe `nei-episode` – The Never Ending Interview, episode (16:9)

Machine-readable: [`nei-episode.json`](nei-episode.json) · chain: [NEI_CHAIN.md](NEI_CHAIN.md) · blocks:
[../README.md](../README.md) · plan: Phase 6 (`doc/mvp/PHASE_6_EDIT_TEMPLATE.md`, NEI section) · reference test:
`doc/mvp/E2E_REFERENCE_TEST.md` (result A).

**Format:** musicians at festivals answer a question another band asked, then ask a new question for the next band
they do not know. Only the NEI segment of a festival interview belongs into the episode (not "Who Follows Who" or the
shout-out that often follow).

| | |
|---|---|
| Profile | 1920 × 1080, 25 fps (`landscape`), −14 LUFS / −1 dBTP (`audio_master`) |
| Duration frame | 5–25 min; MVP reference test 5–8 min with **4–6 links** |
| Captions | none by default; optional `subtitles_16x9` (`captions.json` style `brand-16x9`) |
| Music | optional slot (role `music`, ducked by `audio_master`); the template ships no music (T14) |
| Deliverables | the episode, the **thumbnail** (1280 × 720) and the **chapter list** (one chapter per link) |

## Structure

| # | Part | Blocks | Length |
|---|------|--------|--------|
| 1 | **Cold open**: strongest/funniest answer | footage only – no cards, no band card, no lower third (hook) | ~9 s |
| 2 | Sting | `logo_sting` (video + audio clip), then `chevron_wipe` with a = sting, b = the next shot | 2.5 s + 0.5 s |
| 3 | Explainer | `format_card` `{ "title": "Never ending interview", "text": ["We ask musicians at festivals one question.", "The answer comes from someone else – who then comes up with a new question.", "And it keeps going."] }` | ~5–6 s |
| 4 | Transition | `format_card` `{ "text": "Our starting question comes from none other than…" }` | ~3 s |
| 5 | Starter | `band_card` of the first asker (`["EVIL JARED", "x KROGI"]` for two people) + the question (vertical selfies with `vertical_in_16x9`) | ~25 s |
| 6 | **Links** n× | `chevron_wipe` → `band_card` (first appearance of the band: `["MYLES KENNEDY", "alter bridge"]`) → `chevron_wipe` → shortened answer → the new question | 60–90 s each |
| 7 | Cliffhanger | `cliffhanger_card` `{ "next": "<band the open question goes to>", "question": "<the open question>" }` (without `next`: "who answers the next question…") | ~5 s |
| 8 | Outro | `loud_sounds` (audio) → `chevron_wipe` (b = logo end) → `logo_end` → `endcard` (last picture) | ~15 s |

Order the recipe check enforces (first appearance): `logo_sting → format_card → band_card → cliffhanger_card →
loud_sounds → logo_end → endcard`; the episode ends with the `endcard`.

## Placing the blocks (timeline)

- **Sting and logo end** need a video clip **and** an audio clip (`add-block` prints both in `timelineClips`; the audio
  goes to an `effects` track, `linkedTo` the video clip).
- **A wipe replaces the cut:** clip A ends at the wipe start, the wipe (`a`/`b` parameters, 13 frames) lies there, clip
  B continues right after it with `in = b.in + 0.5 s`. Band cards are revealed and left by wipes: before the card a wipe
  with `b = { "extensionId": "<card>", "in": "0" }` (the card continues with `in` = wipe length), after it a wipe with
  `a = { "extensionId": "<card>", "in": "<card length − wipe length>" }`.
- **Logo end** = wipe (`b = { "extensionId": "logo-end", "in": "0" }`) + `logo_end` from `in` = wipe length; its audio
  clip starts at the wipe start.
- **Band card still:** `image` = a frame of the band's interview (`{ sourceId, in, crop? }`); the card shows its centre
  in the right 60 % – give a `crop` (16:9) that frames the faces.
- **Vertical selfie questions:** the statement's source clip stays on `main` (its dialog clip carries the sound); place
  `vertical_in_16x9` (`clip` = the same source and range) on a `graphics` track exactly over it.
- `loud_sounds` is sound only: one audio clip on `effects` right before the logo end.
- `thumbnail` is a still image next to the video (never on a track): propose 2–4 `candidates`, the editor chooses,
  headline = the question or a claim like `WHO IS NEXT?` (2–5 words); flat camera footage needs `contrast` ≈ 1.4–1.5.

## Agent rules

1. **Chain from transcripts only** – follow [NEI_CHAIN.md](NEI_CHAIN.md): observations with source and timecode in
   `chain.json`, graph and path from `nei-chain.mjs`; uncertain or contradictory assignments are flagged and shown to
   the editor, never guessed. Upload notes and metadata values of the NEI videos are **never** used (they hold the
   editor's answer key); no `get_video` for the chain.
2. **Chain logic:** the question of link n is answered in link n+1. If a link drops out, report the break and propose a
   solution (a transition, another link) – never invent a question.
3. Real chains are graphs (branches, unanswered questions, answers without a filmed question, questions by Loud Society,
   bands appearing several times, separate sub-chains): choose a path (prefer long sub-chains with strong answers) and
   give the reasons for the choice and for every rejection in the review report; list unanswered questions as reserve.
4. **No interviewer in the episode** (editor decision, Phase 6 WP7): leave out the read-out questions, prompts and
   hand-overs of the interviewer – the previous band's question on camera carries the chain. A link is band card →
   the shortened answer (punchline) → the band's own question for the next band ("my question for the next band is …",
   complete). Interviewer voices that are only picked up by the guest's microphone also appear in the transcripts –
   check the speaker at the material. Quotes stay verbatim (`edit.json`); the editor may correct misheard band names
   (e.g. "hard case" = The Hardkiss) in quote and caption.
5. Band card at the first appearance of every link; spelling of names from the transcript, uncertain spellings flagged
   (`unresolved`).
6. Cold open: the strongest answer (~9 s); give the reason in the review report.
7. Questions that do not fit the band and rude/NSFW answers stay allowed but are flagged in the review report – the
   editor decides.
8. No transitions other than `chevron_wipe` and `glitch_flash`; brand-layer parameters only within the `brand.json`
   limits; episode-layer elements (series designs, grading) only as free extensions (T6).

## Checks, reviews, done

```powershell
node <skill>/brand/tools/recipe.mjs apply nei-episode            # profile, duration frame, recipe, audio_master
node <skill>/brand/tools/recipe.mjs check                         # after every timeline change (exit 1 on errors)
node <skill>/brand/tools/recipe.mjs chapters --out chapters.txt   # YouTube description: one chapter per link
darkmind-agent review status --json > review-status.json
node <skill>/brand/tools/recipe.mjs check --reviews review-status.json   # "done"
```

- The **first pass** renders to the proxy without the editorial review (F5); the editor approves the content when
  reviewing the preview – mandatory before the final render.
- **Done** = editorial, captions text (if captions), preview, final and **thumbnail** approved (plus the duration
  exception outside 5–25 min). The thumbnail review is independent of the video reviews.
- **Chapters:** derived from the band cards (each chapter starts with the wipe that reveals the card; titles from the
  card lines). To change titles write `chapters.json` (`{ "schemaVersion": 1, "kind": "darkmind-chapters", "chapters":
  [{ "title", "clipId" }] }` – anchored to timeline clips, so the list follows edits). YouTube: first chapter 0:00, at
  least three, each ≥ 10 s.
