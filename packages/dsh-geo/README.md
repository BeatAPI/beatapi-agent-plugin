# BeatGEO for DeepSeek Harness

Connect Harness to an existing local BeatGEO workspace for brands, questions, AI visibility collection, citations, drafts and matched retests. SEO Research stays in the same brand dashboard and uses the same BeatAPI connection. Maintained by BeatAPI; a community integration, not an official DeepSeek product.

## Install

In Harness **Plugins → Add plugin**, enter `@beatapi/dsh-geo`, or run in your actual host profile:

```sh
dsh plugin --profile web add @beatapi/dsh-geo
```

After community approval and catalog refresh, search **BeatGEO** in dsh-market and click Install. Submission is not approval.

## First use

1. Set up and start [BeatGEO](https://github.com/BeatAPI/BeatGEO) locally. The product requires Node.js 24 and its normal local setup; this connector itself requires Node.js 22.12+. It does not install/start PostgreSQL, the worker or the dashboard.
2. Create a suitably scoped **MCP API key in BeatGEO workspace settings**. Put it in the Harness credential store as `BEAT_GEO_MCP_TOKEN`. Never put it in chat. Reload this plugin after saving the credential.
3. The default endpoint is `http://localhost:3140/api/mcp`. `url` in plugin settings can select another loopback port. Use `beatgeo_connection` for setup guidance. The normal product MCP tools appear as `mcp__beatgeo__*` after a successful connection.

Alternatively, create `~/.beat-geo/harness-mcp.env` with `BEAT_GEO_MCP_TOKEN=<dashboard-issued key>`, set mode 600, and reload. Set `keyFile` to another absolute private file if needed. The bridge refuses symlinks, public-readable files, remote destinations and redirects. File credentials are re-read on each request, so key rotation/revocation applies to subsequent requests.

**The workspace MCP key is not the BeatAPI billing key.** Keep the billing key in BeatGEO Connections (`/setup`); SEO and GEO use that shared product connection. Never enter a provider key in the MCP key field.

Try: **“Use my existing brand, inspect the saved AI visibility evidence, and open its SEO Research page. Preview costs before paid queries and ask before enabling recurring monitoring.”**

## What is available

The bridge forwards only tools allowed by the key and deployment, preserving read-only and brand restrictions. The bundled Skill explains project reuse, collection readiness, idempotency, evidence, draft review and monitoring. It also guides the user/connected browser to the same brand's SEO page. SEO UI integration does not imply SEO-specific MCP query tools: inspect the actual tool catalog. This plugin does not expose a new paid SEO transport or duplicate product storage.

A missing service or credential leaves setup diagnostics and the Skill available; it does not claim the workspace is connected. No Harness version restriction is declared; future releases may change host APIs. Installing the connector starts no paid calls, monitoring or publishing. Browser collection still requires the product's BeatBrowser/Chrome setup and website login. Full installation/fixture evidence and unverified boundaries are in [validation](../../harness/VALIDATION.md).

[简体中文](README.zh-CN.md) · [Product Agent guide](https://github.com/BeatAPI/BeatGEO/blob/main/docs/beat-geo/agent-workflow.md)
