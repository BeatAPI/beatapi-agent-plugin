# Harness validation — 2026-11-01

Status: implementation and package acceptance complete. Marketplace submission and package publication are separate states; see their actual links and receipts rather than treating tests as marketplace approval.

## Compatibility release 0.1.1 — 2026-11-01

The three packages declare `engines.dsh: "*"` and unrestricted optional DSH peers. This removes installation blocks tied to individual RC versions; it is not a claim that every future host is tested. All three locally packed 0.1.1 bundles passed installation, 33 tool registrations, three Skill registrations and offline report execution on hosts 0.1.0-rc.6, 0.2.1-rc.2 and 0.2.1-rc.5. No paid operations were started.

`npm run verify` passed with `BEATAPI_SKILL_SOURCE` pointing to an export of the recorded Skill commit `40ceddc0beadce4da61d8fd2d47e5dda70b8529c`. The nearby development checkout has newer Skill content; this release retains and verifies the repository’s pinned source.

## Reproduced checks (initial acceptance, 2026-10-28)

| Check | Result |
|---|---|
| Offline DSH behavior tests | 14 passed; scope restrictions, missing credentials, safe errors, redaction, price previews, changed specifications, idempotency, result retrieval, task resume, CSV safety and compact discovery |
| Existing plugin validation | Standalone `npm run verify` passed, including contract/Skill/runtime checks, 20 existing tests, typecheck, generated MCP bundle and artifact builders |
| Harness `0.1.0-rc.6` | Three actual tarballs installed together in an isolated profile; 9 native tools, 24 browser MCP tools and 3 Skills registered; report execution passed |
| Harness `0.2.1-rc.2` | Same installation, registration, Skill and report checks passed |
| Harness `0.2.1-rc.5` | Three locally packed bundles installed in an isolated profile; 9 native tools, 24 browser MCP tools and 3 Skills registered; offline report execution passed. Paid operations and live Chrome were not retested on this version. |
| Live capability discovery | Actual X Social Data and image-model discovery plus contract inspection succeeded; these were free requests |
| Real browser through Harness | Both host versions created an owned background TaskSpace, read the Example Domain page through the namespaced snapshot tool and finished the space; Chrome extension 1.4.1 |
| Packaged browser dependency | Uses the published `@beatapi/beat-browser@1.4.1`, not unpublished FAST settings source |

`node harness/scripts/host-smoke.mjs /absolute/path/to/@deepseek-ai/dsh` reproduces isolated installation, 33 tools, three Skills and an offline report call. The dedicated GitHub workflow runs this against the three recorded host versions. It does not require website login or a connected Chrome extension and does not create browser pages or paid requests.

## Boundaries

- Real paid Social Data reads and image/video generation were not executed during this acceptance because no BeatAPI credential was configured in the isolated environment. Do not interpret discovery, `ready` or mocked paid responses as a successful real data read or generated asset.
- The payment workflow, transport and task resumption have offline regression coverage. A user with a key must approve actual inputs and current pricing before a real paid start. The acknowledgement is not a gateway-enforced spending cap.
- Platform/action coverage varies. Not every platform, data action, model, reference-media input, operating system or future Harness version has been tested.
- Browser acceptance read a public page. It did not certify authenticated account actions, posting, payments, CAPTCHA handling or unattended operation. Foreground interruption and explicit-resume requirements are retained.
- Report formatting uses clearly labeled fixture rows in offline tests. It does not claim that those rows are fetched social evidence.
- Media status returns remote task results. File upload, local file download and full timeline editing are not provided by this package.

The plugin readmes and proposed marketplace descriptions deliberately stay within these boundaries.

## BeatDesign and BeatGEO bundles — 2026-11-02

- Product prerequisite verified: BeatGEO PR #28 merged as `e18b7c4739892232fd02055d063832ab45eb4c6a`, with all four PR checks passing. The main README documents the shared connection, twelve SEO endpoints, brand SEO page and reviewed-question import. Real paid SEO calls remain a separate acceptance.
- BeatDesign uses the published 0.2.5 runtime, not its unreleased source additions. Isolated bundle installs on the three recorded Harness versions start the local production workspace and register 30 MCP tools and its Skill. Project list, temporary project creation, Canvas handoff and HTTP health checks pass. The test asserts its database is in temporary storage.
- BeatGEO bundle installs on the same three hosts. Its proxy test uses a synthetic authenticated MCP fixture: permitted read-only discovery/call and missing-key setup behavior pass. It does not certify a real user's key, browser account, product database or paid SEO queries.
- The `beatgeo-mcp-catalog.json` fixture contains 27 public tool schemas exported through BeatGEO's real MCP server without invoking product handlers. Full-catalog tests check Harness schema ingestion; returned identity is clearly synthetic. These are not fetched brand analytics.
- Two transport-boundary regressions cover loopback-only URLs, credential-file privacy, symbolic links, malformed credentials and file rotation. Existing behavior tests remain in the full check.
- The SEO dashboard is accessed through the same brand URL and shared BeatGEO connection. No SEO-specific MCP execution API is claimed or duplicated by this connector.
- Package publication, public registry installation and community review are reported separately in the delivery record.
