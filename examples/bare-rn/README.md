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

## Failures, retries and Encore

```sh
baton perform demo
```

The `demo` programme runs the three passing flows plus two in `.maestro-demo/`, in one Act with one retry:

- `sign-in` always fails (the sample has no sign-in screen), with a screenshot and log in the Concert.
- `flaky` fails, then passes on the retry, so Baton reports it **flaky**. It counts its runs in iOS Settings and passes on even ones; on Android it always passes.

Then `baton encore <id>` reruns only `sign-in`. A plain `baton perform` doesn't run `.maestro-demo/`, so it still passes.
