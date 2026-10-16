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
  metro: { start: 'yarn start --port {port}' },     // {port} is filled in by Baton
  // connect: 'devClient',                         // Expo dev-client apps; `baton init` sets this
  android: {                                        // optional: `baton perform --platform android`
    applicationId: 'com.example.app',
    app: {
      build: {                                      // or: path: 'android/app/build/…/app-debug.apk'
        command: 'cd android && ./gradlew assembleDebug -PreactNativeArchitectures=arm64-v8a',
        output: 'android/app/build/outputs/apk/debug/app-debug.apk',
      },
    },
    // emulator: { systemImage: 'system-images;android-36;google_apis;arm64-v8a' }, // default: newest arm64 image
    env: { APP_ID: 'com.example.app' },             // layered over `env` for Android Concerts
  },
  flowsDir: '.maestro',
  simulator: { deviceType: 'iPhone 17', runtime: 'iOS-26-5' },
  defaultActs: 2,

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
    // For --affected runs: map changed files to flows. Return { flows } (exact files) or { tags }.
    selectFlows: ({ changedFiles }) =>
      changedFiles.some(f => f.startsWith('src/checkout/')) ? { tags: ['checkout'] } : {},
  },
  affected: { base: 'origin/main' },                  // optional; defaults to origin/main, then main

  programmes: {
    smoke: { tags: ['smoke'], acts: 2, env: { ENVIRONMENT: 'staging' } },
  },
};
```

## The app build

When `baton init` finds an Xcode workspace, it configures **`app.build`**. Baton then builds the simulator app itself whenever the worktree's **native fingerprint** has no cached build: `ios/`, native dependency versions, `patches/`, the build command and the Xcode version. Builds are cached in `~/.baton/binaries/`, so worktrees with the same native code share one, and JS-only branches never rebuild.

If you'd rather build yourself, set `app.path` to a prebuilt Debug simulator `.app` instead. A build from Xcode works, and `init` also searches Xcode's DerivedData.

Each Concert's `build.log` and the dashboard's **Details** show where the build ran (DerivedData), where it wrote the app, and Baton's cached copy.

## Env

**Load order** (later wins): `~/.baton/env` → `envFiles` → `env` strings → programme `env` → per-run `-e K=V` → `exec`/function values. Values declared in config, programmes or runs are passed to Maestro as `-e`.

**Functions and hooks** run in a child process per Concert, with the worktree as its working directory. A hang or crash in your code affects only that Concert, never the daemon.

## Affected runs

`--affected`, MCP `affected: true`, or **Affected flows** in the dashboard pass `hooks.selectFlows` every file the worktree has changed: committed since its merge-base with the base branch, **plus uncommitted and untracked work**. Paths are relative to the project root. If nothing is affected, the Concert finishes as **skipped**: nothing boots and it exits 0.

## Android

Android shares Metro, flows, hooks and programmes with iOS; only the app, its id and env overrides differ. Hooks and dynamic env values get `platform`, and on Android `udid` is the emulator's adb serial.

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
| `androidSdk` | `ANDROID_HOME`, then `~/Library/Android/sdk` | Android SDK location |
| `metroPortRange` | `[8082, 8099]` | Ports for each Stage's Metro |
| `warmSimulatorMs` | 5 minutes | How long devices stay booted after a Concert |
| `metroIdleMs` | 30 minutes | How long an idle Metro keeps running |
| `daemonIdleMs` | 1 minute | How long an idle daemon keeps running |
| `infraRetries` | 2 | Automatic retries for infra failures |
| `bundleCheckTimeoutMs` | 90 seconds | How long the app has to connect to its Metro |
| `binaryCacheGb` | 10 | Size cap for cached app builds |
| `emulatorSnapshots` | `true` | Boot emulators from a snapshot (~2 GB of disk per emulator) |
