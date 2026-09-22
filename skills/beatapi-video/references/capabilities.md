# Unified capabilities

The public HTTP surface is:

```text
POST /v1/capabilities/search
POST /v1/capabilities/inspect
POST /v1/capabilities/run
```

Use the caller's configured API key. Search, Inspect, and status are read-only. Run start uses the existing account balance, task, and idempotency rules.

## Selection flow

```text
short user intent
  → capabilities_search
  → capabilities_inspect(reference)
  → capabilities_run(reference, operation=start)
  → capabilities_run(reference, operation=status, task_id=...)
```

Search is not a substitute for Inspect. A capability with `validation.state: partial` has documented contract gaps; do not invent missing output fields.

## Social Data

Social Data actions use the same capability surface as Models and Workflows. Search
for `kind=data`, inspect the returned `data:<action-id>` reference, then run it.
Read [social-data.md](social-data.md) for action parameters, normalized output,
errors, and credit behavior.

## REST example

```bash
curl https://api.beatapi.io/v1/capabilities/search \
  -H "Authorization: Bearer $BEATAPI_API_KEY" \
  -H 'Content-Type: application/json' \
  -d '{"query":"search","kind":"data","platform":"xiaohongshu","limit":5}'
```

Select an actual reference from `data.data`, then inspect it. Construct the Run
input only from that action's schema. Do not copy an invented action ID or assume
all search actions accept the same parameters. Status uses the same
`POST /v1/capabilities/run` endpoint with `operation: "status"`, `reference`,
and the returned `task_id`; the API origin has no separate `/run/status` route.

Some Inspect responses contain only `input_modes` or omit the full input schema.
Read the selected capability's current official API documentation before running;
if its execution mapping remains unclear, report the gap instead of guessing.
See <https://beatapi.io/SKILL.md> for setup, a runnable read-only discovery example,
and error recovery. Anonymous discovery does not validate an API key; use
authenticated `/v1/usage` or the authenticated MCP connection.

Use the same idempotency key only for the same request. Never put an API key in a prompt, URL, source file, or tool argument.

## Optional onboarding status

API users can skip MCP and Skill installation entirely. Agent hosts may use these authenticated endpoints to persist setup state:

```text
GET/PUT /v1/onboarding/preferences
POST    /v1/onboarding/keys
GET     /v1/onboarding/connection-status
POST    /v1/onboarding/connection-check
GET     /v1/onboarding/completion-status
```

Preferences affect recommendations only; they do not grant or remove capability access. Name a key before creating it. The plaintext key is returned once and must remain in the host's secure configuration. A setup flow is complete only after `first_call_succeeded` is true.
