# Roadmap

## Next

### 2.2.0 (TBC): a simpler dashboard

Agents run the tests; the dashboard should let you watch them, not drive them. A new **View** setting picks **Simplified** (the default) or **Detailed** (today's dashboard, for more control).

- **Simplified** hides the Stage actions (▶ Perform and Remove) and **＋ New Stage**, collapses Stages with nothing running, and shows only the active Concert on a busy Stage.
- **▶ Perform** is shown disabled when a Stage can't run (for example, its worktree has no `baton.config.ts`), with the reason on hover.

### Later

- **Detox with Expo dev clients.**
- **XCUITest test plans:** picking tests by a test plan's configurations.
- **npm package:** maybe; it would ship the CLI's source, which Baton.app doesn't expose.
- **Homebrew:** submit to the official `homebrew/cask` once Baton is better known.

## Released

Highlights of each release; [the releases page](https://github.com/lmcjt37/baton-releases/releases) has the full notes.

| Version | Highlights |
|---|---|
| 2.1.1 | `baton close .` from any folder, the MCP server's version, guide corrections |
| 2.1.0 | **Native apps:** XCUITest and Android instrumentation (Espresso, Compose), `init` for Swift and Kotlin projects, Android-only configs, builds in parallel (`maxBuilds`), a troubleshooting guide |
| 2.0.0 | **Detox** on iOS and Android, with `init` detection and setup warnings; programme `args` |
| 1.5.0 | `maestroStallMs` renamed to `stallMs` |
| 1.4.0 | Dashboard: active Stages first, Remove Stage, Perform on both platforms, collapse idle Stages, status filters |
| 1.3.0 | Check for Updates and a Settings window; open at login |
| 1.2.0 | Sessions sharing a worktree, ⚠ worktree changed, clearer queueing, the stall watchdog, instant cancel |
| 1.1.0 | One-command install script, checked against checksums and signatures |
| 1.0.0 | Per-worktree Metro, simulators and emulators; queueing; CLI, MCP and the menu bar app; Encore; affected flows; the build cache; Live viewer; Expo dev clients; Android; signed releases and a Homebrew cask |
