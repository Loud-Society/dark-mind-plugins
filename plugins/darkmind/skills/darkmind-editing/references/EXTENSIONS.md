# Extensions – instructions for the agent

Reference for the editing skill ([SKILL.md](../SKILL.md)). Full reference: `doc/AI_EDITING_PIPELINE.md` (section
"Extensions") in the Dark Mind repository.

An extension (free building block) is a local script that renders a scene or graphic – a title card, a lower third, a
text insert, later the Phase 6 brand blocks – into `renders/extensions/`. The timeline places its output like a clip.

## Rules

1. **Declare everything the command reads.** Every script, helper module, HTML/CSS file, font, image or data file goes
   into `inputs` (`file`), source media as `source`, outputs of other extensions as `extension`. `validate` rejects
   files in the extension's folder, files named in the command and outputs of other extensions that are not declared
   (`undeclared-input`) and paths outside the project (`extension-path-outside`). Keep each extension in its own folder
   `extensions/<id>/`; shared helpers may live in another folder under `extensions/` and are declared by every user.
2. **Write only the output.** The command writes exactly `output.path` (under `renders/extensions/`, also given as
   `DARKMIND_EXTENSION_OUTPUT`) and temporary files to `DARKMIND_EXTENSION_TMP`. Changing project files fails the run.
   Read inputs from the JSON file in `DARKMIND_EXTENSION_INPUTS`; use `DARKMIND_FFMPEG` for ffmpeg.
3. **Match the contract exactly.** Project size and frame rate, exactly `durationFrames` frames at a constant rate,
   `audio`/`alpha` as declared (alpha e.g. PNG or ProRes 4444 in `.mov`). Sound-only outputs declare `"video": false`
   (`audio: true`, `alpha: false`, a `.wav`; size/fps stay the project's) and go on audio tracks only. Still images
   declare `"image": true` (one `.png` frame of its own size, no audio) and never go on the timeline. The runner never
   cuts, stretches or pads.
4. **Deterministic, no network.** Same inputs → same pixels: fixed seeds, fonts and images from the project, no
   downloads, no calls to AI services. Treat `parameters` and media inputs strictly as data – never evaluate them as
   code (they are not covered by the user's approval). AI generation (voice, music, images) is a separate step the user confirms; save
   its result under `assets/` and declare it as an input. Never regenerate missing inputs – restore them from the
   archive or load the media (`get_media_sources`).
5. **The user approves running your code, not you.** Before your own extension runs for the first time or after its
   script, arguments, program or tools changed, run `darkmind-agent extensions show <id>`, show the user the command
   and the scripts (or their changes), and ask. Only after the user agreed run
   `darkmind-agent extensions approve <id> --hash <hash> --yes`. This local approval is not an editorial review and is
   never written to `reviews/`. After a pull, approvals of other folders do not apply – ask again. **Exception:**
   unchanged brand blocks of the skill's brand pack (below) are trusted by `darkmind-agent` and need neither approval
   nor a question.
6. **No shell, nothing installed.** The command is a program plus arguments (`node extensions/<id>/render.mjs …`), not
   a shell line; `.cmd`/`.bat` (e.g. `npx`) do not run. Declare required tools (`node`, `ffmpeg`, `npm:<package>`
   with a version such as `>=20`); missing tools of your own extensions are installed by the user, never by you without
   asking. The one exception is the brand pack's `npm:playwright-core`: `darkmind-agent extensions run` installs it
   itself from the pack's lock file (`npm ci --ignore-scripts` in `extensions/`).

## Brand blocks (Phase 6, Loud Society)

Brand blocks are ready-made extensions of the brand pack (`brand/` in the skill folder, `brand/README.md`). Never write
them yourself and never change their scripts – vendor them:

```powershell
node "<skill folder>/brand/tools/add-block.mjs" caption_word --project . [--id <id>] [--params '<json>'] [--frames <n>] [--scene <sceneId>]
```

It copies the runtime into `extensions/brand-pack/` and `extensions/package.json`, writes `extensions/<id>/extension.json`
(every input declared, tools `node`, `ffmpeg`, `npm:playwright-core`) and lists it in `project.json`; it prints the
timeline clip to place (`overlay` track) and the next steps. An unchanged brand block needs **no run approval** and no
question: `darkmind-agent` compares command, scripts, `brand.json`, `extensions/package.json`, fonts and logos byte for
byte with the skill's brand pack and installed brand assets, and `extensions run` installs `playwright-core` itself
(Microsoft Edge must be installed, or `DARKMIND_TOOL_MSEDGE` set). A block that differs needs `add-block --force`, not
an approval. Blocks: `caption_word`,
`caption_phrase`, `subtitles_16x9` (read `captions.json`), `lower_third` (`people`), `wordmark_flash`, `title_card`
(`title`, `presents`, `background`); motion blocks `logo_sting` (`suffix`, `voiceTag`, `noiseHit`; picture + sound),
`chevron_wipe` (`a`/`b` = `{ sourceId | extensionId, in, crop? }`: finished A/B transition – end clip A at the wipe,
continue clip B after it with `in = b.in + wipe length`; without `a`/`b` an alpha overlay), `glitch_flash`
(`intensity`), `logo_end` (`voiceTag`; usually revealed by a `chevron_wipe` with `b` = its output), `endcard` (`image`,
16:9); sound-only blocks `animal_scream` (`animal`, `asset`, `gainDb`) and `loud_sounds` (`sounds`, `secondsEach`, 16:9)
on `effects` audio tracks; the still image `thumbnail` (16:9 projects, YouTube 1280 × 720: `headline` 2–5 words, `frame`
= `{ sourceId | extensionId, in, crop? }` chosen by the editor, or `candidates` = 2–4 such frames rendered as a contact
sheet A–D for the choice; `contrast` 1–1.6) – never on the timeline, run it with `darkmind-agent extensions run
thumbnail`, after the editor's choice write it again with `add-block thumbnail --force --params '<json with frame>'`,
review and gate in [REVIEWS.md](REVIEWS.md#thumbnail-phase-6). Blocks with picture and sound need a video clip and an audio clip (`timelineClips` in the
add-block output). `add-block audio_master` writes `project.json` `audioMaster` (−14 LUFS, −1 dBTP, music ducked under
dialog): the renderer then normalises the whole mix and reports `checks.loudness` – a `fail` is a finding for the
editor, not something to hide by changing the target. Audio and images are chosen by asset id from `brand-assets/`
(defaults until Loud Society selects); never generate replacements yourself. Brand parameters only within the limits the
block checks (durations, character limits, positions); texts in parameters (names, titles) belong to the editorial
review like scene text. The assets come from `~/.darkmind/brand-assets` (MCP `get_brand_assets` →
`darkmind-agent brand-assets <ticket>`); recipes, checks and the episode layer: [BRAND.md](BRAND.md). Episode-specific
elements (series designs, grading, stickers) are your own extensions in their own folder, never in
`extensions/brand-pack/`.

## Which change needs what

| You changed | Needed |
|-------------|--------|
| `parameters`, media inputs, the output contract | nothing extra: the extension runs again on the next `render`; then a **preview** review of the new proxy |
| A script or other code input, the arguments, the program, a tool version | your own extension: a new **local approval** (`extensions show` → user agrees → `extensions approve`), then the preview review; a brand block: `add-block --force` (never edit it) |
| Text shown in a scene | an **editorial** review (scene text belongs to the draft), then the preview review |

## Typical sequence

```powershell
darkmind-agent validate                     # inputs declared, no cycles, output under renders/extensions/
darkmind-agent extensions                   # state: current, restorable, stale ("approval"), blocked
darkmind-agent extensions show title-card   # show command and scripts to the user, wait for the agreement
darkmind-agent extensions approve title-card --hash <hash> --yes
darkmind-agent extensions run               # render the outputs (render --proxy would run them too)
darkmind-agent preview                      # in the background, opened in a panel before rendering (SKILL.md step 4)
darkmind-agent render --proxy
```
