# Native apps

Baton tests Swift and Kotlin apps with no React Native. Each worktree still gets its own simulators and emulators, its own cached build and a fair place in the queue. There's just no Metro: Baton starts no dev server, skips the bundle check and writes nothing into the app.

## Pick a runner

| | iOS | Android |
|---|---|---|
| **Maestro** flows (YAML) | ✓ | ✓ |
| **XCUITest** (UIKit and SwiftUI) | ✓ | |
| **Instrumentation** (Espresso, Jetpack Compose, UI Automator) | | ✓ |

Each platform can use its own: XCUITest on iOS and instrumentation on Android, or Maestro on one and native tests on the other. `runner` is the project-wide default (Maestro), and `ios.runner` or `android.runner` overrides it for that platform.

## Set up

From the project root (the folder holding `ios/` and `android/`, or your Xcode or Gradle project):

```sh
baton init
```

For a project with no `react-native` or `expo` dependency, `init` finds:

- **iOS:** the Xcode workspace or project at the root or in `ios/` (or an xcodegen `project.yml`, adding `xcodegen generate` when the `.xcodeproj` isn't committed, and `pod install` when there's a Podfile), the app's scheme and bundle id. With a **UI Testing** target, it sets `ios.runner: 'xcuitest'` and builds with `build-for-testing`.
- **Android:** the Gradle app module and its `applicationId`. With tests in `src/androidTest`, it sets `android.runner: 'instrumentation'` and also builds the test APK.
- **Maestro flows** in `.maestro/` (or `maestro/`, `e2e/maestro/`, `e2e/`, when it holds YAML) win over native tests, so Maestro projects keep working; `init` says how to switch.

A config for both platforms looks like this:

```ts
export default {
  bundleId: 'com.example.app',
  ios: { runner: 'xcuitest' },
  app: {
    build: {
      command: "cd ios && xcodebuild build-for-testing -project App.xcodeproj -scheme App -configuration Debug -destination 'generic/platform=iOS Simulator' -derivedDataPath {derivedData}",
      output: '{derivedData}/Build/Products/Debug-iphonesimulator',
      xctestrun: '{derivedData}/Build/Products/*.xctestrun',
    },
  },
  android: {
    applicationId: 'com.example.app',
    runner: 'instrumentation',
    app: {
      build: {
        command: 'cd android && ./gradlew assembleDebug assembleAndroidTest',
        output: 'android/app/build/outputs/apk/debug/app-debug.apk',
        testOutput: 'android/app/build/outputs/apk/androidTest/debug/app-debug-androidTest.apk',
      },
    },
  },
  instrumentation: { tags: { smoke: 'com.example.app.Smoke' } },
  programmes: { smoke: { tags: ['smoke'], acts: 2 } },
};
```

**Android only?** Leave out `bundleId` and `app`. Baton then runs on Android without `--platform android`, and `baton init` writes it that way for a project with no Xcode project.

## Run

```sh
baton perform smoke                       # iOS
baton perform smoke --platform android
baton perform --test AppUITests/LoginTests                    # an XCUITest class
baton perform -p android --test com.example.app.LoginTest#signsIn
```

- **Tests are ids:** `Target/Class/method` for XCUITest and `package.Class#method` for instrumentation. A class or target runs everything in it.
- **Tags:** `_smoke_` in an XCUITest name (`test_smoke_signsIn`); an annotation on Android (`instrumentation.tags` gives it a short name). A programme's tags must suit both platforms' runners, or the config doesn't load: `tags: ['smoke']` needs `instrumentation.tags.smoke`, and a dotted annotation name like `com.example.Smoke` isn't a valid XCUITest tag (give it a short name).
- **Params:** `env`, a programme's `env` and `-e K=V` (not `envFiles`) reach XCUITest tests as environment variables (`ProcessInfo.processInfo.environment`) and instrumentation tests as arguments (`InstrumentationRegistry.getArguments()`). Neither reaches the app; pass what it needs through `XCUIApplication().launchEnvironment` or an intent extra.
- **Affected runs:** `hooks.selectFlows` gets the Concert's `platform` and can return `{ tests: [...] }`, since test ids differ per platform.

## Builds

A native build's fingerprint covers the whole project root, since native source can live anywhere, so editing tests rebuilds too. It leaves out build output (`build`, `DerivedData`, `Pods`, `.gradle` and the like), the other platform's folder, `node_modules`, `.git`, `.github`, `.vscode`, `.baton`, `.maestro` and `baton.config.ts`, and adds the build command and toolchain (Xcode, or the JDK for Android). Native branches rebuild more often than React Native ones, so consider raising `maxBuilds` in `~/.baton/config.json`. Each Stage builds into its own DerivedData (and Gradle builds in the worktree), so rebuilds are incremental. On iOS a worktree's first build is a clean one: as long as your app's clean build takes. On Android most of that is shared already, since Gradle keeps dependencies and its daemon in `~/.gradle`. Worktrees on the same native code share one cached build.

To also share compiled output between worktrees on Android, turn on Gradle's [build cache](https://docs.gradle.org/current/userguide/build_cache.html): add `org.gradle.caching=true` to `gradle.properties` (the project's, or `~/.gradle/gradle.properties` for every project), or `--build-cache` to `android.app.build.command`. A new worktree then takes compile and dex output from any worktree that built the same code. C++ (CMake) steps, such as a React Native new-architecture app's, aren't cached. Baton leaves this off, since it changes how your builds run.

## Maestro and Compose

Maestro finds Compose elements by `Modifier.testTag` only when the tags are exposed as resource ids. Turn that on once, near the root of each screen:

```kotlin
Column(Modifier.semantics { testTagsAsResourceId = true }) {
  Text("Ready", Modifier.testTag("ready"))   // Maestro: - assertVisible: { id: "ready" }
}
```

## Limits

- **Espresso and React Native don't mix:** Espresso can't wait for React Native's JS thread, so tests of React Native screens need idling resources; Detox or Maestro wait for it by themselves. Compose UI tests sync with Compose itself. See [Android instrumentation](instrumentation.md#limits).
- **XCUITest:** XCTest only (Swift Testing can't run in UI test targets), no test plans, and about 4 to 5 seconds of xcodebuild overhead per Act. See [XCUITest](xcuitest.md#limits).
- **Instrumentation:** an app crash fails the rest of its Act's tests unless you turn on Android Test Orchestrator. See [Android instrumentation](instrumentation.md).

More: [XCUITest](xcuitest.md) and [Android instrumentation](instrumentation.md) cover each runner's setup, failure videos and troubleshooting, and [Troubleshooting](troubleshooting.md) collects common symptoms.
