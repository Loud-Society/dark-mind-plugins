# Dark Mind plugin marketplace

Plugin marketplace `darkmind` of [Dark Mind](https://darkmind.cloud) (Loud Society) with the plugin `darkmind`, version
0.18.0+52e644bfaa0d: the video editing skill `darkmind-editing`, the local helper `darkmind-agent` and the Dark
Mind MCP server (`https://darkmind.cloud/mcp`, sign-in with your Dark Mind account). Using it needs a Dark Mind account.

**Generated – do not edit.** Dark Mind publishes this folder after every deployment; changes here are overwritten.

## GitHub Copilot (CLI and the Copilot app)

```shell
copilot plugin marketplace add Loud-Society/dark-mind-plugins
copilot plugin install darkmind@darkmind
```

Update: `copilot plugin marketplace update darkmind; copilot plugin update darkmind@darkmind`.

## Claude Code

Claude Code uses the marketplace served by Dark Mind itself (no git needed):

```shell
claude plugin marketplace add https://darkmind.cloud/plugins/marketplace.json
claude plugin install darkmind@darkmind
```

## Sign in

Restart the client, then sign in to Dark Mind once: GitHub Copilot `/mcp` → `darkmind`; Claude Code `/mcp` →
`plugin:darkmind:darkmind` → *Authenticate*. No OAuth client ID is needed.

Installation guide: https://darkmind.cloud/downloads/darkmind-plugin.md
