# BeatAPI next

Unified generation and Effect API update.

- Creates and monitors BeatAPI Music Video and Ecommerce Video workflows.
- Discovers the current image and video model catalogue at runtime and creates
  model-specific tasks through one stable request shape.
- Discovers published versioned Effects, validates their current input contract,
  and creates Effect tasks.
- Reads and closes existing short-lived Realtime Video sessions; secret-returning
  creation stays outside agent-visible flows.
- Handles local media upload, manual storyboard review, shot operations,
  composition, task polling, usage checks, and existing webhook management.
- Prefers compatible BeatAPI MCP tools supplied by the host and otherwise uses
  the official CLI without placing credentials in conversations.
- Requires the reviewed globally installed `beatapi@0.2.0` CLI for Skills-only
  hosts that do not supply BeatAPI MCP tools.
- Matches the current BeatAPI OpenAPI `1.0.0-launch` unified API baseline.
- Includes model, Effect, workflow, Realtime, security, and recovery review cases.
