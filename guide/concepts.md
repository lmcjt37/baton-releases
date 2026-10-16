# How Baton works

## Architecture

```
 baton CLI ─────┐
 baton mcp ─────┼──▶ ~/.baton/baton.sock ──▶ batond (daemon, spawned on demand)
 baton ui ──────┘                              ├─ registry       ~/.baton/state.json
                                               ├─ scheduler      simulator and emulator budgets, FIFO
                                               ├─ port allocator Metro on 8082–8099 (never 8081)
                                               └─ adapters       simctl · emulator/adb · Metro · Maestro
```

For each worktree, Baton:

1. starts **its own Metro** on a free port
2. creates **its own simulators** (`baton-<stage>-N`) and points each one at that port through `RCT_jsLocation`, or, on Android, **its own emulators** (`baton-<stage>-aN`), pointed at it through the app's `debug_http_host`
3. **checks** that every app really connects to *that* Metro before any flow runs
4. runs Maestro across the simulators (sharded), streams progress, and saves screenshots and reports into the worktree

Requests that arrive while the machine is full **wait in a queue instead of failing**. The daemon starts on first use and exits when it has been idle for a while.

## Terminology

| Term | Meaning |
|---|---|
| **Stage** | One project in one worktree. A Stage owns one Metro port and a pool of simulators. |
| **Concert** | One test run on a Stage: a set of flows/tags plus an Act count. Concerts on one Stage run one after another. |
| **Act** | One shard of a Concert, running on one simulator ("Act 2/3"). |
| **Programme** | A named, saved Concert preset in `baton.config.ts`, e.g. `baton perform smoke`. |
| **Budget** | The machine-wide simulator limit (default 4), and a separate emulator limit (default 2). Concerts ask for N Acts and get as many as are free (at least 1). |
| **External** | A process Baton didn't start, such as your own `yarn start` on 8081. Baton shows it but never touches it. |
| **Warm** | A booted simulator or emulator kept for 5 minutes after a Concert so the next one starts fast. |

## Artifacts

Each Concert writes to `<project>/.baton/concerts/<id>/`: screenshots, the JUnit report, `maestro.log` and Maestro's debug output. Baton writes a `.gitignore` in `.baton/`, so the folder never appears in `git status`.

Machine-wide state (the daemon socket, registry, cached builds, Baton's AVDs) lives in `~/.baton/`.

## Failures

- **Infra failures** (boot, install, Metro dying, the bundle check) are retried automatically, and simulators are erased (emulators wiped) if they were the problem.
- **Flow failures** are not retried unless you pass `-r N`; a flow that passes on a retry is reported as **flaky**.
- **Bundle errors** fail the Concert straight away with Metro's error message, before any simulator boots.
