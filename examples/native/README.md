# Baton sample: native iOS and Android apps

A SwiftUI app tested with XCUITest (`ios/`), and a Kotlin app tested with Compose UI tests and Espresso (`android/`). There's no React Native and no Metro. Baton runs the native tests the way it runs Maestro flows: pinned simulators and emulators per worktree, Acts, retries, Encore, affected runs, the build cache, and live results, failure videos and logs in the dashboard.

## Setup

Xcode 16 or later, JDK 17, and the Android SDK with an arm64 system image. `baton.config.ts` builds both apps.

- **iOS** builds for testing (`xcodebuild build-for-testing`) into Baton's DerivedData folder, and runs the `.xctestrun` it writes. `ios/project.yml` is the xcodegen spec the Xcode project was generated from.
- **Android** builds the app and its test APK (`assembleDebug assembleAndroidTest`). The `MainActivity` screen is Compose and `LegacyActivity` is a View screen, so one test APK has both kinds of test.

On a project like this one, `baton init` proposes the same builds and runners.

## Run

```sh
baton perform smoke                      # iOS: the test_smoke_ tests, on 2 Acts
baton perform smoke --platform android   # Android: the @Smoke tests (Compose and Espresso)
baton perform --test BatonNativeUITests/MarkerTests
baton perform -p android --test com.example.batonnative.MarkerTest#showsMarker
```

- **Test ids:** `Target/Class/method` on iOS, `package.Class#method` on Android. A class runs all its tests.
- **Tags:** `_smoke_` in an XCUITest name, and the `@Smoke` annotation on Android (`instrumentation.tags` maps `smoke` to it).
- **Env:** `EXPECTED_MARKER` reaches XCUITest as an environment variable and instrumentation as an argument. The marker tests check it against the marker the app shows, so each worktree tests its own build. Change `marker` in `BatonNativeApp.swift` and `MARKER` in `MainActivity.kt` on a branch, with the `env` to match, and run both worktrees at once.

## Failures, retries and Encore

```sh
baton perform demo
baton perform demo --platform android
```

`DemoTests` are skipped unless `DEMO=1`, which the `demo` programme sets. It runs them in one Act with one retry:

- `signIn` always fails (the sample has no sign-in screen), with a screen recording of the failure.
- `flaky` fails, then passes on the retry, so Baton reports it **flaky**. `FLAKY_FILE` is a per-Concert path from an env function; the test passes when the file exists.

A retry reruns only the failed tests. Then `baton encore <id>` reruns only `signIn`.

## Affected runs

`hooks.selectFlows` maps changes to tests for `baton perform --affected`: an edited test class runs itself, app code runs the smoke tests, and anything else runs nothing. It gets the Concert's `platform`, since test ids differ per platform.
