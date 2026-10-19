<p align="center">
  <img src="assets/baton.png" width="128" height="128" alt="Baton">
</p>

<h1 align="center">Baton</h1>

<p align="center">
  <strong>Run Maestro E2E flows for React Native apps from every git worktree at once, with no collisions.</strong>
</p>

<p align="center">
  <a href="https://buymeacoffee.com/lmcjt">
    <img src="https://img.shields.io/badge/Buy%20Me%20a%20Coffee-Support-yellow?logo=buymeacoffee&logoColor=white" alt="Buy Me a Coffee">
  </a>
</p>

<p align="center">
  <a href="https://lmcjt37.github.io/baton-releases/"><strong>Website</strong></a> ·
  <a href="https://github.com/lmcjt37/baton-releases/releases/latest"><strong>Download</strong></a> ·
  <a href="#documentation"><strong>Docs</strong></a> ·
  <a href="examples"><strong>Examples</strong></a>
</p>

This is the public home for Baton's **releases**, **documentation**, **examples** and **issues**. Baton is free to use; its source is closed.

## Why Baton

Several worktrees, each with a human or an AI agent on its own branch, all want to run Maestro flows. On one Mac they get in each other's way: every dev build loads JS from Metro on `:8081`, so one worktree can serve *its* code to every simulator; two runs on one simulator break each other; and too many simulators stall the machine.

Baton gives each worktree its own Metro, its own simulators and emulators, and a fair place in the queue:

- a **separate Metro per worktree** on its own port (never 8081)
- **dedicated simulators or emulators**, each pointed at that Metro
- a **bundle check** proving every app loaded the right code before any flow runs
- a **queue** when the machine is full, and flows **sharded** across devices
- app builds **cached by native fingerprint**, so JS-only branches never rebuild
- screenshots and reports saved in the worktree, and a **live menu bar dashboard**
- an **MCP server**, so agents run flows with one call and get results and screenshots back

## Requirements

| | Minimum | Tested with |
|---|---|---|
| macOS + Xcode, with an iOS simulator runtime | not yet established | macOS 26.6, Xcode 26.5, iOS 18.6 and 26.5 |
| [Maestro CLI](https://maestro.mobile.dev) | **2.11.0** | 2.11.0 |
| Java (required by Maestro) | `JAVA_HOME` set, or `java` on PATH | |
| React Native app | bare RN using Metro, or Expo with `expo-dev-client` | RN 0.83, 0.86 (Expo SDK 57), 0.87 |
| *Android only:* Android SDK with the emulator and an arm64 system image | Android Studio's SDK (`ANDROID_HOME`, or `~/Library/Android/sdk`) | emulator 36.5, Android 17 (API 37) |

Baton.app bundles its own Node; you don't need Node installed.

## Installation

> The first public release is on its way. Watch this repo (**Watch → Custom → Releases**) to hear when it lands.

### Download

1. Download **Baton-universal.dmg** from the [latest release](https://github.com/lmcjt37/baton-releases/releases/latest).
2. Open it, accept the licence, and drag **Baton** to Applications.
3. Open Baton and click **Open** if macOS asks. It lives in the menu bar, not the Dock.
4. From the menu bar icon, choose **Install 'baton' Command…** to put `baton` on your PATH.

### Homebrew

```sh
brew install --cask lmcjt37/tap/baton
```

This installs the app and links the `baton` command for you. *(Available from the first release.)*

Then open Baton from Applications once: macOS asks before running an app downloaded from the internet, and `baton` waits for that.

### Updates

Baton checks for updates itself and installs them only when nothing is running, so a test run is never interrupted.

## Getting started

From your React Native project:

```sh
baton init       # detects your app, build, Metro, flows and simulator; writes baton.config.ts
baton perform    # runs your flows
baton ui         # opens the dashboard
```

The first run builds the app and boots simulators (a few minutes); later runs take seconds. Commit `baton.config.ts` so every worktree gets it.

Let your AI agents use Baton:

```sh
claude mcp add --scope user baton -- baton mcp
```

Any MCP client works: point it at `baton mcp`. See [MCP](guide/mcp.md) for the tools agents get.

New to Baton? Try it on one of the [examples](examples) first.

## Documentation

| | |
|---|---|
| [How Baton works](guide/concepts.md) | Stages, Concerts, Acts and Programmes; artifacts; how failures are handled |
| [Configuration](guide/configuration.md) | `baton.config.ts`, app builds, env, affected runs, Android, machine settings |
| [CLI](guide/cli.md) | Every command, flag and exit code |
| [MCP](guide/mcp.md) | Tools for AI agents |
| [Menu bar app](guide/app.md) | Dashboard, Live viewer, logs, deep links, notifications |
| [Limitations](guide/limitations.md) | What isn't supported yet |
| [Roadmap](guide/roadmap.md) | What Baton does today and what's next |

## Examples

| | |
|---|---|
| [bare-rn](examples/bare-rn) | Bare React Native, iOS and Android |
| [expo-dev-client](examples/expo-dev-client) | Expo development build, iOS and Android |

## Feedback and bugs

[Open an issue](https://github.com/lmcjt37/baton-releases/issues/new). Include your macOS, Xcode and Maestro versions and the output of `baton status`.

## Licence

Free to use under the [end user licence agreement](LICENSE). Baton is closed source.

---

<p align="center">
  If Baton saves you time, consider buying me a coffee.<br><br>
  <a href="https://buymeacoffee.com/lmcjt">
    <img src="https://img.shields.io/badge/Buy%20Me%20a%20Coffee-Support-yellow?logo=buymeacoffee&logoColor=white" alt="Buy Me a Coffee">
  </a>
</p>
