import assert from "node:assert/strict";
import test from "node:test";
import { toolDefinitions } from "../mcp/src/tools.js";

test("the installable MCP exposes the same discovery and Web interfaces taught by the Skill", () => {
  const byName = new Map(toolDefinitions.map((tool) => [tool.name, tool]));
  for (const name of [
    "capabilities_search",
    "capabilities_inspect",
    "capabilities_run",
    "web_search",
    "web_read",
    "web_map",
    "web_research",
  ])
    assert.ok(byName.has(name), name);
  assert.equal(
    byName
      .get("capabilities_search")!
      .inputSchema.safeParse({ view: "full", group_by: "function" }).success,
    true,
  );
  assert.equal(
    byName.get("capabilities_run")!.inputSchema.safeParse({
      reference: "data:web.search",
      operation: "result",
      request_id: "req_fixture",
      fields: ["items[].title"],
    }).success,
    true,
  );
  assert.equal(
    byName.get("capabilities_run")!.inputSchema.safeParse({
      reference: "data:web.search",
      input: { api_key: "secret" },
    }).success,
    false,
  );
});
