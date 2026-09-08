# BeatAPI Agent Plugin

Create and manage BeatAPI text, image, video, Effect, workflow, analysis, and
Realtime APIs from Codex, Cursor, and Grok Bot. One repository ships
host-specific manifests over the same canonical `beatapi-video` Skill, locked
OpenAPI contract, typed client, and bundled local MCP server.

## What users can do

- discover stable image/video model aliases and published Effects;
- list authenticated text models and create non-streaming text responses only
  when the user explicitly asks to use BeatAPI for text;
- create image and video tasks through a model-agnostic request shape, plus
  versioned Effect tasks;
- analyze uploaded MP4 or MOV files through the async Video Analysis workflow;
- inspect workflows, USD balance, usage, and concurrency;
- upload local images, audio, video, and SRT files;
- create automatic or manual Music Video tasks;
- inspect, edit, materialize, and compose storyboard shots;
- create Ecommerce Video tasks;
- create, inspect, and close short-lived Realtime Video sessions;
- poll asynchronous tasks until a terminal or actionable state;
- create, inspect, update, and delete webhook endpoints.

The plugin does not put API keys in prompts or MCP tool arguments. Cursor and
Grok Bot users bind `BEATAPI_API_KEY` through Plugins → Configure. Codex can use
the process environment or the installed `beatapi` CLI, which reads the key
saved by `beatapi auth login` from the operating-system credential manager.

Realtime creation stores the one-time browser `client_secret` in a local file
with mode `0600`; it is never returned to the model. The agent manages only the
server-side session. Camera permission, WebRTC, and rendering remain in the
browser SDK.

## Install for Cursor or Grok Bot

Prerequisites:

- Node.js 20.19+ or 22.12+;
- a BeatAPI account and API key from
  [Dashboard → API Keys](https://beatapi.io/dashboard/apikeys).

For local testing, link this checkout as a local Cursor plugin, reload Cursor,
then open Customize → Plugins and configure `BEATAPI_API_KEY`:

```bash
ln -s /absolute/path/to/beatapi-agent-plugin \
  ~/.cursor/plugins/local/beatapi-agent-plugin
```

The repository is ready for Cursor Marketplace review, but marketplace
submission is a separate owner action. Never paste the API key into a prompt,
commit it, or add it to `mcp.json`.

## Install for Codex desktop

Prerequisites:

- Node.js 20.19+ or 22.12+;
- Codex/ChatGPT desktop with plugin support;
- a BeatAPI account and API key from [BeatAPI](https://beatapi.io).

From a source checkout:

```bash
npm ci
npm run verify
codex plugin marketplace add ./dist/marketplace
codex plugin add beatapi-agent-plugin@beatapi-local
```

Then authenticate once in a terminal:

```bash
npm install --global beatapi
beatapi auth login
```

Alternatively, set `BEATAPI_API_KEY` in the environment that launches Codex.
Never paste the key into a conversation.

Restart the desktop app after installation. Useful starter requests include:

- “Use `$beatapi-video` to create a music video from my images and audio.”
- “Turn these product photos into a 15-second 9:16 ad.”
- “Generate an image with Nano Banana Pro.”
- “Make a 10-second Seedance 2.5 video with these references.”
- “List the current Effects and run one on this portrait.”
- “Check my BeatAPI balance and the status of task `task_...`.”
- “Create a 60-second Realtime Video session for `https://app.example.com`.”

## Package layout

- `.codex-plugin/plugin.json` — Codex presentation and component manifest.
- `.cursor-plugin/plugin.json` — Cursor/Grok Bot presentation, components, and
  variable declarations.
- `.mcp.json` — local stdio MCP configuration.
- `mcp.json` — Cursor/Grok Bot stdio configuration with variable placeholders.
- `mcp/server.mjs` — dependency-free bundled MCP runtime.
- `skills/beatapi-video/` — synchronized canonical BeatAPI Skill.
- `contract/` — locked BeatAPI OpenAPI snapshot.
- `generated/` — Skill and client-runtime provenance locks.
- `submission/` — official Plugin Directory listing and review materials.

Do not edit `skills/beatapi-video` or `mcp/vendor/client` directly:

```bash
npm run skill:sync
npm run runtime:sync
```

## Publishing paths

This repository supports three distinct release paths:

1. **Codex desktop/local marketplace.** `npm run marketplace:build` creates a
   complete installable marketplace and ZIP under `dist/`.
2. **Cursor Marketplace / Grok Bot.** `.cursor-plugin/plugin.json` and the root
   `mcp.json` form the reviewable plugin. Submit the public repository URL only
   after owner review at <https://cursor.com/marketplace/publish>.
3. **Public OpenAI Plugin Directory.** `npm run submission:build` creates a
   Skills-only ZIP that can be uploaded to the official submission portal.
   This artifact contains the Skill but not the local MCP server, so users need
   the globally installed `beatapi` CLI unless their host supplies compatible
   BeatAPI MCP tools.

The local plugin includes a stdio MCP server. Official MCP-backed public review
requires a separately deployed public HTTPS MCP server, domain verification,
and reviewer authentication. This repository does not claim that hosted
infrastructure; see [submission/SUBMISSION.md](submission/SUBMISSION.md).

## Verification

```bash
npm run verify
python3 ~/.codex/skills/.system/plugin-creator/scripts/validate_plugin.py .
```

Verification checks OpenAPI drift, synchronized Skill/client sources,
TypeScript, MCP protocol behavior, credential redaction, webhook-secret file
permissions, deterministic bundles, marketplace packaging, and submission
packaging.
