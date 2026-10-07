/**
 * [INPUT]: 依赖 MCP SDK 内存传输与真实服务注册
 * [OUTPUT]: 验证候选工具范围与协议层拒绝执行的安全边界
 * [POS]: 本地审核 profile 回归测试，不证明 HTTP、OAuth 或生产计费
 * [PROTOCOL]: 变更时更新此头部，然后检查 AGENTS.md
 */
import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { readFile } from "node:fs/promises";
import test from "node:test";
import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { InMemoryTransport } from "@modelcontextprotocol/sdk/inMemory.js";
import { BeatAPIExecutor } from "../mcp/src/executor.js";
import { mediaReviewTools, toolsForProfile } from "../mcp/src/profile.js";
import { createServer } from "../mcp/src/server.js";

test("media-review only executes registered media tools", async () => {
  const calls: string[] = [];
  class FixtureExecutor extends BeatAPIExecutor {
    override async execute(name: string): Promise<unknown> {
      calls.push(name);
      return { credit_balance: 321 };
    }
  }
  const server = createServer(new FixtureExecutor(), "media-review");
  const client = new Client({ name: "review-fixture", version: "1" });
  const [clientTransport, serverTransport] = InMemoryTransport.createLinkedPair();
  try {
    await server.connect(serverTransport);
    await client.connect(clientTransport);
    const listed = await client.listTools();
    assert.deepEqual(listed.tools.map((tool) => tool.name), [...mediaReviewTools]);
    for (const tool of listed.tools) {
      assert.equal(tool.inputSchema.additionalProperties, false);
      assert.ok(tool.outputSchema);
      for (const hint of ["readOnlyHint", "destructiveHint", "openWorldHint"] as const) {
        assert.equal(typeof tool.annotations?.[hint], "boolean");
      }
    }
    for (const name of [
      "capabilities_run", "capabilities_search", "capabilities_inspect",
      "beatapi_upload_file", "beatapi_create_text_response",
      "beatapi_delete_webhook", "beatapi_wait_for_task",
    ]) {
      const rejected = await client.callTool({ name, arguments: {} });
      assert.equal(rejected.isError, true, name);
    }
    const invalid = await client.callTool({
      name: "beatapi_get_usage", arguments: { api_key: "not-allowed" },
    });
    assert.equal(invalid.isError, true);
    assert.deepEqual(calls, []);
    const usage = await client.callTool({ name: "beatapi_get_usage", arguments: {} });
    assert.deepEqual(usage.structuredContent, { result: { credit_balance: 321 } });
    assert.deepEqual(calls, ["beatapi_get_usage"]);
  } finally {
    await client.close();
    await server.close();
  }
});

test("unknown profiles fail closed and the default retains local tools", () => {
  assert.throws(() => toolsForProfile("media-reveiw"), /Unknown MCP profile/);
  assert.equal(toolsForProfile().length, 33);
});

test("media-review stdio refuses CLI credential fallback", () => {
  const result = spawnSync(process.execPath, [
    new URL("../mcp/server.mjs", import.meta.url).pathname,
  ], {
    env: {
      ...process.env,
      BEATAPI_MCP_PROFILE: "media-review",
      BEATAPI_API_KEY: " ",
      BEATAPI_CLI_PATH: "/must-not-execute-cli",
    },
    encoding: "utf8",
  });
  assert.equal(result.status, 1);
  assert.equal(result.stdout, "");
  assert.match(result.stderr, /CLI credential fallback is not enabled/);
});

test("review draft cases name only tools in the media candidate surface", async () => {
  const cases = JSON.parse(await readFile(
    new URL("../submission/test-cases.json", import.meta.url), "utf8",
  ));
  for (const item of cases.positive) {
    for (const name of item.tools_triggered.split(", ")) {
      assert.ok(mediaReviewTools.includes(name), name);
    }
  }
});
