# Dark Mind editing skill (`darkmind-editing`)

Skill for local AI agents – **GitHub Copilot** (desktop app and CLI) and **Claude Code** (Claude desktop app and CLI)
– that edit videos with Dark Mind on the editor's computer (Phase 4, [plan](../../doc/mvp/PHASE_4_AI_EDITING_PIPELINE.md)).
The agent researches footage through the Dark Mind MCP server, shows the hits in the Dark Mind review player next to
the chat and collects the chosen ones in the user's research basket ([research review](../../doc/RESEARCH_REVIEW.md)),
builds a reviewable cut draft and an editing pipeline in
a local project folder, renders previews and the final video locally, records only the editor's explicit approvals,
saves the project as versions in Dark Mind and can hand it over to Premiere Pro. Both clients use the same skill, the
same format and the same approval rules.

This file is the installation guide. Dark Mind serves it at `https://<dark mind>/downloads/darkmind-editing-skill.md`
(prod: <https://darkmind.cloud/downloads/darkmind-editing-skill.md>); the Main App shows the same steps under
**Cut projects → Work on cut projects with your AI tool**. The commands below use prod (`https://darkmind.cloud`);
other environments use their Main App URL.

## Requirements

| What | Version / note |
|------|----------------|
| Windows | Windows 10/11 (tested: Windows 10 Enterprise 26H2). macOS is not supported yet |
| AI client | GitHub Copilot (desktop app or CLI) and/or Claude Code (Claude desktop app, *Code* tab, or CLI) |
| Dark Mind account | Internal account of the Dark Mind tenant (sign-in in the client, see step 1) |
| Node.js | 20 or later (`node --version`) |
| ffmpeg / ffprobe | In `PATH`, with `libx264`, `aac` and `drawtext` (tested: 9.0.1 essentials build from gyan.dev, e.g. `choco install ffmpeg` or `winget install Gyan.FFmpeg`) |
| Optional: whisper.cpp | Speech-to-text check of renders: set `DARKMIND_WHISPER` (path of `whisper-cli.exe`) and `DARKMIND_WHISPER_MODEL` (ggml model, e.g. `ggml-base.en.bin`). Without it the check is skipped |
| Optional: Premiere Pro | 2027 (27.0) for the Premiere hand-off |
| Brand projects (Loud Society) | Microsoft Edge (preinstalled on Windows) for the brand blocks; Playwright is installed per project by `darkmind-agent` itself (`npm ci --ignore-scripts` in `extensions/`, no question). The brand assets come with your Dark Mind sign-in (MCP `get_brand_assets`), not with the download |

## Installation

**Recommended: the Dark Mind plugin.** It installs this skill, the script and the Dark Mind MCP server for Claude Code
and GitHub Copilot from a plugin marketplace and keeps them updatable – guide:
[agents/darkmind-plugin](../darkmind-plugin/README.md) (served at
<https://darkmind.cloud/downloads/darkmind-plugin.md>):

```powershell
claude plugin marketplace add https://darkmind.cloud/plugins/marketplace.json; claude plugin install darkmind@darkmind
copilot plugin marketplace add Loud-Society/dark-mind-plugins; copilot plugin install darkmind@darkmind
```

Then restart the client, sign in to Dark Mind once (Copilot `/mcp` → `darkmind`, Claude Code `/mcp` →
`plugin:darkmind:darkmind`) and continue with step 3 below. The manual steps 1–2 remain for clients without plugin
support (e.g. Claude chat in the desktop app); do not combine both – the client would see the skill and the Dark Mind
tools twice ([switch-over](../darkmind-plugin/README.md#switch-over-from-older-setups)).

### 1. Connect the Dark Mind MCP server (once per client, manual setup)

URL `https://darkmind.cloud/mcp` – nothing else: the client registers itself at Dark Mind (no OAuth client ID). The
login uses your Dark Mind account; no consent dialog is expected.

- **GitHub Copilot:** add an HTTP MCP server in the app's MCP settings, or add this entry to
  `%USERPROFILE%\.copilot\mcp-config.json`, then sign in when the browser opens:

  ```json
  { "mcpServers": { "dark-mind": { "type": "http", "url": "https://darkmind.cloud/mcp", "tools": ["*"] } } }
  ```

- **Claude (desktop app incl. Claude Code):** *Settings → Connectors → Add custom connector*, name `Dark Mind`, URL
  `https://darkmind.cloud/mcp`, then *Connect*.

### 2. Install the skill (also to update it; manual setup)

The skill is a folder `darkmind-editing` with `SKILL.md`, references, an example project, JSON Schemas and the local
script `darkmind-agent.mjs` (built for the Dark Mind it was downloaded from). In PowerShell:

```powershell
$zip = "$env:TEMP\darkmind-editing-skill.zip"; curl.exe -fsSLo $zip https://darkmind.cloud/downloads/darkmind-editing-skill.zip; foreach ($d in "$HOME\.copilot\skills", "$HOME\.claude\skills") { Remove-Item "$d\darkmind-editing" -Recurse -Force -ErrorAction SilentlyContinue; Expand-Archive $zip -DestinationPath $d -Force }
```

This installs the skill for GitHub Copilot (`%USERPROFILE%\.copilot\skills\darkmind-editing`) and Claude Code
(`%USERPROFILE%\.claude\skills\darkmind-editing`). Run the same command again to **update** – the agent tells you when
Dark Mind serves a newer version (`darkmind-agent doctor`). Do not edit files in the skill folder; an update replaces
it.

### 3. Restart the client and check

Restart the client (or start a new session). GitHub Copilot: `/skills` lists `darkmind-editing`. Claude Code:
`/darkmind-editing` (plugin: `/darkmind:darkmind-editing`) appears in the `/` menu. Then ask:

```text
Check my Dark Mind editing setup.
```

The agent runs `darkmind-agent doctor` (Node, ffmpeg, Dark Mind reachable, skill version, brand assets) and calls a Dark
Mind tool. For Loud Society formats it installs the brand assets once (`get_brand_assets` → `darkmind-agent
brand-assets`, about 9 MB into `%USERPROFILE%\.darkmind\brand-assets`; updates of the plugin or the skill keep them).

## First steps

Open the client in an **empty folder** (one folder per project) and describe the job, for example:

```text
Use the Dark Mind editing skill: create a 30–60 second vertical interview short from the Never Ending Interview
about "first concert". Find two or three strong statements and show me the draft first.
```

Or, in the Loud Society style with a format recipe:

```text
Use the Dark Mind editing skill: make a Never Ending Interview episode (recipe nei-episode, 5–8 minutes, 4–6 links)
from the NEI upload area. Reconstruct the chain from the transcripts only and show me the chain report and the draft.
```

To continue a project, copy the prompt from the project page in the Main App (*Cut projects → project → Work on this
project with your AI tool*) into a new session in an empty folder.

What to expect:

- The agent shows you a **draft** (statements with original timecodes, quotes, context) and records your approval only
  when you confirm explicitly – your words are stored with the review.
- It renders a **proxy preview** (`renders/proxy/vNNNN.mp4`) with automatic checks and can open a live browser
  preview; you approve the preview and the caption text, or request changes.
- Before it runs a script it wrote (title cards, graphics) it shows you the code and asks – that approval stays on your
  computer. The Loud Society brand blocks run without asking as long as they are unchanged copies of the skill's brand
  pack (`darkmind-agent` checks that byte for byte).
- After your approvals it downloads the originals (it tells you the size first), renders the **final video**
  (`renders/final/vNNNN.mp4`) and asks you to watch it before the final approval.
- It saves the project as versions in Dark Mind and releases the lock at the end. Optionally it exports a Premiere Pro
  package (`renders/premiere/vNNNN/` with `IMPORT.md`); changes in Premiere do not flow back.

**Tips:** for a small correction start a fresh, short session in the project folder (the state is in the files) and
use a medium reasoning level; use a higher level for building a new project or format.

**Tested state (Phase 4 WP7, 2026-11-22, Windows):** one complete real interview short from NEI material (research →
draft → editor reviews → proxy → content and design correction → originals → final → sync → Premiere package → restore
in a fresh folder) with skill/script 0.6.0 and the fixes of 0.7.0, run by the agent with the skill's script and a real
Dark Mind token; editor decisions by Steve. The runs inside GitHub Copilot Desktop and Claude Code themselves are still
open (user checklist in the [phase plan](../../doc/mvp/PHASE_4_AI_EDITING_PIPELINE.md#wp7--umsetzung-2026-11-22)).
Typical figures: proxy render 9–10 s, final 25 s, original download about 18 MB/s, Premiere import of the package
about 80 s (Premiere Pro 2027).

## Contents

| Path | Content |
|------|---------|
| [`SKILL.md`](SKILL.md) | Workflow and rules for the agent (brief → research → draft → reviews → proxy → final → sync → Premiere) |
| [`references/FORMAT.md`](references/FORMAT.md) | Project files, time rules, timeline/caption rules |
| [`references/REVIEWS.md`](references/REVIEWS.md) | Reviews and approvals: never approve, which change needs which review |
| [`references/EXTENSIONS.md`](references/EXTENSIONS.md) | Extensions: declare inputs, local approval to run, contract |
| [`references/SYNC.md`](references/SYNC.md) | Locks, base version, derived video references, conflicts, restore |
| [`references/RESEARCH.md`](references/RESEARCH.md) | Small tool answers, choosing the smallest suitable source |
| [`references/PREMIERE.md`](references/PREMIERE.md) | Premiere Pro hand-off (brand projects: caption overlay track, thumbnail and chapters, loudness) |
| [`references/BRAND.md`](references/BRAND.md) | Loud Society brand projects: recipe choice, brand blocks, assets, recipe check, NEI rules |
| [`examples/interview-short/`](examples/interview-short/) | Complete example project of format contract v1 (9:16/30 fps, 35 s, three statements, rotated VFR B-roll, title-card extension, captions; fictitious video IDs) |
| [`brand/`](brand/README.md) | Loud Society brand pack (Phase 6): `brand.json` tokens, HTML compositor, brand blocks (captions, lower third, wordmark flash, title card, sting, chevron wipe, logo end, endcard, animal scream, loud sounds, thumbnail, NEI format/band/cliffhanger cards, vertical footage in 16:9) and `tools/add-block.mjs`, which vendors a block into a project's `extensions/`; format recipes (`recipes/`, `tools/recipe.mjs`: apply, check, YouTube chapters) and the NEI chain reconstruction (`recipes/NEI_CHAIN.md`, `tools/nei-chain.mjs`). The brand assets (Neuborn, logos, audio, endcard images) are **not** in the download (licensed for internal editors only): the agent installs them into `~/.darkmind/brand-assets` with the MCP tool `get_brand_assets` and `darkmind-agent brand-assets` |
| `schemas/` (download only) | JSON Schemas of every artefact (from `shared/schemas/editing-pipeline/`) |
| `darkmind-agent.mjs`, `skill.json` (download only) | The local script for this Dark Mind and `{ name, version, server, install }` (`install`: `zip` or `plugin`) |

## For developers

- The Dark Mind plugin ([agents/darkmind-plugin](../darkmind-plugin/README.md)) ships this folder unchanged below
  `plugins/darkmind/skills/darkmind-editing/`; both downloads are built from the same sources per request.
- The download is assembled by the Main App (`main-app/backend/src/routes/downloads.ts`): this folder (deployed to
  `dist/downloads/editing-skill/` by `main-app/deploy-to-appservice.ps1` together with the schemas), the
  `darkmind-agent.mjs` bundle with the request origin and `skill.json` with the bundle version. Skill and script share
  one version; `darkmind-agent` records it in `toolchain.json` (`skill.version`) when it runs from the skill folder.
- Check the example (format only, no media): `node agent-cli/dist/darkmind-agent.mjs validate --ready --dir
  agents/editing-skill/examples/interview-short`. The shared and agent-cli tests validate it and derive broken variants
  from it.
- `SKILL.md` follows the [Agent Skills](https://agentskills.io) format (`name`, `description` frontmatter), which GitHub
  Copilot and Claude Code both read. Keep instructions client-neutral; client-specific notes belong in this guide.
- Local check of the download: start the backend (`npm run dev` in `main-app/backend`) and fetch
  `http://localhost:<port>/downloads/darkmind-editing-skill.zip` – it falls back to this folder, `shared/schemas/` and
  `agent-cli/dist/darkmind-agent.mjs`.
