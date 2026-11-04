# MCP: let agents use Baton

```sh
claude mcp add --scope user baton -- baton mcp
```

Any MCP client can launch `baton mcp`, which speaks MCP over stdio. It starts the daemon when needed and tells agents never to start Metro, simulators or emulators, or run the test tools, themselves. A typical agent turn is a single call to `baton_perform_and_wait`, followed by reading the screenshots it returns.

| Tool | |
|---|---|
| `baton_perform_and_wait` | Run flows for a worktree and wait. Returns pass/fail per flow, failure reasons, screenshot and video paths and a next step. Sends progress notifications. `flows` takes flow files (Maestro, Detox), `tests` takes test ids (XCUITest, instrumentation); `affected: true` runs only what the worktree's changes affect; `platform: 'android'` runs on emulators (the default for an Android-only config). |
| `baton_perform` / `baton_await` | The same, split into queue-now and wait-later (for long runs) |
| `baton_status` | Stages, Concerts, budget, External processes |
| `baton_logs` | Test runner output for a Concert or Act, or a React Native Stage's Metro log |
| `baton_encore` | Rerun only a finished Concert's failed (or flaky) flows, and wait for the result |
| `baton_cancel` · `baton_close_stage` | Cancel a run · stop a worktree's Metro (if any), simulators and emulators |
| `baton_project` | Show a worktree's config, programmes and runner setup warnings; propose (or write) `baton.config.ts` if it's missing |

`worktreePath` defaults to the client's MCP root (or the server's working directory), and must be absolute when given.

While a Concert waits, its progress says what for: a free simulator (`#2 in queue`) or another session's Concert on the same worktree (`waiting for Concert 1a2b3c4d (claude-code) on this worktree`). If the wait times out first, the result says it's still queued and to call `baton_await`, not to start another run. A summary starts with a warning when the worktree's code changed while the Concert waited or ran, which happens when sessions share a worktree.

Results include a `baton://concert/<id>` link, so a link in an agent's transcript opens that run in the [dashboard](app.md).
