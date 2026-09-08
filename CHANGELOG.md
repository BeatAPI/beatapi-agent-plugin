# Changelog

## Unreleased

- Renamed the repository and package to `beatapi-agent-plugin`.
- Added a Cursor/Grok Bot manifest and root `mcp.json` alongside the existing
  Codex manifest, sharing the same Skill and MCP runtime.
- Declared `BEATAPI_API_KEY` as a required Cursor plugin variable so users bind
  it through Plugins → Configure instead of chat or repository files.
- Added MCP tools for text-model discovery, non-streaming text responses,
  generation-model discovery, generic image/video generation, versioned
  Effects, and Video Analysis.
- Synchronized the canonical Skill, typed client runtime, and OpenAPI snapshot
  with the complete 30-operation contract and USD-denominated usage semantics.
- Replaced hardcoded image/video model unions with a stable `model` plus
  `parameters` interface so newly published model IDs do not require a plugin
  release.
- Added host Configure guidance for `BEATAPI_API_KEY` and kept credentials out
  of tool arguments and model-visible results.
- Confined uploads to configured trusted roots, rejected credential material in
  open-ended parameters, validated custom API origins, reduced CLI environment
  inheritance, and pinned release workflow dependencies.
- Removed Realtime-session and webhook creation from agent-visible surfaces
  until hosts provide an opaque secret broker.

## 0.2.0 - 2026-07-31

- Added Realtime Video session create, read, and close MCP tools.
- Store the one-time Realtime browser client secret in a mode-`0600` local file
  and keep it out of model-visible tool results.
- Synchronized the canonical Skill, official client runtime, and public OpenAPI
  contract to the Realtime baseline.
- Added exact-origin, duration, idempotency, billing, and browser trust-boundary
  guidance.
- Prefer bundled MCP execution in the canonical Skill with CLI fallback.

## 0.1.0 - 2026-07-17

- Added the canonical `beatapi-video` Skill and eight review/evaluation cases.
- Added a bundled local stdio MCP server with all 16 BeatAPI launch operations.
- Reused `BEATAPI_API_KEY` or the API key stored by the official BeatAPI CLI.
- Added exact OpenAPI and generated-client provenance locks.
- Added secure one-time webhook-secret storage with rollback on failure.
- Added production brand assets, marketplace packaging, CI, security guidance,
  and official Skills-only Plugin Directory submission materials.
