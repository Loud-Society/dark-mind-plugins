# Premiere Pro hand-off – instructions for the agent

Reference for the editing skill: the optional last step after the final check, when the editor wants to continue in
Adobe Premiere Pro. Verified with Premiere Pro 2027 (27.0.0) on Windows; other versions are not tested.

## Rules

1. **Only after the final check** and only on the editor's wish – the hand-off is manual work with the editor, so it is
   never part of an autonomous run and has no `--unreviewed`. The export needs the same approvals as
   `render --original` (editorial, caption text, preview, duration exception if needed) and the originals locally
   (`darkmind-agent plan --original` lists missing ones; load them with `get_media_sources(kind "original")` →
   `darkmind-agent media <ticket>`) – or, as a **proxy package** (`--proxy`, below), only the complete proxies.
2. **One-way.** Tell the editor clearly: changes made in Premiere are **not** transferred back into the pipeline or to
   Dark Mind. A later change in the pipeline means a new export; Premiere work on the old package stays separate.
3. **Hand over the folder and `IMPORT.md`.** Do not describe the import from memory – `IMPORT.md` in the package lists
   the steps, what is natively editable and what is rendered.
4. **Move the folder as a whole.** Media paths are relative to the XML. After copying the package to another drive or
   machine, check it with `darkmind-agent export verify <folder>`.
5. Packages live under `renders/` (not synced, reproducible from the project and the originals). Do not push them.
6. **Proxy package:** offer it when the originals are large or not needed yet. Tell the editor before: the clips are
   offline after the import until the proxies are attached, and the **final export from Premiere only after
   `export hires`** – while a hi-res file is missing, Premiere exports from the proxy without a warning (also with
   proxies off). `export hires` needs Premiere **closed** (it replaces files Premiere holds open); on `premiere-open`
   ask the editor to close Premiere and run it again.

## Commands

```powershell
darkmind-agent export premiere                 # renders/premiere/vNNNN/: <title>.xml, <title>.srt, media/, manifest.json, IMPORT.md
darkmind-agent export premiere --handles 10    # more trim room in conform media (default 5 s)
darkmind-agent export premiere --attach renders/chapters.txt   # project files next to IMPORT.md (YouTube chapter list)
darkmind-agent export verify renders/premiere/v0001
darkmind-agent export premiere --proxy         # before the originals are here (complete proxies + facts needed)
darkmind-agent export hires renders/premiere/v0001   # later: originals in media/original/, Premiere closed
```

## Proxy package (2026-11-26)

Verified in Premiere Pro 2027 (spike `agent-cli/spikes/premiere-proxy`, hand check I6 by Steve).

| Step | Agent | Editor |
|------|-------|--------|
| Prepare | complete proxies of the used videos (`get_media_sources(kind "proxy", videoIds)` → `darkmind-agent media <ticket>` **without** `--range`; from the media cache if already loaded) and the facts of the originals (`get_media_sources(kind "original")` → `darkmind-agent probe --ticket <ticket>`, no download) | – |
| Export | `darkmind-agent export premiere --proxy` → `renders/premiere/vNNNN/` with `proxies/<name>_Proxy.<ext>` | – |
| Start in Premiere | hand over the folder and `IMPORT.md` | File > Import the XML → cancel "Locating media…" → **Offline All** → select the offline clips → **Proxy > Attach Proxies…** (the `_Proxy` files) → **Toggle Proxies** on → edit |
| Hi-res | `get_media_sources(kind "original")` → `darkmind-agent media <ticket>` → editor closes Premiere → `darkmind-agent export hires <folder>` | reopen the project (clips online) → **Toggle Proxies** off (if a clip still shows its proxy: Proxy > Reconnect Full Resolution Media… / Link Media… → `media/`) → final export |

- The XML is the same as a full export: cuts, framing (Motion relative to the hi-res size) and levels stay valid when
  the hi-res media arrive.
- Proxies: an exact divisor of the hi-res size (same aspect), same frame rate, length and audio channels – Premiere's
  rules for attaching proxies; named `<name>_Proxy` so Premiere's import search cannot link them as main media.
- Sound files (mono → stereo, gain above +15 dB) get a placeholder with the proxy sound under the final name;
  extensions that read sources are rendered from proxies. `export hires` replaces both.
- `export hires` checks the originals against the recorded facts (`original-mismatch`: export a new package) and builds
  exactly the files a full export would. `export verify` lists the hi-res files still pending.
- Thumbnail: not in a proxy package (it comes from the original).


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
