import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";
import { resolve } from "node:path";

import { toolDefinitions } from "../mcp/src/tools.js";
import { BeatAPIClient } from "../mcp/vendor/client/index.js";

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
  "beatapi_get_realtime_session",
  "beatapi_close_realtime_session",
  "beatapi_get_task",
  "beatapi_wait_for_task",
  "beatapi_list_webhooks",
  "beatapi_get_webhook",
  "beatapi_update_webhook",
  "beatapi_delete_webhook",
] as const;

test("exposes the safe model-facing API subset without credential parameters", () => {
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

test("open-ended model requests reject credential-like keys and values", () => {
  const byName = new Map(toolDefinitions.map((tool) => [tool.name, tool]));
  const image = byName.get("beatapi_create_image")?.inputSchema;
  const text = byName.get("beatapi_create_text_response")?.inputSchema;

  assert.equal(
    image?.safeParse({
      model: "future-image-model",
      parameters: { nested: { api_key: "sk_should_not_be_here" } },
    }).success,
    false,
  );
  assert.equal(
    text?.safeParse({
      model: "future-text-model",
      request: { input: "hello", metadata: { authorization: "Bearer secret" } },
    }).success,
    false,
  );
  assert.equal(
    text?.safeParse({
      model: "future-text-model",
      request: { input: "sk_accidental_prompt_secret" },
    }).success,
    false,
  );
});

test("API client rejects unsafe base URL overrides", () => {
  assert.throws(
    () => new BeatAPIClient({ apiKey: "test", baseUrl: "http://example.com" }),
    /HTTPS origin/i,
  );
  assert.throws(
    () => new BeatAPIClient({ apiKey: "test", baseUrl: "https://example.com" }),
    /explicit.*operator setting/i,
  );
  assert.throws(
    () =>
      new BeatAPIClient({
        apiKey: "test",
        baseUrl: "https://api.beatapi.io/proxy?key=value",
      }),
    /HTTPS origin/i,
  );
  assert.equal(
    new BeatAPIClient({
      apiKey: "test",
      baseUrl: "https://api.beatapi.io",
    }).baseUrl,
    "https://api.beatapi.io",
  );
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
  const packageManifest = JSON.parse(
    await readFile(resolve(root, "package.json"), "utf8"),
  ) as Record<string, unknown>;
  const manifest = JSON.parse(
    await readFile(resolve(root, ".codex-plugin/plugin.json"), "utf8"),
  ) as Record<string, unknown>;
  assert.equal(packageManifest.name, "beatapi-agent-plugin");
  assert.equal(
    (packageManifest.scripts as Record<string, string>)["validate:cursor"],
    "node scripts/validate-cursor.mjs",
  );
  assert.equal(manifest.name, "beatapi-agent-plugin");
  assert.equal(manifest.repository, "https://github.com/BeatAPI/beatapi-agent-plugin");
  assert.equal(manifest.skills, "./skills/");
  assert.equal(manifest.mcpServers, "./.mcp.json");
  assert.equal(
    (packageManifest.scripts as Record<string, string>)["validate:grok"],
    "node scripts/validate-grok.mjs",
  );

  const interfaceBlock = manifest.interface as Record<string, unknown>;
  assert.equal(interfaceBlock.logo, "./assets/logo.png");
  assert.equal(interfaceBlock.logoDark, "./assets/logo-dark.png");
  assert.equal(interfaceBlock.composerIcon, "./assets/icon.png");
  const defaultPrompts = interfaceBlock.defaultPrompt as string[];
  assert.ok(defaultPrompts.length <= 3);
  assert.ok(defaultPrompts.every((prompt) => prompt.length <= 128));
});

test("Cursor manifest wires shared skills and MCP through declared variables", async () => {
  const manifest = JSON.parse(
    await readFile(resolve(root, ".cursor-plugin/plugin.json"), "utf8"),
  ) as Record<string, unknown>;
  const mcp = JSON.parse(
    await readFile(resolve(root, "mcp.json"), "utf8"),
  ) as {
    mcpServers: Record<
      string,
      {
        type: string;
        command: string;
        args: string[];
        cwd: string;
        env: Record<string, string>;
      }
    >;
  };

  assert.equal(manifest.name, "beatapi-agent-plugin");
  assert.equal(manifest.repository, "https://github.com/BeatAPI/beatapi-agent-plugin");
  assert.equal(manifest.skills, "./skills/");
  assert.equal(manifest.mcpServers, "./mcp.json");

  const variables = manifest.variables as {
    properties: Record<string, unknown>;
    required: string[];
  };
  assert.deepEqual(variables.required, ["BEATAPI_API_KEY"]);
  assert.ok(variables.properties.BEATAPI_API_KEY);
  assert.ok(variables.properties.BEATAPI_BASE_URL);
  assert.ok(variables.properties.BEATAPI_TRUST_CUSTOM_BASE_URL);
  assert.ok(variables.properties.BEATAPI_UPLOAD_ROOTS);

  const server = mcp.mcpServers.beatapi;
  assert.ok(server);
  assert.equal(server.type, "stdio");
  assert.equal(server.command, "node");
  assert.deepEqual(server.args, ["./mcp/server.mjs"]);
  assert.equal(server.cwd, "${PLUGIN_ROOT}");
  assert.equal(server.env.BEATAPI_API_KEY, "${BEATAPI_API_KEY}");
  assert.equal(server.env.BEATAPI_BASE_URL, "${BEATAPI_BASE_URL}");
  assert.equal(
    server.env.BEATAPI_TRUST_CUSTOM_BASE_URL,
    "${BEATAPI_TRUST_CUSTOM_BASE_URL}",
  );
  assert.equal(server.env.BEATAPI_UPLOAD_ROOTS, "${BEATAPI_UPLOAD_ROOTS}");
  assert.doesNotMatch(JSON.stringify(mcp), /sk_[A-Za-z0-9_-]{6,}/);
});

test("release workflows pin every action to an immutable commit", async () => {
  for (const path of [
    resolve(root, ".github/workflows/ci.yml"),
    resolve(root, ".github/workflows/release.yml"),
  ]) {
    const workflow = await readFile(path, "utf8");
    for (const match of workflow.matchAll(/uses:\s+[^@\s]+@([^\s#]+)/g)) {
      assert.match(match[1] ?? "", /^[0-9a-f]{40}$/i);
    }
  }
});

test("Grok Build manifest exposes the shared Skill and MCP plugin metadata", async () => {
  const packageManifest = JSON.parse(
    await readFile(resolve(root, "package.json"), "utf8"),
  ) as Record<string, unknown>;
  const manifest = JSON.parse(
    await readFile(resolve(root, ".grok-plugin/plugin.json"), "utf8"),
  ) as Record<string, unknown>;
  const mcp = JSON.parse(
    await readFile(resolve(root, ".mcp.json"), "utf8"),
  ) as {
    mcpServers: Record<
      string,
      { command: string; args: string[]; tool_timeout_sec: number }
    >;
  };

  assert.equal(manifest.name, "beatapi-agent-plugin");
  assert.equal(manifest.version, packageManifest.version);
  assert.equal(manifest.repository, "https://github.com/BeatAPI/beatapi-agent-plugin");
  assert.equal(manifest.license, "MIT");
  assert.equal(manifest.skills, "./skills/");
  assert.equal(manifest.mcpServers, "./.mcp.json");
  const server = mcp.mcpServers.beatapi;
  assert.ok(server);
  assert.equal(server.command, "node");
  assert.deepEqual(server.args, ["./mcp/server.mjs"]);
  assert.ok(server.tool_timeout_sec >= 4_320);
  assert.doesNotMatch(JSON.stringify(mcp), /sk_[A-Za-z0-9_-]{6,}/);
});

test("release builders use the renamed cross-host plugin artifact", async () => {
  for (const path of [
    "scripts/build-marketplace.mjs",
    ".github/workflows/ci.yml",
    ".github/workflows/release.yml",
  ]) {
    const source = await readFile(resolve(root, path), "utf8");
    assert.match(source, /beatapi-agent-plugin/);
    assert.doesNotMatch(source, /beatapi-codex-plugin/);
  }

  const builder = await readFile(
    resolve(root, "scripts/build-marketplace.mjs"),
    "utf8",
  );
  assert.match(builder, /\.cursor-plugin/);
  assert.match(builder, /\.grok-plugin/);
  assert.match(builder, /"mcp\.json"/);
});

test("README leads with project-native proof and complete host setup", async () => {
  const readme = await readFile(resolve(root, "README.md"), "utf8");
  const cover = await readFile(resolve(root, "assets/readme/cover.svg"), "utf8");

  assert.match(readme.slice(0, 300), /assets\/readme\/cover\.svg/);
  assert.match(readme, /## Quick start/);
  assert.match(readme, /## Model coverage/);
  assert.match(readme, /## Install on Grok Build/);
  assert.match(readme, /Cursor and Grok Bot/);
  assert.match(readme, /Codex/);
  assert.match(readme, /Never paste.*API key.*prompt/i);
  assert.match(cover, /BeatAPI Agent Plugin/);
  assert.doesNotMatch(cover, /Awesome README Studio/i);
});
