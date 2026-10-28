---
name: beatapi-media-kit
description: Discover image/video models, preview pricing, generate approved media and resume existing tasks.
---

1. Clarify the deliverable: image or video, dimensions/aspect ratio, duration, and reference media. Use `beat_media_search` to find models; do not silently substitute another model.
2. Call `beat_media_inspect` and read input_schema, pricing and readiness. Use only fields the selected model supports. Reference URLs must be HTTPS and authorized by the user. This plugin does not upload local files; use the existing BeatAPI upload interface or an authorized HTTPS reference.
3. Call `beat_media_generate` without confirm_paid for a pricing preview. Explain the applicable tier and full requested specification. Catalog tiers are not an exact arbitrary-input estimate or a spending cap. Obtain human approval before passing confirm_paid=true and the returned pricing_ack.
4. Use a unique, stable idempotency_key for the task; reuse it only when retrying identical inputs. Never generate another paid start merely because a call or wait timed out. Return and preserve the original task ID.
5. Poll `beat_media_status` with the same reference and task_id, respecting poll_after_seconds. A tool-call cancellation does not cancel remote generation. Resume the existing task after a session restart. Stop on terminal or action-required states.
6. Claim completion only when the task succeeds and returns real media URLs. Show those URLs and the requested specification. Download/verify actual files using the host's file tools if the user wants local delivery. Do not represent a submitted task, mock preview or text description as a generated asset.

Set BEATAPI_API_KEY in the Harness credential store or launch environment. Settings namespace: `beatapi-media-kit`. Its apiKeyRef is a credential name, never a key. Search/Inspect are free; generation uses BeatAPI balance. This plugin does not change the host's primary model and does not embed a complete editing timeline.
