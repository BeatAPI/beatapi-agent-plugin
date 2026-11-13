# BeatAPI for Claude

Use BeatAPI to research public social and web data, analyze SEO keywords and
competitors, run text and decision models, and create images and videos. The
plugin includes a workflow Skill and a remote MCP connection; execution, account
authorization and billing stay with BeatAPI. It does not run a local MCP server.

## Connect

Install this plugin through Claude's supported plugin flow. Connect the BeatAPI
MCP server at `https://api.beatapi.io/mcp/openai` and complete BeatAPI sign-in and
consent when requested. The public OAuth client ID for this integration is
`beatapi-claude`; no client secret or API key belongs in this repository or chat.
The `/openai` path is the existing shared remote endpoint, not a model setting.

For a developer preview, run `claude --plugin-dir ./claude/beatapi` from this
repository. For a directory submission, use repository
`BeatAPI/beatapi-agent-plugin` with plugin path `claude/beatapi`.

## Try it

- “Use BeatAPI to find a web-search capability and show its input requirements
  and pricing. Do not execute a paid call.”
- “Find the current image-generation options for this brief; compare their
  supported inputs before we generate.”
- “Read the status of this existing BeatAPI task without starting a new task.”

The Skill discovers current capabilities rather than assuming fixed model IDs.
Search and Inspect are free. Other operations may be billed to your existing
BeatAPI balance; inspect current pricing before authorizing execution. Social
capabilities are for research, not social posting or private-message access.

## Compatibility and release requirements

This package is a submission candidate. A valid manifest is not evidence of a
published listing or a successful authenticated workflow. Before release, the
operator must register the dedicated OAuth client, test sign-in, refresh,
revocation and representative workflows, and resolve the directory's findings.

Claude web, Desktop, mobile and Cowork use the HTTPS callback
`https://claude.ai/api/mcp/auth_callback`. Native Claude Code uses a loopback
callback; it requires separately verified gateway support. Do not advertise
native Claude Code OAuth compatibility until that callback flow passes. A
connector inherited from claude.ai is a separate host-managed connection.

## Data and support

The plugin sends the inputs required for a selected operation to the declared
BeatAPI service. BeatAPI may route that operation to its service providers.
Only supply media and other data you are authorized to process. Keep passwords,
API keys, cookies and tokens out of prompts and tool arguments. This bundle
adds no separate application data store. Service-side retention follows the
current BeatAPI privacy policy, not a promise of zero retention.

[Documentation](https://docs.beatapi.io/capabilities) ·
[Privacy policy](https://beatapi.io/privacy-policy) ·
[Terms](https://beatapi.io/terms-of-service) ·
[Support](mailto:support@beatapi.io)

Licensed under MIT. This integration is published by BeatAPI and does not imply
Anthropic endorsement or directory approval.
