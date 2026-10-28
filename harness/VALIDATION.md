# Harness validation — 2026-10-28

Status: implementation and package acceptance complete. Marketplace submission and package publication are separate states; see their actual links and receipts rather than treating tests as marketplace approval.

## Reproduced checks

| Check | Result |
|---|---|
| Offline DSH behavior tests | 14 passed; scope restrictions, missing credentials, safe errors, redaction, price previews, changed specifications, idempotency, result retrieval, task resume, CSV safety and compact discovery |
| Existing plugin validation | Standalone `npm run verify` passed, including contract/Skill/runtime checks, 20 existing tests, typecheck, generated MCP bundle and artifact builders |
| Harness `0.1.0-rc.6` | Three actual tarballs installed together in an isolated profile; 9 native tools, 24 browser MCP tools and 3 Skills registered; report execution passed |
| Harness `0.2.1-rc.2` | Same installation, registration, Skill and report checks passed |
| Live capability discovery | Actual X Social Data and image-model discovery plus contract inspection succeeded; these were free requests |
| Real browser through Harness | Both host versions created an owned background TaskSpace, read the Example Domain page through the namespaced snapshot tool and finished the space; Chrome extension 1.4.1 |
| Packaged browser dependency | Uses the published `@beatapi/beat-browser@1.4.1`, not unpublished FAST settings source |

`node harness/scripts/host-smoke.mjs /absolute/path/to/@deepseek-ai/dsh` reproduces isolated installation, 33 tools, three Skills and an offline report call. The dedicated GitHub workflow runs this against both declared host versions. It does not require website login or a connected Chrome extension and does not create browser pages or paid requests.

## Boundaries

- Real paid Social Data reads and image/video generation were not executed during this acceptance because no BeatAPI credential was configured in the isolated environment. Do not interpret discovery, `ready` or mocked paid responses as a successful real data read or generated asset.
- The payment workflow, transport and task resumption have offline regression coverage. A user with a key must approve actual inputs and current pricing before a real paid start. The acknowledgement is not a gateway-enforced spending cap.
- Platform/action coverage varies. Not every platform, data action, model, reference-media input, operating system or future Harness version has been tested.
- Browser acceptance read a public page. It did not certify authenticated account actions, posting, payments, CAPTCHA handling or unattended operation. Foreground interruption and explicit-resume requirements are retained.
- Report formatting uses clearly labeled fixture rows in offline tests. It does not claim that those rows are fetched social evidence.
- Media status returns remote task results. File upload, local file download and full timeline editing are not provided by this package.

The plugin readmes and proposed marketplace descriptions deliberately stay within these boundaries.
