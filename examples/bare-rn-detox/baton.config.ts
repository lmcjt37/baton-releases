// Baton project config. Plain object: Baton is not a dependency of this repo.
// Functions may be used for env values and hooks; they run in a child process rooted at the worktree.
export default {
  // Detox runs the tests in e2e/ (flowsDir defaults to `e2e` for Detox), extending .detoxrc.js.
  runner: 'detox',
  bundleId: 'org.reactjs.native.example.BatonSample',
  app: {
    // Baton builds the app when its native fingerprint changes, and caches it (`baton cache ls`).
    build: {
      command:
        "cd ios && (cmp -s Podfile.lock Pods/Manifest.lock && [ -d build/generated ] || pod install) && cd .. && xcodebuild -workspace ios/BatonSample.xcworkspace -scheme BatonSample -configuration Debug -sdk iphonesimulator -destination 'generic/platform=iOS Simulator' -derivedDataPath {derivedData} ARCHS=arm64 ONLY_ACTIVE_ARCH=YES build",
      output: '{derivedData}/Build/Products/Debug-iphonesimulator', // Baton picks the .app whose bundle id matches
    },
  },
  // Android emulators: `baton perform --platform android`. Detox also needs its test APK.
  android: {
    applicationId: 'com.batonsample',
    app: {
      build: {
        command: 'cd android && ./gradlew assembleDebug assembleAndroidTest -DtestBuildType=debug -PreactNativeArchitectures=arm64-v8a',
        output: 'android/app/build/outputs/apk/debug/app-debug.apk',
        testOutput: 'android/app/build/outputs/apk/androidTest/debug/app-debug-androidTest.apk',
      },
    },
  },
  metro: { start: 'npm start -- --port {port}' },
  defaultActs: 1,
  env: { EXPECTED_MARKER: 'main' }, // Detox tests read these from process.env; add strings, { exec } or functions
  simulator: { deviceType: 'iPhone 17', runtime: 'iOS-26-5' },
  hooks: {
    // Which tests a change affects, for `baton perform --affected`: edited tests run themselves,
    // app code runs the smoke suite, anything else (docs, config) runs nothing.
    selectFlows: ({ changedFiles }: { changedFiles: string[] }) => {
      const flows = changedFiles.filter(f => /^e2e(-demo)?\/.*\.test\.js$/.test(f));
      if (flows.length) return { flows };
      return changedFiles.some(f => /^(App\.tsx|index\.js|src\/)/.test(f)) ? { tags: ['smoke'] } : {};
    },
  },

  programmes: {
    // Tags are #words in test names.
    smoke: { tags: ['smoke'], acts: 2 },
    // A pass, a failure and a flaky test in one Concert: `baton perform demo`. One Act, so the retry uses the same simulator.
    demo: { flows: ['e2e', 'e2e-demo'], acts: 1, retries: 1 },
  },
};
