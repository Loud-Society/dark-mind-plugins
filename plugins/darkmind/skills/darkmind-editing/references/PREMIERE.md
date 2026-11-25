# Premiere Pro hand-off – instructions for the agent

Reference for the editing skill: the optional last step after the final check, when the editor wants to continue in
Adobe Premiere Pro. Verified with Premiere Pro 2027 (27.0.0) on Windows; other versions are not tested.

## Rules

1. **Only after the final check** and only on the editor's wish. The export needs the same approvals as
   `render --original` (editorial, caption text, preview, duration exception if needed) and the originals locally
   (`darkmind-agent plan --original` lists missing ones; load them with `get_media_sources(kind "original")` →
   `darkmind-agent media <ticket>`).
2. **One-way.** Tell the editor clearly: changes made in Premiere are **not** transferred back into the pipeline or to
   Dark Mind. A later change in the pipeline means a new export; Premiere work on the old package stays separate.
3. **Hand over the folder and `IMPORT.md`.** Do not describe the import from memory – `IMPORT.md` in the package lists
   the steps, what is natively editable and what is rendered.
4. **Move the folder as a whole.** Media paths are relative to the XML. After copying the package to another drive or
   machine, check it with `darkmind-agent export verify <folder>`.
5. Packages live under `renders/` (not synced, reproducible from the project and the originals). Do not push them.

## Commands

```powershell
darkmind-agent export premiere                 # renders/premiere/vNNNN/: <title>.xml, <title>.srt, media/, manifest.json, IMPORT.md
darkmind-agent export premiere --handles 10    # more trim room in conform media (default 5 s)
darkmind-agent export premiere --attach renders/chapters.txt   # project files next to IMPORT.md (YouTube chapter list)
darkmind-agent export verify renders/premiere/v0001
```

An identical package is reported as `unchanged`; a changed state gives a new version.

## What the editor gets

- Timeline (xmeml): cuts, B-roll, framing as Motion values (scale/position), separate stereo audio tracks with levels,
  markers at statements and scenes. All of this stays editable.
- Captions as SRT, imported separately and placed at 00:00:00:00 as a caption track (editable text and timing).
- Media: originals and assets; VFR or rotated sources as CFR ProRes conform files, mono sound as stereo WAV (Premiere
  would play mono on the left only), and for clips louder than +15 dB (Premiere's maximum clip level) the sound as
  stereo WAV with the excess gain applied – the clip levels show the rest. Extension outputs (title cards, graphics)
  are **rendered media**, named `[rendered] <id>` with label colour Mango – not editable as text or effects in
  Premiere; change them in the pipeline and export again.
- Known Premiere behaviour (in `IMPORT.md` when it applies): a caption ending exactly at the sequence end may lose a
  frame; media can show offline for a moment after a cold start.

## Brand projects (Phase 6)

- **Captions (exception T8 from F7):** brand caption styles (`brand-word`, `brand-phrase`, `brand-16x9`) reach Premiere
  **only as the rendered overlay** – no SRT, no caption track. The exporter puts the caption overlay on a **video track
  of its own** (if it shares a pipeline track with other clips, the captions move to a new track directly above it; the
  picture is unchanged) and `IMPORT.md` names the track. The editor can move, trim, disable or fade the overlay clip,
  but not edit its text: text corrections go into `captions.json` (caption text review), then render and export again.
  Tell the editor this before the export. Plain projects keep the editable SRT (F7).
- **Brand blocks** (sting, wipes, cards, lower thirds, endcard, sounds) are rendered media; `IMPORT.md` lists each with
  block and brand pack version. The brand layer is not changed in Premiere – parameters change in the pipeline.
- **Next to `IMPORT.md`** (not on a track): the thumbnail PNG, if its review is approved and it was rendered from the
  original (`extensions run <id> --original`; otherwise `IMPORT.md` says why it is missing), and the files given with
  `--attach` – run `darkmind-agent recipe chapters --out renders/chapters.txt` right before the export so the list matches.
- **Loudness:** the package carries the clips with their levels, **not** the −14 LUFS master of the render (and the
  music is not ducked). `IMPORT.md` gives the target for Premiere's export (Effects > Loudness Normalization:
  ITU BS.1770-3, −14 LUFS, −1 dBTP) and what the latest final render measured and applied.
