# Limitations

- **Debug builds only** (simulator `.app`s and debug APKs), from `app.build` or a prebuilt `app.path`. With `app.path`, a branch that changes native code runs against that binary until you rebuild it.
- **iOS**: bare React Native, or Expo development builds (`expo-dev-client`, `connect: 'devClient'`). Expo Go isn't supported.
- **Android**: arm64 emulators, bare React Native or Expo development builds. The app must use the default dev server (`10.0.2.2:8081`), which Baton routes per emulator. Emulators run without virtual Wi-Fi (the guest sees a cellular connection). Expo dev clients need `defaultLaunchURL` set for `clearState` flows (see [Configuration](configuration.md#android)).
- **macOS only.** Baton drives Xcode's simulators and the Android emulator on a Mac.
- **Sessions in one worktree share it.** Two agents or people running Baton in the same worktree share its code, Metro and simulators, so one session's edits reach the other's runs. Their Concerts take turns, and Baton warns (⚠ worktree changed) when a Concert's code changed while it waited or ran. Give each session that edits code in parallel its own worktree.
- **A stuck Maestro is stopped after 5 minutes.** Under heavy load (Spotlight indexing, too many simulators) a `simctl` call can hang and Maestro waits on it forever. When Maestro prints nothing and writes no output for 5 minutes, Baton stops it and retries the Concert, then reports an infra error. A flow that legitimately stays silent longer needs a higher `maestroStallMs` in `~/.baton/config.json` (see [Configuration](configuration.md#machine-settings)).
- **Flows must assert a real screen.** A flow that only waits for "anything visible" passes on React Native's loading banner.
