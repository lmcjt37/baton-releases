# Baton sample: bare React Native app with Detox

The [`bare-rn`](../bare-rn) sample app (React Native 0.87, iOS and Android), tested with Detox instead of Maestro, to try Baton with Detox before your own project. Baton runs its Detox tests the way it runs Maestro flows: a Metro per worktree, pinned simulators, Acts, retries, Encore and artifacts, on iOS simulators and Android emulators.

## Setup

```sh
npm install
brew tap wix/brew && brew install applesimutils   # Detox needs it on iOS
```

`baton.config.ts` sets `runner: 'detox'` and uses `app.build` (and `android.app.build`), so the first Concert runs `pod install` if needed and builds the app. The build is then cached by native fingerprint, and only native changes rebuild.

For Android, Detox needs a test APK: the app has Detox's Android setup (`android/app/src/androidTest/…/DetoxTest.java`, `testInstrumentationRunner` and `androidTestImplementation("com.wix:detox:+")` in `android/app/build.gradle`, Detox's maven repo in `android/build.gradle`), and the build command also runs `assembleAndroidTest`, with `testOutput` pointing at the APK.

Baton extends `.detoxrc.js` with its own simulator, app build and Metro, so the tests don't need to know about Baton. Each Detox test (`it`) is one flow. Tags are `#words` in test names: `smoke` runs tests named `… #smoke`.

## Run

```sh
baton perform smoke                     # 2 Acts; the tests assert the visible marker matches EXPECTED_MARKER
baton perform smoke --platform android   # the same on Baton's emulators
```

Detox tests read Baton's env (`env` in `baton.config.ts`, programme `env`, `--env`) from `process.env`.

## Failures, retries and Encore

```sh
baton perform demo
```

The `demo` programme runs the tests in `e2e/` plus two in `e2e-demo/`, in one Act with one retry:

- `sign in` always fails (the sample has no sign-in screen), with a screenshot and device log in the Concert.
- `flaky` fails, then passes on the retry, so Baton reports it **flaky**. It counts its runs in `.baton/flaky-runs` and passes on even ones.

A retry reruns only the failed tests. Then `baton encore <id>` reruns only `sign in`. A plain `baton perform` doesn't run `e2e-demo/`, so it still passes.
