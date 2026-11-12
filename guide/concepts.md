# How Baton works

## Architecture

```
 baton CLI ─────┐
 baton mcp ─────┼──▶ ~/.baton/baton.sock ──▶ batond (daemon, spawned on demand)
 baton ui ──────┘                              ├─ registry       ~/.baton/state.json
                                               ├─ scheduler      simulator and emulator budgets, FIFO
                                               ├─ port allocator Metro on 8082–8099 (never 8081)
                                               ├─ runners        Maestro · Detox · XCUITest · instrumentation
                                               └─ adapters       simctl · emulator/adb · Metro
```

For each worktree, Baton:

1. builds the app, or takes it from the cache, by its native fingerprint
2. creates **its own simulators** (`baton-<stage>-N`) or, on Android, **its own emulators** (`baton-<stage>-aN`)
3. for a React Native app, starts **its own Metro** on a free port, points every device at it and **checks** that every app really connects to *that* Metro before any flow runs. A [native app](native.md) has no Metro, so these steps are skipped.
4. runs the platform's test runner, [Maestro](https://maestro.dev), [Detox](detox.md), [XCUITest](xcuitest.md) or [instrumentation](instrumentation.md), across the devices (sharded), streams progress, and saves screenshots, videos and reports into the worktree

Requests that arrive while the machine is full **wait in a queue instead of failing**. The daemon starts on first use and exits when it has been idle for a while.

## Terminology

| Term | Meaning |
|---|---|
| **Stage** | One project in one worktree. A Stage owns a pool of simulators and emulators, and for React Native one Metro port. |
| **Concert** | One test run on a Stage: a set of flows/tags plus an Act count. Concerts on one Stage run one after another. |
| **Flow** | One test: a Maestro flow file, a Detox test case (`it`), or an XCUITest or instrumentation test method. |
| **Act** | One shard of a Concert, running on one simulator or emulator ("Act 2/3"). |
| **Programme** | A named, saved Concert preset in `baton.config.ts`, e.g. `baton perform smoke`. |
| **Budget** | The machine-wide simulator limit (`maxSimulators`, default 4), and a separate emulator limit (`maxEmulators`, default 2). Concerts ask for N Acts and get as many as are free (at least 1). |
| **External** | A process Baton didn't start, such as your own `yarn start` on 8081. Baton shows it but never touches it. |
| **Warm** | A booted simulator or emulator kept after a Concert (`warmSimulatorMs`, default 5 minutes) so the next one starts fast. Baton shuts warm devices down early when another Stage needs the budget. |

## Artifacts

Each Concert writes to `<project>/.baton/concerts/<id>/`: screenshots, logs and reports: `build.log` when it built the app; with Maestro the JUnit report, `maestro.log` and Maestro's debug output; with Detox `detox.log`, plus each test's device log; with XCUITest `xcodebuild.log`, each Act's result bundle and a video of each failure; with instrumentation `instrumentation.log`, each Act's logcat and failure videos. Baton writes a `.gitignore` in `.baton/`, so the folder never appears in `git status`. A Concert's artifacts are deleted 30 days after it finished (`artifactMaxAgeDays`), keeping each Stage's latest Concert.

Machine-wide state lives in `~/.baton/` (or `BATON_HOME`): the daemon socket, registry, cached builds (`binaries/`), each Stage's DerivedData (`derived/`, deleted with its Stage, after 14 days without a build, or least recently built first when they pass 30 GB), Baton's AVDs (`avd/`), `daemon.log`, and each Stage's Metro log (`logs/metro-<stage>.log`).

## Failures

- **Infra failures** (boot, install, Metro dying, the bundle check, a runner that produced no results) are retried automatically, and simulators are erased (emulators wiped) if they were the problem.
- **Flow failures** are not retried unless you pass `-r N`; a flow that passes on a retry is reported as **flaky**.
- **Bundle errors** fail the Concert straight away with Metro's error message, before any simulator boots.

For the internals, design decisions and lessons learned, see [ARCHITECTURE.md](../ARCHITECTURE.md).
