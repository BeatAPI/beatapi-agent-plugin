# OpenAI remote MCP + Skill submission

Public distribution targets **With MCP**, not Skills only or desktop-only.
The owner has confirmed developer access and identity verification. This does
not establish that an endpoint, OAuth connection, tool scan or review has passed.

The local marketplace, Cursor/Grok manifests, canonical `skills/beatapi-video`
and Harness packages remain independent. Do not upload local stdio wiring as
the public plugin. The retired `beatapi-video-skill.zip` is not a replacement
for a remote connection and is no longer built or attached to releases.

## Package source

- `REMOTE-SKILL.md` is packaged as `skills/beatapi/SKILL.md`, without local
  software, file access or raw REST fallback.
- `remote-tools.json` records the discovery and generated execution convention,
  not a second fixed catalog. `scripts/remote-capabilities.mjs` compiles one
  execution tool per supported reference plus bounded status/result tools.
- The Skill covers social/web research, text and decision models, images,
  videos and media workflows. Social data is read/research-only, not posting.
- The portable manifest preserves the existing plugin identity and icons,
  with remote-specific listing copy and three starter prompts.
- Built root `mcp.json` contains only the supplied remote OAuth configuration.
  Repository root `mcp.json` remains Cursor's local stdio configuration.
- Credentials are never packaged. Draft cases are not imported as executed
  evidence. Final review cases and recording metadata still need to be added
  after the hosted service is tested.

## Backend dependency

No production review endpoint is declared here yet. Existing `https://beatapi.io/mcp`
is a manual API-key integration. On 2026-11-03 anonymous initialize returned 401
without an OAuth challenge. Do not call it OAuth merely by changing a manifest.
Keep that endpoint compatible for existing users.

`../beat-new-api` owns user-bound OAuth grants, tokens, revocation, scopes,
PKCE S256 and the remote MCP implementation. `../beatapi` owns the sign-in,
consent and connected-application UI. Reuse existing task, billing and idempotency
chains; never use a shared billable identity or grant dashboard administration.

The local gateway now implements this bridge in `service/beatmcp` and
`router/beatapi-mcp-executor.go`, using the official Go MCP SDK. It remains
default-off. The implementation has shipped as gateway `ee619e934` and frontend
`8db4ef4a9` through their production workflows on 2026-11-03, but the OAuth/MCP
feature has not been activated. Anonymous hosted MCP and metadata probes now
return uncached 404, rather than dashboard HTML; the English and Chinese
frontend consent pages and their client assets are reachable and excluded from
the shared page cache. This is code-delivery evidence, not a host connection.
The gateway loads the compiled v2 artifact only via
`BEAT_MCP_CATALOG_PATH`; OAuth configuration, explicit table migration, real host
registration and provider E2E evidence remain activation/release-acceptance prerequisites.

Production workflow evidence:
- https://github.com/fengshao1227/beat-new-api/actions/runs/41638961380
- https://github.com/erickkkyt/BeatAPI/actions/runs/41638442741

The follow-up frontend full check passed 386 files / 2,876 tests and its Worker
build; the controller race run passed 756 top-level cases with three explicit
environment-dependent skips. Router and middleware race checks passed again
after the production-discovered SPA fallback fix. The final Linux ARM64 gateway
build also passed. Ego Browser's full UI rehearsal in this run was blocked by
navigation/CDP timeouts; HTTP page checks are not browser OAuth acceptance.

Local acceptance now includes `TestMCPOAuthToolRunsThroughWalletAndIdempotency`
in the gateway's `router/mcp_browser_test.go`. It exchanges a real OAuth code
over HTTPS, invokes the actual MCP router using the official client, reaches a
loopback upstream through the existing native relay, and checks owner-wallet
charging, idempotent replay/conflict, failed-submit refund and revocation.
The database, funds, client registration and upstream are isolated fixtures:
this is not evidence of a real Codex install, a production callback or a paid
provider call. The consent/browser checks remain separate from this fixture.
PostgreSQL task JSON checks also cover retaining and clearing MCP grant
provenance with prepared statements both enabled and disabled. A native local
MySQL 8.4.13 run also passed OAuth storage/refresh/replay/revocation/cleanup,
token-column migration, token uniqueness migration, MCP task JSON retention and
clearing, and concurrent wallet reservation/refund with unrelated-key/account
isolation. All four targeted MySQL suites ran without skips using disposable
databases on a private Unix socket with TCP disabled. The server and data were
removed after testing; this is not a paid-provider or full hosted MCP E2E run.

The 2026-11-03 follow-up controller race run completed in 442 seconds:
756 top-level cases passed, three were skipped, and none failed. The earlier
realtime fixture leak is fixed by moving expiry-loop ownership into application
startup/shutdown, with cancellation propagated to due-session queries and an
explicit join before application exit. The request-worker regression was
observed failing before the fix and passing afterwards; service tests also
exercise in-flight query cancellation and a fresh loop lifetime. Service, model,
router, middleware, relay-common and MCP package race checks passed separately.
The gateway's embedded web assets, frontend typecheck, and native macOS/Linux
ARM64 Go builds passed locally using Bun 1.4.4 and Go 1.26.10. Native CLI help
also executed successfully. Docker image packaging/runtime and hosted-client
checks remain unverified; these local results do not establish release readiness.

Agree the actual production URL, resource, scopes, client registration and exact
tool schemas with the gateway before configuring the package. Exclude local
uploads, arbitrary administration and generic capability execution. Existing
API-key and three-tool integrations remain compatible and separate.

## One catalog, two transports

```bash
npm run submission:catalog -- --fetch
# Or use a complete, gateway-exported JSON array without network access:
npm run submission:catalog -- --catalog /absolute/path/to/contracts.json
```

The command reads only anonymous Search pages (full contracts, 50 at a time),
checks pagination completeness, and writes `dist/submission/remote-catalog.json`.
The v2 catalog mirrors OAuth policy in `_meta.securitySchemes` so standard SDK
clients retain it. A fresh fetch also saves `remote-catalog.contracts.json` for
reproducible offline rebuilds; earlier v1 artifacts must be rebuilt.
Execution tools request the matching data-read, model-run or media-create scope;
retrieval helpers request task-read. Non-array schema `examples` annotations are
normalized to arrays for strict SDK compatibility without changing constraints
or removing an input property named `examples`.
It does not call Run, authenticate, debit an account, or deploy anything.
`listed`, non-executable, missing-schema, credential-input and unresolved-ref
contracts are reported as exclusions, not silently exposed. Exclusions are
technical, not a claim about a platform's publishing capabilities or legal rights.

The generated tool input embeds the gateway input schema and requires a stable
idempotency key. The tool binding pins the reference on the server side; callers
cannot switch it or select another operation. `createRemoteDispatcher` validates
arguments with the MCP SDK's JSON Schema validator and emits the existing Run
body; it never holds credentials or performs HTTP calls. `adaptRemoteNext` rewrites
only protocol-level next calls to exposed names, never next fields embedded in
comments, pages or model results. Status and result reads cannot fall back to start.

This module is an integration boundary, not a deployed hosted server. The gateway
must register generated tools, keep discovery limited to exposed references,
enforce authenticated ownership/scopes, validate the current schema hash against
the pinned build, reuse billing/idempotency and apply next adaptation. A changed
contract requires rebuilding and scanning tools, not a dynamic executor bypass.
Generated OAuth declarations require authentication but do not define new grants:
the gateway must map operations to actual consented scopes. No tool may infer
authorization from metadata alone.
The SDK validator checks standard JSON Schema; gateway-specific formats (for
example image-size) still require the existing gateway validators. Do not treat
client-side schema validation as the billing, URL-safety or authorization boundary.
Large catalogs must be tested with real host tool discovery/pagination; never
embed hundreds of tool schemas in the Skill or assume host scan limits are proven.

Anonymous initialization must be allowed for public discovery. Preflight accepts
anonymous initialize with discoverable OAuth metadata as well as a standard 401
challenge; this does not itself verify per-tool anonymous access. The existing
API-key-only `/mcp` still needs server-side work, not just a new package manifest.

## Build and check

```bash
npm ci
npm run verify
```

`verify` runs offline checks and mock tests, including `submission:check`.
It builds local marketplace artifacts, but no public ZIP and no real user OAuth.
Network-dependent public packaging is separate from CI.

After the gateway is deployed, supply an actual portable MCP configuration
file outside the upload source. It must contain exactly `mcpServers.beatapi`,
type `streamable-http`, its production HTTPS URL, and
`extensions.com.openai.auth.type: "oauth"`. Set `auth.client.mode` to `provided`,
`dcr` or `cimd` according to the actual server. A provided client needs its real
`clientId`; client secrets belong only in secure Portal fields. Optional endpoint
overrides, resource and scopes must match discovery. Headers, environment
variables, keys and secrets are forbidden.

```bash
npm run submission:probe -- --mcp-config /absolute/path/to/actual-remote-mcp.json --catalog dist/submission/remote-catalog.json --report dist/submission/preflight.json
npm run submission:build -- --mcp-config /absolute/path/to/actual-remote-mcp.json --catalog dist/submission/remote-catalog.json
```

Preflight checks OAuth discovery and uses the official SDK Client and Streamable
HTTP transport to initialize anonymously and read every tools/list page. Each
generated operation must match its pinned title, description, input schema,
explicit risk annotations, SDK-visible OAuth policy and declared reference/schema
hash binding. Missing, extra, duplicate
or drifting tools, non-advancing pagination and absent anonymous discovery all
fail. Redirects, credentials and business-tool calls are refused. It does not
register clients, issue tokens, invoke Search/Inspect, or run paid tools.

For an OAuth-only diagnosis use `submission:probe -- --oauth-only --mcp-config ...`.
This cannot build a ZIP or claim that the tools work. `--report` requires probe
mode and writes an explicit metadata-only, metadata-matched or blocked status;
none is an assertion of user authorization, billing or review success. A successful
full report includes the pinned catalog SHA-256 and checks that remain unverified.

Missing configuration, a pinned v2 catalog, OAuth discovery or tool consistency
fails without producing a public ZIP.
Successful output is `dist/submission/beatapi-agent-plugin-remote.zip`, containing
`plugin.json`, `mcp.json`, the remote Skill, icons and LICENSE. Discovery does
not prove that a registered client, user consent, refresh or revocation works.

## Preparation stages

1. Source and build: generate a pinned v2 catalog, run `npm run verify`, then
   compare the actual hosted tools. This step can be automated without a key.
   A successful scan is metadata evidence only, not eight passed review cases.
2. Runtime and review rehearsal: wire gateway OAuth, consent and operation scopes;
   verify account isolation and the database matrix before production activation.
   Prefer a separately isolated preview deployment. The owner authorized shipping
   default-off code to production first; that does not authorize treating an
   inactive endpoint as an accepted host connection. The current Compose stack does not yet pass the MCP
   settings or mount the compiled catalog; preview wiring must explicitly supply
   both, exact host-issued redirect URIs and an explicitly migrated preview DB.
   Build the gateway's actual `web/dist` assets before the embedded application
   image; a backend-package test is not a complete application image build.
   Run all five positive and three negative cases in the intended host with a
   dedicated, funded review account and public fixtures. Resolve conceptual stages
   to exact scanned tool names and record actual outcomes, not proposed calls.
3. Application materials: verify listing URLs/icons and the exact publisher,
   supported countries and existing-account billing declaration; then record a
   real walkthrough. These facts must not be inferred from a successful build.

Suggested recording sequence, not a completed recording: show the installed
version and connected test account without secrets; discover and inspect a
research capability without spending; run one bounded approved query and show
its real sources; start one approved media task and show actual polling or final
output; finish with a request to post to a social account and the unsupported
explanation without a posting call. Record the broader text/decision and web cases
separately during rehearsal. Repeatedly processing is not a failed demo, but do
not edit it into fabricated completion. Verify playback and reviewer access before
adding an actual `review.demo_recording_url` to the package.

Reviewer passwords, tokens and any login instructions containing secrets belong
only in secure Portal reviewer-access fields. No recording, reviewer account,
country targeting or legal attestation is completed by this source change.

## Review handoff

1. Test clean host installation, OAuth login and consent rejection, refresh,
   expiry/revocation, scope failures and cross-user task isolation.
2. Scan actual tools; verify schemas and boolean risk annotations. Do not expose
   unreviewed operations behind generic discovery/execution tools.
3. Run the five positive and three negative cross-domain cases with a dedicated account.
   `test-cases.json` remains Draft, not run until real evidence exists. Resolve
   its conceptual stages to actual generated tool names during rehearsal and
   supply public media fixtures and owned task/result IDs. Balance is not a quote;
   do not promise spending limits unless the server enforces them.
4. Record real flows, verify the recording URL, then add tested cases/demo
   metadata to the final package. Reviewer credentials stay in secure Portal
   fields, not the repository or ZIP.
5. Confirm the verified publisher name, countries, commerce declarations and
   policy coverage. Existing listing links do not prove remote data practices
   match. Do not add checkout, credit purchases, upgrades or unauthorized relays.
6. Upload through With MCP. Verify imported metadata, domain verification,
   user authorization and tool/Skill scans. The owner completes attestations
   and submits; approval and Publish remain separate actions.

References checked 2026-11-03:
- https://developers.openai.com/plugins/build/plugins
- https://developers.openai.com/plugins/build/auth
- https://developers.openai.com/plugins/deploy/submission
- https://developers.openai.com/plugins/plugin-guidelines

[PROTOCOL]: 变更时更新此头部，然后检查 AGENTS.md
