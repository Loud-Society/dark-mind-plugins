---
name: darkmind-editing
description: Edit videos with Dark Mind. Researches footage via the Dark Mind MCP server, shows hits in the review player and the research basket, builds a reviewable cut draft and editing pipeline in a local project folder, renders proxies and the final video with darkmind-agent, records only the editor's explicit approvals or runs bulk jobs autonomously on request, syncs project versions to Dark Mind and optionally exports a Premiere Pro package. Loud Society formats (Never Ending Interview episode and short, anecdote and statement shorts, host interview) follow format recipes from the Dark Mind catalog; new recipes are developed with the editor and published there. Use when the user wants to research or review Dark Mind material, use the research basket, create, continue or change a video, short, interview cut or cut project, develop a format recipe, or mentions Dark Mind, darkmind-agent, cut projects, proxies, originals, captions, Loud Society, Never Ending Interview, thumbnails or a Premiere export.
---

# Dark Mind editing skill

You build an **editing pipeline**: files in a local project folder that render the video deterministically. The
**editor** (the user) decides about content, wording and the final result; you research, propose, build, render and
present. **Dark Mind** is the material source and the versioned archive (MCP server `dark-mind`). The local script
**`darkmind-agent`** moves data, validates, renders and records reviews – large data never passes through you.

This contract is the same in GitHub Copilot and Claude Code. Windows is the supported platform.

## Working mode: collaborative (default) or autonomous

The workflow below is the **standard procedure**, not a script: read the job and decide how to work.

- **Collaborative (default).** The editor works with you: brief questions, reviews with the editor's words, pushes
  at the agreed milestones, as described in the workflow. Choose it whenever the job does not say otherwise.
- **Autonomous.** The user expects you to finish without them – e.g. a bulk job ("make 30 shorts in 9:16 from the
  festival material"), "without approvals", or a run the user started in autopilot and left. The results are checked
  later on another way. Then you decide yourself and do not wait for answers or approvals. If it is unclear, ask
  **once** at the start, not per video. Note the mode with the user's words in each `brief.md`
  ("Review mode: autonomous – <the user's instruction>").

In an autonomous run, adapt the standard procedure:

- **Brief:** take format, length, recipe and topic from the job and the material; ask only what really blocks you.
- **Reviews are skipped, never faked:** check the work yourself (`validate --ready`, `recipe check`, the render checks
  – sync, transcription, loudness – and frames of the proxy) and render with
  `--unreviewed "<the user's instruction>"`; the output is marked "not reviewed by an editor"
  ([references/REVIEWS.md](references/REVIEWS.md#autonomous-runs)). Never run `review approve` – nobody approved.
- **Originals, pushes, locks:** download the originals the final renders need without asking per video (check the free
  disk space first); push each finished project with a message that says it is unreviewed; renew your locks for long
  runs and release them at the end ([references/SYNC.md](references/SYNC.md)).
- **Many projects:** plan the run yourself. If your client can start sub-agents or sessions, giving each one a cut
  project of its own (own folder, own lock) works well; keep a short status per project.
- **Not part of it:** the Premiere hand-off is manual work with the editor and always needs the approvals.
- **At the end:** a summary per project – output, skipped reviews, recipe deviations, check warnings, open points – and
  how the editor reviews later (`darkmind-agent review status` in the project folder).

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

## Ground rules (both modes)

- **You never approve.** Reviews are recorded only with the editor's explicit, verbatim confirmation
  ([references/REVIEWS.md](references/REVIEWS.md)). Never edit `reviews/`. In an autonomous run you skip reviews with
  `--unreviewed` – you never record one the editor did not give, and a change the editor requested still blocks.
- **Running your own extension code needs the user's OK** (local approval in `.darkmind/`, not a review;
  [references/EXTENSIONS.md](references/EXTENSIONS.md)); in an autonomous run that OK covers the code you write for
  this job, never code from others. **Brand blocks are trusted:** a brand block vendored by
  `add-block` and unchanged runs without approval and without asking – `darkmind-agent` checks it byte for byte against
  this skill's brand pack (`extensions show` says "approval: not needed"), and `extensions run` installs its npm tool
  (`npm ci --ignore-scripts` in `extensions/`) by itself. Do not ask the user about either. Only when a block is
  reported as no unchanged brand block (`extension-approval-required`), vendor it again with `add-block --force`;
  never approve a modified brand pack.
- **Never invent** quotes, timecodes, sources or approvals. Transcript and search times are research values; resolve
  cut points at the material and keep open points as `unresolved` codes.
- **No SAS URLs, tokens or media content in the conversation.** Tools return tickets; the script redeems them.
- **Never push silently, never over others.** Push when the user asked for it, at the agreed milestones or – in an
  autonomous run – per finished project with a message that says so; never after a lost lock without telling the
  user, never over someone else's lock or a newer version ([references/SYNC.md](references/SYNC.md)).
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

## Open in a panel

Pages for the editor – the review links of research hits and the local preview (`darkmind-agent preview`) – open **in
a panel next to the chat**, never in an external window when the client has one; the user should not have to switch
windows. Use the first option the client offers:

- GitHub Copilot app: the **browser canvas** – open it with the URL; reuse the same canvas instance for the next URL
  (one instance for review links, one for the preview).
- Claude desktop app (built-in browser tools `mcp__Claude_Browser__*`): the **built-in browser pane** –
  `preview_start` with `url` opens the page in a new tab and returns its `tabId`; keep it and `navigate` that tab next
  time instead of opening another one (one tab for review links, one for the preview).
- Only Claude Code or Copilot CLI in a terminal (none of these tools): the **system browser** – PowerShell
  `Start-Process "<url>"` (macOS `open "<url>"`). Always quote the URL.
- If the page cannot be opened, give the user the URL.

## Workflow

Standard procedure (collaborative): brief → research → draft → **editorial review** → live preview → proxy →
**preview review** → corrections → originals → final render → **final approval** → sync → optional Premiere export.
Push after each approved milestone. In an autonomous run the same steps run without the reviews (see
[Working mode](#working-mode-collaborative-default-or-autonomous)).

### 1. Brief and project folder

- Ask what the video is for (autonomous: take it from the job): format (short 9:16 1080 × 1920 / 30 fps, or episode
  16:9 1920 × 1080 / 25 fps), length (reference short: 30–60 s), topic, statements, audience, captions. **Loud Society
  format?** Then choose the recipe with the editor (autonomous: by the job and the material) (`nei-episode`,
  `nei-short`, `short-anecdote`, `short-statement`, `host-interview`), ask its briefing questions and follow
  [references/BRAND.md](references/BRAND.md). Write `brief.md` (with "Recipe: <id>" for brand projects, and the
  review mode in an autonomous run). The recipe is the base pattern: deviations the editor asks for are fine and are
  reported, never blocked.
- Use an **empty folder per project and machine**. New project: `project_create(name, description)` (locks it for the
  user) → `darkmind-agent init <projectId>`. Existing project: `project_checkout` → `project_pull` →
  `darkmind-agent download <ticket>` (no `init`). A project saved from Explore contains only `cutlist.json`: after the
  pull run `darkmind-agent import-cutlist [--profile vertical|landscape]` – the result is a draft that is not ready.
- **After a pull, before the preview or a render** (the archive holds no media and no rendered extension outputs, and
  pulling never runs code): `darkmind-agent plan` → load the listed proxies → `darkmind-agent extensions run` (brand
  blocks: no approval, it installs `playwright-core` itself; your own extensions: `extensions show <id>` → the user
  agrees → `extensions approve <id> --hash <hash> --yes` first) → then start and open the preview as in step 4
  ("Preview before rendering") – before any render. The preview lists whatever is still missing (banner and
  terminal) with these steps; brand captions and overlays appear only from their rendered outputs. Details:
  [references/SYNC.md](references/SYNC.md#restore-in-a-fresh-folder).
- Write `project.json`, `sources.json` and `edit.json` yourself; start from
  [examples/interview-short](examples/interview-short/) and [references/FORMAT.md](references/FORMAT.md). JSON Schemas
  are in `schemas/`. With a recipe: `recipe_get(slug)` → `darkmind-agent recipe use <ticket>` freezes it into
  `recipe.lock.json` and writes the profile, duration frame, recipe reference and loudness step into `project.json`;
  `darkmind-agent recipe show` prints the whole recipe – read it before the draft.

### 2. Research

- `search_videos` → candidates; `get_transcript(videoId, from, to)` around the hit; `get_video` only when you need
  metadata. Prefer the smallest suitable copy of a scene ([references/RESEARCH.md](references/RESEARCH.md)).
- **Let the user watch the hits.** `get_review_link(hits, title)` with the best candidates (range and a short label
  each) returns **one link per hit** (`links[].url`; each shows exactly that one video). Answer with a numbered result
  list – per hit the label, file, range and its link – and open the first link **in a panel**
  ([Open in a panel](#open-in-a-panel)). When the user asks for another result ("show me 3"), open its link in the same
  panel. The player shows the video with transcript and insights; the user keeps it in the **research
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
  Autonomous run: check the draft yourself against the brief and the material and go on.
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
  `darkmind-agent recipe check` after every timeline change – errors block, deviations go into the review report
  ([references/BRAND.md](references/BRAND.md)).
- Prepare: `darkmind-agent validate` (no errors) → `darkmind-agent plan` (lists missing proxies with a ready
  `media --range` hint) → load them → `darkmind-agent levels --apply` (dialogue clip gains from the measured loudness;
  again after every cut change) → with extensions (brand blocks, brand captions, your own): `darkmind-agent extensions
  run`, so that the preview shows them (after a pull: the order in step 1).
- **Preview before rendering (the default).** Before the first `render --proxy` or `render --section` in the session,
  and after every change of timeline or captions while no preview is running, start `darkmind-agent preview` **in the
  background** (it runs until it is stopped and would block the session in the foreground – Claude Code: the shell
  tool's background mode; GitHub Copilot: an async shell). Its first line on stderr, `Dark Mind preview: <url>`, names
  the URL – `http://127.0.0.1:4610/`, or another free port when 4610 is taken; open exactly that URL **in a panel**
  ([Open in a panel](#open-in-a-panel)). A running preview reloads by itself on every file change and keeps the
  playhead: keep it and its panel, never start a second one for the folder. Then present the points to check with
  their times in the video (e.g. "0:12 cut to the second speaker, 0:31 caption 'five years'"). The preview needs no
  approval and also works with pending points – and it **is no approval**: reviews refer only to
  `renders/proxy/vNNNN.mp4` and the final render.
- **Cannot open it?** (no background process, the server does not start, the page cannot be opened): ask the editor
  whether you should start the preview before you render – never render silently instead. If the editor says they
  want no preview, skip it (and stop a running one) for the rest of the session. In an autonomous run nobody watches
  the preview: skip it and check the proxy render instead.
- → `darkmind-agent validate --ready` → `darkmind-agent render --proxy` (autonomous run without a recipe: `render --proxy
  --unreviewed "<the user's instruction>"`, the editorial review is skipped). The preview may keep running during renders
  and `extensions run` in the same folder (it takes no render lock, writes only its browser copies in
  `renders/.cache/preview/` and reloads when extension outputs change). Only if a render or `extensions run` fails
  with `EPERM`/`EBUSY` on a file in `renders/extensions/` (an older Windows that cannot replace a file the browser is
  playing): stop the preview, run again, start it again. Stop the preview when the work in this folder is done.

### 5. Preview review and corrections

- Present the proxy file (`renders/proxy/vNNNN.mp4`) and its checks: sync (≤ 1 frame), transcription hit rate and
  differing words, changed time ranges against the previous version. Then `review show preview` and, if there are
  captions, `review show captions-text`; outside the duration frame `review show duration-exception` (never cut the
  video to fit – the editor decides). Record each approval only after the editor's explicit OK.
- Corrections: classify each change (content → editorial review again; caption text → caption-text review; crop, gain,
  timing, style → only a new proxy and its preview review) – table in [references/REVIEWS.md](references/REVIEWS.md).
  Let the editor check each correction in the running preview first (step 4).
- **Proxy render blocked** (`review-required`, e.g. blocker `project-not-ready` with pending points such as
  `quote-unverified`, or a missing editorial review): the preview is the first way to let the editor check those
  places – open it (step 4) and name each point with its time in the video and what to check (quote, cut point,
  caption). Remove a point's `unresolved` code only when the material or the editor's statement confirms it, then
  render. `render --section <fromFrame>-<toFrame>`
  stays allowed in addition – e.g. for a file the editor wants to pass on (the preview shows the matching command for
  its in/out points); sections cannot be approved.
- **Autonomous run:** no review step. Check the proxy yourself – sync, transcription deviations (a wrong quote is a
  content error: fix it from the material), loudness, `recipe check` – and correct before the final render. Resolve
  pending points from the material; a point you cannot resolve keeps the project from the final render (the gate
  blocks it even with `--unreviewed`) – leave it open and list it in the summary. Outside the duration frame, prefer
  choosing material that fits over cutting into statements; a length that still does not fit is recorded as a skipped
  duration exception.

### 6. Final render and approval

- `darkmind-agent plan --original` shows the originals needed. Tell the user the download size
  (`get_media_sources(kind "original")` returns `bytes` before anything is downloaded; camera masters can be > 10 GB)
  → `darkmind-agent media <ticket>` → `darkmind-agent render --original` (gate: editorial, caption text, preview and,
  if needed, duration exception). Originals and complete proxies this computer already loaded (any session or
  folder) come from the media cache `~/.darkmind/media` without a transfer (`status: cached`); still call
  `get_media_sources` – the ticket is the access check. If `media` warns that it copied from the cache (other drive),
  tell the user about `DARKMIND_MEDIA_CACHE`. The cache has no size limit: on the user's request show it with
  `darkmind-agent cache` and remove entries with `cache prune` (e.g. `--unused`).
- The final file is **not approved** until the editor has watched it: `review show final` → editor's explicit OK →
  `review approve final …`.
- **Autonomous run:** download the originals without asking per video (sum up the sizes in your summary; check the
  free disk space first and stop the downloads, not the run, when it gets short) → `darkmind-agent render --original
  --unreviewed "<the user's instruction>"`. The output is marked "not reviewed by an editor" (render report,
  `renders/final/vNNNN.UNREVIEWED.txt`, `review status`); a later review by the editor works as usual – after their
  approvals `render --original` reuses the file and removes the mark.
- Thumbnail (Phase 6 brand projects, YouTube): propose 2–4 frames as a contact sheet (brand block `thumbnail` with
  `candidates`), the editor chooses and confirms the headline → `frame`, render, `review show thumbnail` → editor's
  explicit OK → `review approve thumbnail …` → `extensions run thumbnail --original` (the deliverable PNG). Details in
  [references/REVIEWS.md](references/REVIEWS.md#thumbnail-phase-6). Autonomous run: choose the frame and headline
  yourself by the recipe, then `extensions run thumbnail --original --unreviewed "<the user's instruction>"`.
- Brand projects are **done** when `darkmind-agent recipe check --done` reports no errors and nothing pending; recipes
  with chapters also give the editor the YouTube chapter list (`darkmind-agent recipe chapters --out
  renders/chapters.txt`). After an autonomous run `recipe check --done` says `delivered: unreviewed` – delivered, not
  done until the editor's reviews.

### 7. Sync (push)

`darkmind-agent manifest` → `project_push_begin(projectId, baseVersion, manifest)` (manifest = content of
`.darkmind/manifest.json`, `manifest --print`) → `darkmind-agent upload <ticket>` → `project_push_commit(pushId,
"<what changed>")` → `darkmind-agent pushed <version>`. `project_release` when the work is done. `manifest` derives the
video references from the pipeline and refuses invalid pipelines or excluded pipeline files – fix the cause; details,
locks, conflicts and restore in [references/SYNC.md](references/SYNC.md). Autonomous run: push each finished project
with a message like "Autonomous run, not reviewed by an editor: <the user's instruction>" (renders are not synced, so
the message carries the mark into Dark Mind).

### 8. Optional: Premiere Pro hand-off

Only after the final check and only if the editor wants to continue in Premiere – it is manual work with the editor,
so it always needs the editor's approvals (no `--unreviewed`, not part of autonomous runs): `darkmind-agent export premiere
[--handles <seconds>] [--attach renders/chapters.txt]` → give the editor the folder `renders/premiere/vNNNN/` and its
`IMPORT.md`. Changes made in Premiere are **not** transferred back. Brand projects: captions arrive only as the
rendered overlay on a track of its own (no caption track), brand blocks as rendered media, the approved thumbnail and
the chapter list next to `IMPORT.md`, and the package holds the clip levels, not the −14 LUFS master (`IMPORT.md` says
how to set it in Premiere). Before the originals are downloaded (large camera masters), offer a **proxy package**:
`darkmind-agent export premiere --proxy` – the editor works on proxies and the hi-res media follow with
`darkmind-agent export hires` before the final export (Premiere closed). Details in
[references/PREMIERE.md](references/PREMIERE.md).

## Operating hints

- **Session length:** the project state lives completely in the folder's files. For small changes (a correction, a
  caption fix, a crop) start a **fresh, short session** in the project folder; long sessions only re-read context.
- **Reasoning level:** **medium** for corrections and routine steps; **higher** for building a project, a new format,
  new extensions or difficult research.
- Read `darkmind-agent` JSON output selectively; use `review show`, `status`, `plan` instead of opening large files.
- One render per folder at a time (`render-running` otherwise); Ctrl+C stops only the own processes and a re-run
  resumes. The preview is no render and may keep running (step 4).

## Errors and what to do

| Code | Meaning / action |
|------|------------------|
| `review-required` | An approval is missing or stale, or points are pending (`details.gate.blockers`): show the subject to the editor – pending points and places to check in the preview with their times (step 5); never work around it by changing the project or recording approvals. In an autonomous run the user asked for: `--unreviewed "<the user's instruction>"` skips missing or stale reviews; changes the editor requested, pending points, errors and rights still block |
| `rights-missing`, `rights-unclear` (gate of the final render/export) | Third-party material without cleared rights (T14): ask the editor for holder, licence, status and scope and record them in `sources.json` `rights`; never set `cleared` yourself without the editor's statement, never swap the material silently |
| `hash-mismatch` | The state changed since `review show`: show it again |
| `extension-approval-required` | Your own extension: `extensions show <id>` → ask the user → `extensions approve`. A brand block (message "no unchanged brand block"): `add-block <block> --force` with the same parameters, never approve it |
| `pipeline-invalid`, `required-files-excluded` | `manifest` refuses to archive an invalid pipeline or without needed files: fix with `validate` / `.darkmindignore`; `--allow-invalid` only on the user's wish to save work in progress |
| `locked`, `not-locked` | Someone else holds the lock, or yours expired: keep working locally, tell the user, do not push; your own expired lease you may renew with `project_checkout` (autonomous run: without asking) if nobody else took it ([SYNC](references/SYNC.md)) |
| `version-conflict` | Someone pushed in between: do not force; follow [SYNC](references/SYNC.md) |
| `media-facts-missing`, `media-facts-changed`, `original-changed` | Run `probe`; a changed original needs a new source revision – ask the editor |
| `not-indexed`, `indexing-failed`, `proxy-unavailable` | No proxy: choose another copy or, with the user's consent, work with the original |
| `local-changes` | `download` would overwrite local edits: ask before `--force` |
| `brand assets … not found` (add-block), `brand-pack-modified`, `deviation`, `recipe-lock-*` (recipe check) | [references/BRAND.md](references/BRAND.md#errors) |

## References

- [references/FORMAT.md](references/FORMAT.md) – project files, time rules, timeline/caption rules, validator codes
- [references/REVIEWS.md](references/REVIEWS.md) – reviews and approvals: never approve, which change needs which review, autonomous runs
- [references/EXTENSIONS.md](references/EXTENSIONS.md) – extensions: declare inputs, local approval, contract
- [references/SYNC.md](references/SYNC.md) – Dark Mind sync: locks, base version, video references, conflicts, restore
- [references/RESEARCH.md](references/RESEARCH.md) – efficient research, review player, research basket, choosing sources
- [references/PREMIERE.md](references/PREMIERE.md) – Premiere Pro hand-off
- [references/BRAND.md](references/BRAND.md) – Loud Society brand projects: recipes, brand blocks, assets, checks
- [references/RECIPES.md](references/RECIPES.md) – developing and publishing format recipes with the editor (catalog)
- [brand/recipes/NEI_CHAIN.md](brand/recipes/NEI_CHAIN.md) – the Never Ending Interview chain guide
- [examples/interview-short/](examples/interview-short/) – complete example project (format contract v1)
- `schemas/` – JSON Schemas of every artefact
