# Brand projects (Loud Society) – instructions for the agent

Reference for the editing skill: videos in the Loud Society style with the **brand pack** (`brand/`, Phase 6). The
pack adds brand blocks (sting, chevron wipe, captions in the house font Neuborn, lower thirds, cards, endcard, sounds,
thumbnail) and **format recipes** to the normal workflow of [SKILL.md](../SKILL.md). Everything else – reviews, sync,
extension approvals, research – works exactly as there. Block details: [brand/README.md](../brand/README.md).

## When

The editor wants a Loud Society format or look: "Never Ending Interview" / NEI (episode or short), a short "anecdote"
or "statement", the host interview "jensen x <guest>", or simply "in the Loud Society style". Without such a wish the
project stays a plain Phase 4 project (no recipe, no brand blocks).

## Rules (on top of SKILL.md)

1. **The brand layer is fixed (T6).** Brand blocks come only from `add-block`; their parameters stay within the limits
   of `brand.json` (add-block and the renderer refuse anything else – never work around it). Never edit
   `extensions/brand-pack/` or a brand block's `extension.json` by hand beyond its `parameters`; never write your own
   version of a brand element (sting, wipe, captions, lower third, logo, endcard, thumbnail template).
2. **The episode layer is free.** Series designs, textures, grading, album stickers, a cut-out band picture and similar
   elements of one production are ordinary extensions by [EXTENSIONS.md](EXTENSIONS.md) in their own folder
   (`extensions/<id>/`, never below `extensions/brand-pack/`); `recipe.mjs check` reports them as warnings (allowed).
3. **The recipe decides** profile, frame rate, duration frame, caption style, mandatory blocks and their order, hook
   rules and the "done" state. Read `brand/recipes/<recipe>.md` completely before the draft.
4. **Brand assets are licensed for internal editors only (T12).** Never pass the fonts, logos or sounds on, attach them
   to anything outside the project, or upload them anywhere but the project sync. Never regenerate AI audio or images.
5. **NEI chains only from transcripts** – never from upload notes or metadata values of the videos (they contain the
   editor's answer key): [brand/recipes/NEI_CHAIN.md](../brand/recipes/NEI_CHAIN.md).
6. **Only the editor approves**, also the thumbnail and its headline ([REVIEWS.md](REVIEWS.md)).

## Setup (once per machine, `darkmind-agent doctor` shows the state)

- **Brand assets:** `doctor` notes when they are missing. Call the MCP tool `get_brand_assets` →
  `darkmind-agent brand-assets <ticket>` (about 9 MB into `~/.darkmind/brand-assets`, outside the skill, so plugin
  updates keep them; `doctor` moves assets of an older skill folder there). `add-block` fails with "brand assets … not
  found" until they are there.
- **Microsoft Edge** (preinstalled on Windows; otherwise `DARKMIND_TOOL_MSEDGE`; `doctor` reports it) and, per project,
  `playwright-core` in `extensions/`: `darkmind-agent extensions run` (and `render`) installs it by itself with `npm ci
  --ignore-scripts` when `extensions/package.json` and `package-lock.json` are those of this brand pack – do not ask
  the user and do not run `npm ci` yourself. `node_modules` is not synced, so a pulled project gets it again the same
  way.
- **No run approval for brand blocks:** a block vendored by `add-block` and unchanged (scripts, `brand.json`,
  `extensions/package.json`, fonts and logos byte-identical to this skill's brand pack and installed brand assets) runs
  without `extensions approve` and without asking. `extensions show <id>` says "approval: not needed". A block that
  differs (edited, outdated pack, foreign assets) is reported as `extension-approval-required` "no unchanged brand
  block": vendor it again with `add-block <block> --force` and the same parameters – never approve it.

## Continuing a pulled brand project (new session or other machine)

The archive holds the pipeline and `extensions/brand-pack/`, but no media and no rendered blocks. Before you open the
preview or render: `darkmind-agent plan` → proxies → `darkmind-agent extensions run` (installs `playwright-core`, runs
the unchanged brand blocks without approval; only your own episode extensions need `extensions show` → the user
agrees → `extensions approve`) → `darkmind-agent preview`. A project vendored with an older brand pack is no unchanged
brand block of this skill: re-vendor its blocks (`add-block --force`; `recipe.mjs check` reports
`brand-pack-outdated`).
The live preview shows brand captions and blocks only from these rendered outputs (alpha overlays get a browser copy
automatically); without them it draws placeholders and lists the missing steps. Never fall back to describing the
brand look from memory – render it.

## Workflow with a recipe

| Recipe | Profile | Length | Captions |
|--------|---------|--------|----------|
| `nei-episode` | 16:9, 25 fps | 5–25 min (reference test 5–8 min, 4–6 links) | none / optional `brand-16x9` |
| `nei-short` | 9:16, 30 fps | 30–90 s | `brand-word` |
| `short-anecdote` | 9:16, 30 fps | 15–60 s | `brand-word` |
| `short-statement` | 9:16, 30 fps | 30–65 s | `brand-word` **or** `brand-phrase` |
| `host-interview` | 16:9, 25 fps | 10–25 min | none / optional `brand-16x9` |

1. **Brief:** ask which format (table above; `node <skill>/brand/tools/recipe.mjs list`), topic, people, the language of
   the captions (the language of the speech). Write the recipe into `brief.md` ("Recipe: nei-short") and confirm the
   choice with the editor before research.
2. **Apply:** after `init`, `node <skill>/brand/tools/recipe.mjs apply <recipe> --project .` writes `project.json`
   `output`, `duration`, `recipe` and `audioMaster` (never edit them by hand). Then `sources.json`/`edit.json` as in
   SKILL.md; NEI: chain first ([NEI_CHAIN.md](../brand/recipes/NEI_CHAIN.md)).
3. **Blocks:** `node <skill>/brand/tools/add-block.mjs <block> --project . [--params '<json>'] [--id <id>]` for every
   block of the recipe; place the printed `timelineClips` (sting and logo end: video **and** audio clip; a chevron
   wipe replaces the cut – the recipe document shows how). No run approval is needed for unchanged brand blocks.
4. **Captions:** text only from verified quotes. `brand-word`: save `get_word_timings` per video as JSON → `darkmind-agent
   captions-words <files>`; propose at most one `emphasis` word per group (part of the caption text review). Without
   word timings (`word-timings-unavailable`) use `brand-phrase` where the recipe allows it. **One style per video** –
   word and phrase captions mixed in one video are not supported.
5. **Check after every timeline change:** `node <skill>/brand/tools/recipe.mjs check --project .` (exit 1 on errors) and
   `darkmind-agent validate`. `brand-pack-modified` → vendor again (`add-block <block> --force`, same parameters);
   `brand-pack-outdated` (older pack) → re-vendor before the final render.
6. **First pass:** recipe projects render the first full proxy without the editorial review; the editor approves the
   content together with the preview (mandatory before the final render). Present the draft anyway.
7. **Loudness:** first level the dialogue – `darkmind-agent levels --apply` after the timeline is built (and again after
   cut changes): festival and camera sound is often 10–35 dB quieter than the brand sounds; the command writes clip gains
   (a level change, preview review only); report its quiet-source warning (distant camera microphone) to the editor.
   The render then masters to −14 LUFS / −1 dBTP (`audio_master`) and reports
   `checks.loudness`; a `fail` is a finding for the editor – never change the target.
8. **Thumbnail** (16:9 recipes): 2–4 frame `candidates` → the editor chooses frame and headline → `frame` → review
   `thumbnail` → `extensions run <id> --original` ([REVIEWS.md](REVIEWS.md#thumbnail-phase-6)).
9. **Chapters** (16:9 recipes): `node <skill>/brand/tools/recipe.mjs chapters --project . --out renders/chapters.txt`
   after the last timeline change; show the list to the editor (YouTube description).
10. **Done:** `darkmind-agent review status --json > renders/review-status.json` →
   `node <skill>/brand/tools/recipe.mjs check --project . --reviews renders/review-status.json` – no errors and nothing
   pending.
11. **Premiere (optional):** `darkmind-agent export premiere --attach renders/chapters.txt` ([PREMIERE.md](PREMIERE.md)):
   captions only as the rendered overlay on a track of its own, brand blocks as rendered media, thumbnail and chapters
   next to `IMPORT.md`, loudness target for Premiere's export.

`toolchain.json` records the brand pack version (`brandPack`) at every render – nothing to do.

## Errors

| Message | Action |
|---------|--------|
| `brand assets (fonts, logo) not found` (add-block) | `get_brand_assets` → `darkmind-agent brand-assets <ticket>` |
| `… is made for the 16:9 profile` / limits, durations (add-block, render) | the block or parameter does not fit the recipe – choose within the limits, never patch the pack |
| `brand-pack-modified`, `brand-pack-outdated` (recipe check), `extension-approval-required` "no unchanged brand block" (extensions run) | `add-block <block> --force` with the same parameters; never approve a changed brand block |
| `brand-captions-unrendered` (validate) | the caption block is missing on an `overlay` track |
| preview shows placeholders / "not rendered in this folder" | normal after a pull: `darkmind-agent extensions run` (installs `playwright-core`, no approval for brand blocks) – the preview lists the steps |
| `word-timings-unavailable` (MCP) | `brand-phrase` where allowed, otherwise tell the editor |
| `review-required` for `thumbnail` | show the thumbnail and the headline to the editor first |
| `checks.loudness` `fail` | report it with the measured values; the editor decides |
