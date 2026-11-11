# BeatAPI for Cursor and Grok Bot

Research social and web data, analyze SEO, and generate media through the hosted
BeatAPI MCP service. No local Node runtime or copied API key is needed by users.

## Current status

This is a local integration candidate, not a verified marketplace release.
`beatapi-cursor` is the proposed public OAuth client ID. It must be registered
and tested before distribution. The ChatGPT client's registration is not reused.
The shared service URL is `https://api.beatapi.io/mcp/openai`; its path name does
not establish compatibility with another host. No production service is changed
by building this package.

See [the official compatibility review](OFFICIAL-COMPATIBILITY.md) for the
documented host contracts and the later backend registration handoff. Local
adaptation work and offline checks do not require an already registered client.

## Operator setup

1. Register the public client `beatapi-cursor` in BeatAPI's remote MCP settings.
   Do not put a client secret or test account credentials in this repository.
   The config explicitly requests the six existing public capability scopes;
   do not add undocumented scopes or use the ChatGPT client's registration.
2. Cursor documents `https://www.cursor.com/agents/mcp/oauth/callback` for web
   and Agents, and `http://localhost:8787/callback` for desktop. Register exact
   callbacks only after confirming the actual flow. Never use wildcard callbacks.
   The current gateway's HTTPS-only callback validator cannot accept the desktop
   loopback callback. Do not bypass this check or claim desktop login works.
   With a static Client ID, the documented desktop flow sends that loopback URL;
   the plugin cannot fix the backend restriction with an invented callback override.
   Test the HTTPS web flow first; desktop support remains a release gate unless
   the host offers a supported HTTPS route or a separately reviewed gateway change.
3. Grok Bot supports a custom Remote HTTPS connector with an optional OAuth
   Client ID. Confirm its actual callback during testing; do not assume it matches
   Cursor's. Register only observed, officially supported callbacks. If its client
   setup differs, give it a separate client/config rather than sharing credentials.
4. Verify OAuth discovery, S256/PKCE, requested/granted scopes, token exchange,
   refresh, reconnect and revocation in each target host. A generated package or
   anonymous HTTP 200 is not an OAuth test. Check host Origin and CSP behavior too.

## Install and connect

For local Cursor review, copy the generated `dist/cursor` directory into
`~/.cursor/plugins/local/beatapi-agent-plugin`, then reload Cursor. Do not symlink
to a directory outside that local plugins folder. Enterprise policy may disable
local plugin imports. These are plugin files only; execution stays remote.

Open Customize, find BeatAPI, and complete Authenticate in the host. For Grok Bot,
use Connect apps > Add a custom connector > Remote HTTPS with the service URL and
registered client ID. A custom connector alone does not install this Skill; install
the Skill/plugin through the supported host flow before testing Skill behavior.

The public Cursor submission uses a public Git repository, not the ChatGPT ZIP or
the local Codex marketplace archive. A URL-only Grok Bot submission is also allowed,
but is not a guarantee of Skill distribution. Confirm both target listings with
the reviewers. Never certify in-app testing before it has actually succeeded.

## Offline adaptation checks

Run `npm run cursor:build` and `npm run cursor:check`. The build derives the
installed Skill from the shared remote instructions plus host-specific guidance;
packaging rejects stale guidance before replacing its output. The regression
suite tests both documented Cursor callback encodings with the official MCP SDK,
including S256/PKCE, state, explicit scopes, resource binding, public-client token
exchange and refresh. All exchange responses are fixtures; no real tokens are
issued, no account is connected, and no backend registration is required.

Cursor's documented MCP Apps support does not imply Grok Bot renders an identical
view. The Skill uses native UI progressively and defines concise chat output when
it is unavailable. Tool prefixes, tool approvals, team policies, account identity,
local media restrictions and routine creation boundaries are kept host-aware.

## Acceptance checks

- Discover and inspect capabilities; verify current input schemas and prices.
- Confirm inputs and price before one bounded paid run with owner approval.
- Read progress and an existing result without starting another task.
- Verify images, video links and metadata, both with MCP Apps and plain-chat fallback.
- Exercise denied scope, expired/revoked login, insufficient balance and invalid input.
- Verify public HTTPS media input; do not upload local files through a shell fallback.
- Record host versions, OAuth callback, outcomes and authorized spend without secrets.

## Read-only service check (2026-11-11)

The path-specific OAuth discovery endpoint
`https://api.beatapi.io/.well-known/oauth-authorization-server/mcp/oauth`
returned public-client authentication (`none`), S256 and refresh-token support.
The MCP `initialize` request without an Origin header returned HTTP 200. Requests
with the illustrative Origins `https://cursor.com` and `https://x.ai` returned
HTTP 403, `Origin is not allowed`. These Origins are test inputs, not verified
host traffic; this does not prove all Cursor/Grok Bot clients fail. Observe the
actual host request before reviewing the gateway allowlist. Do not broaden CORS
or trust arbitrary Origins to make the check pass. No business tools were called.

Client registration, the desktop callback restriction and actual host Origin
behavior are explicit integration gates; this candidate is not a launch-ready
package until those gates and the authenticated cases above pass.

Do not call paid tools merely to validate installation. Production client
registration, authenticated host tests, recording and marketplace approval remain
separate from local code validation. Existing API usage is billed by BeatAPI;
disclose that model to marketplace reviewers and resolve Publisher Terms section
3.1 before submission. Do not advertise this candidate as unconditionally eligible.

## Official references

- https://cursor.com/docs/reference/plugins
- https://cursor.com/docs/mcp
- https://cursor.com/help/security-and-privacy/marketplace-security
- https://docs.x.ai/grok-bot/computer-and-apps
- https://x.ai/bot/marketplace/submit-a-plugin
- https://cursor.com/marketplace-publisher-terms
- https://docs.x.ai/grok-bot/skills-routines-and-automations
