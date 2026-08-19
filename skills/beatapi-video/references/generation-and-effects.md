# Generation models and Effects

Use stable BeatAPI aliases only. Discover the current catalog before choosing a
model; never expose or invent internal provider routes.

## Image models

| Alias | Public modes | Important request rule |
| --- | --- | --- |
| `nano-banana` | text | Prompt only; no reference images |
| `nano-banana-pro` | text, reference | Up to 8 public HTTPS images |
| `gpt-image-2` | text, reference | Up to 16 public HTTPS images; aspect-ratio availability depends on resolution |
| `seedream-5-pro` | text, reference | Up to 10 public HTTPS images |

## Video models

| Alias | Public modes | Important request rule |
| --- | --- | --- |
| `minimax-h3` | text, frames, reference | 4-15 seconds; frame inputs cannot be mixed with reference inputs |
| `seedance-2` | text, frames, reference | 4-15 seconds; supports generated audio |
| `seedance-2-fast` | text, frames, reference | 4-15 seconds; 480p or 720p |
| `seedance-2-mini` | text, frames, reference | Low-cost 4-15 second route; generated audio is unavailable |
| `veo-3.1` | text, frames, reference | Fixed 8 seconds; frame and reference-image inputs cannot be mixed |
| `seedance-2.5` | text, frames, reference | 4-30 seconds; current output is 720p |
| `kling-3` | text, frames, reference | 3-15 seconds; multi-shot mode requires `multi_prompt` |

Run `beatapi models list` or call `beatapi_list_generation_models` before
generation. Then copy `assets/image-generation.json` or
`assets/video-generation.json`, select exactly one model alias, and retain only
fields in that model's schema in `beatapi.openapi.yaml`.

Do not combine `images` with `reference_*` fields when the selected video model
forbids it. Audio references require at least one reference image or video for
the Seedance routes. Reject unknown fields instead of forwarding them.

## Effects

Effects are versioned published capabilities, not model aliases.

1. List active Effects with `beatapi_list_effects` or `beatapi effects list`.
2. Read the selected Effect with `beatapi_get_effect` or
   `beatapi effects get EFFECT_ID`.
3. Validate image count, MIME types, dimensions, subject requirements, and
   supported options against that returned version.
4. Copy `assets/effect-task.json`, preserve the selected `effect_id`, and omit
   unsupported options.
5. Create with `beatapi_create_effect` or `beatapi effects create --file ...`.
   Use one stable idempotency key for retries of the same request.
6. Poll the shared task endpoint and require hosted output before reporting
   completion.

The catalog exposes only publication-safe fields. Never infer provider names,
template IDs, internal costs, or execution context.
