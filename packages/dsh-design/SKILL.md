---
name: beatdesign-harness
description: Operate the local BeatDesign Project, Canvas, Assets and Timeline with the human.
---

# BeatDesign workspace

Use mcp__beatdesign__* tools to work in the same local Project the user can inspect. This connector starts the released BeatDesign 0.2.5 runtime, which exposes 30 MCP tools. It is not the standalone Media Kit generator.

1. Inspect available tools and read existing projects before creating anything. Reuse the requested project and read its current state/revision.
2. For local organization, import, Canvas and Timeline edits, use the supported incremental operations. Keep exact asset IDs, pinned versions and stable operation keys. Do not replace full documents or write SQLite directly.
3. Offer the exact Canvas/Editor URL returned by a tool so the human can review and take over. A tool receipt alone is not proof the visual result is correct.
4. Before remote generation or analysis, inspect model requirements and the current price, explain the exact inputs that will leave the machine, and get human approval. Provider credentials belong in the local BeatDesign connection settings, never chat or tool arguments. Local editing requires no provider key.
5. Save generated/imported media in project storage before treating it as a durable asset. Poll the original task; never repeat a paid start after a timeout.
6. For Timeline work inspect duration, clip/asset ownership, audio and diagnostics, then verify the exported output. Node-side frame extraction needs ffmpeg; MCP rendering also needs ffprobe. Browser export has different requirements.

Startup opens no browser automatically. Open the returned loopback URL only when useful. Port 3020 is fixed by the published runtime; if another workspace is using it, explain the conflict and let the human decide. Never terminate an existing workspace, erase project data, or reset a database to fix startup. Multiple connectors should not independently launch the same runtime at the same time.

The runtime is local-first. No hosted sharing, account login, publishing, or automatic social posting is provided by this connector. Future Harness versions may change APIs; unrestricted installation is not a claim of universal test coverage.
