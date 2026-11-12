# Roadmap

## Next

- **Keep the daemon running:** a setting to turn off the daemon's idle shutdown, so it's always ready and the dashboard always shows live state. The menu bar item stays either way.
- **Rust:** investigating whether moving parts of Baton to Rust would make it faster and lighter, before deciding to do it.
- **Detox with Expo dev clients.**
- **XCUITest test plans:** picking tests by a test plan's configurations.
- **npm package:** maybe; it would ship the CLI's source, which Baton.app doesn't expose.
- **Homebrew:** submit to the official `homebrew/cask` once Baton is better known.

## Released

Highlights of each release; [the releases page](https://github.com/lmcjt37/baton-releases/releases) has the full notes.

| Version | Highlights |
|---|---|
| 2.4.0 | **Disk space:** DerivedData deleted with its Stage and trimmed by age and size, old artifacts deleted, Storage in Settings with Free Up Space…, a low-disk warning, `baton storage` |
| 2.3.0 | XCUITest result-bundle warnings on the Concert; Gradle build cache guide |
| 2.2.0 | **Simplified dashboard** for watching agents' runs (the default), with **Detailed** for run controls; ▶ Perform greyed out with a reason when a Stage can't run |
| 2.1.1 | `baton close .` from any folder, the MCP server's version, guide corrections, daemon-start fix |
| 2.1.0 | **Native apps:** XCUITest and Android instrumentation (Espresso, Compose), `init` for Swift and Kotlin projects, Android-only configs, builds in parallel (`maxBuilds`), a troubleshooting guide |
| 2.0.0 | **Detox** on iOS and Android, with `init` detection and setup warnings; programme `args` |
| 1.5.0 | `maestroStallMs` renamed to `stallMs` |
| 1.4.0 | Dashboard: active Stages first, Remove Stage, Perform on both platforms, collapse idle Stages, status filters |
| 1.3.0 | Check for Updates and a Settings window; open at login |
| 1.2.0 | Sessions sharing a worktree, ⚠ worktree changed, clearer queueing, the stall watchdog, instant cancel |
| 1.1.0 | One-command install script, checked against checksums and signatures |
| 1.0.0 | Per-worktree Metro, simulators and emulators; queueing; CLI, MCP and the menu bar app; Encore; affected flows; the build cache; Live viewer; Expo dev clients; Android; signed releases and a Homebrew cask |
