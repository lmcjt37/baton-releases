# CLI

```sh
baton perform                   # all flows in flowsDir
baton perform smoke             # a programme from baton.config.ts
baton perform -t login -a 3     # tags, 3 Acts
baton perform --affected        # only the flows this worktree's changes affect (needs hooks.selectFlows)
baton perform smoke -p android  # the same programme on Android emulators (needs an `android` block)
baton status                    # Stages, Concerts, budget, External processes
```

## Commands

| Command | |
|---|---|
| `baton init [--force]` | Detect the project and write `baton.config.ts` |
| `baton perform [programme] [-p ios\|android] [-f flow] [-t tags] [-x exclude] [-a acts] [-r retries] [-e K=V] [--affected] [--no-wait]` | Queue a Concert for this worktree; follows progress by default |
| `baton await <id> [--timeout s]` | Wait for a Concert |
| `baton status` | Everything Baton manages, plus External processes |
| `baton logs <id> [--act n]` · `baton logs --stage <id\|path>` | Test runner output (Maestro or Detox), or a Stage's Metro log |
| `baton encore <id> [--no-wait]` | **Encore**: rerun only the failed (or flaky) flows of a finished Concert, with the same config and env |
| `baton cancel <id>` | Cancel a queued or running Concert. It's cancelled straight away; the test runner is stopped, forcibly if it doesn't exit within 5 seconds |
| `baton close [stage\|path]` | Stop a Stage's Metro and shut down its simulators and emulators |
| `baton prune [--all]` | Delete Stages whose worktree is gone, plus orphaned `baton-*` simulators and Baton AVDs. `--all` removes every Stage and every simulator and AVD Baton created, cancelling running Concerts |
| `baton cache ls` · `prune [--all]` · `rm <fingerprint>` | Cached app builds: list them, trim to the size cap (`binaryCacheGb`, default 10), or remove one bad build (this also clears the DerivedData it was built from) |
| `baton stop [--force]` | Stop the daemon and everything it manages |
| `baton mcp` | Run the MCP server on stdio ([MCP](mcp.md)) |
| `baton ui` | Open the menu bar app and dashboard ([Menu bar app](app.md)) |

Add `--json` to any command for machine-readable output. `baton --version` (`-v`) prints the version.

## Exit codes

| Code | Meaning |
|---|---|
| `0` | Passed, flaky, or skipped (nothing affected) |
| `1` | Flows failed |
| `2` | Infra error |
| `3` | Still running (`await` timed out) |
| `130` | Cancelled |

The first Concert on a Stage is the slowest (Metro cold start, simulator boot, install), around 1–3 minutes. Warm Concerts take seconds.
