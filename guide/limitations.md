# Limitations

- **Debug builds only** (simulator `.app`s and debug APKs), from `app.build` or a prebuilt `app.path`. With `app.path`, a branch that changes native code runs against that binary until you rebuild it.
- **iOS**: bare React Native, or Expo development builds (`expo-dev-client`, `connect: 'devClient'`). Expo Go isn't supported.
- **Android**: arm64 emulators, bare React Native or Expo development builds. The app must use the default dev server (`10.0.2.2:8081`), which Baton routes per emulator. Emulators run without virtual Wi-Fi (the guest sees a cellular connection). Expo dev clients need `defaultLaunchURL` set for `clearState` flows (see [Configuration](configuration.md#android)).
- **macOS only.** Baton drives Xcode's simulators and the Android emulator on a Mac.
- **Flows must assert a real screen.** A flow that only waits for "anything visible" passes on React Native's loading banner.
