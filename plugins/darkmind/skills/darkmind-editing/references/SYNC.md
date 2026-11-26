# Sync with Dark Mind – instructions for the agent

Reference for the editing skill: how the project folder and the Dark Mind archive stay consistent. Dark Mind stores
**immutable versions**; the folder knows its **base version** (`darkmind.json`, written by the script – never edit it).

## Rules

1. **Lock before you change a shared project.** `project_create` locks a new project for the user;
   `project_checkout` locks or renews an existing one. The lease lasts 12 hours; every push extends it. Reading,
   pulling and research never need the lock.
2. **Locks belong to the user, not to the folder or machine.** Two folders of the same person (laptop and desktop,
   two sessions) are not protected by the lock – only by the base version: the second push fails with
   `version-conflict`. Work on one project in one folder at a time; before switching folders, push in the old one and
   pull in the new one.
3. **Push at milestones, not silently.** Push when the user asks, after an approved draft, an approved preview, the
   final approval and before ending the work – each with a message that says what changed ("Draft approved by Jan",
   "Crop of s02 corrected"). Tell the user the new version number.
4. **Lost the lock? Keep working locally, but do not push.** `not-locked` (the lease expired) or `locked` (someone else
   holds it) on `project_push_begin`/`project_push_commit`/`project_checkout`: stop the push, keep the local files and
   tell the user who holds the lock and until when (`details.lock`). With the user's OK, `project_checkout` renews an
   expired lease if nobody else took it. Never release or take over someone else's lock – that is an admin action in
   the Main App.
5. **Never force over other work.** `version-conflict` means a newer version exists (`details.currentVersion`). Do not
   push again with another base version and do not `download --force` over local changes without the user's consent.
   Recommended: pull the current version into a **new empty folder**, show the user the differences (both folders'
   `edit.json`/`timeline.json`, `darkmind-agent review` state), re-apply the wanted changes there together with the
   user, then push from the new folder. Alternative: `project_duplicate` into a new project.
6. **Release when done.** `project_release` at the end of the work, so others can continue without waiting 12 hours.

## Push routine

```text
darkmind-agent manifest                                   → .darkmind/manifest.json, changes since the base version
project_push_begin(projectId, baseVersion, manifest)      → manifest = content of .darkmind/manifest.json
darkmind-agent upload <ticket>                            → resumable: run it again with the same ticket
project_push_commit(pushId, "<what changed>")             → new version
darkmind-agent pushed <version>                           → the folder's new base version
```

`baseVersion` is the one `manifest` and `status` print. If `upload` stops with `file-changed`, a file changed after
`manifest`: run `manifest` and `project_push_begin` again. `missing-objects` on commit: run `upload` again.

## What `manifest` checks for an editing pipeline

- **Video references are derived** from the pipeline, deterministically: Dark Mind videos of statements and B-roll in
  `edit.json`, of timeline clips and of source inputs of used extensions. Videos that were only loaded for research
  (`media` adds every loaded video to `darkmind.json`) are dropped (`videoRefsDropped`); `darkmind.json` is updated.
  The references protect the used videos from being purged in Dark Mind and show them in the Main App.
- **Invalid pipeline → `pipeline-invalid`.** Fix the errors (`darkmind-agent validate`). Only if the user wants to save
  work in progress anyway, use `manifest --allow-invalid`: it keeps every reference of `darkmind.json` and warns.
- **Pipeline files must be pushed → `required-files-excluded`.** Artefacts, extension definitions and their declared
  files, assets and review records must not be excluded by `.darkmindignore`. Remove the matching rule.
- Pushed: artefacts, `reviews/`, extension scripts, `assets/` (AI media as `generated-media`; warnings above 100 MB per
  file), `cutlist.json` of an Explore import. Never pushed: `media/`, `renders/` (proxies, originals, renders, Premiere
  packages – reproducible), `.darkmind/` (incl. the local approvals to run extensions), `darkmind.json`.
- Push answers can warn about **deleted videos**: tell the editor; replacing a source changes the draft and needs a new
  editorial review. `unknown-videos` means a video ID in `sources.json` does not exist – it was not taken from Dark Mind.

## Restore in a fresh folder

1. `project_pull(projectId[, version])` → `darkmind-agent download <ticket>` into an empty folder (no `init`; it
   writes `darkmind.json` with the base version). `project_checkout` first if you will change and push.
2. `darkmind-agent status` (clean) and `darkmind-agent validate --ready`; `darkmind-agent review` shows the approvals –
   they stay valid as long as the state is unchanged.
3. Media are not part of the archive: load proxies (`plan` lists them) and, for the final render, originals
   (`get_media_sources` → `media`). Media this computer loaded before (another folder or session) come from the
   local media cache `~/.darkmind/media` without a transfer. Media facts are already in `sources.json`.
4. Your own extensions need a **new local approval** in this folder (`extensions show` → user agrees → `extensions
   approve`); unchanged brand blocks of this skill need none. Pulling never runs code. Saved AI media come from the
   archive; never regenerate them.
5. **Render the extension outputs before the preview.** Brand blocks, brand captions and other extensions exist only as
   local renders (`renders/` is never synced). `darkmind-agent extensions run` installs `playwright-core` in
   `extensions/` by itself for an unchanged brand pack (`npm ci --ignore-scripts`; no question to the user) and renders
   the blocks. Only then does `darkmind-agent preview` show the brand elements and captions; until then it draws
   placeholders and lists exactly these steps. Brand assets in the skill folder (`brand-assets`) are needed only to add
   or re-vendor blocks – a pulled project carries its own `extensions/brand-pack/`.
6. **Preview, then render again.** Start the preview in the background and open it in a panel
   ([SKILL.md](../SKILL.md) step 4) before the first render in the new folder. The same pipeline and tool versions
   reproduce cuts, length, sound and design; the render reports are new (they are not synced).
