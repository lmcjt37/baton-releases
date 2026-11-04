# Troubleshooting

Every Concert keeps its logs in `<project>/.baton/concerts/<id>/`: `build.log`, and the test runner's log (`maestro.log`, `detox.log`, `xcodebuild.log` or `instrumentation.log`). Open them with **Logs** in the dashboard or `baton logs <id>`. An infra error (⚠) comes with a hint; the dashboard's **Copy** button copies both.

## Setup

| Symptom | Fix |
|---|---|
| `No baton.config.ts found` | Run `baton init` in the project, and commit the config so every worktree has it |
| `baton init` wrote the config in the wrong folder | It picks the nearest React Native project, else the folder holding `ios/` or `android/`, else the Xcode or Gradle project. Pass `--worktree <dir>`, or move the file |
| Setup warnings in `baton init`, the Perform form or MCP `baton_project` | Each names what's missing: Maestro or Detox not installed, no UI test target, no `testInstrumentationRunner`, Xcode older than 16 |
| `baton.config.ts has no iOS app` | The config is Android-only: run with `--platform android`, or add `bundleId` and `app` |

## Builds

| Symptom | Fix |
|---|---|
| `App build failed` | `build.log` has the compiler errors; the hint lists the first ones. Fix them and perform again |
| `The build finished but no .app with bundle id … is at …` | Check `bundleId` and `app.build.output`; the error lists what was built there |
| `The build finished but no .xctestrun matches …` | XCUITest builds need `build-for-testing` with `-derivedDataPath {derivedData}`; check `app.build.xctestrun` |
| Every branch rebuilds | Native changes change the fingerprint. Raise `maxBuilds` so worktrees build at once; `baton cache ls` shows what's cached |
| A bad build keeps being used | `baton cache rm <fingerprint>` removes it and the DerivedData it came from |

## Devices

| Symptom | Fix |
|---|---|
| A Concert waits (`#2 in queue`) | The simulator or emulator budget is in use; it starts when one frees up. Raise `maxSimulators` or `maxEmulators` if the machine has room |
| `Emulator … didn't finish booting` or `exited while booting` | Check the emulator log named in the hint. Baton retries and wipes the emulator if it was the problem |
| `No arm64-v8a Android system image installed` | Install one with Android Studio's SDK Manager, or set `android.emulator.systemImage` |
| `App on … never connected to Metro` (React Native) | On iOS the app must take its bundle URL from `RCTBundleURLProvider` (Baton sets `RCT_jsLocation`); on Android it must use the default dev server, `10.0.2.2:8081`. Expo dev clients need `connect: 'devClient'`. See [Configuration](configuration.md#android) |

## Runs

| Symptom | Fix |
|---|---|
| `… made no progress for 5 min, so Baton stopped it` | A `simctl` or `adb` call was stuck, often under heavy load. Check Activity Monitor, then Encore. Raise `stallMs` for tests that stay silent longer |
| `… exited 0 without producing results` | Baton retries this. If it keeps happening, the runner's log says why (an app that crashes at launch, a test APK that didn't install) |
| `No flows matched this Concert` | Check the flows, test ids and tags. Test ids are `Target/Class/method` (XCUITest) or `package.Class#method` (instrumentation) |
| A test passes locally but fails in Baton | Baton's devices are fresh and its env comes from `baton.config.ts`; check the env your tests read |
| ⚠ worktree changed | Another session edited the worktree while the Concert ran. Give each session that edits code its own worktree |

## By runner

- **Maestro:** Maestro 2.11 or later; older versions lose the app on iOS 26 simulators. Flows must assert a real screen, not just "anything visible".
- **Detox:** [Detox troubleshooting](detox.md#troubleshooting) and [limits](detox.md#limits).
- **XCUITest:** [XCUITest troubleshooting](xcuitest.md#troubleshooting) and [limits](xcuitest.md#limits).
- **Instrumentation (Espresso, Compose):** [troubleshooting](instrumentation.md#troubleshooting) and [limits](instrumentation.md#limits). **Espresso doesn't wait for React Native**, so Espresso tests of React Native screens need idling resources; use Detox or Maestro for those.

What Baton doesn't support yet: [Limitations](limitations.md).
