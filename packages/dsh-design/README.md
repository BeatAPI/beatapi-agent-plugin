# BeatDesign for DeepSeek Harness

Create and edit in a local visual workspace: projects, Canvas, Assets and Timeline, shared between Harness and the user. This is a BeatAPI-maintained community integration, not an official DeepSeek product.

## Install and start

In Harness **Plugins → Add plugin**, enter `@beatapi/dsh-design`. Or install from the CLI in your actual profile:

```sh
dsh plugin --profile web add @beatapi/dsh-design
```

After community approval/catalog refresh, search **BeatDesign** in dsh-market and click Install. Submission does not guarantee approval or immediate market visibility.

Requires Node.js 22.12+ and a working Harness plugin manager. No Harness version restriction is declared. On plugin activation the pinned `@beatapi/beatdesign-workbuddy@0.2.5` runtime starts the local workspace at http://127.0.0.1:3020 and exposes 30 namespaced MCP tools. First startup creates local storage and applies the runtime's bundled migrations. No provider key is needed for local work.

Try: **“Create a BeatDesign project for a product video, show its Canvas, and organize my authorized assets. Ask me before any paid generation.”**

Use the exact project URL returned by a tool for visual review. Configure a BeatAPI/provider key in BeatDesign only if you want remote generation or analysis; those actions require confirmation and use the provider balance. This connector does not upload local media merely by installing or starting.

## Storage and setup

The runtime stores projects outside the plugin directory in its standard application data folder. Optional `dataDirectory` in plugin settings selects an absolute storage path. Port 3020 must be free: the runtime refuses to reuse another BeatDesign workspace. Stop your other connector yourself before enabling this one. Do not delete project data when reinstalling.

`toolCallTimeoutMs` controls waits. Node-side frame extraction requires ffmpeg and MCP timeline rendering also requires ffprobe; unavailable binaries return setup errors. Browser export does not require system FFmpeg.

The bundled Skill documents revisions, project ownership, paid-action approval and handoff. Tools are namespaced `mcp__beatdesign__*`. This package does not provide hosted collaboration or social publishing. Tested host evidence and limitations are recorded in [validation](../../harness/VALIDATION.md).

[简体中文](README.zh-CN.md) · [BeatDesign source](https://github.com/BeatAPI/BeatDesign) · [Issues](https://github.com/BeatAPI/beatapi-agent-plugin/issues)
