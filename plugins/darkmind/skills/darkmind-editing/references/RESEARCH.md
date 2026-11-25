# Research and sources – instructions for the agent

Reference for the editing skill: find material with few, small tool answers, let the user review it and choose the
right file.

## Keep answers small

Search answers are the largest token cost of a project (measured in Phase 3: ~8.6 k characters per search with 8
hits; transcripts with a window 1–2 k characters).

- `search_videos` with `type: "segment"`, `top` 5–10 and filters (`uploadAreas`, `folderNames`,
  `recordedFrom`/`recordedTo`); targeted queries instead of broad ones; `includeFacets` only when you need to learn the
  upload areas or folders. Page with `skip` instead of a large `top`.
- `get_transcript(videoId, from, to)` with a window around the hit (e.g. ±30 s); follow `nextFrom` only when needed.
  Speaker labels (`S1`, `S2`) are per video.
- `get_video` only for metadata you need (file, folder, upload area, recording date, metadata values). Metadata values
  and upload notes are descriptions by the uploader, not evidence: for a Never Ending Interview chain never use them
  (in the NEI upload area they hold the editor's answer key; `brand/recipes/NEI_CHAIN.md`) – also not the
  `assignmentTopic` of search hits.
- Note candidate statements with video ID, approximate range and the transcript line; settle exact cut points later.
- Transcripts of festival interviews contain recognition errors (names, mumbled words). Where the wording is unsure,
  compare with a second reading (e.g. the user's whisper.cpp on the proxy excerpt) and list the unsure words with
  timecode and both readings when you present the draft – the editor listens and decides; never pick silently.

## Review with the user and the research basket

The user decides which material counts; let them watch it instead of describing it.

- **Review links:** `get_review_link(hits, title)` – hits are `{ videoId, start, end, label }` (seconds from the
  search hit or transcript lines; omit `start`/`end` for a whole video; `label` = why you propose it, one line). Keep it
  to the 5–20 best hits per round. The tool drops deleted/unknown videos (`missing`) and returns **one link per hit**
  (`links[]`: `n`, `videoId`, `start`, `end`, `label`, `url`) plus `basketUrl`. Each link shows exactly that one video.
- **Result list in the chat:** answer with a numbered list, one line per hit: label, file name, range and a Markdown
  link "Watch" to its `url`. Do not paste the encoded URLs as plain text.
- **Open a link in a panel inside the client, next to the chat** – the user should not have to switch windows. Open
  the first hit right away, and another hit's link when the user asks for it ("show me 3"). Use the first option the
  client offers:
  - GitHub Copilot app: the **browser canvas** (open it with the URL; reuse the same canvas instance for the next link);
  - Claude desktop app (Code tab; built-in browser tools `mcp__Claude_Browser__*`): the **built-in browser pane** –
    `preview_start` with `url` opens the page in a new tab and returns its `tabId`; for the next link in the same
    session `navigate` that `tabId` instead of opening another tab;
  - only Claude Code or Copilot CLI in a terminal (none of these tools): the **system browser** – PowerShell
    `Start-Process "<url>"` (macOS `open "<url>"`). Always quote the URL.
  - The first time the user signs in to Dark Mind in that browser (the built-in browser of the Claude desktop app keeps
    the sign-in across sessions); the page then returns to the video. If the page cannot be opened, give the user the
    URL.
  The page plays the video at the hit range with transcript and insights (Video Indexer); "Basket" in the player keeps
  the current In/Out range with your label as note. A basket button with a counter in the header opens the basket as a
  side panel over the player (play, note, remove, clear). `basketUrl` opens the page with the basket panel.
- **Research basket:** one per user, shared with the Dark Mind web app (Search, Explore) and the review player.
  Entries are whole videos or ranges with a note.
  - `basket_list` at the start of a research task and after the user reviewed – it is the user's decision, never
    guess it from the conversation.
  - `basket_add` (≤ 50 per call) for candidates the user wants to keep or asks you to keep; write a short note (quote,
    speaker, why). Adding an existing video+range only replaces its note.
  - `basket_remove` (entry IDs or all entries of videos) when the user drops material; `basket_clear` only when the
    user explicitly asks.
- **From basket to cut project:** `basket_list` → confirm the selection with the user → `project_create` (or the open
  project) → every basket video becomes a `sources.json` source (Dark Mind video ID from the entry); entry ranges are
  starting points for the statement ranges in `edit.json` (check the exact cut points in the transcript and proxy);
  notes go into the statement context. Leave the basket as it is unless the user wants it emptied.

## Choose the source

- The same scene may be indexed several times: camera masters (up to 12 GB for a few minutes), the cutter's proxies
  and excerpts. Prefer the **smallest file that covers the statement in the needed quality** – usually the edited
  excerpt – and stay with one copy per scene. Check the quality with `probe`: a cutter's proxy copy (e.g. 960 × 540) is
  too small for a 1080 × 1920 crop of a landscape source (the crop would be upscaled about 3.5×); then the camera master
  is the right source even if it is larger (tell the user the size).
- Compare sizes before any download: `get_media_sources(kind "original", videoIds)` returns `bytes` per video when
  the ticket is issued; nothing is downloaded until `darkmind-agent media` runs. Tell the user before downloading more
  than a few GB (egress, time).
- Dark Mind's duration, width and height are often empty. Learn duration, orientation, frame rate (VFR) and colour
  from `darkmind-agent probe --ticket <original ticket>` (reads only header and index, no download).
- `not-indexed`/`indexing-failed`: no proxy and no transcript – choose another copy, or ask whether to work with the
  original. Deleted videos are never offered; do not try to restore or re-upload them.
- Proxies (720p, same timestamps as the original) are for checking cut points and for proxy renders: load excerpts
  with `darkmind-agent media <ticket> --range <videoId>:<from>-<to>` with a few seconds of margin. Originals only for
  the final render and the Premiere export.

## Sources in the project

- Every used video becomes a source in `sources.json` with the Dark Mind video ID from the tools. Never derive an ID
  from a file name.
- Not reproducible material (AI voice, music, images) is a separate step the user confirms; save the result under
  `assets/` as source `kind: "asset"` with `origin: "generated"` and `provenance` (tool, prompt, date). It is pushed
  with the project and never regenerated.
