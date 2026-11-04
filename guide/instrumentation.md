# Android instrumentation (Espresso, Compose)

Baton runs a native Android app's instrumentation tests (Espresso, Jetpack Compose, UI Automator, or a mix) with everything it gives Maestro flows: pinned emulators per worktree, Acts, retries and flaky detection, Encore, affected runs, the build cache, and live results, videos and logs in the dashboard. It drives `am instrument` with `AndroidJUnitRunner`, so it works for any test that runner runs. `examples/native` is a working setup, and `baton init` writes this config when the app module has tests in `src/androidTest`.

## Setup

1. **A test APK.** The app module has `testInstrumentationRunner = "androidx.test.runner.AndroidJUnitRunner"` in `defaultConfig` and its tests in `src/androidTest`. Baton reads the test package and runner from the built APK.
2. **The config.** Pick the runner for Android, and have the build make both APKs:

```ts
export default {
  // bundleId and app are for iOS; leave them out for an Android-only project.
  android: {
    applicationId: 'com.example.app',
    runner: 'instrumentation',
    app: {
      build: {
        command: './gradlew assembleDebug assembleAndroidTest',
        output: 'app/build/outputs/apk/debug/app-debug.apk',
        testOutput: 'app/build/outputs/apk/androidTest/debug/app-debug-androidTest.apk',
      },
    },
  },
  instrumentation: {
    tags: { smoke: 'com.example.Smoke' },   // short names for annotations
    // orchestrator: true,                  // see below
    // args: ['-e', 'debug', 'false'],      // extra am instrument args
  },
  env: { API_URL: 'https://staging.example.com' }, // tests read these as instrumentation args
  programmes: { smoke: { tags: ['smoke'], acts: 2 } },
};
```

`runner` stays the project-wide default (Maestro or Detox), so iOS can keep its own runner. The dashboard's Perform form and MCP `baton_project` warn when the app module has no `testInstrumentationRunner` or no Espresso or Compose test dependency.

## Choosing tests

- **Tests are ids, not files:** `com.example.LoginTests` (a class) or `com.example.LoginTests#signsIn` (one test). Pass them with `--test` (repeatable), MCP `tests`, or a programme's `tests`. With none, every test in the APK runs.
- **Tags are annotations.** `tags: ['smoke']` runs tests annotated `@Smoke`, using `instrumentation.tags` to map the short name to its class; a fully qualified name (`com.example.Smoke`) works without the map. Several tags run tests with any of them; `excludeTags` skips tests with any of theirs.
- **Env** from `baton.config.ts` (`env`, `envFiles`, programme and per-run values) reaches tests as instrumentation args: `InstrumentationRegistry.getArguments().getString("API_URL")`.
- **Affected runs:** `hooks.selectFlows` returns `{ tests: [...] }`.

## What Baton does

- **Lists the tests** with `-e log true` (nothing runs), then splits whole classes across Acts, largest first. Each Act runs `am instrument -w -r` on its own emulator.
- **Reads results from the output**, never from adb's exit code: each test's pass, failure (with the first line of its stack) or skip shows live, with a total per Act.
- **A crash** of the app's process fails the test it hit, and every test after it in that Act fails as never run, so a retry or Encore picks them up.
- **Retries** rerun only the failed tests by id, so a test that fails and then passes is reported **flaky**.
- **Cancel** stops the tests on the device too (it force-stops the app, which hosts them).

## Artifacts

- **Failure videos.** Baton records each emulator's screen while its Act runs and keeps the recording around each failed test. The dashboard opens it where the test starts.
- **Failure screenshots** need a JUnit rule in your tests, because the screen has already changed by the time Baton hears about a failure. Baton collects whatever the rule saves to `baton-screenshots/` in the app's external files folder:

```kotlin
class FailureScreenshot : TestWatcher() {
  override fun failed(e: Throwable?, description: Description) {
    val instrumentation = InstrumentationRegistry.getInstrumentation()
    val bitmap = instrumentation.uiAutomation.takeScreenshot() ?: return
    val dir = File(instrumentation.targetContext.getExternalFilesDir(null), "baton-screenshots").apply { mkdirs() }
    File(dir, "${description.className}#${description.methodName}.png").outputStream().use { bitmap.compress(Bitmap.CompressFormat.PNG, 100, it) }
  }
}

// Inside the activity's rule, so the screen is still showing:
@get:Rule val chain: RuleChain = RuleChain.outerRule(composeRule).around(FailureScreenshot())
```

- **Logs:** `instrumentation.log` (the runner's output, **Logs** in the dashboard, `baton logs <id>`) and each Act's `logcat.txt`, linked from its failed tests.

## Orchestrator

`instrumentation: { orchestrator: true }` runs each test in its own process with [Android Test Orchestrator](https://developer.android.com/training/testing/instrumented-tests/androidx-test-libraries/runner#use-android) and clears the app's data between tests, so a crash fails only its own test. It costs about 9 seconds per test. Baton installs Orchestrator and Test Services on its emulators itself, from Gradle's cache or, failing that, Google's Maven repository (checked against known checksums).

## Troubleshooting

| Error | Fix |
|---|---|
| No instrumentation for the app | Add `testInstrumentationRunner` to `defaultConfig`, and check `android.app.build.testOutput` |
| `Unable to resolve activity … ComponentActivity` | `createComposeRule()` needs `debugImplementation("androidx.compose.ui:ui-test-manifest")` in the app; `createAndroidComposeRule<YourActivity>()` doesn't |
| Text isn't found on Android 15+ | Apps draw edge to edge, so content can sit under the status bar; pad it (`Modifier.safeDrawingPadding()`) |
| Espresso times out or sees a stale screen in a React Native app | Espresso can't wait for React Native's JS thread: register idling resources for it, or test those screens with Detox or Maestro (see Limits) |
| The instrumentation ran no tests | Baton retries this as an infra error; if it persists, read `instrumentation.log` for `INSTRUMENTATION_FAILED` and check the test APK installed |

More symptoms and fixes: [Troubleshooting](troubleshooting.md).

## Limits

- **Espresso and React Native don't mix.** Espresso waits for the main thread and its own idling resources, not React Native's JS thread or bridge, so on React Native screens it acts before the UI updates. Use idling resources, or Detox or Maestro, which wait for React Native. Baton warns when a React Native project picks `instrumentation`. Compose UI tests don't have this problem: they sync with Compose itself.
- **Parameterised tests** are selected by method, so a retry of one case reruns all of that method's cases.
- **One Act's tests share a process** unless you use Orchestrator, so a crash ends the rest of that Act's run (they're failed and retried).
