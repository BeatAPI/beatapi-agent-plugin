# Hosted media integration boundary

This is a design and local prototype, not a deployed or submission-ready server.

## Candidate surface

`BEATAPI_MCP_PROFILE=media-review node mcp/server.mjs` selects eight fixed
media/account tools. The default stays `local` with all 33 existing tools.
This stdio prototype needs a host-configured API key; it does not implement
OAuth, multi-user hosting or public HTTP. Do not deploy it with one shared key.

The candidate includes workflow listing, usage, music-video creation, shot
editing/media retrieval/composition, ecommerce-video creation and task lookup.
It excludes dynamic capability discovery/run, arbitrary model parameters,
local file access, CLI setup, long blocking polling, realtime and webhooks.
The schemas and annotations are reused from the local definitions rather than
copied. Unknown profile names fail closed. Unregistered tools cannot execute.

`outputSchema` currently wraps an unknown result. Hosted review still needs
concrete per-operation result contracts; this prototype does not satisfy that
requirement merely by having an outputSchema field.

## Owning sources checked 2026-10-07

- Gateway `router/beatapi-router.go` applies TokenAuth to /beat/v1; nginx maps
  the customer-facing /v1 prefix. Existing media handlers own routing, task
  billing and settlement. Reuse their service boundary; do not reimplement
  paid submission or replace the authenticated user with a server account.
- Gateway `middleware/auth.go` validates customer keys, user status, IP limits
  and group permissions. A reusable customer key is not an OAuth access token.
- Gateway `controller/beatapi_usage.go` calls BeatAccountUsage for the
  authenticated user. Task lookup must likewise retain ownership isolation.
- Gateway login-provider OAuth callbacks are for signing into BeatAPI.
  They do not establish a hosted MCP authorization-server implementation.
- Website `src/routes/mcp.ts` serves the existing manual-key generic facade.
  Preserve it for current integrations; its successful operation does not
  prove compatibility with the proposed directory surface.

## Gateway work required before enabling paid review

1. Add an independently routed Streamable HTTP MCP surface with this fixed
   tool contract. Enforce body limits, Origin/Host checks, protocol lifecycle
   and request cancellation using a maintained SDK, not a custom JSON-RPC
   parser. No endpoint URL is final until deployment routing is verified.
2. Establish explicit user consent and revocable, scoped authorization in the
   gateway. OAuth must validate PKCE S256, exact redirect URIs, audience/resource,
   expiry and one-time code use. Refresh rotation, revocation and client
   registration policy need an actual design and tests, not reuse of login
   OAuth callbacks. Do not return refresh tokens to model-visible tool results.
3. Bind every call to its authorized user; test cross-user task/shot access,
   revoked/expired tokens and insufficient scopes before positive fixtures.
   MCP session IDs are transport state, not authorization credentials.
4. Add a fixed workflow quote/estimate operation or another verifiable
   pre-submit cost path. The current eight-tool profile has no guaranteed
   quote operation. Positive cases requesting cost approval remain blocked;
   never infer a price from a balance or fabricate one. Preserve existing
   idempotency, reservation and settlement invariants for paid mutations.
5. Return customer-safe typed outputs and error codes; retain signed artifact
   URL semantics, scrub upstream/internal fields and credentials. Do not
   claim shot-media materialization is read-only: it can create hosted media.
6. Adapt the canonical Skill upstream to these fixed hosted tools, without
   instructing hosted users to install an unpublished CLI. Synchronize it here
   only after its owner has accepted the new contract.

Only then record real reviewer-account cases and a demonstration. Local tests
are boundary checks, not provider acceptance, billing validation or approval.
Publisher identity, distribution countries, commerce declarations and third-party
rights remain owner-confirmed decisions, not inferred implementation defaults.

[PROTOCOL]: 变更时更新此头部，然后检查 AGENTS.md
