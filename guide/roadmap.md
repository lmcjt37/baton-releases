# Roadmap

| Phase | Scope | State |
|---|---|---|
| 0 · Spikes | `RCT_jsLocation` override, running Maestro processes in parallel, sharding, timings | ✅ |
| 1 · Core + CLI | Daemon, registry/reconcile, ports, FIFO budget, Stage/Concert/Act lifecycle, bundle check, retries, `init` | ✅ |
| 2 · MCP | A stdio MCP server with `baton_perform_and_wait` and friends, progress notifications, project setup | ✅ |
| 3 · Electron | Tray icon, dashboard with cancel, failure notifications, External view, "Install `baton` command" | ✅ |
| Baton.app | Self-contained packaged app and DMG (`npm run package`); the CLI, daemon and MCP all run on its bundled Node | ✅ |
| Encore | Rerun only failed or flaky flows, from the CLI, MCP, the dashboard and failure notifications | ✅ |
| Dashboard runs | Perform programmes, all flows or custom runs on any Stage or new worktree, from the dashboard and tray | ✅ |
| Gallery and deep links | Screenshot thumbnails and lightbox, per-Act logs with follow, process details, `baton://` links | ✅ |
| Affected flows | `hooks.selectFlows` maps a worktree's changes to flows; `--affected`, MCP and the dashboard | ✅ |
| Binary cache | Build the app on a native-fingerprint miss, one build at a time, shared and cached across worktrees | ✅ |
| Live viewer | One grid of every running Act's simulator, captured only while you're watching | ✅ |
| Expo dev-client | Expo development builds connect to their Stage's Metro: prompt-free, `clearState`-safe, with generated `ios/` | ✅ |
| Android | Emulators per Stage in a Baton-owned AVD home, their own budget, APK builds in the binary cache, bundle check, Live view, `--platform android` everywhere | ✅ |
| Android follow-ups | A Metro proxy per emulator (`clearState`-safe, one build for every Stage), Expo dev clients, snapshot boots | ✅ |
| Test runners | Maestro behind a `Runner` interface, then Detox on iOS and Android: tags in test names, retries per test, test APK builds, `init` detection and setup warnings | ✅ |
| Donations | A dismissable "buy me a coffee" window at launch, plus a menu item; Baton stays free | ✅ |
| Distribution | Signed, notarised universal releases on `lmcjt37/baton-releases`, auto-update, and a Homebrew cask (`lmcjt37/tap/baton`) | ✅ |

## Next

- **npm package:** maybe; it would ship the CLI's source, which Baton.app doesn't expose.
- **Homebrew:** submit to the official `homebrew/cask` once Baton is better known.
