# Format contract v1 – instructions for the agent

Reference for the editing skill: what you write into a project folder. The complete example is
[examples/interview-short](../examples/interview-short/), the JSON Schemas are in `schemas/` of the skill folder
(repository: `shared/schemas/editing-pipeline/`); the full reference is `doc/AI_EDITING_PIPELINE.md` in the Dark Mind
repository. `darkmind-agent validate` checks everything the schemas cannot (references, frame arithmetic, overlaps,
gaps, paths) and names file, field and clip ID in each issue.

## Files

| Path | Who writes it | Content |
|------|---------------|---------|
| `project.json` | you (or `import-cutlist`) | `schemaVersion: 1`, `kind: "darkmind-edit-project"`, `title`, `output` (`width`, `height`, `fps` as string `"30/1"`, `sampleRate: 48000`), `duration` frame (`minSeconds`, `maxSeconds`), `recipe` (`null` without a Phase 6 recipe), `artifacts` (paths), `extensions` (list of `extension.json` paths) |
| `brief.md` | you | The editor's assignment |
| `sources.json` | you; `probe` adds `media`/`original` | Sources: `darkmind-video` (Dark Mind `videoId`, `fileName`) or `asset` (file under `assets/` with `sha256`, `size`, `origin`, `provenance`); third-party material (`origin` `stock`/`other`, music, external B-roll) also `rights` = `{ holder, license, status, scope?, source? }` – the final render and the Premiere export block until `status` is `cleared` (T14) |
| `edit.json` | you | Reviewable draft: `sequence` (statements and scenes in order), `broll` |
| `timeline.json` | you | Executable tracks, clips, crops, gains, gaps |
| `captions.json` | you | Caption texts in timeline frames |
| `extensions/<id>/` | you | `extension.json` and its scripts ([EXTENSIONS.md](EXTENSIONS.md)) |
| `assets/` | you, after the user confirmed a generation | Saved non-reproducible inputs (AI voice, music, images) |
| `toolchain.json` | `render` | Tool versions; add `"toolchain": "toolchain.json"` to `artifacts` |
| `reviews/` | `review approve/reject` only | Editor decisions |
| `darkmind.json`, `.darkmind/`, `media/`, `renders/` | the script | Local state, media and renderings (never pushed, never artefacts) |

Paths are relative, use `/`, no `..`, Windows-safe and unique ignoring case. Unknown fields and unknown
`schemaVersion` values are errors; `$schema` is allowed.

## Time rules

- **Source times** are strings with exact rational seconds relative to the start of the original: `"12.48"`, `"15"`,
  `"1/3"`. JSON numbers are rejected. Ranges are half-open `{ "in": "12.48", "out": "22" }`.
- **Timeline positions** (`start`, caption `start`/`end`, gaps) are whole output frames. The output frame rate is a
  whole number (`"30/1"`, `"25"`; no NTSC rates).
- **Clip length** in frames = `round_half_up((out − in) × fps)`; placement is the explicit `start` of each clip – compute
  every `start` yourself, never assume they add up. Example: in 12.48, out 22 at 30 fps → 285.6 → 286 frames.
- Times from search, transcripts and Explore are approximate research values. Settle cut points at the material
  (proxy excerpt, transcript window); do not invent extra decimals.

## edit.json

```json
{ "schemaVersion": 1,
  "sequence": [
    { "kind": "scene", "id": "sc01", "description": "Opening title card", "text": "What was your first concert?", "extensionId": "title-card", "unresolved": [] },
    { "kind": "statement", "id": "s01", "sourceId": "int-a", "range": { "in": "12.48", "out": "22" },
      "quote": "My first concert was …", "context": "Answer to the first question …", "speaker": { "name": "Alex", "role": "Singer" }, "unresolved": [] } ],
  "broll": [ { "id": "b01", "sourceId": "br-crowd", "range": { "in": "3", "out": "6" }, "description": "Jumping crowd", "afterId": "s02", "unresolved": [] } ] }
```

- `quote` is **verbatim** what is said in the range (from the transcript, checked at the material). Never polish it.
- Open points go into `unresolved` (`tc-approximate`, `quote-unverified`, `source-unconfirmed`, `placeholder`, `other`);
  remove a code only after checking. `sourceId`, `range`, `quote` may be `null` while open – the project is then not
  ready.
- Scene text (title cards, inserts) belongs to the editorial review like quotes.

## timeline.json

- `video` tracks bottom to top, roles `main`, `b-roll`, `graphics`, `overlay`; `audio` roles `dialog`, `b-roll`,
  `music`, `effects`. Track and clip IDs unique. No overlapping clips within a track.
- A clip has exactly one of `sourceId` / `extensionId`, `in`, `out`, `start`; dialog clips carry `statementId`, B-roll
  clips `brollId`, extension clips `sceneId`. Audio clips have `gainDb`; `linkedTo` links audio to its video clip (same
  source, range and start).
- **Statements:** the dialog audio clip uses exactly the statement's source and range; the video lies within it;
  every statement once, on a `main` track in the order of `edit.json`. Changing a cut therefore means changing
  `edit.json` – and a new editorial review.
- **Crop** is required for every source video clip: normalised rectangle `{ x, y, w, h }` in the **correctly oriented**
  source image with the output aspect ratio (±½ output pixel). Width for a full-height crop:
  `w = (sourceHeight × outW / outH) / sourceWidth` – 1920 × 1080 source to 1080 × 1920 output: `"0.31640625"`,
  `h: "1"`; `x` between 0 and `1 − w`. Full frame for a source with the output aspect ratio: `{ "x": "0", "y": "0",
  "w": "1", "h": "1" }`. The error message names the exact `w` when the ratio is off. Extension clips take no crop.
- **Gaps:** every frame needs a picture on a `main`/`b-roll` track and sound, or an explicit gap
  `{ "start", "end", "fill": "black" | "silence" | "black-and-silence", "reason" }`.

## captions.json

`{ "schemaVersion": 1, "language": "en", "style": "plain", "captions": [{ "id", "start", "end", "text", "statementId" | "sceneId", "words"? }] }`
– whole timeline frames, no overlaps, inside the timeline, each caption references one reviewed statement or scene,
short lines (keep to two lines with `\n` for readability), no empty lines or `-->`. Caption text comes from the
verified quote; corrections need the caption-text review. Optional `words` (word timings) must be ordered and inside
the caption.

**Brand styles (Phase 6):** `brand-word` (9:16 word captions), `brand-phrase` (9:16, at most 2 × 32 characters),
`brand-16x9` (16:9 subtitles, at most 2 × 48 characters). Nothing is burnt in: add the matching brand block
(`caption_word`, `caption_phrase`, `subtitles_16x9`, see the brand pack `brand/README.md`) and place it on an `overlay`
track over the whole timeline; Premiere gets the rendered overlay on a track of its own, no caption track. For `brand-word` every statement
caption needs `words`: call the MCP tool `get_word_timings` for the used range of each video, save each result as a
JSON file in the project folder and run `darkmind-agent captions-words <file>…` (rule W1 – never compute or guess word
times yourself). Mark at most one keyword per group with `"emphasis": true` (it pops); emphasis is part of the caption
text review. Captions that break the character limits are refused by the block – split them. One `captions.json` has
one style: word and phrase captions mixed in one video are not supported.

## Validation

| Severity | Meaning |
|----------|---------|
| `error` | Format broken – fix before anything else |
| `pending` | Valid but incomplete (open `unresolved`, missing timeline/captions/toolchain, statements not placed, `media-facts-missing` → run `probe`). Blocks reviews and full renders |
| `warning` | Allowed with attention: duration outside the frame (needs the editor's duration exception, never trim), unsignalled colour, unused sources |

`validate` also lists the derived video references (Dark Mind videos actually used) and the sources that need
conform media for Premiere (VFR, rotation). HDR sources (PQ/HLG/BT.2020) are not supported (`color-unsupported`).
