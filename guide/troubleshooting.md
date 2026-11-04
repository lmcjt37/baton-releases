# Troubleshooting

Every Concert keeps its logs in `<project>/.baton/concerts/<id>/`: `build.log`, and the test runner's log (`maestro.log`, `detox.log`, `xcodebuild.log` or `instrumentation.log`). Open them with **Logs** in the dashboard or `baton logs <id>`. A React Native Stage's Metro log is `~/.baton/logs/metro-<stage>.log` (`baton logs --stage <id|path>`), and the daemon's is `~/.baton/daemon.log`. Machine settings (`maxBuilds`, `maxSimulators`, `stallMs` and so on) live in `~/.baton/config.json`; see [Configuration](configuration.md#machine-settings). An infra error (⚠) comes with a hint; the dashboard's **Copy** button copies both.

## Setup

| Symptom | Fix |
|---|---|
| `No baton.config.ts found` | Run `baton init` in the project, and commit the config so every worktree has it |
| `baton init` wrote the config in the wrong folder | It picks the nearest React Native project, else the folder holding `ios/` or `android/`, else the Xcode or Gradle project. Pass `--worktree <dir>`, or move the file |
| Setup warnings in `baton init`, the Perform form or MCP `baton_project` | Each names what's missing or unsupported: Maestro not installed or older than 2.11 (`maestro update`), Detox not installed or its Android setup missing, a Jest version Detox doesn't support, a Detox config only in `package.json`, Expo Go, no UI test target, no `testInstrumentationRunner` or Espresso/Compose dependency, Xcode older than 16, Espresso in a React Native project |
| `baton.config.ts has no iOS app` | You asked for iOS (`-p ios`, the iOS menu, MCP `platform: 'ios'`) but the config is Android-only: drop the platform, or add `bundleId` and `app` |
| `Invalid …/baton.config.ts: …` | The message lists each problem, such as a missing `bundleId` or an `app.build` without `command` and `output` |
| `Baton daemon did not start` | Check `~/.baton/daemon.log` |
| `Android SDK not found` | Install Android Studio, or set `androidSdk` in `~/.baton/config.json` |
| `No available iOS simulator runtime matching …` | Install that runtime in Xcode (Settings → Components), or change `simulator.runtime` |

## Builds

| Symptom | Fix |
|---|---|
| `App build failed` | `build.log` has the compiler errors; the hint lists the first ones. Fix them and perform again |
| `The build finished but no .app with bundle id … is at …` | Check `bundleId` and `app.build.output`; the error lists what was built there |
| `The build finished but no .xctestrun matches …` | XCUITest builds need `build-for-testing` with `-derivedDataPath {derivedData}`; check `app.build.xctestrun` |
| `The build finished but … isn't a built .apk` | Check `android.app.build.output` |
| `… isn't a built test .apk` | The build command must also run `assembleAndroidTest`; check `android.app.build.testOutput` |
| `app.path is not a built .app` · `android.app.path is not an .apk` | Point it at a Debug simulator `.app` or a debug APK |
| Every branch rebuilds | Native changes change the fingerprint. Raise `maxBuilds` so worktrees build at once; `baton cache ls` shows what's cached |
| `JS bundle failed to build` (React Native) | Metro's error is in the hint. For a generated file that's missing, run its generator in `hooks.beforeMetro` |
| `Metro exited before becoming ready` · `Metro not ready on :port after Ns` | Read the Metro log named in the hint. A slow first start may need a higher `metro.readyTimeoutMs` |
| `No free Metro port in …` | Run `baton status` to see what holds the ports, or widen `metroPortRange` |
| A bad build keeps being used | `baton cache rm <fingerprint>` removes it and the DerivedData it came from |

## Devices

| Symptom | Fix |
|---|---|
| A Concert waits (`#2 in queue`) | The simulator or emulator budget is in use; it starts when one frees up. Raise `maxSimulators` or `maxEmulators` if the machine has room |
| `Emulator … didn't finish booting` or `exited while booting` | Check the emulator log named in the hint. Baton retries and wipes the emulator if it was the problem |
| `No arm64-v8a Android system image installed` | Install one with Android Studio's SDK Manager, or set `android.emulator.systemImage` |
| `System image … isn't installed` | The `android.emulator.systemImage` you set isn't installed; the hint lists those that are |
| `… isn't on <emulator> after installing` · `The package manager on … didn't start` | Retried automatically with a wiped emulator; if it keeps happening, check the emulator log |
| `App on … never connected to Metro` (React Native) | On iOS the app must take its bundle URL from `RCTBundleURLProvider` (Baton sets `RCT_jsLocation`); on Android it must use the default dev server, `10.0.2.2:8081`. Expo dev clients need `connect: 'devClient'`. See [Configuration](configuration.md#android) |

## Runs

| Symptom | Fix |
|---|---|
| `… made no progress for 5 min, so Baton stopped it` | A `simctl` or `adb` call was stuck, often under heavy load. Check Activity Monitor, then Encore. Raise `stallMs` for tests that stay silent longer |
| `… exited N without producing results` | Baton retries this when the runner gave no reason. Otherwise the hint names the cause (missing Detox setup, an xcodebuild error, an instrumentation failure) and it isn't retried. The runner's log says more |
| `No flows matched this Concert` | Check the flows, test ids and tags. Test ids are `Target/Class/method` (XCUITest) or `package.Class#method` (instrumentation) |
| ``iOS runs XCUITest, which takes test ids, not `flows` `` (or the reverse) | Pass `--test` for XCUITest and instrumentation, `--flow` for Maestro and Detox |
| `Programme "x" lists flows, but … runs tests by id` | Give the programme `tests` for that platform |
| `Unknown programme "x"` | The hint lists the programmes in `baton.config.ts` |
| `Concert … ran Maestro, but baton.config.ts now uses …` | The runner changed since that Concert, so Encore can't rerun it; perform again |
| `N Concert(s) in progress` from `baton stop` | Wait for them, or `baton stop --force` to cancel them |
| A test passes locally but fails in Baton | Baton's devices are fresh and its env comes from `baton.config.ts`; check the env your tests read |
| ⚠ worktree changed (CLI and MCP: `The worktree changed while …`) | Another session edited the worktree while the Concert waited or ran. Give each session that edits code its own worktree |

## By runner

- **Maestro:** Maestro 2.11 or later; older versions lose the app on iOS 26 simulators. Flows must assert a real screen, not just "anything visible".
- **Detox:** [Detox troubleshooting](detox.md#troubleshooting) and [limits](detox.md#limits).
- **XCUITest:** [XCUITest troubleshooting](xcuitest.md#troubleshooting) and [limits](xcuitest.md#limits).
- **Instrumentation (Espresso, Compose):** [troubleshooting](instrumentation.md#troubleshooting) and [limits](instrumentation.md#limits). **Espresso doesn't wait for React Native**, so Espresso tests of React Native screens need idling resources; use Detox or Maestro for those.

What Baton doesn't support yet: [Limitations](limitations.md).
