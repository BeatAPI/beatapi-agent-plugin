# BeatAPI Social Research

Research social posts, accounts and comment samples, then export source-backed Markdown and CSV tables.

A community integration maintained by BeatAPI; not an official DeepSeek product or endorsement. MIT licensed.

## Install

Requires Node.js >=22.12, pnpm, and a supported Harness version. Compatibility is intentionally limited to the verified versions in `engines.dsh`: 0.1.0-rc.6 and 0.2.1-rc.2.

```sh
dsh plugin --profile web add @beatapi/dsh-social@0.1.0
dsh --profile web
```

GitHub installation is also supported (prebuilt JavaScript; no prepare/build script):

```sh
dsh plugin --profile web add 'github:BeatAPI/beatapi-agent-plugin#path:/packages/dsh-social'
```

Set `BEATAPI_API_KEY` in the Harness credential store, or in the environment of the process that launches Harness. Never put a secret in chat or tool arguments. `apiKeyRef` in plugin settings is the credential name, not the key itself. Rotated credentials are resolved at the next call.

Paid tools default to a free preview. They require human approval, the current `pricing_ack`, `confirm_paid: true`, and a stable `idempotency_key` before starting a paid operation. Catalog pricing is not an exact arbitrary-input task quote or a spending cap.

## Try it

> Research a topic on X or Xiaohongshu, show the planned calls and price, then prepare a source table after I approve.

The bundled `beatapi-social-research` Skill supplies the task procedure.

## Tools

beat_social_search, beat_social_inspect, beat_social_read, beat_social_result, beat_social_report

## Costs and boundaries

Search and Inspect are free/keyless. Successful remote Social Data reads use your BeatAPI balance.

Platform support is action-specific. This plugin reads public data; it cannot publish posts or mutate accounts. Comment analysis describes a collected sample. The report tool returns Markdown/CSV contents; use host file tools to save them. Discovery is not proof that every action was live-tested.

## Validation and support

See [Harness validation](https://github.com/BeatAPI/beatapi-agent-plugin/blob/main/harness/VALIDATION.md) for tested versions, exact checks and unverified boundaries. Report sanitized issues at https://github.com/BeatAPI/beatapi-agent-plugin/issues. See [privacy and security](https://github.com/BeatAPI/beatapi-agent-plugin/blob/main/harness/SECURITY.md).

[简体中文](README.zh-CN.md) · [BeatAPI](https://beatapi.io/)
