<!--
[INPUT]: Claude plugin components and the connected BeatAPI MCP tools
[OUTPUT]: Claude-specific connection, consent, tool selection and result presentation
[POS]: Host supplement appended to submission/REMOTE-SKILL.md by claude:build
[PROTOCOL]: Update this header and AGENTS.md when this file changes.
-->

## Claude interaction

Use the available tool list to find BeatAPI tools; Claude may prefix names with
its connector or plugin identifier. Do not hardcode that prefix. The MCP service
URL is shared across hosts; the `/openai` path does not make its tools OpenAI-only.

For a sign-in error, ask the user to Authenticate or Reconnect through Claude's
connector controls. Do not substitute the ChatGPT or Cursor OAuth client, or
collect a BeatAPI API key in chat. A successful tool listing proves discovery,
not account authorization. Do not describe anonymous discovery as signed-in use.

Present read-only MCP Apps results when the current Claude surface supports them.
Otherwise return the actual media links, a concise result summary and source
links in ordinary chat. An installed plugin does not establish that every Claude
surface renders the same UI or supports the same authentication callback.

Start with Search and Inspect. A request to test the connection authorizes those
free checks, not paid model generation or broad data collection. For execution,
use the exact advertised next tool and the user's agreed scope. Approval and
Auto-run controls in Claude do not expand the requested task or spending scope.
