# BeatAPI plugins for DeepSeek Harness

Three independently installable bundles with distinct tools and tasks:

| Bundle | Task | Tools | Install |
|---|---|---|---|
| [Social Research](../packages/dsh-social) | Social discovery, approved reads, stored results and source tables | 5 native | `dsh plugin --profile web add @beatapi/dsh-social@0.1.0` |
| [Media Kit](../packages/dsh-media) | Image/video discovery, pricing previews, approved starts and task status | 4 native | `dsh plugin --profile web add @beatapi/dsh-media@0.1.0` |
| [BeatBrowser](../packages/dsh-browser) | Existing Chrome logins and owned background TaskSpaces | 24 namespaced MCP tools | `dsh plugin --profile web add @beatapi/dsh-browser@0.1.0` |

Tested hosts: `0.1.0-rc.6` and `0.2.1-rc.2`, Node.js 22.12+. Community integrations by BeatAPI, not official DeepSeek products. Each bundle supplies a Skill and coexists with the others. Prebuilt JavaScript needs no install-time build script. Each package README documents GitHub installation too.

`harness/shared/` is synchronized into self-contained Social and Media packages by `npm run harness:sync`; `npm run harness:check` checks drift and offline behavior. To verify a host, run `node harness/scripts/host-smoke.mjs /absolute/path/to/@deepseek-ai/dsh`. It installs all three tarballs into a temporary profile, checks 33 tool registrations and three Skills, calls the report tool, then stops the host and removes temporary data. It never creates paid tasks or mutates existing profiles.

See [validation](VALIDATION.md) and [security](SECURITY.md) for evidence and limits.

For a reproducible test runtime, first run `node harness/scripts/install-host.mjs <version> /tmp/beatapi-dsh-host`. Its recorded official package versions avoid older prerelease caret ranges resolving a mixture of later RC packages. These pins affect the test host only, not the distributed plugins or the user's installation.
