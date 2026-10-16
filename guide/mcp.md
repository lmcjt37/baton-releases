# MCP: let agents use Baton

```sh
claude mcp add --scope user baton -- baton mcp
```

Any MCP client can launch `baton mcp`, which speaks MCP over stdio. It starts the daemon when needed and tells agents never to start Metro, simulators or emulators themselves. A typical agent turn is a single call to `baton_perform_and_wait`, followed by reading the screenshots it returns.

| Tool | |
|---|---|
| `baton_perform_and_wait` | Run flows for a worktree and wait. Returns pass/fail per flow, failure reasons, screenshot paths and a next step. Sends progress notifications. `affected: true` runs only what the worktree's changes affect; `platform: 'android'` runs on emulators. |
| `baton_perform` / `baton_await` | The same, split into queue-now and wait-later (for long runs) |
| `baton_status` | Stages, Concerts, budget, External processes |
| `baton_logs` | Maestro output for a Concert or Act, or a Stage's Metro log |
| `baton_encore` | Rerun only a finished Concert's failed (or flaky) flows, and wait for the result |
| `baton_cancel` · `baton_close_stage` | Cancel a run · stop a worktree's Metro and simulators |
| `baton_project` | Show a worktree's config and programmes; propose (or write) `baton.config.ts` if it's missing |

`worktreePath` defaults to the client's MCP root (or the server's working directory), and must be absolute when given.

Results include a `baton://concert/<id>` link, so a link in an agent's transcript opens that run in the [dashboard](app.md).
