# Never Ending Interview – reconstructing the chain

Guide for the recipes [`nei-episode`](nei-episode.md) and [`nei-short`](nei-short.md). Tool: `brand/tools/nei-chain.mjs`
(logic `brand/lib/nei-chain.mjs`, test cases `brand/test/nei-chain.test.mjs` with synthetic transcripts in
`brand/test/nei-fixtures/`). Background: `doc/mvp/NEI_REFERENCE_MATERIAL.md` (real chains are graphs).

**Principle (decision 2026-11-08):** the chain comes **only from the transcripts** – who asks which question, who
answers it, who gets the new question. Every assignment carries source and timecode. Uncertain or contradictory
assignments are flagged and shown to the editor, never guessed.

**Never use upload metadata for the chain.** In the Dark Mind upload area of the NEI material the upload notes and
metadata values (`metadata.notes`, `assignmentTopic`, topics) contain the editor's own chain – the answer key of the
MVP reference test. Using them makes the reconstruction worthless. So: do **not** call `get_video` for NEI videos while
you reconstruct the chain, ignore `assignmentTopic` (and any notes) in `search_videos` hits, take file names from
`search_videos`/`get_transcript`, speakers from the self-introduction in the transcript, and ask the editor for a name
the transcript does not give (`--who`). Search may still find the files (finding material is no evidence). If you have
used such values anyway, say so in the report and redo the affected assignments from the transcripts.

## Steps

1. **Find the material** (MCP): `search_videos` with phrases of the format ("never ending interview", "question
   comes from", "question for the next band"), the festival, upload area or folder (`type: "segment"`, small `top`).
   No `get_video` (see above).
2. **Save the transcripts**: `get_transcript` of every NEI video, the JSON result as a file in the project folder
   (`research/transcripts/<file>.json`; page with `from = nextFrom` and save every page). Videos often contain more than
   the NEI segment ("Who Follows Who", shout-outs) – the tool ignores what has no NEI cues.
3. **Proposals**: `node <skill>/brand/tools/nei-chain.mjs extract research/transcripts/*.json --out chain.json`
   (`--who '{"<videoId or fileName>": "Myles Kennedy"}'` for videos without a self-introduction). It proposes per video:
   - `by` – who speaks (self-introduction "we are …"; several introductions in one file → flag `mixed-speakers`),
   - `answers[]` – the announced asker ("this question comes from …", "… wants to know", Loud Society), the question
     read out, the answer range,
   - `asks[]` – the question for the next band ("my question for the next band is …"),
   each with `evidence` (start/end in source seconds, quoted line) and `"unverified": true`.
4. **Check every proposal at the material** – the transcript window around the evidence, the proxy excerpt where the
   wording is unclear (`RESEARCH.md`: a second reading of uncertain words). Correct `chain.json`:
   - names as spoken in the transcript; spelling uncertain → keep, flag in the report (band card later),
   - `question` as read out (verbatim; never complete or invent a question),
   - `askedBy` as announced; `askedByLoudSociety: true` for questions by Loud Society off camera,
   - add what the heuristic missed (other wording, German questions), remove what is no NEI content,
   - `strength` 1–3 per answer (weak/medium/strong – the editor's quality is the measure),
   - `flags` per item: `nsfw`, `question-unfit` (a question that does not fit the band), `spelling`,
   - `names` – aliases (`{ "Bullet For My Valentine": ["BFMV"] }`),
   then remove `"unverified"` (and `"draft"`).
5. **Graph and path**: `nei-chain.mjs build chain.json --format md` (report) or JSON; `--links 5` picks the window of
   five links with the strongest answers from the longest sub-chain.
6. **Draft**: the chosen links become the episode (`edit.json`: per link the band card, the shortened answer and the
   band's own question for the next band – without the interviewer, who only reads out and hands over; the read-out is
   evidence for the chain, not part of the cut), the open question of the last link goes on the `cliffhanger_card`. The
   short takes one link of the same chain (strongest answer). Put the Markdown report into the review report.

## chain.json

```json
{ "schemaVersion": 1, "kind": "darkmind-nei-chain",
  "names": { "Bullet For My Valentine": ["BFMV"] },
  "answers": [
    { "id": "a7", "videoId": "…", "fileName": "LS_BFMV_Answer.mov", "by": "Bullet For My Valentine",
      "question": "Tour talisman for good luck?", "askedBy": "Myles Kennedy",
      "evidence": [{ "start": 3.2, "end": 7.9, "quote": "This question comes from Myles Kennedy: …" }],
      "answer": { "start": 7.9, "end": 52.4 }, "strength": 3, "flags": [] } ],
  "asks": [
    { "id": "q8", "videoId": "…", "fileName": "LS_BFMV_Question.mov", "by": "Bullet For My Valentine",
      "question": "What car part would you be?",
      "evidence": [{ "start": 1.0, "end": 4.6, "quote": "My question for the next band is: what car part would you be?" }] } ] }
```

## How the graph is built

| Rule | Why |
|------|-----|
| An answer belongs to the filmed question whose **content** matches (content words, Dice ≥ 0.5) – the announced asker decides between equal matches | bands appear several times and ask similar questions; names are misheard |
| Announced asker ≠ asker of the matching question → **contradiction**; two questions match about equally (< 0.1 apart) → **ambiguous**; the asker has filmed questions but none matches → **question-not-found** | flagged for the editor, **never** used for the chain |
| An answer continues with the answerer's question **of the same appearance**: the same file, otherwise a question file of that person without an answer of theirs (separate question/answer files) | identifies links by question and timecode, not by the band name |
| Several answers to one question → **branch**; the path that gives the longest chain wins, the others are listed with the reason | real chains branch (reference 8, 9, 17, 21, 31, 32) |
| Question nobody answers → **reserve** (for further interviews) | reference 19, 24, 27, 29, 30, 39, 40, 43 |
| Answer without filmed question → **starter candidate** (question only from the answer) | reference 20, 36 |
| Question by Loud Society (off camera) → own role, the question only from the answer transcript | reference 37 |
| One sub-chain per start; the longest without uncertain links is chosen, ties by answer strength | reference: several separate chains |

The order in a cut sequence is no proof (the editor's sequence swaps links); a clip inside a segment may belong to
another band (`mixed-speakers`) – check by transcript, not by position.

## Lessons from the real material (WP5 comparison)

A blind reconstruction of the 44 indexed NEI files (no answer key) against the editor's chain gave: every automatic
link of `build` with an announcement or a clear content match was right or backed by the transcript; the chosen path
was exactly the editor's longest available sub-chain. What to do with that:

- **Read every transcript completely.** `extract` finds few real phrasings (misheard names, questions read from a
  phone, German interviews, interviewers who forget the asker) – it is only a start.
- **The announcement is the strongest evidence** ("this came from …", "he asked a question and his question was …"),
  even misheard ("Mount Kennedy", "the morning" = The Warning) – put the misheard form into `names` as alias.
- **Similar is not the same.** Without an announcement, a link only by content is a proposal for the editor: in the
  material several bands asked near-identical questions ("what made you become a musician" / "who inspired you to make
  music"; "your wildest tour night" / "your most embarrassing tour experience"), and the true asker's file was missing –
  both content-only guesses were wrong. Leave such answers as "answer without filmed question", list the candidate in
  the report, never copy the question across.
- **Copy the asker's question into an answer only** when the asker is announced and the content is clearly the same
  (paraphrased or translated read-out); flag it `matched by agent`.
- **Second cameras:** the same moment in two files (longshot/movecam, master/second camera) – record it once.
- **The editor may pair differently:** an answer that fits another question may be re-paired in the edit (a pre-show
  ritual answer announced for one question, used for another). Report what the transcript says; the editor decides.
- Questions the interviewer read wrongly or that do not fit ("any song you wish was popular" to a band with one
  release) stay links but get `question-unfit` – usually not usable for the episode.

## Report (review)

The Markdown of `build --format md` lists: the chosen links with question, asker, answering band and evidence of both
sides, the open question (cliffhanger), branches with the choice and its reason, rejected sub-chains, conflicts for the
editor (not used), questions not on camera (unfilmed, Loud Society), the reserve of unanswered questions, repeated
appearances, flags and files to check, and proposals still unverified. Fill in by hand: why the cold open and the short
link were chosen, NSFW and unfitting questions, uncertain spellings.

## Test cases

`brand/test/nei-fixtures/` – synthetic transcripts of fictional bands (no real transcripts in the repository):
`unique` (linear chain, open question as reserve), `gapped` (unanswered question, answer without filmed question,
Loud Society question, a band in two festivals, three sub-chains), `contradictory` (branch, announcement vs. question
content, near-identical questions of one band, a foreign clip in an answer). `npm test` in `brand/` runs them.
