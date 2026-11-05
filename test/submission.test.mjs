/**
 * [INPUT]: 远程发布构建器、展示翻译、品牌 PNG、审核案例与 mock OAuth 响应
 * [OUTPUT]: 验证展示/ZIP 同源、录像链接必填、低价图片审核案例、研究和私信拒绝规则、公开范围及凭证边界
 * [POS]: 公开发布边界回归；不代替真实用户 OAuth、计费或门户审核
 * [PROTOCOL]: 变更时更新此头部，然后检查 AGENTS.md
 */
import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { readFileSync, mkdtempSync, rmSync, existsSync, writeFileSync, mkdirSync } from "node:fs";
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
  checkListingAssets,
  checkRemoteSource,
  exportListing,
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

test("public icons include a dark composer variant and satisfy actual PNG dimensions", () => {
  const ui = checkRemoteSource(root).extensions["com.openai"].interface;
  assert.equal(ui.composerIconDark, "./assets/logo-dark.png");
  checkListingAssets(root, ui);
  assert.throws(() => checkListingAssets(root, { ...ui, logo: "../logo.png" }), /path/);
  const dir = mkdtempSync(join(tmpdir(), "beatapi-icons-"));
  try {
    mkdirSync(join(dir, "assets"));
    const png = Buffer.from(readFileSync(join(root, "assets/logo.png")));
    png.writeUInt32BE(128, 16);
    writeFileSync(join(dir, "assets/logo.png"), png);
    assert.throws(() => checkListingAssets(dir, ui), /square/);
    writeFileSync(join(dir, "assets/logo.png"), "not a PNG");
    assert.throws(() => checkListingAssets(dir, ui), /PNG/);
    writeFileSync(join(dir, "assets/logo.png"), Buffer.alloc(5 * 1024 * 1024 + 1));
    assert.throws(() => checkListingAssets(dir, ui), /5 MiB/);
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
});

test("remote manifest has complete listing without local runtime dependencies", () => {
  const manifest = createRemoteManifest(local, "0.4.0", "Remote preparation.");
  const ui = manifest.extensions["com.openai"].interface;
  assert.equal(manifest.name, local.name);
  assert.equal(ui.displayName, "BeatAPI Agent Toolkit");
  assert.equal(ui.developerName, "Logiavox LLC");
  assert.equal(manifest.author.name, "Logiavox LLC");
  assert.equal(local.author.name, "BeatAPI");
  assert.ok(ui.displayName.length <= 30);
  assert.equal(manifest.mcpServers, undefined);
  assert.equal(manifest.skills, undefined);
  assert.equal(ui.supportURL, "https://github.com/BeatAPI/beatapi-agent-plugin/issues");
  assert.ok(ui.shortDescription.length <= 30);
  assert.match(ui.longDescription, /OAuth/);
  assert.match(ui.longDescription, /Search and Inspect are free/);
  assert.equal(ui.shortDescription, "Research, SEO and AI creation");
  for (const area of ["Social research:", "Web research:", "SEO and competitor analysis:", "AI creation and workflows:", "Text and decision models:"]) {
    assert.ok(ui.longDescription.includes(area), area);
  }
  assert.match(ui.longDescription, /historical snapshots, not live rank tracking/);
  assert.ok(manifest.keywords.includes("seo"));
  assert.match(ui.defaultPrompt[0], /social.*web/);
  assert.match(ui.defaultPrompt[1], /SEO/);
  assert.match(ui.defaultPrompt[2], /visuals.*video/);
  assert.match(ui.longDescription, /product visuals, ad creatives, social images and short videos/);
  assert.match(ui.longDescription, /public HTTPS URLs/);
  assert.deepEqual(manifest.extensions["com.openai"].publication.countries, []);
  const review = manifest.extensions["com.openai"].review;
  assert.equal(review.commerce, false);
  assert.match(review.commerce_description, /existing BeatAPI balance/);
  assert.match(review.commerce_description, /independently on the BeatAPI website/);
  assert.match(review.commerce_description, /does not sell credits/);
  for (const domain of ["social", "web", "text", "decision", "images", "videos"]) assert.ok(ui.longDescription.includes(domain));
  assert.doesNotMatch(JSON.stringify(manifest), /BEATAPI_CLI_PATH|stdio|API key|requires_local_executor/);
  for (const key of ["websiteURL", "supportURL", "privacyPolicyURL", "termsOfServiceURL"]) {
    assert.equal(new URL(ui[key]).protocol, "https:");
  }
});

test("private presentation and submission share English defaults, translations and real icons", () => {
  const manifest = checkRemoteSource(root);
  const openai = manifest.extensions["com.openai"];
  assert.equal(openai.interface.displayName, "BeatAPI Agent Toolkit");
  assert.equal(openai.interface.category, "Productivity");
  assert.equal(openai.interface.websiteURL, "https://beatapi.io");
  assert.equal(openai.interface.shortDescription, "Research, SEO and AI creation");
  assert.match(manifest.description, /^Combine social and web research/);
  assert.deepEqual(Object.keys(openai.publication.translations), ["zh-CN", "ja-JP"]);
  assert.match(openai.publication.translations["zh-CN"].description, /不支持发帖、私信/);
  assert.match(openai.publication.translations["ja-JP"].description, /リアルタイムの順位計測ではありません/);
  for (const entry of Object.values(openai.publication.translations)) {
    assert.ok(entry.subtitle.length <= 30);
    assert.ok(entry.description.length <= 4000);
    assert.ok(entry.description.includes("OAuth"));
    assert.ok(entry.description.includes("HTTPS"));
  }
  const directory = mkdtempSync(join(tmpdir(), "beatapi-presentation-"));
  try {
    exportListing(root, directory);
    assert.deepEqual(JSON.parse(readFileSync(join(directory, "plugin.json"), "utf8")), manifest);
    for (const path of [openai.interface.logo, openai.interface.logoDark, openai.interface.composerIcon, openai.interface.composerIconDark]) {
      assert.deepEqual(readFileSync(join(directory, path)), readFileSync(join(root, path)));
    }
    assert.equal(existsSync(join(directory, "mcp.json")), false, "listing export must not pretend to be an installable connection");
    assert.equal(existsSync(join(directory, ".app.json")), false);
  } finally {
    rmSync(directory, { recursive: true, force: true });
  }
});

test("remote skill discloses insufficient balance without promoting a purchase", () => {
  const skill = readFileSync(join(root, "submission/REMOTE-SKILL.md"), "utf8");
  assert.match(skill, /Do not promote top-ups or link to checkout/);
  assert.match(skill, /If balance is insufficient, explain the execution limitation and stop/);
});

test("research guidance preserves evidence and SEO metric boundaries", () => {
  const skill = readFileSync(join(root, "submission/REMOTE-SKILL.md"), "utf8");
  for (const boundary of ["read_status", "position_seen_at", "has_data", "total site visits", "country and language", "not continuous monitoring"]) {
    assert.ok(skill.includes(boundary), boundary);
  }
  assert.match(skill, /Do not promise ranking gains/);
});

test("out-of-scope social requests stop without suggesting another integration", () => {
  const skill = readFileSync(join(root, "submission/REMOTE-SKILL.md"), "utf8");
  assert.match(skill, /For requests to publish posts, read private messages or use login cookies/);
  assert.match(skill, /Do not offer, recommend or investigate another plugin, integration or credential path/);
  assert.match(skill, /Do not ask which platform or account to access for these unsupported actions/);
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
  assert.match(skill, /Do not turn a refusal into a purchase or credential path/);
  assert.doesNotMatch(skill, /npm install|BEATAPI_CLI_PATH|BEATAPI_API_KEY|capabilities_run|beatapi_upload_file/);
  const cases = JSON.parse(readFileSync(join(root, "submission/test-cases.json"), "utf8"));
  assert.equal(cases.positive.length, 5);
  assert.equal(cases.negative.length, 3);
  for (const item of cases.positive) {
    assert.match(item.description, /execution evidence is recorded separately/);
    assert.ok(item.tools_triggered.includes("capabilities_inspect"));
    assert.equal(item.stages, undefined);
  }
  assert.deepEqual(checkRemoteSource(root).extensions["com.openai"].review.test_cases, cases);
  const fixtureHash = createHash("sha256").update(readFileSync(join(root, "assets/demo-water-bottle-v1.png"))).digest("hex");
  const mediaCase = cases.positive.find((item) => item.tools_triggered.includes("beatapi_model_nano_banana_2_890739a2f7"));
  assert.ok(mediaCase.prompt.includes(`https://cdn.beatapi.io/plugins/beatapi-agent-toolkit/review/demo-water-bottle-${fixtureHash.slice(0, 12)}.png`));
  assert.match(mediaCase.description, /AI-generated fictional unbranded/);
  assert.match(mediaCase.prompt, /1K, 9:16 and PNG/);
  assert.match(mediaCase.expected_behavior, /resolution=1K, aspect_ratio=9:16, output_format=png/);
  assert.doesNotMatch(mediaCase.tools_triggered, /workflow_ecommerce/);
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

test("public research catalog excludes messaging, device and credential utilities without blocking public research", () => {
  const excluded = [
    "data:bilibili.huahuo.account_session_info",
    "data:douyin.app.v3.open_douyin_app_to_send_private_message",
    "data:tiktok.app.v3.open_tiktok_app_to_send_private_message",
    "data:douyin.app.v3.register_device",
    "data:douyin.web.fetch_douyin_web_guest_cookie",
    "data:tiktok.web.fetch_tiktok_web_guest_cookie",
    "data:tiktok.web.generate_real_mstoken",
  ];
  const permitted = ["data:xiaohongshu.app_v2.search_notes", "data:creator.contacts", "data:douyin.xingtu_v2.get_author_hot_comment_tokens"];
  const catalog = compileRemoteCatalog([...excluded, ...permitted].map((reference) => capability(reference)));
  assert.deepEqual(Object.values(catalog.bindings).map((item) => item.reference).sort(), permitted.sort());
  assert.deepEqual(catalog.excluded.map((item) => item.reference).sort(), excluded.sort());
  assert.ok(catalog.excluded.every((item) => item.reason.startsWith("outside public research/creation scope:")));
  const dispatcher = createRemoteDispatcher(catalog);
  const unsafe = compileRemoteCatalog([capability("data:search")]);
  const name = Object.keys(unsafe.bindings)[0];
  const reference = excluded[0];
  unsafe.bindings[name].reference = reference;
  unsafe.tools[0]._meta["beatapi/capability"].reference = reference;
  assert.throws(() => validateRemoteCatalog(unsafe), /public.*scope/);
  assert.throws(() => dispatcher("capabilities_run", { reference }), /not exposed/);
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
    const catalog = compileRemoteCatalog([
      capability("data:xiaohongshu.app_v2.search_notes"), capability("data:web.search"), capability("data:web.read"),
      capability("data:seo.keyword_overview"), capability("model:nano-banana-2", {
        execution: { mode: "async", executable: true, status_supported: true },
        input_schema: { type: "object", properties: {
          output_format: { type: "string" }, resolution: { type: "string" }, aspect_ratio: { type: "string" },
          images: { type: "array", items: { type: "string" } },
        } },
      }),
    ]);
    const demoUrl = "https://cdn.beatapi.io/plugins/review/demo.mp4";
    await assert.rejects(buildRemotePackage(root, dist, config(), mockOAuth().fetcher), /catalog/i);
    await assert.rejects(buildRemotePackage(root, dist, config(), mockReady(catalog).fetcher, catalog), /demo-recording-url/);
    for (const invalid of ["http://cdn.beatapi.io/demo.mp4", "https://user:password@cdn.beatapi.io/demo.mp4"]) {
      await assert.rejects(buildRemotePackage(root, dist, config(), mockReady(catalog).fetcher, catalog, invalid), /recording/i);
    }
    await assert.rejects(buildRemotePackage(root, dist, config(), mockReady(catalog, (tools) => tools.slice(1)).fetcher, catalog, demoUrl), /tool/i);
    const archive = await buildRemotePackage(root, dist, config(), mockReady(catalog).fetcher, catalog, demoUrl);
    const files = execFileSync("unzip", ["-Z1", archive], { encoding: "utf8" }).split("\n");
    const prefix = "beatapi-agent-plugin/";
    for (const name of ["plugin.json", "mcp.json", "skills/beatapi/SKILL.md", "assets/logo.png", "assets/logo-dark.png", "assets/icon.png", "LICENSE"]) {
      assert.ok(files.includes(prefix + name), name);
    }
    assert.doesNotMatch(files.join("\n"), /node_modules|server\.mjs|\.codex-plugin|\.app\.json|\.env|README\.txt/);
    const remote = JSON.parse(execFileSync("unzip", ["-p", archive, prefix + "mcp.json"], { encoding: "utf8" }));
    validateRemoteConfig(remote);
    const manifest = JSON.parse(execFileSync("unzip", ["-p", archive, prefix + "plugin.json"], { encoding: "utf8" }));
    const openai = manifest.extensions["com.openai"];
    assert.equal(openai.review.commerce, false);
    assert.equal(openai.review.test_cases.positive.length, 5);
    assert.equal(openai.review.test_cases.negative.length, 3);
    assert.equal(openai.interface.composerIconDark, "./assets/logo-dark.png");
    const icon = execFileSync("unzip", ["-p", archive, prefix + openai.interface.composerIconDark.slice(2)]);
    assert.deepEqual(icon, readFileSync(join(root, "assets/logo-dark.png")));
    assert.equal(openai.review.demo_recording_url, demoUrl);
    assert.deepEqual(openai.publication.countries, []);
    assert.deepEqual(openai.publication.translations, checkRemoteSource(root).extensions["com.openai"].publication.translations);
    await assert.rejects(buildRemotePackage(root, dist, config(), mockReady(catalog).fetcher,
      compileRemoteCatalog([capability("data:search")]), demoUrl), /Review case names an unavailable tool/);
    await assert.rejects(buildRemotePackage(root, dist, config(), mockReady(catalog, (tools) => tools.slice(1)).fetcher, catalog, demoUrl), /tool/i);
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
