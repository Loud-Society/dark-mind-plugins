# Brand pack – Loud Society (`agents/editing-skill/brand/`)

Brand layer of the Loud Society edit template (Phase 6, plan:
[PHASE_6_EDIT_TEMPLATE.md](../../../doc/mvp/PHASE_6_EDIT_TEMPLATE.md); brand analysis:
[BRAND_LOUD_SOCIETY.md](../../../doc/mvp/BRAND_LOUD_SOCIETY.md)). The pack consists of brand tokens (`brand.json`) and
**brand blocks**: parameterised extensions of the editing pipeline (Phase 4 extension contract, F14) that render
deterministically with a lean HTML compositor (decision T10). Their videos are rendered locally and never checked in
(T9). Version: `brand.json` `version` (= `package.json`; 1.0 after the brand approval in WP7).

Status: **WP6 (2026-11-23)** – brand pack 0.6.0: tokens, text blocks (WP2), motion and audio blocks and the
`audio_master` step (WP3), the YouTube thumbnail (WP4), the Never Ending Interview blocks, the five format recipes with
their check, the YouTube chapter list and the NEI chain reconstruction (WP5); integrated into the editing skill (WP6:
recipe choice in the brief, [`references/BRAND.md`](../references/BRAND.md), assets via the MCP tool
`get_brand_assets` → `darkmind-agent brand-assets`, Premiere hand-off of brand projects). **WP7 (2026-11-23):** sample
clips for `nei-episode`, `nei-short`, `short-anecdote` and `short-statement` built with this pack from real material and
approved by the editor; `host-interview` only as a technical draft (material rejected). Findings went into the recipes
(NEI without the interviewer) and `darkmind-agent` 0.12.x (`levels`, mastering limiter, rights T14). Version 1.0 waits
for the brand approval by Loud Society (T11) and the audio selection (T13), both still open.

**Assets:** the skill download contains no brand assets (Neuborn is for internal editors only, T12). `add-block` finds
them in `~/.darkmind/brand-assets` (`darkmind-agent brand-assets <ticket>` with a ticket of the MCP tool
`get_brand_assets`), via `--assets <folder>` / `DARKMIND_BRAND_ASSETS`, in `brand/assets/` of an older skill
installation, or in the repository's `brand-assets/`.

## Contents

| Path | Content |
|------|---------|
| `brand.json` | Tokens: colours, Neuborn faces (files from `brand-assets/fonts/`), logo (SVG from `brand-assets/logo/`, suffix variants), default audio/image assets (ids of `brand-assets/*/assets.json`), profiles 9:16 (1080 × 1920, 30 fps) and 16:9 (1920 × 1080, 25 fps) with text safe areas and zones, loudness (−14 LUFS, −1 dBTP, music bed 18–22 dB below dialogue), settings of every block |
| `lib/compositor.mjs` | HTML compositor: Playwright drives headless Microsoft Edge, frames are captured over CDP (transparent for alpha) and piped as PNG into **one** ffmpeg encoder per file (R1), which also muxes a block's sound; strided workers; dedupe only with complete state keys (R4); declared files only, from a virtual origin (R3); deterministic browser and ffmpeg flags (R2) |
| `lib/render.mjs` | Command of the brand extensions: reads the runner's inputs (`DARKMIND_EXTENSION_INPUTS`), checks the output contract and the brand limits (preflight), mixes the sound, extracts wipe frames, renders the block |
| `lib/layout.mjs` | Pure rules of the text blocks (browser and Node): line breaks and character limits, word groups and frame-exact word timing, duration and parameter limits |
| `lib/blocks.mjs` | Pure rules of all blocks: block lists, output kind (picture/alpha/sound/still image), profiles, faces/logos/assets per block, sound cues, duration and parameter limits, asset kind checks, thumbnail headline lines and grade |
| `lib/media.mjs` | ffmpeg helpers (Node): a block's sound from its cues (exact length), frames of a clip with the render core's frame choice (T2/T3) for the chevron wipe and the thumbnail |
| `lib/scene.mjs`, `lib/cmap.mjs`, `lib/motion.mjs`, `lib/cards.mjs` | Browser helpers of the scenes (fonts from the declared bytes, exact glyph coverage from the font's cmap – R6, shadow text, RGB split, block glitch, glow, ink box for tests; chevron geometry and the motion-blurred wipe, cover images; text items and glitch phases of the NEI cards) |
| `lib/*-scene.mjs`, `blocks/<block>/scene.html` | The scenes (`window.scene = { init, renderAt }`) |
| `blocks/<block>/block.json` | Block description: profiles, caption style, faces, logo, output, parameters |
| `recipes/<recipe>.json` + `.md` | Format recipes (WP5): machine-readable description (profile, duration frame, mandatory/optional blocks, order, hook, parameters, chapters, "done") and the agent document; `NEI_CHAIN.md` = guide of the chain reconstruction |
| `lib/recipes.mjs`, `lib/chapters.mjs`, `tools/recipe.mjs` | Recipe check of a project, YouTube chapter list, CLI `list`/`show`/`apply`/`check`/`chapters` |
| `lib/nei-chain.mjs`, `tools/nei-chain.mjs` | NEI chain reconstruction: proposals from saved transcripts (`extract`), graph, sub-chains, branches, gaps, conflicts and the chosen path (`build`) |
| `tools/add-block.mjs` | Vendors a block into a project (below) |
| `package.json`, `package-lock.json` | Tool `playwright-core` (exact version); copied to the project's `extensions/` |
| `test/` | `layout.test.mjs` (pure), `recipes.test.mjs` and `nei-chain.test.mjs` (pure, synthetic transcripts in `nei-fixtures/`), `render.test.mjs` (text blocks, Edge + ffmpeg), `motion.test.mjs` (motion and audio blocks), `thumbnail.test.mjs` (thumbnail), `nei-blocks.test.mjs` (NEI blocks), `fixtures.mjs` (synthetic projects) |

## Text blocks (WP2)

Sizes are **cap heights** (height of a capital, as measured on the reference frames); the scenes derive the font size
from Neuborn's measured cap height. Positions in % of the frame height H / width W.

| Block | Profile | Output | Look and rules | Parameters |
|-------|---------|--------|----------------|------------|
| `caption_word` | 9:16 | alpha `.mov`, whole timeline | Neuborn Medium, cap height 4.2 % H, white, hard shadow (0.25 % H), no box, centred at 66.5 % H, 1–3 words per group (new group after 3 words, after punctuation, after a pause > 0.25 s, beyond 16 characters); each word appears on its own start frame; an emphasised word stands alone, pops (1.4 → 1.18 in 8 frames, then exactly constant) | `captions` (default `captions.json`), `startFrame` |
| `caption_phrase` | 9:16 | alpha `.mov`, whole timeline | cap height 2.7 % H, at most 2 lines of 32 characters (explicit `\n` kept, otherwise balanced breaks), bottom line at 78 % H | `captions`, `startFrame` |
| `subtitles_16x9` | 16:9 | alpha `.mov`, whole timeline | cap height 4 % H, at most 2 lines of 48 characters, bottom line at 88 % H | `captions`, `startFrame` |
| `lower_third` | both | alpha `.mov`, glitch-in 0.3 s + hold 3–6 s + glitch-out 0.2 s | NAME in capitals (Neuborn Bold) over the role (Regular), hard shadow, clean in the hold, RGB split only in the glitch. 9:16: one person, left at 10 % W, name at 55 % H (above the word caption line); 16:9: one person left (8 % W) or two – guest left, host right-aligned at 92 % W (host interviews), name at 77.5 % H. Names ≤ 28, roles ≤ 40 characters | `people: [{ name, role }]` |
| `wordmark_flash` | 9:16 | alpha `.mov`, 0.3–3 s | wordmark SVG (not the font – the wordmark differs from Neuborn Medium) at 56 % W with glow and RGB split, 7.5 % H above the word caption line (58.5 % H), glitch-in over 3 frames, hard cut out | `centerY` |
| `title_card` | 16:9 | H.264 `.mp4` on black, or alpha `.mov` (`background: "transparent"`), 1.5–8 s | title as written (e.g. `jensen x mark tremonti`), Neuborn Medium, cap height 7 % H, ≤ 80 % W, steady RGB split ±2 px, optional `LOUD SOCIETY PRESENTS` above, glitch-in 0.4 s, glitch-out 0.2 s | `title` (≤ 40 characters), `presents`, `background` |

Safe areas (`brand.json` `profiles.*.textSafe`): 9:16 x 8–92 % W, y 15–80 % H (top 15 % and bottom 20 % are
platform UI); 16:9 the 90 % title-safe area. Every frame of every block stays inside (render test). The vertical zones
deviate slightly from the analysis table: lower third and word captions 54–70 % H (titles 40–54 %), so a popped
keyword never touches the lower third.

Caption blocks refuse what they would otherwise have to drop or guess: a style other than theirs, statement captions
without word timings (`caption_word`), lines beyond the limits, characters Neuborn has no glyph for. Text and
parameters are data – they are measured and drawn, never evaluated.

## Motion and audio blocks (WP3)

Sound comes from the AI/library assets of `brand-assets/` (manifests `audio/assets.json`, `images/assets.json`), chosen
**by id**: every block has a documented default candidate in `brand.json` `assets.defaults` (`voice-shout-guy`,
`voice-spoken-guy`, `noise-hit-c`, `animal-peacock-1`/`-rooster-1`/`-stag-1`, `loud-jackhammer-1` + `loud-helicopter-1` +
`animal-peacock-1`, `endcard-angled-gpt-image-2-1`) until Loud Society selects (T13; then the defaults change to the
`selected` assets). `add-block` checks the kind of every asset (a voice tag must be a `voice-tag` …) and vendors the
file to `extensions/brand-pack/assets/audio/<id>.wav` / `assets/images/<id>.jpg`. The assets are normalised to a common
reference, not to the mix: the blocks set **relative** levels (`brand.json` `blocks.<block>.audio`), `audio_master` the
final loudness.

| Block | Profile | Output | Look and sound | Parameters |
|-------|---------|--------|----------------|------------|
| `logo_sting` | both | H.264 + AAC `.mp4`, 2–5 s (default 2.5 s) | white flash with black bars (3 frames) → block glitch settling (to 0.45 s) into the wordmark on black (40.6 % W in 16:9, 58.5 % W in 9:16, centred; glow, steady RGB split) → optional country suffix revealed in 6 steps from 0.7 to 1.0 s (inline 16:9, second line 9:16; grey suffix SVGs of `brand-assets/logo/`) → micro glitch at 55 %. Sound: noise hit at 0 s (−4 dB), shouted voice tag at 0.1 s (voice tags are trimmed to their onset = sync point). The transition into the next shot is a `chevron_wipe` with this output as A | `suffix`, `voiceTag`, `noiseHit` (ids or `null` = off) |
| `chevron_wipe` | both | with `a`/`b`: H.264 `.mp4` (finished transition); without: alpha `.mov` overlay; 0.4–0.6 s (default 0.5 s) | a white chevron 2.4 × H high sweeps left to right (ease in/out, 40-sample motion blur over 0.15 frame, orange/blue fringe); with `a`/`b` shot A is shown and **B already behind the leading edge and in the notch** (references yt-long/02, yt-shorts/08). A/B frames are extracted with the render core's frame choice (T2/T3, also from proxy excerpts with their offset) into `DARKMIND_EXTENSION_TMP`, so the wipe continues seamlessly into the clips around it | `a`, `b` = `{ sourceId \| extensionId, in, crop? }` (`in` in source seconds, `crop` like timeline crops; without crop the picture covers the frame) |
| `glitch_flash` | both | alpha `.mov`, 1–3 frames | white flash with horizontal bars in black/red/cyan over a hard cut | `intensity` 0.2–1, `seed` |
| `logo_end` | both | H.264 + AAC `.mp4`, 1.5–2 s (default 1.8 s) | wordmark white on black with soft glow, glitch-in over 3 frames, then still; spoken voice tag at 0.2 s. Usually revealed by a `chevron_wipe` with `b` = this output (in 0); continue the timeline with in = wipe length, place its audio clip at the wipe start | `voiceTag` |
| `endcard` | 16:9 | H.264 `.mp4`, 10–11 s (default 10 s) | AI sticker wall in black and white ("cover"), three black sticker labels left – wordmark, `subscribe.`, `thank you!` (Neuborn Medium) – slapped on at 0.2/0.45/0.7 s with a 3-frame glitch; the YouTube end-screen zone (x ≥ 58 % W) stays free | `image` |
| `animal_scream` | both | **sound only**, PCM `.wav`, length of the sound | peacock (default), rooster or stag right before the logo end | `animal`, `asset`, `gainDb` (−24…6) |
| `loud_sounds` | 16:9 | **sound only**, PCM `.wav` | 1–5 loud sounds back to back (jackhammer, helicopter, peacock …), each cut to `secondsEach` with a 40 ms fade | `sounds`, `secondsEach` (0.5–3 s, default 1.2) |
| `audio_master` | both | **no extension** – `project.json` `audioMaster` | the renderer masters the whole mix: music tracks ducked by 12 dB under dialog (0.25 s ramps), the mix in 32-bit float, one gain to −14 LUFS and, where peaks would exceed it, an oversampled lookahead limiter at −3 dBTP plus one correction pass (`darkmind-agent` ≥ 0.12.0; dialogue levelled before with `darkmind-agent levels`); `checks.loudness` of the encoded output (±1 LU, ≤ −1 dBTP) | `ducking` (`{ underDialogDb, rampSeconds }` or `null`) |

Sound-only blocks use the extension contract's `output.video: false` (darkmind-agent ≥ 0.9.0) and are rendered with
ffmpeg alone (command `node extensions/brand-pack/lib/render.mjs extensions/brand-pack/blocks/<block>/block.json`, no
Playwright). Blocks with picture and sound need a video clip **and** an audio clip on the timeline; `add-block` prints
both (`timelineClips`, audio on an `effects` track). The Premiere package carries all of them as rendered media.

Rendering speed (development machine, 4 workers): sting 2.5 s in ~1.9 s, logo end ~1.3 s, wipe A/B ~1.4 s, endcard 10 s
in ~3.5 s (still frames are deduplicated), sound-only blocks < 0.4 s.

## Thumbnail (WP4)

The YouTube thumbnail of the 16:9 formats (NEI episode, host interview) – a fixed template in all nine reference
thumbnails ([contact sheet](../../../doc/mvp/brand/frames/yt-long/11_thumbnails_alle_kontaktbogen.jpg)), measured on
[yt-long/10](../../../doc/mvp/brand/frames/yt-long/10_thumbnail_chevron-headline_NeQ3LGhyRrw.jpg):

| Element | Rule (`brand.json` `blocks.thumbnail`) |
|---------|-----------------------------------------|
| Output | **one 8-bit grey PNG, 1280 × 720** (≤ 2 MB, YouTube's limit) – a still image next to the video, extension contract `output.image: true`; never on the timeline (validator `extension-still-image`), not part of the preview review |
| Picture | the frame of a `source` or `extension` input at `in` (source seconds) with the **render core's frame choice** (T2/T3 on the project's frame rate, also from proxy excerpts with their offset), `crop` like a timeline clip (fractions of the oriented source, 16:9), otherwise "cover"; black and white: Rec. 709 luma, `contrast` around mid grey (1–1.6, default 1.2; flat/log camera footage needs ~1.4–1.5), brightness −3 % |
| Chevron | white, the logo chevron (same polygon as the glyph), height 47.2 % H, at the left edge, centred – apex at 23 % W (analysis: 20–25 % W) |
| Headline | Neuborn Medium (not condensed: the reference headlines are Neuborn), capitals (default case mapping, `ß` → `SS`), right-aligned on the ink at 94 % W, cap height 20.4 % H, smaller only if the longest line would be wider than 56 % W or the block higher than the safe area (13–87 % H, clear of YouTube's duration badge), never below 11 % H; line gap 0.23 cap heights, block centred; soft dark halo (blur 1.2 % H, 35 %) for bright frames |
| Lines | 2–5 words, ≤ 4 lines of ≤ 14 characters. Explicit `\n` win; otherwise up to three words one per line, more words over three lines with the shortest longest line (ties: the earlier line longer) – `CITY OF / THRASH / METAL`, `LAND OF / THE RISING / NOISE`. Set `\n` where the phrase wants it (`GIVE 'EM\nHELL\nUP THERE!`) |
| Candidates | `candidates` (2–4 frames) instead of `frame`: a 2 × 2 contact sheet of complete thumbnails labelled A–D with their source time – the agent's proposal; the editor chooses. A sheet cannot be approved in the `thumbnail` review |

```powershell
# the agent proposes frames (16:9 project; sources from sources.json)
node <skill>/brand/tools/add-block.mjs thumbnail --project . --params '{"headline":"Who is next?","contrast":1.5,"candidates":[{"sourceId":"q-myles","in":"25","crop":{"x":"0.22","y":"0.02","w":"0.56","h":"0.56"}},{"sourceId":"a-bfmv","in":"56"}]}'
darkmind-agent extensions run thumbnail       # → renders/extensions/thumbnail.png (sheet A–B): the editor chooses
node <skill>/brand/tools/add-block.mjs thumbnail --project . --force --params '{"headline":"Who is next?","contrast":1.5,"frame":{"sourceId":"a-bfmv","in":"56"}}'
darkmind-agent extensions run thumbnail       # the chosen thumbnail; show it to the editor
darkmind-agent review show thumbnail          # editor's explicit OK → review approve thumbnail --hash … --by … --confirmation "…"
darkmind-agent extensions run thumbnail --original   # the deliverable from the original (gate: thumbnail review)
```

The block runs without a local run approval (unchanged brand block, see "Using a block in a project"); `--force`
changes only parameters and inputs, so it stays trusted.
Rendering: ~1 s for the still, a few seconds per frame from 4K camera originals (seek and 16-bit conversion).

**Fixes found with real NEI originals (they also affect `chevron_wipe`):** ffprobe 9 reports the time base of a camera
`.mov` with a timecode track twice (`has no video stream` before), and cropping 10-bit 4:2:2 video at an unaligned
position garbled the chroma – frames are now cropped after conversion to 16-bit planar RGB (like the render core, which
crops after 4:4:4).

## Never Ending Interview blocks (WP5)

The series-specific blocks of the NEI episode (`doc/mvp/brand/ANALYSIS_YOUTUBE_LONGFORM.md`, section C; reference
b7IxT-OI2fQ). All are opaque H.264 without sound (`renders/extensions/<id>.mp4`); stills and clips come from `source` or
`extension` inputs with the render core's frame choice (T2/T3, also from proxy excerpts with their offset).

| Block | Profile | Look | Parameters |
|-------|---------|------|------------|
| `format_card` | 16:9, 3–6 s (default 5 s) | text card on black: optional title in capitals (Neuborn Medium, cap height 6 % H, steady RGB split) over up to three sentences (Regular, 3.2 % H, ≤ 5 lines of 52 characters), centred; glitch-in 0.3 s, glitch-out 0.2 s. Explainer (`title` + `text`) and transition (`text` = "Our starting question comes from none other than…") | `title` (≤ 32), `text` (sentence or list of ≤ 3) |
| `band_card` | 16:9 and 9:16, 1–2.5 s (default 1.5 s) | 1–2 lines **as written** (names in capitals, the band or `x NAME` below – `["MYLES KENNEDY", "alter bridge"]`, `["EVIL JARED", "x KROGI"]`) in Neuborn Medium with a steady RGB split on black, left (16:9: 8 % W, cap 9.4 % H; 9:16: below the picture at 65 % H); a still of the interview in the image box (16:9 right 60 %, 9:16 upper 56 %; "cover", soft fade into black on the text side); glitch-in over 3 frames. Chevron wipes reveal and leave it: the card is an `extension` input (`a`/`b`) of the wipes | `lines` (1–2 × ≤ 24), `image` (`{ sourceId \| extensionId, in, crop? }`, optional) |
| `cliffhanger_card` | 16:9, 4–6 s (default 5 s) | "SUBSCRIBE" (Bold, 7.5 % H, RGB split) over "to find out if the question / goes to NEXT / and if they will answer…" (without `next`: "to find out who answers / the next question…"), optionally the open question quoted below; right-aligned at 92 % W from 10 % H, over a darkened still (brightness 0.5) or black | `next` (≤ 28, capitals), `question` (≤ 100), `image` (optional) |
| `vertical_in_16x9` | 16:9, as long as the clip (0.5–180 s) | vertical footage (selfie questions) fitted to the frame height in the middle over the same frame blurred and darkened (brightness 0.45, drawn small and scaled up – deterministic); picture only. Place it on a `graphics` track exactly over the statement's source clip; the dialog clip keeps the sound | `clip` (`{ sourceId \| extensionId, in, out, crop? }`, crop with the 9:16 aspect) |

Texts are checked before rendering (characters, lines, Neuborn glyphs) and refused rather than cut. Rendering
(development machine, 4 workers): format card 5 s in ~3 s, band card ~1.5 s, cliffhanger ~2 s, vertical footage about
real time (frame extraction from the source dominates).

## Format recipes (WP5)

Recipes describe how a format is built – for the agent (`recipes/<id>.md`) and machine-readable (`recipes/<id>.json`).
They set the output profile, the duration frame and the loudness step in `project.json` and are checked against the
project:

| Recipe | Profile | Duration | Mandatory blocks (order) | Also |
|--------|---------|----------|--------------------------|------|
| [`nei-episode`](recipes/nei-episode.md) | 16:9/25 | 5–25 min (reference 5–8 min, 4–6 links) | `logo_sting` → 2 × `format_card` → ≥ 2 × `band_card` (+ `chevron_wipe` with A/B) → `cliffhanger_card` → `loud_sounds` → `logo_end` → `endcard` | `thumbnail`, chapters per link; optional `vertical_in_16x9`, `subtitles_16x9`, `glitch_flash`; no cards in the cold open |
| [`nei-short`](recipes/nei-short.md) | 9:16/30 | 30–90 s | `band_card` → `wordmark_flash` (+ `caption_word`) → `animal_scream` → `logo_end` | one link of the same chain; title suffix " \| The Never Ending Interview" |
| [`short-anecdote`](recipes/short-anecdote.md) | 9:16/30 | 15–60 s | `wordmark_flash` (+ `caption_word`) → `animal_scream` → `logo_end` | no lower third in the first 3 s |
| [`short-statement`](recipes/short-statement.md) | 9:16/30 | 30–65 s | `logo_sting` → `lower_third` → `animal_scream` → `logo_end`, one of `caption_word`/`caption_phrase` | no lower third before the sting |
| [`host-interview`](recipes/host-interview.md) | 16:9/25 | 10–25 min | `logo_sting` → `title_card` → `lower_third` (first one double) → `loud_sounds` → `logo_end` → `endcard`, `chevron_wipe` | `thumbnail`, chapters from `chapters.json` |

Every recipe has `audio_master` (−14 LUFS, −1 dBTP) and an optional music slot (MVP without music, T14).

```powershell
node <skill>/brand/tools/recipe.mjs list                     # recipes
node <skill>/brand/tools/recipe.mjs apply nei-episode        # project.json: output, duration, recipe, audioMaster
node <skill>/brand/tools/recipe.mjs check                    # exit 1 on errors; JSON with issues, blocks, chapters
node <skill>/brand/tools/recipe.mjs chapters --out chapters.txt
darkmind-agent review status --json > review-status.json
node <skill>/brand/tools/recipe.mjs check --reviews review-status.json   # "done": the reviews of the recipe
```

`check` reports (severities like `darkmind-agent validate`): **errors** – wrong recipe/profile/duration frame, missing
or non-brand `audioMaster`, mandatory block missing or unplaced, too many, a block outside the recipe, brand parameters
outside the limits (the blocks' own preflight), recipe parameters (e.g. wipes of the episode need A/B), a modified
vendored brand pack (T6: the brand layer is fixed – an older vendored version is only a warning), order, a forbidden
block in the hook, the wrong last block, the first lower third of the host interview not double, a captions style
outside the recipe, a still image on a track, invalid chapters; **pending** – thumbnail candidates not chosen yet,
captions missing, chapters missing (`host-interview`), reviews of "done" open; **warnings** – episode-layer extensions
(allowed, T6), an outdated vendored pack, a music bed (rights, T14). Safe zones are kept by the blocks themselves
(tests); the format contract (references, frames, gaps) stays with `darkmind-agent validate`. The duration frame is set
by the recipe; outside it the editor grants a duration exception (Phase 4), the frame is never changed.

**Chapters** (YouTube description) for `nei-episode` are derived from the band cards (each chapter starts with the
wipe that reveals the card, title from the card lines), for `host-interview` from `chapters.json`
(`{ "schemaVersion": 1, "kind": "darkmind-chapters", "chapters": [{ "title", "clipId" | "frame" }] }`, anchored to
timeline clips so the list follows edits); YouTube rules: first chapter 0:00, at least three, each ≥ 10 s.

**NEI chain:** [recipes/NEI_CHAIN.md](recipes/NEI_CHAIN.md) – proposals from saved transcripts
(`nei-chain.mjs extract`), checked and corrected by the agent in `chain.json`, then `nei-chain.mjs build` (graph,
branches, gaps, Loud Society questions, repeated appearances, contradictions/ambiguities for the editor, chosen path,
Markdown for the review report).

## Using a block in a project

```powershell
# 1. vendor (runs nothing; assets from ~/.darkmind/brand-assets – darkmind-agent brand-assets – or --assets <brand-assets>)
node agents/editing-skill/brand/tools/add-block.mjs caption_word --project <project> --assets brand-assets
node agents/editing-skill/brand/tools/add-block.mjs lower_third --project <project> --params '{"people":[{"name":"Gustavo Hill","role":"@gustahill"}]}'
# 2. captions.json: "style": "brand-word"; word timings from the MCP tool get_word_timings (saved per video):
darkmind-agent captions-words words-int-a.json
# 3. place the printed timeline clip on an "overlay" track, then render – no run approval and no npm step:
#    darkmind-agent compares the block with this brand pack (byte-identical → trusted) and installs playwright-core in
#    extensions/ by itself (npm ci --ignore-scripts from package-lock.json)
darkmind-agent render --proxy
```

**Trust of brand blocks (2026-11-25, `agent-cli/src/pipeline/brand-trust.ts`).** `darkmind-agent` runs a brand block
without a local approval when its command is `node extensions/brand-pack/lib/render.mjs
extensions/brand-pack/blocks/<block>/(scene.html|block.json)`, its tools are only `node`, `ffmpeg` and
`npm:playwright-core` in this pack's version, and every code input – `lib/`, `blocks/`, `brand.json`,
`extensions/package.json`, the vendored fonts and logos – is byte-identical to the brand pack next to the script
(`<skill>/brand`, or `DARKMIND_BRAND_PACK`) and its installed brand assets (`~/.darkmind/brand-assets`,
`DARKMIND_BRAND_ASSETS`). Parameters are data. A changed or outdated pack, foreign assets and every episode extension
still need `extensions approve`; `extensions show` names the reason. `npm ci --ignore-scripts` runs only when
`extensions/package.json` and `package-lock.json` equal this pack's and `extensions/node_modules/playwright-core` is
missing.

`add-block` writes `extensions/brand-pack/` (lib, `brand.json`, the block's scene, the Neuborn faces and logo files it
uses), `extensions/package.json` + `package-lock.json` (only `playwright-core`), the audio/image assets it uses and
`extensions/<id>/extension.json`
with every input declared, the command
`node extensions/brand-pack/lib/render.mjs extensions/brand-pack/blocks/<block>/scene.html` (sound-only blocks:
`…/blocks/<block>/block.json`), the tools `node >=20`, `ffmpeg`, `npm:playwright-core <version>` (picture blocks) and
the output contract (`renders/extensions/<id>.mov|.mp4|.wav`; caption overlays cover the timeline, sound-only blocks
last as long as their sound, timed blocks get the brand default duration; the chevron wipe's `a`/`b` become
`source`/`extension` inputs). `add-block audio_master` writes `project.json` `audioMaster` instead of an extension. It
lists the extension in `project.json` and
refuses to overwrite an existing `extension.json` without `--force`. Neuborn (T12) and the logo are synced with the
project (internal Dark Mind archive only).

Edge: Playwright `channel: "msedge"` (Windows: preinstalled), or `DARKMIND_TOOL_MSEDGE` = path to `msedge(.exe)`.
`DARKMIND_BRAND_WORKERS` sets the capture workers (default 4; the file does not depend on it).

Rendering speed (development machine, 4 workers, QuickTime Animation): word captions 9:16 over 8 s in ~2.4 s, a
35 s phrase-caption overlay in ~9 s, a lower third in ~1.5 s.

## Captions, reviews and Premiere

- Brand caption styles in `captions.json`: `brand-word` → `caption_word`, `brand-phrase` → `caption_phrase`,
  `brand-16x9` → `subtitles_16x9`. The renderer burns nothing in; the validator warns `brand-captions-unrendered` while
  no extension on the timeline reads `captions.json`, and the preview review refuses such renders.
- `words[].emphasis` marks a keyword (agent choice) and belongs to the caption text review; word timings and positions
  belong to the preview review. Text corrections happen in `captions.json`; `captions-words` re-aligns the words
  (rule W1) and the overlay renders again (cache key: captions file hash).
- Premiere (T8, WP6): brand captions reach Premiere only as the rendered overlay `[rendered] <id>` on a **video track of
  its own** (the exporter moves it there if it shares a pipeline track with other clips), no SRT, no caption track; the
  export report names the track. All brand blocks are rendered media, named in the report with block and brand pack
  version. The approved thumbnail (from the original) and attached files (`export premiere --attach chapters.txt`) lie
  next to `IMPORT.md`; the package carries clips with their levels, not the mastered mix – `IMPORT.md` gives the
  −14 LUFS / −1 dBTP target for Premiere's export (Loudness Normalization) and what the latest final render applied.
- **Mixed word and phrase captions** in one video are not supported (decision WP6): one `captions.json` has one style
  and one caption block reads it; recipes allow one style each (`short-statement`: word **or** phrase).

## Tests

```powershell
cd agents/editing-skill/brand
npm ci
npm test        # layout (pure) + render tests (text, motion and audio blocks); render tests skip without Edge/ffmpeg unless DARKMIND_REQUIRE_BRAND_RENDER=1
```

Covered: brand tokens inside the safe areas, line breaks and character limits (also umlauts/ß), word groups and
frame-exact appearance, duration/parameter limits, vendoring, output contract per block (ffprobe), ink inside the safe
area on **every frame** of every block, glyph coverage (umlauts drawn with Neuborn, missing glyphs refused),
undeclared files refused, and determinism (T10): the same block rendered again in a fresh browser, with 3 workers and
without dedupe gives the identical SHA-256. WP3 (`motion.test.mjs`): every motion and audio block against its
contract with ffprobe (frames, fps per profile, alpha, codec, sound 48 kHz stereo as long as the picture ±1 frame),
the voice tag on its sync point and sounds switched off with `null`, the chevron wipe showing A and B with the render
core's frame choice (luma-coded source frames, also from a proxy excerpt with offset) and refusing a clip that ends
too early, the endcard labels outside the end-screen zone, and T10 for sting (with AAC), wipe, endcard and loud sounds;
rules, asset ids/kinds and `audio_master` vendoring in `layout.test.mjs`. WP4 (`thumbnail.test.mjs`): one grey PNG
1280 × 720 per ffprobe, the frame choice (luma-coded frames, proxy offset, a `.mov` with timecode track, a cropped
10-bit 4:2:2 source), chevron and headline geometry inside the safe area for short, long and four-line headlines, the
candidate sheet (each quadrant its own frame) and T10; headline lines, grade, parameters and vendoring in
`layout.test.mjs`. WP5 (`nei-blocks.test.mjs`): the NEI blocks against their contract, the card still and the
vertical clip frame by frame with the render core's frame choice (also proxy offset), text inside the safe area, the
blurred background, T10 for band card, vertical footage and format card; `recipes.test.mjs` (the shipped recipes, a
synthetic NEI episode against the recipe check – every error class – and the chapter list), `nei-chain.test.mjs`
(unique, gapped and contradictory synthetic chains). CI runs the suite on Ubuntu with the preinstalled Edge
(`DARKMIND_REQUIRE_BRAND_RENDER=1`).
