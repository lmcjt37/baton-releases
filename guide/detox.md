# Detox

Baton runs [Detox](https://wix.github.io/Detox/) tests with everything it gives Maestro flows: a Metro per worktree, pinned simulators and emulators, Acts, retries and flaky detection, Encore, affected runs, the build cache, and screenshots and logs in the dashboard. `examples/bare-rn-detox` is a working setup for iOS and Android.

## Setup

1. **Detox in the project.** `detox` and a Jest version Detox supports in `devDependencies`, installed in each worktree's `node_modules`, and a Detox config file: `.detoxrc.js` (or `.cjs`/`.json`, `.detoxrc`, `detox.config.*`), or any path set as `detox: { config: 'path' }`. A config only in `package.json` isn't read; move it to a file.
2. **iOS:** `applesimutils` (`brew tap wix/brew && brew install applesimutils`).
3. **Android:** Detox's test setup in the app, as in [Detox's project setup](https://wix.github.io/Detox/docs/introduction/project-setup):
   - Detox's maven repository in `android/build.gradle` (`allprojects.repositories`)
   - in `android/app/build.gradle`: `testBuildType`, `testInstrumentationRunner "androidx.test.runner.AndroidJUnitRunner"` and `androidTestImplementation("com.wix:detox:+")`
   - `DetoxTest.java` (or `.kt`) in `android/app/src/androidTest/…`
4. **`baton init`** finds the Detox config and writes `runner: 'detox'`. It warns about anything missing from the list above, as do the dashboard's Perform form and MCP `baton_project`.

```ts
export default {
  runner: 'detox',
  bundleId: 'com.example.app',
  app: { build: { command: '…xcodebuild… -derivedDataPath {derivedData} build', output: '{derivedData}/Build/Products/Debug-iphonesimulator' } },
  android: {
    applicationId: 'com.example.app',
    app: {
      build: {
        command: 'cd android && ./gradlew assembleDebug assembleAndroidTest -DtestBuildType=debug -PreactNativeArchitectures=arm64-v8a',
        output: 'android/app/build/outputs/apk/debug/app-debug.apk',
        testOutput: 'android/app/build/outputs/apk/androidTest/debug/app-debug-androidTest.apk',
      },
    },
  },
  metro: { start: 'yarn start --port {port}' },
  // flowsDir: 'e2e',                     // the default for Detox
  // detox: { config: 'e2e/detox.config.js', args: ['--loglevel', 'trace'] },
  env: { API_URL: 'https://staging.example.com' }, // tests read these from process.env
  programmes: { smoke: { tags: ['smoke'], acts: 2 } },
};
```

Your Detox config keeps its own `apps`, `devices` and `configurations` for running Detox yourself; Baton doesn't use them.

## Writing tests

- **One flow is one test** (`it`). Baton's results, retries and Encore work per test.
- **Tags are `#words` in test names.** `tags: ['smoke']` runs `it('signs in #smoke', …)`; `excludeTags` skips them. Tags must be single words.
- **Env** from `baton.config.ts` (`env`, `envFiles`, programme and per-run values) reaches tests as `process.env`.
- **Launch the app with `device.launchApp()`.** `newInstance`, `resetAppState` and `delete` all keep loading the Stage's bundle.
- **Screenshots:** Baton keeps the failure screenshot and every `device.takeScreenshot()`, even when the test passes.

## What Baton does

For each Act, Baton writes a Detox config that `extends` yours and adds:

- **its device:** the Act's simulator by UDID, or on Android its emulator by adb serial
- **its app:** the cached build (and test APK), which Baton has already installed, so Detox doesn't reinstall it
- **the Stage's Metro:** a launch arg (`RCT_jsLocation`) on iOS; on Android the emulator's proxy routes `10.0.2.2:8081`, so nothing is added
- **its Jest config,** wrapping yours: that Act's test files, the tag filter, and Baton's reporter alongside yours
- **artifacts** in the Concert's folder: screenshots, per-test device logs and `detox.log`

Test files are split round-robin across Acts, and each Act runs `detox test` on its own device. Baton's own retries rerun only the failed tests (Detox's `--retries` isn't used), so a test that fails and then passes is reported **flaky**.

On Android, `android.app.build.command` must build the test APK too, and `testOutput` names it (or `android.app.testPath` alongside a prebuilt `path`). Baton caches it with the app and installs both.

## Args

`detox.args` are added to every `detox test`, then a programme's `args`. Detox passes them through a shell, so each arg must be one word with no spaces or shell characters: write `['--loglevel', 'trace']`, not `['--loglevel trace']`. Baton rejects flags it sets itself, such as `-c`, `-C`, `--reporters`, `--artifacts-location`, `--take-screenshots`, `--record-logs` and `--retries`.

## Troubleshooting

When a run fails before any test reports, the error and its hint name the cause:

| Error | Fix |
|---|---|
| No Detox config | Add a `.detoxrc.js`, or set `detox.config` |
| `detox` not installed | Install the worktree's `node_modules` |
| `applesimutils` | `brew tap wix/brew && brew install applesimutils` |
| Detox framework cache | `npx detox clean-framework-cache && npx detox build-framework-cache` |
| Missing Detox setup, instrumentation or `DetoxTest` (Android) | Add the Android test setup above, then perform again (the native fingerprint changes, so Baton rebuilds) |
| Detox on Android needs a test APK | Set `android.app.build.testOutput` (or `android.app.testPath`) |

Each Concert's `detox.log` (**Logs** in the dashboard, `baton logs <id>`) has Detox's full output.

## Limits

- **No Expo dev clients** (`connect: 'devClient'`) with Detox yet.
- **No total while running.** Jest only knows test files up front, so the dashboard counts tests as they finish, without a total.
- **Retries rerun whole files.** Detox can't start mid-file, so a retry reruns each failed test's file, counting only the failed tests' results. Long files make retries slow. An Encore reruns the failed tests' files in full, including their other tests.
- **One runner per project.** A project with Maestro flows and Detox tests picks one with `runner`.
- **Detox supports a range of React Native versions.** Newer ones often work (the example runs RN 0.87), but Baton can't fix a Detox incompatibility.
