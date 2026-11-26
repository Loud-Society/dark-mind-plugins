# Dark Mind plugin (`darkmind`)

Edit videos with Dark Mind from **GitHub Copilot** (CLI and Copilot app) and **Claude Code** (CLI and the *Code* tab of
the Claude desktop app). Built for https://darkmind.cloud, version 0.17.0+766d314eecc3.

| Part | What it does |
|------|--------------|
| Skill `darkmind-editing` (`skills/darkmind-editing/`) | Workflow and rules: brief → research → draft → editor reviews → proxy → final → sync → Premiere |
| Script `darkmind-agent.mjs` (in the skill folder) | Local helper: project files, transfers with tickets, local rendering with ffmpeg, reviews, Premiere export |
| MCP server `darkmind` (`.mcp.json`) | `https://darkmind.cloud/mcp` – search videos, transcripts, cut projects, media tickets. Sign in with your Dark Mind account when the client asks |

The Loud Society brand assets (Neuborn, logos, audio) are **not** part of this plugin: the agent installs them once
with the MCP tool `get_brand_assets` and `darkmind-agent brand-assets` into `~/.darkmind/brand-assets` (outside the
plugin, so updates keep them).

**Update:** `claude plugin update darkmind@darkmind` / `copilot plugin update darkmind@darkmind` after `… plugin
marketplace update darkmind`, or `node "<this folder>/skills/darkmind-editing/darkmind-agent.mjs" plugin update` for both
(the agent tells you when Dark Mind serves a newer version). Do not edit files here – an update replaces them.

Installation guide: https://darkmind.cloud/downloads/darkmind-plugin.md
