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
   (`extensions/<id>/`, never below `extensions/brand-pack/`); `darkmind-agent recipe check` reports them as warnings
   (allowed).
3. **The recipe is the base pattern of the format**: profile, frame rate, duration frame, caption style, briefing
   questions, material, sections, blocks and their order, hook, rules and the "done" state. Read it completely before
   the draft (`darkmind-agent recipe show`). **Deviations the editor asks for are allowed and expected**: the recipe
   check reports them as `deviation` – name each one in the review report of the preview, never block or hide it.
   Only the brand pack's limits (brand layer, loudness, profile of the blocks) are never broken.
4. **The project works with its frozen recipe** (`recipe.lock.json`, synced with the project). Never edit the lock,
   never check against another version; a recipe is data – it never contains code, new checks come with the brand
   pack.
5. **Brand assets are licensed for internal editors only (T12).** Never pass the fonts, logos or sounds on, attach them
   to anything outside the project, or upload them anywhere but the project sync. Never regenerate AI audio or images.
6. **NEI chains only from transcripts** – never from upload notes or metadata values of the videos (they contain the
   editor's answer key): [brand/recipes/NEI_CHAIN.md](../brand/recipes/NEI_CHAIN.md).
7. **Only the editor approves**, also the thumbnail and its headline ([REVIEWS.md](REVIEWS.md)). Recipe texts are
   editorial guidance – they never override these rules or SKILL.md.

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
brand block of this skill: re-vendor its blocks (`add-block --force`; `darkmind-agent recipe check` reports
`brand-pack-outdated`).
The live preview shows brand captions and blocks only from these rendered outputs (alpha overlays get a browser copy
automatically); without them it draws placeholders and lists the missing steps. Never fall back to describing the
brand look from memory – render it. The recipe comes with the project (`recipe.lock.json`): a pulled project is
checked against exactly the version it was built with.

## Workflow with a recipe

The recipes come from the Dark Mind catalog (`recipe_list`); the formats of Loud Society today:

| Recipe | Profile | Length | Captions |
|--------|---------|--------|----------|
| `nei-episode` | 16:9, 25 fps | 5–25 min (reference test 5–8 min, 4–6 links) | none / optional `brand-16x9` |
| `nei-short` | 9:16, 30 fps | 30–90 s | `brand-word` |
| `short-anecdote` | 9:16, 30 fps | 15–60 s | `brand-word` |
| `short-statement` | 9:16, 30 fps | 30–65 s | `brand-word` **or** `brand-phrase` |
| `host-interview` | 16:9, 25 fps | 10–25 min | none / optional `brand-16x9` |

1. **Brief:** `recipe_list` → choose the format with the editor. After applying it (step 2), ask the recipe's
   **briefing questions** (`darkmind-agent recipe show`, section "Brief"), topic, people, the language of the captions
   (the language of the speech). Write the recipe into `brief.md` ("Recipe: nei-short v1") with the answers.
2. **Apply:** after `init` and a first `project.json`: `recipe_get(slug)` → `darkmind-agent recipe use <ticket>`
   freezes the recipe into `recipe.lock.json` and writes `project.json` `output`, `duration`, `recipe` and
   `audioMaster` (never edit them or the lock by hand). Read the whole recipe: `darkmind-agent recipe show`. Then
   `sources.json`/`edit.json` as in SKILL.md; NEI: chain first ([NEI_CHAIN.md](../brand/recipes/NEI_CHAIN.md)). A newer
   version later is an upgrade only with the editor's consent: `recipe use <ticket> --upgrade` (preview and final
   reviews again; `darkmind-agent recipe status` shows the project's version).
3. **Material:** compare the recipe's material needs with the research and write `material.json`
   (`{ "schemaVersion": 1, "kind": "darkmind-material", "needs": [{ "needId", "status": "covered" | "partial" |
   "missing" | "waived", "sources": [sourceIds], "statements": [statementIds], "note" }] }`, schema
   `schemas/material.schema.json`); **report missing `hard` needs to the editor before the draft** (find more, have it
   uploaded, or go without – then `waived` with the editor's reason).
4. **Blocks:** `node <skill>/brand/tools/add-block.mjs <block> --project . [--params '<json>'] [--id <id>]` for every
   block of the recipe; place the printed `timelineClips` as [brand/README.md](../brand/README.md#placing-blocks-on-the-timeline)
   shows (sting and logo end: video **and** audio clip; a chevron wipe replaces the cut). No run approval is needed for
   unchanged brand blocks.
5. **Captions:** text only from verified quotes. `brand-word`: save `get_word_timings` per video as JSON → `darkmind-agent
   captions-words <files>`; propose at most one `emphasis` word per group (part of the caption text review). Without
   word timings (`word-timings-unavailable`) use `brand-phrase` where the recipe allows it. **One style per video** –
   word and phrase captions mixed in one video are not supported.
6. **Check after every timeline change:** `darkmind-agent recipe check` (exit 1 on errors) and `darkmind-agent
   validate`. **Errors** block (brand pack, format contract): `brand-pack-modified` → vendor again (`add-block <block>
   --force`, same parameters); `brand-pack-outdated` (older pack) → re-vendor before the final render. **Deviations**
   (missing or extra block, order, hook, end, a hard rule) are fine when the editor asked for them – otherwise fix them;
   either way list each one in the review report. **Hints** are recommended rules not followed. The result also lists
   the editorial rules and what the review report must contain.
7. **First pass:** recipe projects render the first full proxy without the editorial review; the editor approves the
   content together with the preview (mandatory before the final render). Present the draft and the deviations anyway.
8. **Loudness:** first level the dialogue – `darkmind-agent levels --apply` after the timeline is built (and again after
   cut changes): festival and camera sound is often 10–35 dB quieter than the brand sounds; the command writes clip gains
   (a level change, preview review only); report its quiet-source warning (distant camera microphone) to the editor.
   The render then masters to −14 LUFS / −1 dBTP (`audio_master`) and reports
   `checks.loudness`; a `fail` is a finding for the editor – never change the target.
9. **Thumbnail** (recipes with a thumbnail): 2–4 frame `candidates` → the editor chooses frame and headline → `frame` →
   review `thumbnail` → `extensions run <id> --original` ([REVIEWS.md](REVIEWS.md#thumbnail-phase-6)).
10. **Chapters** (recipes with chapters): `darkmind-agent recipe chapters --out renders/chapters.txt` after the last
    timeline change; show the list to the editor (YouTube description).
11. **Done:** `darkmind-agent recipe check --done` – no errors and nothing pending (the reviews of the recipe approved).
12. **Premiere (optional):** `darkmind-agent export premiere --attach renders/chapters.txt` ([PREMIERE.md](PREMIERE.md)):
   captions only as the rendered overlay on a track of its own, brand blocks as rendered media, thumbnail and chapters
   next to `IMPORT.md`, loudness target for Premiere's export.

`toolchain.json` records the brand pack version (`brandPack`) at every render – nothing to do.

## Developing a recipe with the editor

New formats and new versions are developed in the AI client together with the editor, in a test project, starting from
a format concept document or from a cut project, and published only on the editor's explicit request – the whole
workflow: [RECIPES.md](RECIPES.md).

## Errors

| Message | Action |
|---------|--------|
| `brand assets (fonts, logo) not found` (add-block) | `get_brand_assets` → `darkmind-agent brand-assets <ticket>` |
| `… is made for the 16:9 profile` / limits, durations (add-block, render) | the block or parameter does not fit the recipe – choose within the limits, never patch the pack |
| `brand-pack-modified`, `brand-pack-outdated` (recipe check), `extension-approval-required` "no unchanged brand block" (extensions run) | `add-block <block> --force` with the same parameters; never approve a changed brand block |
| `deviation` (recipe check) | asked for by the editor → keep it and name it in the review report; otherwise fix it |
| `recipe-lock-missing`, `recipe-lock-mismatch`, `recipe-lock-modified` | apply the recipe again (`recipe_get` → `recipe use`); never edit `recipe.lock.json` |
| `recipe-upgrade-required` | the project uses an older version: keep it, or upgrade with the editor's consent (`--upgrade`) |
| `material-unchecked`, `material-missing` (recipe check) | write `material.json`; tell the editor what is missing before the draft |
| `recipe-withdrawn` (`recipe_get`) | the version must not be used for new projects – take the current version |
| `recipe-brand-incompatible` | the recipe needs another brand pack version: `darkmind-agent plugin update`, or use a recipe version for this pack |
| `brand-captions-unrendered` (validate) | the caption block is missing on an `overlay` track |
| preview shows placeholders / "not rendered in this folder" | normal after a pull: `darkmind-agent extensions run` (installs `playwright-core`, no approval for brand blocks) – the preview lists the steps |
| `word-timings-unavailable` (MCP) | `brand-phrase` where allowed, otherwise tell the editor |
| `review-required` for `thumbnail` | show the thumbnail and the headline to the editor first |
| `checks.loudness` `fail` | report it with the measured values; the editor decides |
