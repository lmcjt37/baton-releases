# CLI

```sh
baton perform                   # all flows in flowsDir
baton perform smoke             # a programme from baton.config.ts
baton perform -t login -a 3     # tags, 3 Acts
baton perform --affected        # only the flows this worktree's changes affect (needs hooks.selectFlows); also `baton perform affected`
baton perform smoke -p android  # the same programme on Android emulators (needs an `android` block)
baton perform --test AppUITests/LoginTests   # XCUITest or instrumentation tests by id
baton status                    # Stages, Concerts, budget, External processes
```

## Commands

| Command | |
|---|---|
| `baton init [-w path] [--force]` | Detect the project and write `baton.config.ts` |
| `baton perform [programme] [-p ios\|android] [-f flow] [--test id] [-t tags] [-x exclude] [-a acts] [-r retries] [-e K=V] [--affected] [-w path] [--config path] [--no-wait]` | Queue a Concert for this worktree (`-w`, default the current folder); follows progress by default. `--config` uses another config file. `-f` takes flow files (Maestro, Detox), `--test` test ids (XCUITest, instrumentation); both repeat. `-p` defaults to `ios`, or `android` for an Android-only config |
| `baton await <id> [--timeout s]` | Wait for a Concert (default 60 seconds) |
| `baton status` | Everything Baton manages, plus External processes |
| `baton logs <id> [--act n] [--lines n]` · `baton logs --stage <id\|path>` | Test runner output (the last 100 lines by default), or a React Native Stage's Metro log |
| `baton encore <id> [--no-wait]` | **Encore**: rerun only the failed (or flaky) flows of a finished Concert, with the same config and env. A Concert that hit an infra error, or was cancelled or interrupted, is rerun in full; a passed one can't be. |
| `baton cancel <id>` | Cancel a queued or running Concert. It's cancelled straight away; the test runner is stopped, forcibly if it doesn't exit within 5 seconds |
| `baton close [stage\|path]` | Cancel a Stage's queued and running Concerts, stop its Metro (if any) and shut down its simulators and emulators |
| `baton prune [--all]` | Delete Stages whose worktree is gone, plus orphaned `baton-*` simulators and Baton AVDs. `--all` removes every Stage and every simulator and AVD Baton created, cancelling running Concerts |
| `baton cache ls` · `prune [--all]` · `rm <fingerprint>` | Cached app builds: list them, trim to the size cap (`binaryCacheGb`, default 10), or remove one bad build (this also clears the DerivedData it was built from). `prune --all` and `rm` refuse while a build is running |
| `baton stop [--force]` | Stop the daemon and everything it manages. It refuses while Concerts are queued or running; `--force` cancels them first |
| `baton daemon` | Run the daemon in the foreground |
| `baton mcp` | Run the MCP server on stdio ([MCP](mcp.md)) |
| `baton ui` | Open the menu bar app and dashboard ([Menu bar app](app.md)) |

Add `--json` to most commands for machine-readable output (not `stop`, `ui`, `mcp` or `daemon`). `baton --version` (`-v`) prints the version.

## Exit codes

| Code | Meaning |
|---|---|
| `0` | Passed, flaky, or skipped (nothing affected) |
| `1` | Flows failed, or the command failed (bad arguments, an unknown Stage) |
| `2` | Infra error, or interrupted (the daemon restarted mid-run) |
| `3` | Still running (`await` timed out) |
| `64` | Unknown command |
| `130` | Cancelled |

The first Concert on a Stage is the slowest (a build, simulator boot, install and, for React Native, Metro's cold start), around 1–3 minutes. Warm Concerts take seconds.
