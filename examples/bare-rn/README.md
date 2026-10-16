# Baton sample: bare React Native app

A minimal React Native 0.87 app (iOS and Android) to try Baton on before your own project.

## Setup

```sh
npm install
```

That's all. `baton.config.ts` uses `app.build`, so the first Concert runs `pod install` if needed and builds the app. The build is then cached by native fingerprint, and only native changes rebuild.

`baton.config.ts` started from `baton init`. Its hand edits are the `smoke` programme, the `EXPECTED_MARKER` env, and a toy `hooks.selectFlows` for `--affected` runs.

## Run

```sh
baton perform smoke              # 2 Acts; the flows assert the visible marker matches EXPECTED_MARKER
baton perform smoke -p android   # the same on Android emulators
```

To prove each Stage serves its own code, copy this directory and change `MARKER` in `App.tsx` and `EXPECTED_MARKER` in the copy's config. Then run `baton perform smoke` in both directories at the same time.
