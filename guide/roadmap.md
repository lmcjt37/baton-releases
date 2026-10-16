# Roadmap

## What Baton does today

| Feature | |
|---|---|
| Isolation per worktree | Its own Metro (never 8081), its own simulators and emulators, and a check that every app loaded that worktree's bundle |
| Queueing | Machine-wide simulator and emulator budgets; runs wait their turn instead of failing |
| CLI, MCP and menu bar app | `baton`, `baton mcp` for agents, and a dashboard with live progress |
| Encore | Rerun only failed or flaky flows, from the CLI, MCP, the dashboard and failure notifications |
| Dashboard runs | Perform programmes, all flows or custom runs on any worktree from the dashboard and menu bar |
| Gallery and deep links | Screenshot thumbnails and lightbox, per-Act logs with follow, `baton://` links |
| Affected flows | `hooks.selectFlows` maps a worktree's changes to the flows worth running |
| Build cache | Builds the app when its native fingerprint changes, shared across worktrees |
| Live viewer | One grid of every running simulator and emulator |
| Expo dev clients | Expo development builds on iOS and Android |
| Android | Emulators per worktree, `clearState`-safe Metro routing, snapshot boots, `--platform android` everywhere |

## Next

- Signed, notarised releases with auto-update and a Homebrew cask.
- A dismissable "buy me a coffee" prompt in the app. Baton stays free.

Ideas and requests are welcome: [open an issue](https://github.com/lmcjt37/baton-releases/issues/new).
