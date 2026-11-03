/**
 * [INPUT]: 远程发布构建器、本地 metadata、候选工具与 mock OAuth 响应
 * [OUTPUT]: 验证公开包无需本地执行、拒绝凭证和无效端点、保留完整远程接线
 * [POS]: 公开发布边界回归；不代替真实用户 OAuth、计费或门户审核
 * [PROTOCOL]: 变更时更新此头部，然后检查 AGENTS.md
 */
import assert from "node:assert/strict";
import { readFileSync, mkdtempSync, rmSync, existsSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
import { execFileSync } from "node:child_process";
import test from "node:test";
import { compileRemoteCatalog, createRemoteDispatcher, adaptRemoteNext, discoveryTools, taskTool, resultTool } from "../scripts/remote-capabilities.mjs";
import { probeRemoteTools, validateRemoteCatalog } from "../scripts/remote-preflight.mjs";
import {
  createRemoteManifest,
  validateRemoteConfig,
  probeRemoteOAuth,
  buildRemotePackage,
  probeRemoteRelease,
} from "../scripts/submission-package.mjs";

const root = resolve(import.meta.dirname, "..");
const local = JSON.parse(readFileSync(join(root, ".codex-plugin/plugin.json"), "utf8"));
const config = () => ({
  mcpServers: {
    beatapi: {
      type: "streamable-http",
      url: "https://api.beatapi.io/test-mcp",
      extensions: { "com.openai": { auth: { type: "oauth", client: { mode: "dcr" } } } },
    },
  },
});

test("remote manifest has complete listing without local runtime dependencies", () => {
  const manifest = createRemoteManifest(local, "0.4.0", "Remote preparation.");
  const ui = manifest.extensions["com.openai"].interface;
  assert.equal(manifest.name, local.name);
  assert.equal(manifest.mcpServers, undefined);
  assert.equal(manifest.skills, undefined);
  assert.equal(ui.supportURL, "https://github.com/BeatAPI/beatapi-agent-plugin/issues");
  assert.ok(ui.shortDescription.length <= 30);
  assert.match(ui.longDescription, /OAuth/);
  for (const domain of ["social", "web", "text", "decision", "images", "videos"]) assert.ok(ui.longDescription.includes(domain));
  assert.doesNotMatch(JSON.stringify(manifest), /BEATAPI_CLI_PATH|stdio|API key|requires_local_executor/);
  for (const key of ["websiteURL", "supportURL", "privacyPolicyURL", "termsOfServiceURL"]) {
    assert.equal(new URL(ui[key]).protocol, "https:");
  }
});

test("remote configuration accepts OAuth registration but rejects local or secret-bearing inputs", () => {
  validateRemoteConfig(config());
  for (const mutate of [
    (c) => { c.mcpServers.beatapi.type = "stdio"; },
    (c) => { c.mcpServers.beatapi.command = "node"; },
    (c) => { c.mcpServers.beatapi.url = "http://localhost:3000/mcp"; },
    (c) => { c.mcpServers.beatapi.url += "?key=secret"; },
    (c) => { c.mcpServers.beatapi.url = "https://api.beatapi.io:8443/mcp"; },
    (c) => { c.mcpServers.beatapi.headers = { Authorization: "Bearer secret" }; },
    (c) => { c.mcpServers.beatapi.env = { BEATAPI_API_KEY: "secret" }; },
    (c) => { c.mcpServers.beatapi.extensions["com.openai"].auth.type = "api_key"; },
    (c) => { c.mcpServers.beatapi.extensions["com.openai"].auth.client.clientSecret = "secret"; },
    (c) => { c.mcpServers.beatapi.extensions["com.openai"].auth.tokenUrl = "https://evil.example/token"; },
    (c) => { c.mcpServers.other = structuredClone(c.mcpServers.beatapi); },
  ]) {
    const candidate = config();
    mutate(candidate);
    assert.throws(() => validateRemoteConfig(candidate));
  }
  const provided = config();
  provided.mcpServers.beatapi.extensions["com.openai"].auth.client = { mode: "provided" };
  assert.throws(() => validateRemoteConfig(provided), /clientId/);
  provided.mcpServers.beatapi.extensions["com.openai"].auth.client.clientId = "registered-public-client";
  validateRemoteConfig(provided);
});

function mockOAuth() {
  const calls = [];
  const resource = "https://api.beatapi.io/test-mcp";
  const fetcher = async (url, init) => {
    calls.push(String(url));
    assert.equal(init?.redirect, "error");
    assert.equal(new Headers(init?.headers).has("authorization"), false);
    if (String(url) === resource) return new Response(null, { status: 401, headers: {
      "www-authenticate": 'Bearer resource_metadata="https://api.beatapi.io/.well-known/oauth-protected-resource"',
    } });
    if (String(url).includes("/.well-known/oauth-protected-resource")) return Response.json({
      resource, authorization_servers: ["https://api.beatapi.io"],
    });
    return Response.json({ issuer: "https://api.beatapi.io", authorization_endpoint: "https://api.beatapi.io/oauth/authorize",
      token_endpoint: "https://api.beatapi.io/oauth/token", registration_endpoint: "https://api.beatapi.io/oauth/register",
      response_types_supported: ["code"], code_challenge_methods_supported: ["S256"] });
  };
  return { calls, fetcher };
}

test("live preflight follows OAuth metadata, never sends credentials or calls paid tools", async () => {
  const { calls, fetcher } = mockOAuth();
  await probeRemoteOAuth(config(), fetcher);
  assert.equal(calls.length, 3);
  assert.ok(calls.every((url) => !url.endsWith("/token") && !url.endsWith("/register")));
  await assert.rejects(probeRemoteOAuth(config(), async () => new Response(null, { status: 401 })), /OAuth/);
  const anonymous = mockOAuth().fetcher;
  await probeRemoteOAuth(config(), (url, init) => String(url) === config().mcpServers.beatapi.url
    ? Promise.resolve(Response.json({ jsonrpc: "2.0", id: 1, result: {} })) : anonymous(url, init));
  const base = mockOAuth().fetcher;
  await assert.rejects(probeRemoteOAuth(config(), async (url, init) => {
    if (String(url).endsWith("oauth-protected-resource")) return Response.json({resource: "https://api.beatapi.io/other", authorization_servers: ["https://api.beatapi.io"]});
    return base(url, init);
  }), /resource/);
  await assert.rejects(probeRemoteOAuth(config(), async (url, init) => {
    if (String(url).endsWith("oauth-authorization-server")) {
      const metadata = await (await base(url, init)).json();
      return Response.json({ ...metadata, code_challenge_methods_supported: ["plain"] });
    }
    return base(url, init);
  }), /S256/);
  const provided = config();
  provided.mcpServers.beatapi.extensions["com.openai"].auth.client = {
    mode: "provided", clientId: "registered-public-client", tokenEndpointAuthMethod: "none",
  };
  await assert.rejects(probeRemoteOAuth(provided, mockOAuth().fetcher), /authentication method/);
});

test("general remote Skill and review drafts cover discovery and bounded cross-domain composition", () => {
  const profile = JSON.parse(readFileSync(join(root, "submission/remote-tools.json"), "utf8"));
  assert.deepEqual(profile.discovery, discoveryTools);
  assert.equal(profile.task, taskTool);
  assert.equal(profile.result, resultTool);
  const skill = readFileSync(join(root, "submission/REMOTE-SKILL.md"), "utf8");
  assert.match(skill, /^---\nname: beatapi\n/);
  assert.doesNotMatch(skill, /npm install|BEATAPI_CLI_PATH|BEATAPI_API_KEY|capabilities_run|beatapi_upload_file/);
  const cases = JSON.parse(readFileSync(join(root, "submission/test-cases.json"), "utf8"));
  assert.equal(cases.positive.length, 5);
  assert.equal(cases.negative.length, 3);
  for (const item of cases.positive) {
    assert.match(item.description, /Draft, not run/);
    assert.ok(item.stages.every((stage) => ["search", "inspect", "execute", "status", "result"].includes(stage)));
  }
});

function capability(reference, overrides = {}) {
  return { reference, kind: reference.split(":")[0], title: "Test capability", description: "Test operation",
    readiness: "ready", schema_hash: "test-schema", execution: { mode: "sync", executable: true, status_supported: false },
    input_schema: { type: "object", additionalProperties: false, required: ["query"], properties: { query: { type: "string", minLength: 1 } } },
    ...overrides };
}

function mockReady(catalog, change = (tools) => tools) {
  const base = mockOAuth();
  const tools = change([...discoveryTools.map((name) => ({ name, title: name, description: "Read the public capability catalog.",
    inputSchema: { type: "object", properties: {} }, annotations: { readOnlyHint: true, destructiveHint: false, openWorldHint: false },
    securitySchemes: [{ type: "noauth" }], _meta: { securitySchemes: [{ type: "noauth" }] } })), ...structuredClone(catalog.tools)]);
  const methods = [];
  return { methods, tools, fetcher: async (url, init) => {
    if (String(url) !== config().mcpServers.beatapi.url) return base.fetcher(url, init);
    assert.equal(new Headers(init.headers).has("authorization"), false);
    assert.equal(new Headers(init.headers).has("cookie"), false);
    if (init.method === "GET") return new Response(null, { status: 405 });
    const message = JSON.parse(init.body);
    methods.push(message.method);
    if (message.method === "initialize") return Response.json({ jsonrpc: "2.0", id: message.id,
      result: { protocolVersion: message.params.protocolVersion, capabilities: { tools: {} }, serverInfo: { name: "beatapi-test", version: "1" } } });
    if (message.method === "notifications/initialized") return new Response(null, { status: 202 });
    assert.equal(message.method, "tools/list", "preflight must not execute tools");
    const offset = Number(message.params?.cursor ?? 0);
    const end = Math.min(offset + 2, tools.length);
    return Response.json({ jsonrpc: "2.0", id: message.id,
      result: { tools: tools.slice(offset, end), ...(end < tools.length ? { nextCursor: String(end) } : {}) } });
  } };
}

test("release preflight uses real SDK pagination and compares every exposed tool without running any", async () => {
  const catalog = compileRemoteCatalog([capability("data:search"), capability("model:image", {
    execution: { mode: "async", executable: true, status_supported: true },
  })]);
  const remote = mockReady(catalog);
  const report = await probeRemoteRelease(config(), catalog, remote.fetcher);
  assert.equal(report.tools.toolCount, catalog.tools.length + discoveryTools.length);
  assert.match(report.tools.catalogSha256, /^[a-f0-9]{64}$/);
  assert.equal(report.tools.anonymousToolListing, true);
  assert.ok(report.tools.notVerified.includes("user OAuth consent, refresh and revocation"));
  assert.ok(remote.methods.filter((method) => method === "tools/list").length > 1);
  assert.ok(remote.methods.every((method) => ["initialize", "notifications/initialized", "tools/list"].includes(method)));
  assert.throws(() => validateRemoteCatalog({ ...catalog, tools: [...catalog.tools, catalog.tools[0]] }), /Duplicate/);
  assert.throws(() => validateRemoteCatalog({ ...catalog, bindings: {} }), /binding/i);
  for (const change of [
    (tools) => tools.slice(1),
    (tools) => [...tools, { ...tools[0], name: "capabilities_run" }],
    (tools) => { tools[2].inputSchema.properties.input.properties.query.type = "integer"; return tools; },
    (tools) => { tools[2].annotations.readOnlyHint = true; return tools; },
    (tools) => { tools[2]._meta.securitySchemes = [{ type: "noauth" }]; return tools; },
    (tools) => { tools[2]._meta["beatapi/capability"].schemaHash = "drifted-contract"; return tools; },
    (tools) => { delete tools[0].annotations.openWorldHint; return tools; },
    (tools) => [...tools, tools[0]],
  ]) {
    await assert.rejects(probeRemoteTools(config().mcpServers.beatapi.url, catalog, mockReady(catalog, change).fetcher));
  }
  const looping = mockReady(catalog);
  let page = 0;
  await assert.rejects(probeRemoteTools(config().mcpServers.beatapi.url, catalog, (url, init) => {
    const message = init?.method === "POST" ? JSON.parse(init.body) : null;
    if (message?.method !== "tools/list") return looping.fetcher(url, init);
    return Promise.resolve(Response.json({ jsonrpc: "2.0", id: message.id,
      result: { tools: [looping.tools[page++]], nextCursor: "repeated-cursor" } }));
  }), /pagination/);
});

test("catalog compiler exposes each executable reference independently and reports unsupported contracts", () => {
  const contracts = [capability("data:xiaohongshu.search"), capability("model:text"), capability("workflow:media", {
    execution: { mode: "async", executable: true, status_supported: true },
  }), capability("data:listed", { readiness: "listed" }), capability("data:cookie", {
    input_schema: { type: "object", properties: { cookie: { type: "string" } } },
  }), capability("data:unresolved", { input_schema: { type: "object", properties: { query: { $ref: "https://example.com/schema" } } } })];
  const catalog = compileRemoteCatalog(contracts);
  assert.equal(Object.keys(catalog.bindings).length, 3);
  assert.equal(catalog.excluded.length, 3);
  assert.deepEqual(catalog, compileRemoteCatalog(contracts.toReversed()));
  assert.ok(catalog.tools.every((tool) => tool.name.length <= 64 && tool.name !== "capabilities_run"));
  assert.ok(catalog.tools.every((tool) => Object.values(tool.annotations).every((value) => typeof value === "boolean")));
  for (const tool of catalog.tools) {
    const reference = catalog.bindings[tool.name]?.reference;
    const scope = !reference ? "mcp:tasks:read" : reference.startsWith("data:") ? "mcp:data:read" : reference.startsWith("workflow:") ? "mcp:media:create" : "mcp:models:run";
    assert.deepEqual(tool.securitySchemes, [{ type: "oauth2", scopes: [scope] }]);
    assert.deepEqual(tool._meta.securitySchemes, tool.securitySchemes);
  }
  assert.throws(() => compileRemoteCatalog([contracts[0], contracts[0]]), /Duplicate/);
  assert.throws(() => compileRemoteCatalog([contracts[3]]), /empty/);
});

test("remote dispatch pins references, validates exact input and prevents generic execution or mode switching", () => {
  const catalog = compileRemoteCatalog([capability("data:search"), capability("model:image", {
    execution: { mode: "async", executable: true, status_supported: true },
  })]);
  const dispatch = createRemoteDispatcher(catalog);
  const name = Object.keys(catalog.bindings).find((key) => catalog.bindings[key].reference === "data:search");
  const args = { input: { query: "test" }, idempotency_key: "one-logical-call" };
  assert.deepEqual(dispatch(name, args), { reference: "data:search", operation: "start", ...args, view: "preview" });
  for (const invalid of [{ ...args, reference: "model:image" }, { ...args, operation: "status" }, { input: args.input },
    { ...args, idempotency_key: " " }, { ...args, idempotency_key: "<idempotency_key>" },
    { ...args, input: { query: 3 } }, { ...args, input: { query: "test", surprise: true } }]) assert.throws(() => dispatch(name, invalid));
  assert.throws(() => dispatch("capabilities_run", args), /not exposed/);
  assert.throws(() => dispatch(taskTool, { reference: "data:search", task_id: "owned-task" }));
  assert.deepEqual(dispatch(taskTool, { reference: "model:image", task_id: "owned-task" }), {
    reference: "model:image", task_id: "owned-task", operation: "status", view: "preview",
  });
});

test("catalog normalizes example annotations without removing a property named examples", () => {
  const source = { type: "object", properties: { query: { type: "string", examples: { one: "hello" } }, examples: { type: "string" } }, required: ["query"], examples: { query: "hello" } };
  const catalog = compileRemoteCatalog([capability("data:examples", { input_schema: source })]);
  const name = Object.keys(catalog.bindings)[0];
  const schema = catalog.tools.find((tool) => tool.name === name).inputSchema.properties.input;
  assert.deepEqual(schema.examples, [{ query: "hello" }]);
  assert.deepEqual(schema.properties.query.examples, [{ one: "hello" }]);
  assert.equal(schema.properties.examples.type, "string");
  assert.equal(Array.isArray(source.examples), false);
  assert.throws(() => createRemoteDispatcher(catalog)(name, { input: { query: 7 }, idempotency_key: "one" }), /Invalid tool arguments/);
});

test("next adaptation stays within exposed bindings and never walks untrusted result content", () => {
  const catalog = compileRemoteCatalog([capability("data:search")]);
  const original = { data: { next: { action: "run", call: { tool: "capabilities_run", arguments: {
    reference: "data:search", input: { query: "<query>" }, view: "preview",
  } } }, items: [{ next: { call: { tool: "steal_credentials" } } }] } };
  const adapted = adaptRemoteNext(catalog, original);
  assert.equal(adapted.data.next.call.tool, Object.keys(catalog.bindings)[0]);
  assert.deepEqual(adapted.data.next.call.arguments, { input: { query: "<query>" }, idempotency_key: "<idempotency_key>" });
  assert.deepEqual(adapted.data.items, original.data.items);
  assert.equal(original.data.next.call.tool, "capabilities_run");
  for (const args of [{ reference: "data:unknown" }, { reference: "data:search", operation: "delete" }]) {
    assert.equal(adaptRemoteNext(catalog, { error: { next: { action: "run", call: { tool: "capabilities_run", arguments: args } } } }).error.next.action, "none");
  }
  const result = adaptRemoteNext(catalog, { data: { next: { action: "result", call: { tool: "capabilities_run", arguments: {
    reference: "data:search", operation: "result", request_id: "stored-result", view: "full", fields: ["items[].title"],
  } } } } });
  assert.equal(result.data.next.call.tool, resultTool);
  assert.equal(result.data.next.call.arguments.request_id, "stored-result");
  const body = createRemoteDispatcher(catalog)(result.data.next.call.tool, result.data.next.call.arguments);
  assert.equal(body.view, "full", "stored full reads must not be downgraded to another truncated preview");
  assert.deepEqual(body.fields, ["items[].title"]);
});

test("remote ZIP contains portable connection and Skill but no local MCP or credentials", async () => {
  const dist = mkdtempSync(join(tmpdir(), "beatapi-remote-package-"));
  try {
    const catalog = compileRemoteCatalog([capability("data:search")]);
    await assert.rejects(buildRemotePackage(root, dist, config(), mockOAuth().fetcher), /catalog/i);
    await assert.rejects(buildRemotePackage(root, dist, config(), mockReady(catalog, (tools) => tools.slice(1)).fetcher, catalog), /tool/i);
    const archive = await buildRemotePackage(root, dist, config(), mockReady(catalog).fetcher, catalog);
    const files = execFileSync("unzip", ["-Z1", archive], { encoding: "utf8" }).split("\n");
    const prefix = "beatapi-agent-plugin/";
    for (const name of ["plugin.json", "mcp.json", "skills/beatapi/SKILL.md", "assets/logo.png", "assets/icon.png", "LICENSE"]) {
      assert.ok(files.includes(prefix + name), name);
    }
    assert.doesNotMatch(files.join("\n"), /node_modules|server\.mjs|\.codex-plugin|\.app\.json|\.env|README\.txt/);
    const remote = JSON.parse(execFileSync("unzip", ["-p", archive, prefix + "mcp.json"], { encoding: "utf8" }));
    validateRemoteConfig(remote);
    const manifest = JSON.parse(execFileSync("unzip", ["-p", archive, prefix + "plugin.json"], { encoding: "utf8" }));
    assert.equal(manifest.extensions["com.openai"].review, undefined);
    await assert.rejects(buildRemotePackage(root, dist, config(), mockReady(catalog, (tools) => tools.slice(1)).fetcher, catalog), /tool/i);
    assert.equal(existsSync(archive), false, "a failed rebuild must not leave a stale public ZIP");
  } finally {
    rmSync(dist, { recursive: true, force: true });
  }
});

test("public build without an actual server configuration refuses to emit a replacement Skill-only package", () => {
  assert.throws(() => execFileSync(process.execPath, ["scripts/build-submission.mjs"], {cwd: root, stdio: "pipe"}), /mcp-config/);
});

test("probe CLI records missing prerequisites as blocked, never as successful review evidence", () => {
  const dir = mkdtempSync(join(tmpdir(), "beatapi-preflight-report-"));
  try {
    const path = join(dir, "mcp.json");
    const report = join(dir, "report.json");
    writeFileSync(path, JSON.stringify(config()));
    assert.throws(() => execFileSync(process.execPath, ["scripts/build-submission.mjs", "--probe", "--mcp-config", path,
      "--report", report], { cwd: root, stdio: "pipe" }), /catalog/);
    const result = JSON.parse(readFileSync(report, "utf8"));
    assert.equal(result.status, "blocked");
    assert.match(result.reason, /catalog/);
    assert.equal(result.tools, undefined);
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
});
