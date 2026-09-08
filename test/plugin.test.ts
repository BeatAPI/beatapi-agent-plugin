import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";
import { resolve } from "node:path";

import { toolDefinitions } from "../mcp/src/tools.js";

const root = resolve(import.meta.dirname, "..");

const expectedToolNames = [
  "beatapi_check_setup",
  "beatapi_list_workflows",
  "beatapi_list_text_models",
  "beatapi_create_text_response",
  "beatapi_list_generation_models",
  "beatapi_create_image",
  "beatapi_create_video",
  "beatapi_list_effects",
  "beatapi_get_effect",
  "beatapi_create_effect",
  "beatapi_analyze_video",
  "beatapi_get_usage",
  "beatapi_upload_file",
  "beatapi_create_music_video",
  "beatapi_edit_music_video_shot",
  "beatapi_get_music_video_shot_media",
  "beatapi_compose_music_video",
  "beatapi_create_ecommerce_video",
  "beatapi_create_realtime_session",
  "beatapi_get_realtime_session",
  "beatapi_close_realtime_session",
  "beatapi_get_task",
  "beatapi_wait_for_task",
  "beatapi_list_webhooks",
  "beatapi_create_webhook",
  "beatapi_get_webhook",
  "beatapi_update_webhook",
  "beatapi_delete_webhook",
] as const;

test("exposes the complete BeatAPI launch API without credential parameters", () => {
  assert.deepEqual(
    toolDefinitions.map((tool) => tool.name),
    expectedToolNames,
  );

  for (const tool of toolDefinitions) {
    const serialized = JSON.stringify(tool.inputSchema);
    assert.doesNotMatch(serialized, /api[_-]?key|authorization|bearer/i);
  }
});

test("marks read, write, paid, and destructive tools accurately", () => {
  const byName = new Map(toolDefinitions.map((tool) => [tool.name, tool]));

  for (const name of [
    "beatapi_check_setup",
    "beatapi_list_workflows",
    "beatapi_list_text_models",
    "beatapi_list_generation_models",
    "beatapi_list_effects",
    "beatapi_get_effect",
    "beatapi_get_usage",
    "beatapi_get_task",
    "beatapi_wait_for_task",
    "beatapi_list_webhooks",
    "beatapi_get_webhook",
    "beatapi_get_realtime_session",
  ]) {
    assert.equal(byName.get(name)?.annotations.readOnlyHint, true, name);
  }

  for (const name of [
    "beatapi_create_music_video",
    "beatapi_create_text_response",
    "beatapi_create_image",
    "beatapi_create_video",
    "beatapi_create_effect",
    "beatapi_analyze_video",
    "beatapi_edit_music_video_shot",
    "beatapi_compose_music_video",
    "beatapi_create_ecommerce_video",
    "beatapi_create_realtime_session",
  ]) {
    const tool = byName.get(name);
    assert.equal(tool?.annotations.readOnlyHint, false, name);
    assert.match(tool?.description ?? "", /paid|credit/i, name);
  }

  assert.equal(
    byName.get("beatapi_delete_webhook")?.annotations.destructiveHint,
    true,
  );
  assert.equal(
    byName.get("beatapi_close_realtime_session")?.annotations.destructiveHint,
    true,
  );
  for (const tool of toolDefinitions) {
    if (
      tool.name !== "beatapi_delete_webhook" &&
      tool.name !== "beatapi_close_realtime_session"
    ) {
      assert.notEqual(tool.annotations.destructiveHint, true, tool.name);
    }
  }
});

test("generation tools accept current and future model IDs through one stable shape", () => {
  const byName = new Map(toolDefinitions.map((tool) => [tool.name, tool]));
  const image = byName.get("beatapi_create_image")?.inputSchema.safeParse({
    model: "future-image-model",
    parameters: { prompt: "Editorial still", aspect_ratio: "16:9" },
  });
  const video = byName.get("beatapi_create_video")?.inputSchema.safeParse({
    model: "future-video-model",
    parameters: { prompt: "Slow dolly in", duration: 7 },
  });

  assert.equal(image?.success, true);
  assert.equal(video?.success, true);
});

test("text responses are non-streaming and require explicit BeatAPI intent", () => {
  const tool = toolDefinitions.find(
    (definition) => definition.name === "beatapi_create_text_response",
  );

  assert.match(tool?.description ?? "", /only.*explicit.*BeatAPI/i);
  assert.equal(
    tool?.inputSchema.safeParse({
      model: "gpt-5.6-sol",
      request: { input: "Summarize this note", stream: true },
    }).success,
    false,
  );
});

test("plugin manifest wires the skill, local MCP, and production assets", async () => {
  const manifest = JSON.parse(
    await readFile(resolve(root, ".codex-plugin/plugin.json"), "utf8"),
  ) as Record<string, unknown>;
  assert.equal(manifest.repository, "https://github.com/BeatAPI/beatapi-codex-plugin");
  assert.equal(manifest.skills, "./skills/");
  assert.equal(manifest.mcpServers, "./.mcp.json");

  const interfaceBlock = manifest.interface as Record<string, unknown>;
  assert.equal(interfaceBlock.logo, "./assets/logo.png");
  assert.equal(interfaceBlock.logoDark, "./assets/logo-dark.png");
  assert.equal(interfaceBlock.composerIcon, "./assets/icon.png");
});
