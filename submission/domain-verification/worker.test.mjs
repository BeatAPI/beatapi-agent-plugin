/**
 * [INPUT]: 纯 HTTP Worker、部署配置与 Node 原生测试 API
 * [OUTPUT]: 公开 Token 响应及地址/方法隔离的回归证据
 * [POS]: 独立验证基础设施测试，不运行 MCP 或付费任务
 * [PROTOCOL]: 变更时更新此头部，然后检查 AGENTS.md
 */
import test from "node:test";
import assert from "node:assert/strict";
import worker from "./worker.mjs";
import config from "./cloudflare.config.ts";

const url = "https://api.beatapi.io/.well-known/openai-apps-challenge";

test("deployment owns only the exact verification route in the verified account", () => {
  assert.equal(config.accountId, "8529f0937781e0e44cb0075dc64c46e2");
  assert.deepEqual(config.worker.triggers, [{ type: "fetch", pattern: url, zone: "beatapi.io" }]);
  assert.equal(config.worker.domains, undefined);
  assert.equal(config.worker.env, undefined);
  assert.equal(config.worker.workersDev, false);
  assert.equal(config.worker.previewUrls, false);
});

test("GET returns only the public verification token without caching", async () => {
  const response = worker.fetch(new Request(url));
  assert.equal(response.status, 200);
  assert.equal(response.headers.get("Content-Type"), "text/plain; charset=utf-8");
  assert.equal(response.headers.get("Cache-Control"), "no-store");
  assert.equal(await response.text(), "7hcq-PF2w8_e5fKtZnSOvhSDzBPS_ezdue8CH3zNU7I");
});

test("HEAD succeeds without a body", async () => {
  const response = worker.fetch(new Request(url, { method: "HEAD" }));
  assert.equal(response.status, 200);
  assert.equal(await response.text(), "");
});

test("business URLs, other hosts and URL suffixes never return the token", async () => {
  for (const other of ["https://api.beatapi.io/mcp/openai", "https://beatapi.io/.well-known/openai-apps-challenge", url + "/", url + "?x=1"]) {
    assert.equal(worker.fetch(new Request(other)).status, 404);
  }
});

test("write methods cannot perform actions", () => {
  for (const method of ["POST", "PUT", "DELETE"]) {
    const response = worker.fetch(new Request(url, { method }));
    assert.equal(response.status, 405);
    assert.equal(response.headers.get("Allow"), "GET, HEAD");
  }
});
