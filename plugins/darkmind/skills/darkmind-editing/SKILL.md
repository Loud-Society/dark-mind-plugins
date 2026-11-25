---
name: darkmind-editing
description: Edit videos with Dark Mind. Researches footage through the Dark Mind MCP server, shows the hits to the user in the Dark Mind review player and collects them in the user's research basket, builds a reviewable cut draft and an editing pipeline in a local project folder, renders proxy previews and the final video locally with darkmind-agent, records only the editor's explicit approvals, syncs the project as versions to Dark Mind and optionally exports a Premiere Pro package. Loud Society formats (Never Ending Interview episode and short, anecdote and statement shorts, host interview) are built with the brand pack's format recipes and brand blocks. Use when the user wants to research or review Dark Mind material ("find material about …"), use the research basket, or create, continue or change a video, short, interview cut or Dark Mind cut project, or mentions Dark Mind, darkmind-agent, cut projects, proxies, originals, captions, Loud Society, Never Ending Interview, thumbnails or a Premiere export.
---

# Dark Mind editing skill

You build an **editing pipeline**: files in a local project folder that render the video deterministically. The
**editor** (the user) decides about content, wording and the final result; you research, propose, build, render and
present. **Dark Mind** is the material source and the versioned archive (MCP server `dark-mind`). The local script
**`darkmind-agent`** moves data, validates, renders and records reviews – large data never passes through you.

This contract is the same in GitHub Copilot and Claude Code. Windows is the supported platform.

## Before you start

1. **Script.** `darkmind-agent.mjs` lies in this skill's folder next to this file (Claude Code: `${CLAUDE_SKILL_DIR}`;
   GitHub Copilot: the skill's base directory; with the Dark Mind plugin the client's plugin cache – take the folder of
   this file; from the skill ZIP `%USERPROFILE%\.copilot\skills\darkmind-editing\` or
   `%USERPROFILE%\.claude\skills\darkmind-editing\`). Below,
   `darkmind-agent <command>` means
   `node "<skill folder>/darkmind-agent.mjs" <command> --json --dir "<project folder>"`. Do not copy the script into the
   project folder. `skill.json` names the version, the Dark Mind the skill was downloaded from and how it was installed
   (`install`: `plugin` or `zip`).
2. **Check once per session:** `darkmind-agent doctor`. It needs Node.js ≥ 20 and ffmpeg/ffprobe in `PATH`. Report
   problems to the user instead of installing anything. If `notes` says Dark Mind serves a newer version, tell the user
   the update step from the note (plugin: `claude plugin update darkmind@darkmind` / `copilot plugin update
   darkmind@darkmind` after `… plugin marketplace update darkmind`, or `darkmind-agent plugin update`; then a new
   session; guide `<Dark Mind>/downloads/darkmind-plugin.md`) – the user runs it, not you.
3. **MCP tools** (`search_videos`, `get_transcript`, `basket_*`, `get_review_link`, `project_*`, `get_media_sources` …) must be available. If they are
   missing or answer `unauthorized`, ask the user to connect or sign in to the Dark Mind MCP server – you cannot log
   in for them (plugin: GitHub Copilot `/mcp` → `darkmind`; Claude Code `/mcp` → `plugin:darkmind:darkmind`).
4. Optional: speech-to-text check with a user-installed whisper.cpp (`DARKMIND_WHISPER`, `DARKMIND_WHISPER_MODEL`);
   without it the transcription check is `skipped`, which is fine.
5. **Brand projects** (Loud Society formats) additionally need the brand assets in `~/.darkmind/brand-assets`: `doctor`
   notes when they are missing → MCP `get_brand_assets` → `darkmind-agent brand-assets <ticket>`
   ([references/BRAND.md](references/BRAND.md)).

## Ground rules

- **You never approve.** Reviews are recorded only with the editor's explicit, verbatim confirmation
  ([references/REVIEWS.md](references/REVIEWS.md)). Never edit `reviews/`.
- **Running your own extension code needs the user's OK** (local approval in `.darkmind/`, not a review;
  [references/EXTENSIONS.md](references/EXTENSIONS.md)). **Brand blocks are trusted:** a brand block vendored by
  `add-block` and unchanged runs without approval and without asking – `darkmind-agent` checks it byte for byte against
  this skill's brand pack (`extensions show` says "approval: not needed"), and `extensions run` installs its npm tool
  (`npm ci --ignore-scripts` in `extensions/`) by itself. Do not ask the user about either. Only when a block is
  reported as no unchanged brand block (`extension-approval-required`), vendor it again with `add-block --force`;
  never approve a modified brand pack.
- **Never invent** quotes, timecodes, sources or approvals. Transcript and search times are research values; resolve
  cut points at the material and keep open points as `unresolved` codes.
- **No SAS URLs, tokens or media content in the conversation.** Tools return tickets; the script redeems them.
- **Never push silently.** Push only when the user asked for it or at the agreed milestones, and never after a lost
  lock without telling the user ([references/SYNC.md](references/SYNC.md)).
- **Do not regenerate** saved AI media and do not download originals before the final render without need.
- **Brand projects:** the brand layer (brand blocks, `extensions/brand-pack/`) is never changed – only block
  parameters within their limits via `add-block`; episode-specific elements are your own extensions. The brand assets
  are for internal use only. Never use upload notes or metadata values as evidence for a Never Ending Interview chain
  (they hold the editor's answer key) – [references/BRAND.md](references/BRAND.md).
- Hand-edit only the pipeline artefacts (`brief.md`, `sources.json`, `edit.json`, `timeline.json`, `captions.json`,
  `project.json`, `extensions/`). `darkmind.json`, `.darkmind/`, `reviews/`, `renders/`, `media/` and
  `toolchain.json` belong to the script.
- Keep tool answers small: `--json` output, `type: "segment"` searches with a small `top`, transcripts with
  `from`/`to` ([references/RESEARCH.md](references/RESEARCH.md)).

## Workflow

Brief → research → draft → **editorial review** → proxy → **preview review** → corrections → originals → final
render → **final approval** → sync → optional Premiere export. Push after each approved milestone.

### 1. Brief and project folder

- Ask what the video is for: format (short 9:16 1080 × 1920 / 30 fps, or episode 16:9 1920 × 1080 / 25 fps), length
  (reference short: 30–60 s), topic, statements, audience, captions. **Loud Society format?** Then choose the recipe
  with the editor (`nei-episode`, `nei-short`, `short-anecdote`, `short-statement`, `host-interview`), read
  `brand/recipes/<recipe>.md` and follow [references/BRAND.md](references/BRAND.md). Write `brief.md` (with
  "Recipe: <id>" for brand projects).
- Use an **empty folder per project and machine**. New project: `project_create(name, description)` (locks it for the
  user) → `darkmind-agent init <projectId>`. Existing project: `project_checkout` → `project_pull` →
  `darkmind-agent download <ticket>` (no `init`). A project saved from Explore contains only `cutlist.json`: after the
  pull run `darkmind-agent import-cutlist [--profile vertical|landscape]` – the result is a draft that is not ready.
- **After a pull, before the preview or a render** (the archive holds no media and no rendered extension outputs, and
  pulling never runs code): `darkmind-agent plan` → load the listed proxies → `darkmind-agent extensions run` (brand
  blocks: no approval, it installs `playwright-core` itself; your own extensions: `extensions show <id>` → the user
  agrees → `extensions approve <id> --hash <hash> --yes` first) → then `darkmind-agent preview`. The preview lists
  whatever is still missing (banner and terminal) with these steps;
  brand captions and overlays appear only from their rendered outputs. Details: [references/SYNC.md](references/SYNC.md#restore-in-a-fresh-folder).
- With a recipe: `node "<skill folder>/brand/tools/recipe.mjs" apply <recipe> --project .` writes the profile, duration
  frame and loudness step into `project.json`. Then (and without a recipe) write `project.json`, `sources.json` and
  `edit.json` yourself; start from [examples/interview-short](examples/interview-short/) and
  [references/FORMAT.md](references/FORMAT.md). JSON Schemas are in `schemas/`.

### 2. Research

- `search_videos` → candidates; `get_transcript(videoId, from, to)` around the hit; `get_video` only when you need
  metadata. Prefer the smallest suitable copy of a scene ([references/RESEARCH.md](references/RESEARCH.md)).
- **Let the user watch the hits.** `get_review_link(hits, title)` with the best candidates (range and a short label
  each) returns **one link per hit** (`links[].url`; each shows exactly that one video). Answer with a numbered result
  list – per hit the label, file, range and its link – and open the first link **in a panel next to the chat**, never
  in an external window when the client has one: GitHub Copilot app – browser canvas; Claude desktop app (tools
  `mcp__Claude_Browser__*`) – built-in browser pane with `preview_start` and `url` (keep the returned `tabId`; another
  hit: `navigate` that tab to its link); only Claude Code or Copilot CLI in a terminal without these tools – the system
  browser (PowerShell `Start-Process "<url>"`). When the user asks for another result ("show me 3"), open its link in
  the same panel. The player shows the video with transcript and insights; the user keeps it in the **research
  basket** (basket button with counter in the player's header). Never claim what the user saw – read it with
  `basket_list`.
- **Research basket** (per user, shared with the Dark Mind web app): `basket_list` before you propose a project (the
  user may have collected material already), `basket_add` with a note for candidates the user wants to keep,
  `basket_remove`; `basket_clear` only on request. A cut project from the basket: its entries become sources and
  statement ranges ([references/RESEARCH.md](references/RESEARCH.md#review-with-the-user-and-the-research-basket)).
- Proxies to check cut points: `get_media_sources(kind "proxy", videoIds)` → `darkmind-agent media <ticket> --range
  <videoId>:<from>-<to>` (excerpts with a few seconds of margin; complete proxies only for short videos).
- Record every used video in `sources.json` (`kind: "darkmind-video"`, the Dark Mind video ID – never guessed from a
  file name). Research-only sources may stay; they create no project reference.

### 3. Draft and editorial review

- `edit.json`: statements in the proposed order with source, exact range (rational seconds as strings, e.g.
  `"12.48"`), the **verbatim** quote from the transcript, context and speaker; scenes (title cards, text inserts) with
  their text; B-roll with description and placement. Name uncertain transcript passages and missing sources.
- `darkmind-agent validate` until there are no errors; pending points are open work (`unresolved`, missing timeline).
- `darkmind-agent review show editorial` → present the draft (numbered, with original timecodes, quotes, context) →
  wait for the editor's explicit OK → `darkmind-agent review approve editorial --hash <hash> --by "<editor>"
  --confirmation "<the editor's words>"`. Requested changes: `review reject … --comment "<what>"`, change, show again.
- Push the approved draft (step 7) if the user wants the state saved.

### 4. Timeline, captions, proxy render

- Media facts of the originals without downloading them: `get_media_sources(kind "original", videoIds)` →
  `darkmind-agent probe --ticket <ticket>` (Dark Mind has no reliable duration/size metadata; `probe` is the source).
- `timeline.json`: statement clips on `main`/`dialog` tracks with exactly the statement ranges, a **crop for every
  source video clip** (normalised rectangle with the output aspect ratio – no silent centre crop), B-roll on a
  `b-roll` track, explicit gaps. `captions.json`: text only from verified quotes, whole timeline frames, no overlaps.
- Your own extensions (title cards etc.): write them by [references/EXTENSIONS.md](references/EXTENSIONS.md); before the
  first run `darkmind-agent extensions show <id>` → user agrees → `darkmind-agent extensions approve <id> --hash <hash>
  --yes`. Brand blocks need none of this.
- Brand projects: brand blocks with `brand/tools/add-block.mjs`, brand captions (`brand-word`/`brand-phrase`/
  `brand-16x9`, word timings via `get_word_timings` → `darkmind-agent captions-words`), and
  `node "<skill folder>/brand/tools/recipe.mjs" check --project .` after every timeline change
  ([references/BRAND.md](references/BRAND.md)).
- `darkmind-agent validate --ready` → `darkmind-agent plan` (lists missing proxies with a ready `media --range` hint)
  → load them → `darkmind-agent levels --apply` (dialogue clip gains from the measured loudness; again after every cut
  change)
  → load them → optionally `darkmind-agent preview` (browser preview at `http://127.0.0.1:4610/`, runs until stopped;
  offer it for iterating; it shows extension outputs – brand blocks, brand captions – only once they are rendered in
  this folder: run `darkmind-agent extensions run` first, see "After a pull" in step 1) → `darkmind-agent render --proxy`.

### 5. Preview review and corrections

- Present the proxy file (`renders/proxy/vNNNN.mp4`) and its checks: sync (≤ 1 frame), transcription hit rate and
  differing words, changed time ranges against the previous version. Then `review show preview` and, if there are
  captions, `review show captions-text`; outside the duration frame `review show duration-exception` (never cut the
  video to fit – the editor decides). Record each approval only after the editor's explicit OK.
- Corrections: classify each change (content → editorial review again; caption text → caption-text review; crop, gain,
  timing, style → only a new proxy and its preview review) – table in [references/REVIEWS.md](references/REVIEWS.md).
  `render --section <fromFrame>-<toFrame>` renders a part quickly for checking; sections cannot be approved.

### 6. Final render and approval

- `darkmind-agent plan --original` shows the originals needed. Tell the user the download size
  (`get_media_sources(kind "original")` returns `bytes` before anything is downloaded; camera masters can be > 10 GB)
  → `darkmind-agent media <ticket>` → `darkmind-agent render --original` (gate: editorial, caption text, preview and,
  if needed, duration exception).
- The final file is **not approved** until the editor has watched it: `review show final` → editor's explicit OK →
  `review approve final …`.
- Thumbnail (Phase 6 brand projects, YouTube): propose 2–4 frames as a contact sheet (brand block `thumbnail` with
  `candidates`), the editor chooses and confirms the headline → `frame`, render, `review show thumbnail` → editor's
  explicit OK → `review approve thumbnail …` → `extensions run thumbnail --original` (the deliverable PNG). Details in
  [references/REVIEWS.md](references/REVIEWS.md#thumbnail-phase-6).
- Brand projects are **done** when `recipe.mjs check --reviews` (output of `darkmind-agent review status --json`)
  reports no errors and nothing pending; 16:9 recipes also give the editor the YouTube chapter list
  (`recipe.mjs chapters --out renders/chapters.txt`).

### 7. Sync (push)

`darkmind-agent manifest` → `project_push_begin(projectId, baseVersion, manifest)` (manifest = content of
`.darkmind/manifest.json`, `manifest --print`) → `darkmind-agent upload <ticket>` → `project_push_commit(pushId,
"<what changed>")` → `darkmind-agent pushed <version>`. `project_release` when the work is done. `manifest` derives the
video references from the pipeline and refuses invalid pipelines or excluded pipeline files – fix the cause; details,
locks, conflicts and restore in [references/SYNC.md](references/SYNC.md).

### 8. Optional: Premiere Pro hand-off

Only after the final check and only if the editor wants to continue in Premiere: `darkmind-agent export premiere
[--handles <seconds>] [--attach renders/chapters.txt]` → give the editor the folder `renders/premiere/vNNNN/` and its
`IMPORT.md`. Changes made in Premiere are **not** transferred back. Brand projects: captions arrive only as the
rendered overlay on a track of its own (no caption track), brand blocks as rendered media, the approved thumbnail and
the chapter list next to `IMPORT.md`, and the package holds the clip levels, not the −14 LUFS master (`IMPORT.md` says
how to set it in Premiere). Details in [references/PREMIERE.md](references/PREMIERE.md).

## Operating hints

- **Session length:** the project state lives completely in the folder's files. For small changes (a correction, a
  caption fix, a crop) start a **fresh, short session** in the project folder; long sessions only re-read context.
- **Reasoning level:** **medium** for corrections and routine steps; **higher** for building a project, a new format,
  new extensions or difficult research.
- Read `darkmind-agent` JSON output selectively; use `review show`, `status`, `plan` instead of opening large files.
- One render per folder at a time; Ctrl+C stops only the own processes and a re-run resumes.

## Errors and what to do

| Code | Meaning / action |
|------|------------------|
| `review-required` | An approval is missing or stale (`details.gate.blockers`): show the subject to the editor; never work around it |
| `rights-missing`, `rights-unclear` (gate of the final render/export) | Third-party material without cleared rights (T14): ask the editor for holder, licence, status and scope and record them in `sources.json` `rights`; never set `cleared` yourself without the editor's statement, never swap the material silently |
| `hash-mismatch` | The state changed since `review show`: show it again |
| `extension-approval-required` | Your own extension: `extensions show <id>` → ask the user → `extensions approve`. A brand block (message "no unchanged brand block"): `add-block <block> --force` with the same parameters, never approve it |
| `pipeline-invalid`, `required-files-excluded` | `manifest` refuses to archive an invalid pipeline or without needed files: fix with `validate` / `.darkmindignore`; `--allow-invalid` only on the user's wish to save work in progress |
| `locked`, `not-locked` | Someone else holds the lock, or yours expired: keep working locally, tell the user, do not push ([SYNC](references/SYNC.md)) |
| `version-conflict` | Someone pushed in between: do not force; follow [SYNC](references/SYNC.md) |
| `media-facts-missing`, `media-facts-changed`, `original-changed` | Run `probe`; a changed original needs a new source revision – ask the editor |
| `not-indexed`, `indexing-failed`, `proxy-unavailable` | No proxy: choose another copy or, with the user's consent, work with the original |
| `local-changes` | `download` would overwrite local edits: ask before `--force` |
| `brand assets … not found` (add-block), `brand-pack-modified` (recipe check) | [references/BRAND.md](references/BRAND.md#errors) |

## References

- [references/FORMAT.md](references/FORMAT.md) – project files, time rules, timeline/caption rules, validator codes
- [references/REVIEWS.md](references/REVIEWS.md) – reviews and approvals: never approve, which change needs which review
- [references/EXTENSIONS.md](references/EXTENSIONS.md) – extensions: declare inputs, local approval, contract
- [references/SYNC.md](references/SYNC.md) – Dark Mind sync: locks, base version, video references, conflicts, restore
- [references/RESEARCH.md](references/RESEARCH.md) – efficient research, review player, research basket, choosing sources
- [references/PREMIERE.md](references/PREMIERE.md) – Premiere Pro hand-off
- [references/BRAND.md](references/BRAND.md) – Loud Society brand projects: recipes, brand blocks, assets, checks
- [brand/recipes/](brand/recipes/) – the five format recipes and the Never Ending Interview chain guide (`NEI_CHAIN.md`)
- [examples/interview-short/](examples/interview-short/) – complete example project (format contract v1)
- `schemas/` – JSON Schemas of every artefact
