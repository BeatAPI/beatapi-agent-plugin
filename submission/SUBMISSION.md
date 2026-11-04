# BeatAPI Agent Toolkit - OpenAI remote MCP + Skill submission

Public distribution targets **With MCP**, not Skills only or desktop-only.
The owner has confirmed developer access and identity verification. This does
not establish that an endpoint, OAuth connection, tool scan or review has passed.

## Current acceptance, 2026-11-04

The owner confirms that OAuth connection and tool invocation now work in ChatGPT.
An independent anonymous initialize of `https://api.beatapi.io/mcp/openai` returns
MCP JSON. These are distinct from a complete recorded run of the review cases.
Use [LAUNCH-CHECKLIST.md](LAUNCH-CHECKLIST.md) for the current release sequence and
remaining materials; the delivery history below is not current activation advice.

The public research/creation catalog now excludes seven exact
references (messaging deep links, device registration, guest credentials and
advertiser-session identity). The compiler owns the policy; catalog validation
rejects reintroduction, and the gateway built-in artifact is regenerated from it.
The new inventory is 982 tools including discovery. Gateway commit
046715b14826fba2bf1371908bede70159d409bb is deployed and a post-deployment
anonymous strict comparison matched every tool. See LAUNCH-CHECKLIST.md for the
deployment and catalog digest. An admin-selected uploaded catalog takes priority;
pushing a new built-in does not itself override it.
Website commit 26eb4bb711de717a25769be95e23f3e0fbf81016 deployed the OAuth
privacy and connected-application terms in English, Chinese and Japanese.
All six public pages returned 200 with the new text and date. See POLICY-ADDENDUM.md
for implementation evidence; publication is not legal sign-off or review approval.

The local marketplace, Cursor/Grok manifests, canonical `skills/beatapi-video`
and Harness packages remain independent. Do not upload local stdio wiring as
the public plugin. The retired `beatapi-video-skill.zip` is not a replacement
for a remote connection and is no longer built or attached to releases.

## Listing draft and owner decisions

The public display name is **BeatAPI Agent Toolkit** (21 characters). The stable
package ID remains `beatapi-agent-plugin`, and the remote Skill stays `beatapi`.
Local compatibility manifests keep their existing identity and display names.

| Field | Draft or remaining decision |
| --- | --- |
| Display name | BeatAPI Agent Toolkit |
| Subtitle | Research, SEO and AI creation |
| Category | Productivity |
| Description and starters | `createRemoteManifest` in `scripts/submission-package.mjs` is the authoritative package copy |
| Publisher | Owner confirmed Logiavox LLC on 2026-11-04; remote author.name and developerName use this value. Select and verify the matching business identity in the portal; local brand metadata remains BeatAPI |
| Countries | Owner requested all available countries; `publication.countries: []` removes directory country restrictions, not upstream or service eligibility limits |
| Commerce declaration | `review.commerce: false`: no plugin purchases or checkout. Execution consumes existing BeatAPI balance; top-ups occur independently on the BeatAPI website. The review description discloses both facts |
| Icons | Existing 180px composer icon and 1024px light/dark PNG logos; dark logo also supplies composerIconDark. Source checks enforce contained PNG paths, square dimensions, minimum resolution and 5 MiB maximum |

The listing explains free capability Search/Inspect separately from paid
execution, including web search. It covers social/web research, SEO analysis,
text/decision models, images/videos and media workflows without claiming social posting, private
messages, account administration, local uploads or credit purchases.

Creative copy references [CreativeClaw](https://creativeclaw.co/) (checked
2026-11-03) for task-first organization, not feature parity. Within the creative
section, describe product visuals, ad creatives, social images and short videos, then supported
inputs and selection. The pinned catalog includes product-video, music-video and
video-analysis workflows; live Inspect still controls availability and parameters.
Do not borrow its persistent brand/character kits, voice cloning, automatic
cross-model consistency, publishing, promotions or usage metrics.

The overall listing presents the complete toolkit before its individual use cases.
Research is a standalone outcome, not merely preparation for media generation.
Additional primary-source examples checked on 2026-11-03:

| Area | Reference and useful pattern | BeatAPI scope and evidence boundary |
| --- | --- | --- |
| Social research | [Brand24 MCP](https://brand24.com/mcp/) organizes questions around brand discussions, topics and competitor comparisons | Query available public posts/profiles/comments and compare sampled themes and engagement; do not imply continuous monitoring, complete mention coverage or measured population sentiment |
| Web research | [Parallel Search in ChatGPT](https://openai.com/business/plugins/parallel-search/) uses market briefs and source-linked vendor comparisons | The pinned web search/read/map/research contracts support finding and reading sources; a snippet or unread citation is not page evidence, and partial research stays partial |
| SEO | [Ahrefs in ChatGPT](https://openai.com/business/plugins/ahrefs/) leads with keyword opportunities, organic competitors and backlink patterns | The pinned SEO contracts cover keyword ideas/volume/intent/difficulty, domain comparisons, ranked keywords, top pages, backlinks, ratings and traffic estimates; this is not a promise of live rank tracking, first-party analytics, technical audits or AI-visibility monitoring |

These are writing references, not integrations, affiliations or claims of feature
parity. Scope was checked against `dist/submission/remote-catalog.contracts.json`,
not paid runtime results. Live discovery/Inspect and permissions remain authoritative;
the contract snapshot does not prove production execution. Preserve requested
country/language, observation dates, unknown-versus-zero values and provider-specific
metric scales. The remote Skill carries these interpretation rules, not a second
fixed endpoint/model list. The three listing starters now span social/web research,
SEO planning and creative production rather than two creative-only prompts.

The commerce declaration describes the absence of purchasing functionality, not
free execution. The [plugin guidelines](https://developers.openai.com/plugins/plugin-guidelines)
allow access to an existing paid account but prohibit selling digital credits or
promoting upgrades, including indirect upsells. Keep website top-ups a factual
review disclosure, not a plugin call to action. Insufficient balance must stop
execution without checkout links or top-up recommendations. Acceptance of this
balance-funded usage model remains subject to review; offsite payment alone does
not establish compliance.

The existing website, support, privacy and terms URLs are inherited from the
builder/local metadata. Verify public content and actual OAuth data-practice
coverage before submission; successful HTTP delivery alone is not policy sign-off.

Listing checks on 2026-11-03 found all four destinations publicly reachable with
the expected product, policy or repository content. The privacy and terms pages
have no explicit MCP/OAuth paragraphs yet. Review the real connected-account,
tool-result sharing, retention and revocation/deletion behavior before preparing
policy additions; do not invent legal commitments or treat this check as legal
approval. Existing PNG dimensions are 180x180 for the composer icon and
1024x1024 for both logos; the light composer and dark logo were visually inspected.

The owner has supplied the business name Logiavox LLC, and the public generated
demo-image fixture is documented in DEMO-ASSETS.md and included in the media case.
Policy coverage, tested review cases, reviewer access and a playable demo recording
remain incomplete. Publisher type, country
targeting and the balance/top-up arrangement were confirmed by the owner on
2026-11-03; this does not establish review approval.
Never store reviewer credentials in this repository or the public archive.

## Package source

- `REMOTE-SKILL.md` is packaged as `skills/beatapi/SKILL.md`, without local
  software, file access or raw REST fallback.
- `remote-tools.json` records the discovery and generated execution convention,
  not a second fixed catalog. `scripts/remote-capabilities.mjs` compiles one
  execution tool per supported reference plus bounded status/result tools.
- The Skill covers social/web research, SEO, text and decision models, images,
  videos and media workflows. Social data is read/research-only, not posting.
- The portable manifest preserves the existing plugin identity and icons,
  with remote-specific listing copy and three starter prompts.
- Built root `mcp.json` contains only the supplied remote OAuth configuration.
  Repository root `mcp.json` remains Cursor's local stdio configuration.
- Credentials are never packaged. The five positive and three negative draft cases
  are packaged under review.test_cases, not represented as executed evidence.
  Build verifies every named tool against the pinned catalog. The media image is
  publicly hosted and verified; real case outcomes and a playable recording remain incomplete.

## Historical backend delivery (2026-11-03, not current configuration)

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
npm run submission:build -- --mcp-config /absolute/path/to/actual-remote-mcp.json --catalog dist/submission/remote-catalog.json --demo-recording-url "$BEATAPI_REVIEW_DEMO_URL"
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

Missing configuration, a pinned v2 catalog, a demo recording URL, OAuth discovery or tool consistency
fails without producing a public ZIP. Set BEATAPI_REVIEW_DEMO_URL only after checking
real playback and reviewer access. The builder accepts HTTPS without embedded credentials
and writes review.demo_recording_url; URL validation does not verify the recording's content.
Successful output is `dist/submission/beatapi-agent-plugin-remote.zip`, containing
`plugin.json`, `mcp.json`, the remote Skill, icons and LICENSE. Discovery does
not prove that a registered client, user consent, refresh or revocation works.

## Preparation stages

1. Source and build: generate a pinned v2 catalog, run `npm run verify`, then
   compare the actual hosted tools. This step can be automated without a key.
   A successful scan is metadata evidence only, not eight passed review cases.
2. Runtime and review rehearsal: the owner has now accepted the hosted ChatGPT
   connection. Current remote MCP settings are managed in the gateway admin UI;
   the default-off delivery notes above are historical. Recheck the exact
   submission client's redirect URIs, scopes and production tool catalog before review.
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
only in secure Portal reviewer-access fields. No recording, reviewer account or
legal attestation is completed by this source change; all-available-country
targeting is already encoded from the owner's decision.

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
4. Record real flows, verify the recording URL, then finalize the packaged cases
   and add demo metadata. Reviewer credentials stay in secure Portal
   fields, not the repository or ZIP.
5. Select the verified Logiavox LLC identity and confirm policy coverage; check the imported
   all-country targeting and no-checkout commerce declaration against the owner's
   confirmed arrangement. Existing listing links do not prove remote data practices
   match. Do not add checkout, credit purchases, upgrades or unauthorized relays.
6. Upload through With MCP. Verify imported metadata, domain verification,
   user authorization and tool/Skill scans. The owner completes attestations
   and submits; approval and Publish remain separate actions.

References checked 2026-11-04:
- https://developers.openai.com/plugins/build/plugins
- https://developers.openai.com/plugins/build/auth
- https://developers.openai.com/plugins/deploy/submission
- https://developers.openai.com/plugins/plugin-guidelines

[PROTOCOL]: 变更时更新此头部，然后检查 AGENTS.md
