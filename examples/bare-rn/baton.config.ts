// Baton project config. Plain object: Baton is not a dependency of this repo.
// Functions may be used for env values and hooks; they run in a child process rooted at the worktree.
export default {
  bundleId: 'org.reactjs.native.example.BatonSample',
  app: {
    // Baton builds the app when its native fingerprint changes, and caches it (`baton cache ls`).
    build: {
      command:
        "cd ios && (cmp -s Podfile.lock Pods/Manifest.lock && [ -d build/generated ] || pod install) && cd .. && xcodebuild -workspace ios/BatonSample.xcworkspace -scheme BatonSample -configuration Debug -sdk iphonesimulator -destination 'generic/platform=iOS Simulator' -derivedDataPath {derivedData} ARCHS=arm64 ONLY_ACTIVE_ARCH=YES build",
      output: '{derivedData}/Build/Products/Debug-iphonesimulator', // Baton picks the .app whose bundle id matches
    },
  },
  // Android emulators: `baton perform --platform android`.
  android: {
    applicationId: 'com.batonsample',
    app: {
      build: {
        command: 'cd android && ./gradlew assembleDebug -PreactNativeArchitectures=arm64-v8a',
        output: 'android/app/build/outputs/apk/debug/app-debug.apk',
      },
    },
    env: { APP_ID: 'com.batonsample' }, // overrides env for Android Concerts
  },
  metro: { start: 'npm start -- --port {port}' },
  flowsDir: '.maestro',
  defaultActs: 1,
  env: { APP_ID: 'org.reactjs.native.example.BatonSample', EXPECTED_MARKER: 'main' }, // passed to Maestro as -e; add strings, { exec } or functions
  // newest installed runtime
  simulator: { deviceType: 'iPhone 17', runtime: 'iOS-26-5' },
  // envFiles: ['.env.local'],
  hooks: {
    // Which flows a change affects, for `baton perform --affected`: edited flows run themselves,
    // app code runs the smoke suite, anything else (docs, config) runs nothing.
    selectFlows: ({ changedFiles }: { changedFiles: string[] }) => {
      const flows = changedFiles.filter(f => f.startsWith('.maestro/') && f.endsWith('.yaml'));
      if (flows.length) return { flows };
      return changedFiles.some(f => /^(App\.tsx|index\.js|src\/)/.test(f)) ? { tags: ['smoke'] } : {};
    },
  },

  programmes: {
    smoke: { tags: ['smoke'], acts: 2 },
  },
};
