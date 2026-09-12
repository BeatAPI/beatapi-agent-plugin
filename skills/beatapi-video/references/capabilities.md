# Unified capabilities

The public HTTP surface is:

```text
POST /v1/capabilities/search
POST /v1/capabilities/inspect
POST /v1/capabilities/run
POST /v1/capabilities/run/status
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
  -d '{"query":"小红书 笔记搜索","kind":"data","limit":5}'
```

```bash
curl https://api.beatapi.io/v1/capabilities/run \
  -H "Authorization: Bearer $BEATAPI_API_KEY" \
  -H 'Idempotency-Key: capability-run-001' \
  -H 'Content-Type: application/json' \
  -d '{"reference":"data:xiaohongshu.note.search","operation":"start","input":{"keyword":"AI 视频"},"idempotency_key":"capability-run-001"}'
```

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
