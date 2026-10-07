# OpenAI Plugin Directory preparation

## Status and artifacts

Local installation is implemented. Public submission is **not ready**.
Registration is not verified publisher identity, successful scans or approval.
The intended production path is **remote MCP plus the canonical Skill**.

`npm run verify` builds `dist/submission/beatapi-agent-plugin-skills-draft.zip`.
This standalone portable draft includes plugin.json, skills/, brand icons, MIT
LICENSE and a prerequisite notice, excluding local MCP and private App bindings.
It needs compatible host MCP tools. The synchronized Skill references CLI
beatapi@0.4.0, but public npm returned E404 on 2026-10-07. CLI fallback is
blocked until the canonical Skill and a published CLI agree; do not silently
substitute an older CLI. Future CLI setup uses authentication outside chat and
absolute BEATAPI_CLI_PATH.
Do not upload it as a finished public plugin. Local execution and persistent
credentials need additional eligibility review. An existing Skills-only listing
currently cannot simply gain MCP; prefer completing the remote package first.

## Hosted integration prerequisites

See [HOSTED-INTEGRATION.md](HOSTED-INTEGRATION.md) for the inspected gateway
boundaries and locally testable eight-tool media candidate. This is a stdio
prototype, not a hosted MCP or OAuth implementation. Cost-approval cases also
need a verifiable quote path before they can run.

- Existing https://beatapi.io/mcp is a manual Bearer-key integration, not proof
  of directory compatibility. Do not hide unreviewed operations behind generic
  discovery/inspect/run execution.
- Expose individually reviewable operations with input/output schemas and
  explicit boolean readOnlyHint, destructiveHint and openWorldHint. Review
  paid actions and external data separately.
- Establish explicit, revocable user-bound authorization; evaluate OAuth.
  Keep identity, tokens, billing and permissions in the gateway, not this
  package or the marketing Worker. Never request API keys in chat.
- Review provider/data-source authorization and third-party terms before
  choosing coverage. Do not claim external platforms endorse BeatAPI.
- Declare the actual tested hosted MCP endpoint only after it is available.
  Preserve the existing public /mcp contract and local stdio installation.

## Listing and publication

The draft uses the local presentation, a subtitle of at most 30 characters,
three starter prompts, brand icons and four HTTPS resource URLs. Public support
uses repository Issues instead of a login-only ticket page. Privacy and terms
must be checked against actual uploads, downstream recipients, retention and
deletion; this repository change makes no new legal promise.

Owner confirmation is still needed for verified publisher identity, countries,
commerce and policy attestations. Do not infer BeatAPI business verification
from author.name or assume global availability. Unknown metadata stays absent.

## Review evidence and Portal

test-cases.json contains five positive and three negative **draft** cases for
focused media/account tools. Use them only if those exact tools are exposed
by the hosted review server; otherwise adapt them to its advertised surface.
They are not imported into the Skills-only draft and are **Not run against a
hosted review server**. Local mock tests do not prove production acceptance.

Provide public sample fixtures, a dedicated authorized reviewer account,
real results and an accessible demonstration recording. Keep credentials and
login instructions only in secure Portal fields, never the ZIP.

1. Select intended organization/project and verified developer identity with
   Apps Management Write permission.
2. After completing independent materials, upload the finalized remote MCP
   plus Skill package and inspect imported metadata.
3. Complete domain verification and authorized connection; resolve tool/Skill scans.
4. Run cases against the exact saved version and enter secure reviewer access.
5. Owner completes policy attestations and submits; approved publication is
   a separate authorized action.

References checked 2026-10-07:
- https://developers.openai.com/plugins/deploy/submission
- https://developers.openai.com/plugins/guides/submit-claude-plugin
- https://developers.openai.com/plugins/plugin-guidelines

[PROTOCOL]: 变更时更新此头部，然后检查 AGENTS.md
