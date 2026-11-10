# XCUITest

Baton runs a native iOS app's XCUITest UI tests (UIKit or SwiftUI) with everything it gives Maestro flows: pinned simulators per worktree, Acts, retries and flaky detection, Encore, affected runs, the build cache, and live results, failure videos and logs in the dashboard. It builds once with `build-for-testing` and runs `xcodebuild test-without-building` on each Act's simulator. `examples/native` is a working setup, and `baton init` writes this config when the Xcode project has a UI Testing target.

## Setup

1. **A UI test target** (type UI Testing Bundle) in the scheme's test action. XCTest only: Swift Testing can't be used in UI test targets, since Xcode doesn't make it available there.
2. **The config.** Pick the runner for iOS, build for testing into Baton's DerivedData folder, and point at the `.xctestrun` the build writes:

```ts
export default {
  bundleId: 'com.example.app',
  ios: { runner: 'xcuitest' },
  app: {
    build: {
      command: 'xcodebuild build-for-testing -workspace App.xcworkspace -scheme App -destination "generic/platform=iOS Simulator" -derivedDataPath {derivedData}',
      output: '{derivedData}/Build/Products/Debug-iphonesimulator',
      xctestrun: '{derivedData}/Build/Products/*.xctestrun', // its name includes the SDK and archs
    },
  },
  xcuitest: {
    tags: { login: ['AppUITests/LoginTests'] }, // whole classes as tags
    // args: ['-testLanguage', 'fr'],          // extra xcodebuild args
  },
  env: { API_URL: 'https://staging.example.com' }, // tests read these from their environment
  programmes: { smoke: { tags: ['smoke'], acts: 2 } },
};
```

Baton caches the whole products folder (the app, the test runner and the `.xctestrun`) by native fingerprint, and every Act runs from that copy. With a prebuilt app, set `app.path` and `app.xctestrun` instead of `app.build`.

`runner` stays the project-wide default (Maestro or Detox), so Android can keep its own runner. The dashboard's Perform form and MCP `baton_project` warn when the Xcode project has no UI test target or Xcode is older than 16.

## Choosing tests

- **Tests are ids, not files:** `AppUITests` (a target), `AppUITests/LoginTests` (a class) or `AppUITests/LoginTests/testSignsIn` (one test). Pass them with `--test` (repeatable), MCP `tests`, or a programme's `tests`. With none, every test in the bundle runs.
- **Tags** are a `_<tag>_` part of a test's name, with `_` on both sides: `test_smoke_signsIn` has the tag `smoke`, and `test_smoke_slow_loads` has `smoke` and `slow`, but `test_signsIn_smoke` has none. Tags are letters and digits only. `xcuitest.tags` adds whole classes to a tag, under any name. Several tags run tests with any of them; `excludeTags` skips tests with any of theirs.
- **Env** declared in `baton.config.ts` (`env`, a programme's `env`, or `-e` per run) reaches the test runner's environment: `ProcessInfo.processInfo.environment["API_URL"]`. Values from `envFiles` and `~/.baton/env` don't. Names are letters, digits and `_`. It doesn't reach the app; pass what the app needs through `XCUIApplication().launchEnvironment`.
- **Affected runs:** `hooks.selectFlows` returns `{ tests: [...] }`.

## What Baton does

- **Lists the tests** with `-enumerate-tests` (nothing runs), then splits whole classes across Acts, largest first. Each Act runs `xcodebuild test-without-building -only-testing:…` on its own simulator, with parallel testing off (Acts are Baton's parallelism).
- **Live results** come from xcodebuild's output: each test's pass, failure (with its assertion message) or skip shows as it finishes, with a total per Act.
- **Retries** rerun only the failed tests by id, all in one xcodebuild per Act, so a test that fails and then passes is reported **flaky**. Xcode's own `-retry-tests-on-failure` is left off.
- **Cancel** stops xcodebuild and the test runner, and terminates the app (which would otherwise keep running).

## Artifacts

- **Failure videos:** XCTest records the screen during each failed test, and the dashboard plays it.
- **Screenshots:** take them yourself; Baton keeps your tests' `XCTAttachment`s, passing or failing. (XCTest's own failure screenshot comes without its image, so Baton doesn't use it.)

```swift
let shot = XCTAttachment(screenshot: app.screenshot())
shot.name = "checkout"
shot.lifetime = .keepAlways
add(shot)
```

- **Logs:** `xcodebuild.log` (**Logs** in the dashboard, `baton logs <id>`), and each Act's result bundle (`xcuitest/act-N/tests.xcresult` in the Concert's folder) to open in Xcode.
- Xcode's failure diagnostics (a sysdiagnose of about 25 MB per failure) are off. To turn them back on, add `args: ['-collect-test-diagnostics', 'on-failure']`.

## Troubleshooting

| Error | Fix |
|---|---|
| `XCUITest needs an .xctestrun` | Set `app.build.xctestrun` (or `app.xctestrun` with a prebuilt app) |
| No .xctestrun matches | The build command must run `build-for-testing` with `-derivedDataPath {derivedData}`; check `app.build.xctestrun` |
| The app isn't in the products folder | Point `app.build.output` at the app `build-for-testing` built, beside the `.xctestrun` |
| No flows matched | Check `--test` ids (`Target/Class/method`) and tags (`test_<tag>_…`) |
| `Not a test target, class or id` | Use `AppUITests`, `AppUITests/LoginTests` or `AppUITests/LoginTests/testSignsIn`; target names can't contain spaces |
| `XCUITest params can't be named …` | Rename the env value: letters, digits and `_` only |
| `xcodebuild stopped before this test ran` | xcodebuild exited partway through an Act (often a simulator problem); the test is failed so a retry or Encore picks it up. `xcodebuild.log` says why |
| The first run on a simulator is slow | xcodebuild installs the app and its test runner first (about 20s); later runs reuse them |
| `The test runner crashed: …` | The test crashed the test runner (a `fatalError`, a force unwrap, `exit`). xcodebuild restarts the runner and carries on with the next test |
| `Couldn't list the XCUITest tests: … never finished bootstrapping` | The test runner crashed while loading the test bundle, before any test: check the bundle's setup code (principal class, `+load`, static initialisers). Baton retries, since this can also be a passing simulator problem |
| Failures have no message or video | If `xcresulttool` couldn't read the result bundle, the Concert shows a warning, with details in `xcodebuild.log`; open `tests.xcresult` in Xcode meanwhile |

More symptoms and fixes: [Troubleshooting](troubleshooting.md).

## Limits

- **XCTest only.** Swift Testing can't run in UI test targets, so its tags and parameterised tests aren't available there.
- **Test plans:** Baton picks tests by id and tag, not by a test plan's configurations.
- **About 4 to 5 seconds** of xcodebuild overhead per Act and per retry.
- **Tested with Xcode 26.5.** Baton reads failures and recordings with `xcresulttool` (Xcode 16 and later); if a newer Xcode changes its output, the Concert shows a warning.
