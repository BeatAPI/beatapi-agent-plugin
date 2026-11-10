/**
 * [INPUT]: Node 测试器、隔离 fetch 与日志接收器
 * [OUTPUT]: 透明流转发、协议错误分类及无凭证/业务正文日志回归
 * [POS]: 临时线上诊断的部署门禁，不连接生产或运行付费工具
 * [PROTOCOL]: 变更时更新此头部，然后检查 AGENTS.md
 */
import test from "node:test";
import assert from "node:assert/strict";
import { createDiagnosticHandler } from "./worker.mjs";

const env = { DIAGNOSTIC_UNTIL: "2099-01-01T00:00:00Z" };
const request = (body, headers = {}, url = "https://api.beatapi.io/mcp/openai") => new Request(url, {
  method: "POST", headers: { "content-type": "application/json", ...headers }, body: JSON.stringify(body),
});
const run = async (req, response, extra = {}) => {
  const logs = [], pending = [], forwarded = [];
  const handle = createDiagnosticHandler({ fetchOrigin: async r => { forwarded.push(r); return response; }, emit: v => logs.push(v), ...extra });
  const result = await handle(req, env, { waitUntil: p => pending.push(p) });
  await Promise.all(pending);
  return { logs, forwarded, result };
};

test("origin sees the same request, response and streaming body are unchanged", async () => {
  const req = request({ method: "tools/call", params: { arguments: { prompt: "PRIVATE", token: "SECRET" } } }, { authorization: "Bearer SECRET", cookie: "session=SECRET" });
  const response = new Response("event: message\ndata: PRIVATE\n\n", { headers: { "content-type": "text/event-stream", "mcp-session-id": "session-secret" } });
  const { result, forwarded, logs } = await run(req, response);
  assert.equal(forwarded[0], req);
  assert.equal(result, response);
  assert.equal(forwarded[0].headers.get("authorization"), "Bearer SECRET");
  assert.equal((await forwarded[0].json()).params.arguments.prompt, "PRIVATE");
  assert.equal(await result.text(), "event: message\ndata: PRIVATE\n\n");
  assert.equal(logs[0].rpcMethod, "tools/call");
  assert.doesNotMatch(JSON.stringify(logs), /PRIVATE|SECRET|session-secret|authorization|cookie/);
});

test("known protocol error is classified without logging request args or query values", async () => {
  const req = request({ method: "initialize", params: { password: "PRIVATE" } }, { accept: "application/json", "mcp-protocol-version": "2025-06-18", "user-agent": "Python/3.14 aiohttp/3.14.4" }, "https://api.beatapi.io/mcp/openai?token=PRIVATE");
  const error = "Accept must contain both 'application/json' and 'text/event-stream'\n";
  const { logs, result } = await run(req, new Response(error, { status: 400 }));
  assert.equal(await result.text(), error);
  assert.equal(logs[0].protocolError, "accept_requires_json_and_sse");
  assert.deepEqual(logs[0].accept, { present: true, json: true, eventStream: false, wildcard: false });
  assert.equal(logs[0].queryPresent, true);
  assert.equal(logs[0].rpcMethod, "initialize");
  assert.equal(logs[0].protocolVersion, "2025-06-18");
  assert.match(logs[0].client, /Python/);
  assert.doesNotMatch(JSON.stringify(logs), /PRIVATE|password|token=/);
});

test("untrusted method/header/error strings never enter logs", async () => {
  const { logs } = await run(request({ method: "PRIVATE" }, { accept: "PRIVATE", "mcp-protocol-version": "PRIVATE", "user-agent": "PRIVATE" }), new Response("PRIVATE upstream credentials", { status: 400 }));
  assert.equal(logs[0].rpcMethod, "other");
  assert.equal(logs[0].protocolError, "unclassified");
  assert.doesNotMatch(JSON.stringify(logs), /PRIVATE|credentials/);
});

test("large or malformed body is not logged; existing response remains intact", async () => {
  for (const body of ["not json PRIVATE", JSON.stringify({ method: "initialize", params: { prompt: "PRIVATE".repeat(10000) } })]) {
    const req = new Request("https://api.beatapi.io/mcp/openai", { method: "POST", body });
    const { logs, result } = await run(req, new Response("original"));
    assert.equal(await result.text(), "original");
    assert.equal(logs[0].rpcMethod, "unobserved");
    assert.doesNotMatch(JSON.stringify(logs), /PRIVATE/);
  }
});

test("other paths and expired or missing window bypass observation", async () => {
  for (const [url, vars] of [["https://api.beatapi.io/v1/images", env], ["https://api.beatapi.io/mcp/openai", {}], ["https://api.beatapi.io/mcp/openai", { DIAGNOSTIC_UNTIL: "2000-01-01" }]]) {
    const logs = [];
    const r = new Response("unchanged");
    const h = createDiagnosticHandler({ fetchOrigin: async () => r, emit: v => logs.push(v) });
    assert.equal(await h(new Request(url), vars, { waitUntil() { assert.fail("unexpected observation"); } }), r);
    assert.equal(logs.length, 0);
  }
});

test("origin failure is not retried and logger failure cannot alter a response", async () => {
  let calls = 0;
  const failure = new Error("PRIVATE");
  const h = createDiagnosticHandler({ fetchOrigin: async () => { calls++; throw failure; }, emit: () => { throw Error("logger unavailable"); } });
  await assert.rejects(h(request({ method: "initialize" }), env, { waitUntil() {} }), /MCP origin fetch failed/);
  assert.equal(calls, 1);
  const response = new Response("ok");
  const { result } = await run(request({ method: "initialize" }), response, { emit: () => { throw Error("logger unavailable"); } });
  assert.equal(result, response);
});
