# Public remote plugin preparation

The public package contains remote MCP connection metadata, the shared Skill,
brand assets and reusable review cases. It contains no local executor, customer
records, credentials, infrastructure configuration or internal review evidence.

## Build and verify

Run `npm run verify` for offline validation. Build the catalog from the current
public contract using `npm run submission:catalog`. For a release, use the
`submission:probe` and `submission:build` commands documented in the root README
with the actual remote configuration, matching catalog and a demo recording URL
whose playback and reviewer access have been verified separately.

A local build is not OAuth acceptance, successful paid execution, a completed
portal scan or marketplace approval. Register each host's OAuth client separately
and test its actual callback, scopes and result rendering. Never put reviewer
credentials into a public package, repository or recording.

## Private operator records

Keep test receipts, task IDs, recordings, portal screenshots, production rollback
records and deployment configuration in private operator storage. This repository
allowlists only reusable public submission inputs. Files ignored locally must not
be added with `git add -f`. Removing files from the current tree does not erase
previous public Git history; history remediation requires a separate decision.

[PROTOCOL]: 变更时更新此头部，然后检查 AGENTS.md
