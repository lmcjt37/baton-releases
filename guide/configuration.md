# Configuration

`baton.config.ts` lives at the project root (in a monorepo that can be `apps/mobile`). It exports a plain object; Baton is **not** a dependency of your repo. `baton init` writes one for you; commit it so every worktree and teammate gets it.

## Example

```ts
export default {
  bundleId: 'com.example.app',
  app: {
    build: {                                          // or: path: 'ios/build/…/Example.app' (prebuilt)
      command: "cd ios && (cmp -s Podfile.lock Pods/Manifest.lock && [ -d build/generated ] || pod install) && cd .. && xcodebuild -workspace ios/Example.xcworkspace -scheme Example -configuration Debug -sdk iphonesimulator -destination 'generic/platform=iOS Simulator' -derivedDataPath {derivedData} build",
      output: '{derivedData}/Build/Products/Debug-iphonesimulator', // the .app, or its folder (picked by bundle id)
      // fingerprint: { include: ['native-config'], exclude: ['ios/fastlane'] },
    },
  },
  metro: { start: 'yarn start --port {port}' },     // {port} is filled in by Baton; none for native apps
  // connect: 'devClient',                         // Expo dev-client apps; `baton init` sets this
  android: {                                        // optional: `baton perform --platform android`
    applicationId: 'com.example.app',
    app: {
      build: {                                      // or: path: 'android/app/build/…/app-debug.apk'
        command: 'cd android && ./gradlew assembleDebug -PreactNativeArchitectures=arm64-v8a',
        output: 'android/app/build/outputs/apk/debug/app-debug.apk',
        // testOutput: '…/apk/androidTest/debug/app-debug-androidTest.apk', // Detox and instrumentation (or testPath with path)
      },
    },
    // emulator: { systemImage: 'system-images;android-36;google_apis;arm64-v8a' }, // default: newest arm64 image
    env: { APP_ID: 'com.example.app' },             // layered over `env` for Android Concerts
  },
  // runner: 'detox',                               // default 'maestro'; see "Test runners"
  // ios: { runner: 'xcuitest' },                  // per platform; android.runner: 'instrumentation'
  flowsDir: '.maestro',                              // default: .maestro (Maestro) or e2e (Detox)
  // maestro: { args: [...] },                     // extra `maestro test` args (detox: { args } for Detox)
  simulator: { deviceType: 'iPhone 17', runtime: 'iOS-26-5' }, // default: the newest iOS runtime and an iPhone it supports
  defaultActs: 2,                                    // default 1

  envFiles: ['.env.local'],
  env: {
    APP_ID: 'com.example.app',                        // a string
    BRANCH: { exec: 'git rev-parse --abbrev-ref HEAD' }, // a command's stdout
    TOKEN: async ({ worktree, concert }) => {         // a function, using the worktree's own code
      const { getToken } = await import(`${worktree}/scripts/e2e/token`);
      return getToken(concert.env.ENVIRONMENT);
    },
  },

  hooks: {
    beforeMetro: 'yarn codegen',                      // e.g. generate gitignored sources
    beforeAct: async ({ worktree, udid }) => { /* per-simulator setup, e.g. fixtures */ },
    // For --affected runs: map changed files to flows. Return { flows } (exact files), { tests } (test ids), { tags } or { excludeTags }.
    selectFlows: ({ changedFiles }) =>
      changedFiles.some(f => f.startsWith('src/checkout/')) ? { tags: ['checkout'] } : {},
  },
  affected: { base: 'origin/main' },                  // optional; defaults to origin/main, main, origin/master, then master

  programmes: {
    smoke: { tags: ['smoke'], acts: 2, env: { ENVIRONMENT: 'staging' } },
    nightly: { args: ['--config', '.maestro/nightly.yaml'] }, // added after maestro.args
  },
};
```

## Programmes

A programme is a named set of options for `baton perform <name>`. Each field is optional:

| Field | |
|---|---|
| `flows` | Flow files or folders (Maestro, Detox) |
| `tests` | Test ids or classes (XCUITest, instrumentation) |
| `tags`, `excludeTags` | Run flows with any of `tags`, skip those with any of `excludeTags` |
| `acts` | Acts to split across (default `defaultActs`) |
| `retries` | Retries for failed flows (default 0) |
| `env` | Env for this programme, over `env` |
| `args` | Runner args, after `maestro.args` or `detox.args` |

## The app build

When `baton init` finds an Xcode workspace or project, it configures **`app.build`**. Baton then builds the simulator app itself whenever the worktree's **native fingerprint** has no cached build: `ios/` (`android/` for Android), native dependency versions, `patches/`, `app.json`, `app.config.js`/`.ts`, `react-native.config.js`, any `fingerprint.include` paths, the build command and the toolchain (the Xcode version, or the JDK for Android). Builds are cached in `~/.baton/binaries/`, so worktrees with the same native code share one, and JS-only branches never rebuild.

**`{derivedData}`** in `command` and `output` becomes a DerivedData folder of the Stage's own (`~/.baton/derived/<stage>`), so its rebuilds are incremental. Baton empties it after a failed build.

If you'd rather build yourself, set `app.path` to a prebuilt Debug simulator `.app` instead. A build from Xcode works, and `init` also searches Xcode's DerivedData. XCUITest also needs the `.xctestrun` that `build-for-testing` writes: `app.build.xctestrun` (a glob works) or, with `app.path`, `app.xctestrun`.

**Android only:** with an `android` block, leave out `bundleId` and `app`. The project then runs on Android without `--platform android`.

Each Concert's `build.log` and the dashboard's **Details** show where the build ran (DerivedData), where it wrote the app, and Baton's cached copy.

## Metro

`metro.start` defaults to `npx react-native start --port {port}`; Metro also gets `RCT_METRO_PORT`. `metro.entry` (default `index`) is the bundle Baton builds before the app launches, and `metro.readyTimeoutMs` (default 2 minutes) is how long Metro has to start. A Stage's Metro runs until it's idle for `metroIdleMs`, and its log is `~/.baton/logs/metro-<stage>.log` (`baton logs --stage <id|path>`).

## Env

**Load order** (later wins): `~/.baton/env` → `envFiles` → `env` strings → programme `env` → per-run `-e K=V` → `exec`/function values. Everything reaches the Concert's processes (the build, Metro, Maestro, Detox). Only values declared in `env`, a programme or `-e` are passed to the tests themselves: to Maestro as `-e`, to XCUITest tests as their environment (`ProcessInfo.processInfo.environment`) and to instrumentation tests as `InstrumentationRegistry.getArguments()`. Detox tests read everything from `process.env`.

**`exec` and function values** are worked out per Act, once its device is ready, so they reach `beforeAct` and the tests, not the build or Metro. A Stage's Metro keeps the env of the Concert that started it, so a later Concert's programme `env` or `-e` doesn't reach it.

**Functions and hooks** run in a child process per Concert, with the worktree as its working directory. A hang or crash in your code affects only that Concert, never the daemon. That process has only basic shell variables (`PATH`, `HOME`, `JAVA_HOME` and the like), not `~/.baton/env`, `envFiles` or `env`; functions get the Concert's env as `ctx.concert.env`.

**String hooks** and `{ exec }` hooks fill in `{worktree}`, `{stageId}` and `{platform}`, plus `{port}` (Metro's) and, for `beforeAct`, `{udid}` and `{actIndex}`. `hooks.selectFlows` can also be `{ exec }` printing JSON.

## Test runners

`runner` picks the project's test runner: `'maestro'` (default) or `'detox'`. `ios.runner` and `android.runner` override it per platform (see below). Baton calls each test a **flow**: a Maestro flow file, a Detox test case (`it`), or an XCUITest or instrumentation test method.

**Args.** `maestro.args` or `detox.args` are added to every run's command, then the programme's `args`. Baton rejects flags it sets itself (such as Maestro's `--shard-split` or Detox's `-c`). Detox passes args through a shell, so each Detox arg must be one word: put a flag and its value in separate strings.

**Per platform.** `ios.runner: 'xcuitest'` runs a native app's XCUITest UI tests on iOS, and `android.runner: 'instrumentation'` its Espresso or Compose tests on Android; `runner` stays the default for the other platform. These tests are chosen by id (`--test AppUITests/LoginTests`, `--test com.example.LoginTests`, a programme's `tests`) rather than flow files. XCUITest tags are `_<tag>_` in test names; instrumentation tags are annotations. Setup and artifacts: [XCUITest](xcuitest.md), [Android instrumentation](instrumentation.md).

**Detox** (iOS and Android). Baton extends your Detox config with its own device, the cached app build and the Stage's Metro, and splits test files across Acts. Tags are `#words` in test names (`it('signs in #smoke', …)`), and tests read env from `process.env`. On Android, the build also makes Detox's test APK (`android.app.build.testOutput`). Setup, what Baton generates and limits: [Detox](detox.md).

## Affected runs

`--affected`, MCP `affected: true`, or **Affected flows** in the dashboard pass `hooks.selectFlows` every file the worktree has changed: committed since its merge-base with the base branch, **plus uncommitted and untracked work**. Paths are relative to the project root. It also gets the Concert's `platform`. Return `{ flows }` (flow files), `{ tests }` (test ids, for XCUITest and instrumentation) or `{ tags }`. If nothing is affected, the Concert finishes as **skipped**: nothing boots and it exits 0.

## Native apps (no Metro)

A project with no `metro` block and no `react-native` or `expo` dependency is **native**: Baton starts no Metro, skips the bundle check and writes nothing into the app, and each worktree still gets its own devices and its own cached build. Run Maestro flows, XCUITest or instrumentation tests against a Swift/Kotlin app this way; see [Native apps](native.md). `baton init` puts the config in the nearest React Native project, else the nearest folder holding `ios/` or `android/` projects, else the nearest Xcode project or workspace, or Gradle build.

A native build's fingerprint covers the whole project root (minus build output, the other platform's `ios/` or `android/` folder, `node_modules`, `.git`, `.github`, `.vscode`, `.baton`, `.maestro` and `baton.config.ts`), since native source can live anywhere. Trim it with `app.build.fingerprint.exclude`. Native branches rebuild more often than React Native ones, so consider raising `maxBuilds` in the machine config.

## Android

Android shares Metro, flows, hooks and programmes with iOS; only the app, its id, its runner and env overrides differ. Hooks and dynamic env values get `platform`, and on Android `udid` is the emulator's adb serial.

Baton creates its emulators in its own AVD folder (`~/.baton/avd`), headless, on console ports from 5600, so your own AVDs and emulators are never touched. It installs the APK with every runtime permission granted. Each emulator's network goes through its own proxy in Baton, which sends the app's default dev server, `10.0.2.2:8081`, to the Stage's Metro. Nothing is written into the app, so `clearState` flows keep loading the right bundle and one build serves every worktree. Keep the app on the default dev server (no custom host or port). Emulators run without virtual Wi-Fi, so the guest sees a cellular connection.

The first boot of each emulator saves a snapshot, and later boots resume from it in about 5 s instead of about 20 s. Each snapshot takes about 2 GB of disk; turn them off with `emulatorSnapshots: false`.

**Expo dev clients** work on Android too. Baton opens the dev launcher straight at the Stage's Metro. For flows that use `clearState`, which wipes the launcher's memory of it, set the launcher's default URL in `app.json` and rebuild (`baton init` warns when it's missing):

```json
"plugins": [["expo-dev-client", { "android": { "defaultLaunchURL": "http://10.0.2.2:8081", "skipOnboarding": true, "showMenuAtLaunch": false, "toolsButton": false } }]]
```

## Machine settings

`~/.baton/config.json`:

| Setting | Default | |
|---|---|---|
| `maxSimulators` | 4 | Simulator budget |
| `maxEmulators` | 2 | Emulator budget (each takes about 4 GB of RAM) |
| `androidSdk` | `ANDROID_HOME`, `ANDROID_SDK_ROOT`, then `~/Library/Android/sdk` | Android SDK location (the first that has `platform-tools/adb`) |
| `metroPortRange` | `[8082, 8099]` | Ports for each Stage's Metro |
| `warmSimulatorMs` | 5 minutes | How long devices stay booted after a Concert |
| `metroIdleMs` | 30 minutes | How long an idle Metro keeps running |
| `daemonIdleMs` | 1 minute | How long an idle daemon keeps running |
| `infraRetries` | 2 | Automatic retries for infra failures |
| `bundleCheckTimeoutMs` | 90 seconds | How long the app has to connect to its Metro |
| `stallMs` | 5 minutes | Stop the test runner when it prints nothing and writes no output for this long, and report an infra error (`0` turns this off). Was `maestroStallMs` before 2.0 |
| `binaryCacheGb` | 10 | Size cap for cached app builds |
| `derivedDataCacheGb` | 30 | Size cap for every Stage's DerivedData together; the least recently built goes first (`0`: no cap) |
| `derivedDataMaxAgeDays` | 14 | Delete a Stage's DerivedData after this long without a build (`0`: never) |
| `artifactMaxAgeDays` | 30 | Delete a Concert's artifacts this long after it finished, always keeping each Stage's latest Concert (`0`: never) |
| `maxBuilds` | 1 | App builds that may run at once across Stages; raise it for native projects, whose branches rebuild often |
| `emulatorSnapshots` | `true` | Boot emulators from a snapshot (~2 GB of disk per emulator) |

`BATON_HOME` moves `~/.baton` (and so this file) elsewhere, and `BATON_SOCKET` the daemon's socket; useful for a second, isolated daemon.
