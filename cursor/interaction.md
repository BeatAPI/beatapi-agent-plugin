<!--
[INPUT]: Remote MCP tool responses and host rendering capabilities
[OUTPUT]: Cursor and Grok Bot presentation and authorization rules
[POS]: Host-only supplement to the shared remote Skill, without business routing
[PROTOCOL]: 变更时更新此头部，然后检查 AGENTS.md
-->

## Cursor and Grok Bot interaction

This connection runs on BeatAPI's servers, not in the user's workspace or the
Bot's computer. Use only tools advertised by this remote connection. Do not
install Node, invoke the local BeatAPI CLI, edit project files, or ask for an API
key to repair this connection. Use the host's Authenticate or Reconnect action.
An unknown OAuth client or rejected callback requires operator configuration;
do not retry consent indefinitely or substitute the ChatGPT client identity.

Select this BeatAPI connection's tools in the host's available tool list. Cursor
may namespace plugin tools: resolve the connected tool by its advertised name
and schema rather than inventing a name or calling another installed copy.
An app being Installed is not proof of authentication; check the host's connection
state. Never disable a team's MCP policy, enable Auto-run or modify tool approval
settings to complete a request. A host approval prompt does not authorize extra
paid work beyond the user's confirmed scope.

For a paid request, present a compact confirmation of the selected model,
inputs, duration, resolution, aspect ratio or inherited dimensions, and quoted
cost or pricing uncertainty. Ask only for missing choices; preserve confirmed
settings in tool arguments. Never imply that selecting a setting in prose sends it.

When an MCP Apps view renders, use it for returned media and progress without
duplicating its contents. If the host does not render a view, deliver the same
outcome in ordinary chat: preview returned images when supported, link the actual
video or file, and show task state and ID for unfinished work. Never invent an
attachment or claim a link was played. Do not assume Cursor and Grok Bot have
identical rendering support.

Progress means observed server state, not fabricated percentages. Read status
only at the advertised interval and never start a second task to refresh a view.
Failed tasks show the error and recovery option, not an empty success message.
For local attachments without an advertised supported upload path, ask for an
approved public HTTPS URL; never silently upload workspace or Bot-computer files.

For research, lead with the requested conclusion, then a compact source table.
For a creative result, lead with the actual asset, then only the relevant model,
confirmed settings and observed cost. For pending work, show the task ID, latest
state and available read-only next step. Keep technical traces and raw JSON out
of the main answer unless requested. Do not promise inline video playback or a
download control that the current host does not expose.

In Grok Bot, apps and private skills can be shared across the user's Bots, while
each operation still uses the account actually authorized for that connection.
Do not infer permission to use another Bot's files or credentials. A one-time
request does not authorize creating a routine, schedule, background monitor or
webhook. Saving a workflow as a Skill does not grant future paid execution.
