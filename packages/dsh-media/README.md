# BeatAPI Media Kit

Discover image/video models, inspect live inputs and pricing, submit approved generations, and resume existing tasks.

A community integration maintained by BeatAPI; not an official DeepSeek product or endorsement. MIT licensed.

## Install

Requires Node.js >=22.12, pnpm, and a supported Harness version. Compatibility is intentionally limited to the verified versions in `engines.dsh`: 0.1.0-rc.6 and 0.2.1-rc.2.

```sh
dsh plugin --profile web add @beatapi/dsh-media@0.1.0
dsh --profile web
```

GitHub installation is also supported (prebuilt JavaScript; no prepare/build script):

```sh
dsh plugin --profile web add 'github:BeatAPI/beatapi-agent-plugin#path:/packages/dsh-media'
```

Set `BEATAPI_API_KEY` in the Harness credential store, or in the environment of the process that launches Harness. Never put a secret in chat or tool arguments. `apiKeyRef` in plugin settings is the credential name, not the key itself. Rotated credentials are resolved at the next call.

Paid tools default to a free preview. They require human approval, the current `pricing_ack`, `confirm_paid: true`, and a stable `idempotency_key` before starting a paid operation. Catalog pricing is not an exact arbitrary-input task quote or a spending cap.

## Try it

> Find an image model for a product cover; show its supported inputs and pricing before generating anything.

The bundled `beatapi-media-kit` Skill supplies the task procedure.

## Tools

beat_media_search, beat_media_inspect, beat_media_generate, beat_media_status

## Costs and boundaries

Search and Inspect are free/keyless. Image/video generation consumes BeatAPI balance.

Supported reference inputs depend on the inspected model. Use authorized HTTPS references; this package does not upload local files. Submitted tasks return before completion. Resume the original task ID instead of repeating starts after a timeout. Media URLs come from actual task results; use host tools for local downloads and verification.

## Validation and support

See [Harness validation](https://github.com/BeatAPI/beatapi-agent-plugin/blob/main/harness/VALIDATION.md) for tested versions, exact checks and unverified boundaries. Report sanitized issues at https://github.com/BeatAPI/beatapi-agent-plugin/issues. See [privacy and security](https://github.com/BeatAPI/beatapi-agent-plugin/blob/main/harness/SECURITY.md).

[简体中文](README.zh-CN.md) · [BeatAPI](https://beatapi.io/)
