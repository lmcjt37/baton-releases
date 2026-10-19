# Menu bar app and dashboard

```sh
baton ui
```

Baton lives in the menu bar as a conductor's baton, with a status dot. While the dashboard is open it also appears in the Dock and ⌘-Tab, like any app with a window; close the dashboard and it's back to the menu bar only.

| Icon | Meaning |
|---|---|
| No dot | Idle (faded when the daemon isn't running) |
| Pulsing blue dot | A Concert is running |
| Grey dot | Waiting for simulators |
| Green dot | Passed in the last 10 minutes |
| Red dot | Failed, until you open the dashboard |

## Features

- **The menu** lists active and recent Concerts and External processes.
- **The dashboard** has a card per Stage: branch, Metro port and health, and simulators. Each Concert shows its Acts as small phone icons (blue while running, amber if an infra error stopped them), per-Act progress, failing flows with reasons, and a live stdout tail. You can cancel a run, open its artifacts, or **Encore** it: rerun just the failed flows. An Encore and its original link to each other. Starting a Concert collapses the Stage's other Concerts so the running one has focus; queued Concerts stay compact until they start.
- **Start runs from the dashboard.** Each Stage card has **▶ Perform ▾**: its programmes, All flows, or Custom… (tags, exclusions, Acts, retries). **＋ New Stage…** picks any worktree folder, and offers to create its `baton.config.ts` if it has none. The tray has the same under **Perform ▸**. Runs started here show 🧑 dashboard as their source and queue behind anything already running, such as an agent's run.
- **See what the flows saw.** Each Act shows thumbnails, with failure-time screenshots first and outlined red. Click one for a lightbox (←/→ through the Concert's screenshots). **Logs** opens the Act's Maestro output, each flow's `maestro.log` and XCTest log, and the Metro log, with live follow. The lightbox and Logs both have **Show in Finder** for the file you're looking at.
- **Details** shows Metro's PID and port, simulator UDIDs, the Maestro command (with `-e` values hidden), and where things live: the installed app (Baton's cached copy), where the build wrote it, the Stage's DerivedData, and the artifacts folder. Click any of these to open it in Finder. An infra error has a **Copy** button for its message and hint.
- **◉ Live** shows every running Act's simulator or emulator in one grid, refreshed about once a second, with its Stage, Concert and latest output line. Click a tile to enlarge it. Capture runs only while Live is open on a visible dashboard, and only for running Acts.
- **Deep links.** `baton://concert/<id>[/act/<n>]` opens Baton.app on that Concert or Act. The CLI and MCP results print it.
- **Notifications** are for failures only. Clicking one opens the failing Concert. With Baton's notification style set to *Alerts* (System Settings → Notifications), they also offer an **Encore** button.
- **Updates.** Baton checks for a new version at launch and daily, downloads it in the background, then shows **Restart to Update to X** in the menu. If Concerts are queued or running, it waits for them to finish; it never cancels a run to update. Quitting Baton also installs a downloaded update.
- **Support Baton.** When you open Baton it shows a small "buy me a coffee" window once per launch (not when it starts at login). Tick **Don't show this again** to stop it; **Buy Me a Coffee…** in the menu still opens the page, and **Show Donation Prompt at Launch** turns the window back on.
- **When the daemon is idle** (it exits after a quiet spell), the menu and dashboard show the **last saved state**. The menu offers **Start Daemon**, or **Restart Daemon** while it's running; it asks before cancelling running Concerts.

## The daemon and the app

**Opening the dashboard starts the daemon** if it isn't running, and keeps it running while the window is open, so it's ready to show runs as they happen. If it stops, the dashboard starts it again. Once you close the dashboard, the daemon goes back to exiting when idle. The menu bar icon on its own never keeps it alive.

Before starting the daemon, the app loads your login shell's `PATH`/`JAVA_HOME`, because apps opened from Finder or at login don't get them, and runs would fail to find `npm`, `yarn` or `maestro`.

## The `baton` command

**Install 'baton' Command…** in the tray menu writes `/usr/local/bin/baton` (VS Code style). It asks for admin rights only if that folder isn't writable, and the command runs the CLI on the app's own bundled Node. If you installed with Homebrew, `baton` is already on your `PATH` and the menu item says so.
