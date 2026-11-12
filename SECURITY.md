# Security policy

The plugin must never send a BeatAPI API key through a model prompt or MCP tool
argument. Remote Cursor/Grok Bot connections use host-managed OAuth. Local
Codex/Grok Build connections use the supported credential store or the
`BEATAPI_API_KEY` process environment. Manifests declare variable names only;
never commit their values or the user's Codex configuration.

Operations that create one-time credentials, including webhook signing secrets,
are not exposed through the agent tools. Do not use an alternate transport to
bypass that boundary.

## Public repository boundary

Only reusable source, sanitized contracts, tests and public setup documentation
belong in this repository. Submission records, recordings, account details,
production request/task identifiers and infrastructure deployment configuration
are private operator material, even when they are not authentication secrets.
Keep them outside version control. Public submission build inputs are explicitly
allowlisted; `npm run privacy:check` rejects tracked files outside that boundary
and common credential-file names. This path check is not a complete secret scan.

Removing a tracked file does not erase earlier Git history, forks or caches.
Handle history cleanup separately and revoke any exposed credential immediately.

Paid task creation, shot editing, and composition are described as paid
mutations in MCP metadata. The plugin never retries authentication,
validation, insufficient-credit, or concurrency failures unchanged.

Use GitHub's private vulnerability reporting feature for security reports. If a
credential may have been exposed, revoke it immediately in the
[BeatAPI dashboard](https://beatapi.io/dashboard/apikeys).

The latest minor release is the supported release line.
