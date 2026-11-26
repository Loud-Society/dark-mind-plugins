# Reviews and approvals – instructions for the agent

Reference for the editing skill ([SKILL.md](../SKILL.md)). Full format reference: `doc/AI_EDITING_PIPELINE.md`
(section "Reviews and approvals") in the Dark Mind repository.

## Rules

1. **You never approve.** Only the editor decides. Record a decision only after the editor explicitly confirmed it
   in the conversation, and pass the editor's words verbatim with `--confirmation`. Silence, "looks good so far" about
   something else, or your own judgement are no approval. If in doubt, ask. The same rule applies in every client
   (GitHub Copilot, Claude Code) and in every session – a confirmation from an earlier session does not carry over to
   a changed state.
2. **Show before you record.** Run `darkmind-agent review show <subject>`, present the content and the listed
   changes to the editor, and approve with the hash that `show` printed. If the project changed in between, the
   command fails with `hash-mismatch`: show it again.
3. **Never edit `reviews/`.** Records are written only by `darkmind-agent review approve` or `reject`. Hand-edited
   records are detected (`review-hash-mismatch`) and ignored.
4. **Never work around a gate.** `review-required` from `render` lists what the editor still has to review; do not
   change the project to make a gate pass, and do not cut the video to fit the duration frame – ask for a duration
   exception instead.
5. **Requested changes** are recorded with `review reject … --comment "<what to change>"`; change the project, then
   show the subject again.
6. **The live preview is no review.** `darkmind-agent preview` (opened before every render, [SKILL.md](../SKILL.md)
   step 4) lets the editor check the cut, captions and brand elements, but nothing seen there is approved: preview and
   final approvals name a rendered file (`renders/proxy/vNNNN.mp4`, the final render) and need the editor's explicit
   words after they watched that file.

## Which change needs which review

| You changed | Ask the editor for |
|-------------|--------------------|
| Statements (added, removed, order), quote, context, speaker, source or source boundaries; scene text; B-roll material or placement | **editorial** review (`review show editorial` lists the changes with a word diff), then a new proxy and its **preview** review |
| Caption text – also a correction by AI or speech recognition, or a new split | **captions-text** review (word diff per caption) and a new **preview** review |
| Pure design: crop, gain, caption timing/style, extension parameters or scripts, B-roll ranges | only a new proxy render and its **preview** review (a new or changed script first needs the user's local approval to run, see [EXTENSIONS.md](EXTENSIONS.md) – that is no review) |
| The length is outside the duration frame (e.g. 29 s or 61 s for 30–60 s) | **duration-exception** for the concrete length – again after every preview change |
| Final render (`render --original`) | **final** approval after the editor has watched the file |
| Thumbnail (Phase 6): frame, headline, contrast | **thumbnail** review after the editor has seen the rendered image – independent of the video reviews |

Projects with a format recipe (Phase 6) may render the first proxy without the editorial review (F5); the editor
then approves the content together with the preview, and the final render still needs every approval.

## Thumbnail (Phase 6)

The thumbnail is a still image next to the video (brand block `thumbnail`, [EXTENSIONS.md](EXTENSIONS.md)). **You
propose, the editor chooses:** render 2–4 candidate frames as a contact sheet (`candidates`), show the sheet and let the
editor pick one (and confirm or change the headline). Then set `frame` to the chosen candidate, render it, show the
image and `darkmind-agent review show thumbnail`; record `review approve thumbnail` only with the editor's explicit
words. A contact sheet can never be approved. The image from the original (`extensions run thumbnail --original`) is
the deliverable and needs this approval; any new frame, headline or contrast needs it again.

## Typical sequence

```powershell
darkmind-agent review show editorial        # present the draft, wait for the editor's explicit OK
darkmind-agent review approve editorial --hash <hash> --by "<editor>" --confirmation "<the editor's words>"
darkmind-agent preview                      # in the background; open the printed URL in a panel, editor checks
darkmind-agent render --proxy
darkmind-agent review show preview          # present the file and its checks; same for captions-text
darkmind-agent review approve preview --hash <hash> --by "<editor>" --confirmation "<the editor's words>"
darkmind-agent render --original            # after the original download
darkmind-agent review show final            # the editor watches the final file before approving it
```
