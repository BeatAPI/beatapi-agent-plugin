# Official compatibility review

Reviewed 2026-11-11. This records documented host behavior and local adaptation,
not marketplace approval or a successful production account connection.

| Area | Official contract | Local implementation |
| --- | --- | --- |
| Cursor plugin | `.cursor-plugin/plugin.json`, relative component paths, public Git repository | Existing manifest points to the remote-only Skill and `mcp.json`; isolated build contains only referenced assets and documentation |
| Remote transport | Cursor supports Streamable HTTP; Grok Bot accepts Remote HTTPS | Shared hosted URL, no `command`, `cwd`, environment credentials or shell fallback |
| Static OAuth | Cursor supports `auth.CLIENT_ID`, optional `scopes` and optional secret for confidential clients | Dedicated public client candidate, explicit six existing capability scopes, no secret; no OpenAI-specific auth extension |
| Authorization | Cursor documents PKCE, resource metadata and refresh tokens; Grok Bot offers host-managed app authentication | Host owns the flow and token storage; plugin never collects tokens; offline SDK tests cover S256, state, resource, public-client exchange and refresh |
| Tool discovery | Cursor exposes plugin MCP tools with a plugin prefix | Skill resolves actual advertised tools and schemas; never guesses a prefixed tool or uses a different installed connection |
| UI | Cursor supports MCP Apps with progressive enhancement | Reuse the server's existing view when rendered; otherwise provide actual media links, state and concise data in chat; no second UI implementation |
| Grok Bot skills | Apps and packaged skills are installed from Connect apps | Skill is bundled in the repository; a manually added URL alone is not represented as installing that Skill |
| Approval | Host tool approval and enterprise MCP policies apply | No instructions to bypass approval or policy; paid work remains within explicit scope; a one-time task does not authorize a routine |
| Attachments | A Bot's command environment is its computer, not the user's local machine | No workspace/file scanning or implicit uploads; unsupported attachments require an approved HTTPS input |

## Explicit permissions

`mcp.json` names `mcp:catalog:read`, `mcp:usage:read`, `mcp:tasks:read`,
`mcp:media:create`, `mcp:data:read` and `mcp:models:run`. These are the six scopes
advertised by the existing service in the prior read-only check, not new backend
permissions. Listing them explicitly avoids depending on implicit scope discovery
and avoids silently requesting future permissions. No `offline_access` scope is
invented: the service already advertises refresh-token support without it.

## Backend registration handoff, not part of this local change

- Public client ID candidate: `beatapi-cursor`; no client secret.
- MCP resource: `https://api.beatapi.io/mcp/openai`.
- Cursor web/Agents callback: `https://www.cursor.com/agents/mcp/oauth/callback`.
- Cursor desktop callback: `http://localhost:8787/callback`.
- Cursor documents that a static Client ID makes desktop send its desktop callback.
  A client-side `redirect_uri` override is not documented; none is invented here.
  The current gateway's HTTPS-only validator must be reviewed separately before
  claiming desktop support. Merely registering an ID does not fix that restriction.
- Grok Bot supports an OAuth Client ID field, but the reviewed pages do not specify
  its exact callback. Capture/confirm it during real connection setup. Do not guess
  it, whitelist a wildcard, or assume the ChatGPT callback applies. Split its client
  registration if the host requires separate identity; no second business backend
  or duplicate Skill is needed.
- Test actual request Origins before changing an allowlist. The earlier 403 values
  came from illustrative headers, not observed Cursor/Grok Bot traffic.

Offline SDK callback tests exercise protocol encoding only: they do not show that
the gateway accepts either callback, or that either host has authenticated.
After registration, test discovery, consent, execution permissions, refresh,
revocation and result rendering independently in each intended host surface.

## Official sources

- [Cursor plugin structure, MCP configuration and submission](https://cursor.com/docs/reference/plugins)
- [Cursor transports, static OAuth, callbacks, approval and MCP Apps](https://cursor.com/docs/mcp)
- [Grok Bot Remote HTTPS, client ID, app connections and token isolation](https://docs.x.ai/grok-bot/computer-and-apps)
- [Grok Bot packaged skills, approval boundaries and routines](https://docs.x.ai/grok-bot/skills-routines-and-automations)
- [Grok Bot/Cursor marketplace submission fields](https://x.ai/bot/marketplace/submit-a-plugin)
