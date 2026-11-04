// Baton project config. Plain object: Baton is not a dependency of this repo.
// Functions may be used for env values and hooks; they run in a child process rooted at the worktree.
export default {
  // XCUITest runs the BatonNativeUITests target. Test ids are Target/Class/method; tags are _tag_ in names (test_smoke_showsMarker).
  ios: { runner: 'xcuitest' },
  bundleId: 'com.example.batonnative',
  app: {
    // Baton builds for testing when the native fingerprint changes, and caches the app and its test runner (`baton cache ls`).
    build: {
      command:
        "cd ios && xcodebuild build-for-testing -project BatonNative.xcodeproj -scheme BatonNative -configuration Debug -destination 'generic/platform=iOS Simulator' -derivedDataPath {derivedData} ARCHS=arm64 ONLY_ACTIVE_ARCH=YES",
      output: '{derivedData}/Build/Products/Debug-iphonesimulator',
      xctestrun: '{derivedData}/Build/Products/*.xctestrun', // its name includes the SDK and archs
    },
  },
  simulator: { deviceType: 'iPhone 17', runtime: 'iOS-26-5' },
  // Android emulators: `baton perform --platform android`. Instrumentation runs the Espresso and Compose tests; ids are pkg.Class#method.
  android: {
    applicationId: 'com.example.batonnative',
    runner: 'instrumentation',
    app: {
      build: {
        command: 'cd android && ./gradlew assembleDebug assembleAndroidTest',
        output: 'android/app/build/outputs/apk/debug/app-debug.apk',
        testOutput: 'android/app/build/outputs/apk/androidTest/debug/app-debug-androidTest.apk',
      },
    },
  },
  instrumentation: { tags: { smoke: 'com.example.batonnative.Smoke' } }, // annotation classes as tags
  defaultActs: 1,
  // XCUITest reads these from ProcessInfo.processInfo.environment; instrumentation from InstrumentationRegistry.getArguments().
  env: {
    EXPECTED_MARKER: 'main',
    // The flaky demo test fails on a Concert's first try and passes on the retry.
    FLAKY_FILE: ({ worktree, concert }: { worktree: string; concert: { id: string } }) => `${worktree}/.baton/flaky-${concert.id}`,
  },
  hooks: {
    // Which tests a change affects, for `baton perform --affected`: an edited test class runs itself,
    // app code runs the smoke tests, anything else (docs, config) runs nothing.
    selectFlows: ({ platform, changedFiles }: { platform: 'ios' | 'android'; changedFiles: string[] }) => {
      const tests = changedFiles.flatMap(f => {
        if (platform === 'ios') {
          const c = f.match(/^ios\/BatonNativeUITests\/(\w+)\.swift$/)?.[1];
          return c ? [`BatonNativeUITests/${c}`] : [];
        }
        const c = f.match(/^android\/app\/src\/androidTest\/java\/(.+Tests?)\.kt$/)?.[1];
        return c ? [c.replaceAll('/', '.')] : [];
      });
      if (tests.length) return { tests };
      const app = platform === 'ios' ? /^ios\/BatonNative\// : /^android\/app\/src\/main\//;
      return changedFiles.some(f => app.test(f)) ? { tags: ['smoke'] } : {};
    },
  },

  programmes: {
    smoke: { tags: ['smoke'], acts: 2 },
    // A failure and a flaky test, skipped otherwise: `baton perform demo`. One Act, so the retry uses the same device.
    demo: { env: { DEMO: '1' }, acts: 1, retries: 1 },
  },
};
