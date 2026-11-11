/**
 * [INPUT]: Cursor 远程配置验证器、同源 Skill 构建及隔离发行目录
 * [OUTPUT]: 远程接线、SDK 离线 PKCE/刷新、生成一致性和无本地运行时的回归证据
 * [POS]: 宿主发布边界测试，不调用线上服务或模拟真实 OAuth 成功
 * [PROTOCOL]: 变更时更新此头部，然后检查 AGENTS.md
 */
import assert from "node:assert/strict";
import { mkdtempSync, readFileSync, readdirSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { resolve } from "node:path";
import { createHash } from "node:crypto";
import test from "node:test";
import { startAuthorization, exchangeAuthorization, refreshAuthorization } from "@modelcontextprotocol/sdk/client/auth.js";
import { cursorSkill, validateCursorSkill, buildCursorPackage } from "../scripts/build-cursor.mjs";
import { validateCursorRemote } from "../scripts/validate-cursor.mjs";

const root = resolve(import.meta.dirname, "..");
const read = (file) => JSON.parse(readFileSync(resolve(root, file), "utf8"));
const manifest = read(".cursor-plugin/plugin.json");
const mcp = read("mcp.json");

test("remote Cursor config is valid and does not reuse the ChatGPT client", () => {
  assert.equal(validateCursorRemote(manifest, mcp), manifest);
  const openai = read("submission/mcp.production.json");
  assert.equal(mcp.mcpServers.beatapi.url, openai.mcpServers.beatapi.url);
  assert.notEqual(mcp.mcpServers.beatapi.auth.CLIENT_ID,
    openai.mcpServers.beatapi.extensions["com.openai"].auth.client.clientId);
});

test("remote validator rejects local fallback, secrets and routing overrides", () => {
  for (const extra of [{command:"node"}, {cwd:"${PLUGIN_ROOT}"},
    {env:{BEATAPI_API_KEY:"test"}}, {headers:{Authorization:"Bearer test"}},
    {extensions:{"com.openai":{}}}, {url:"https://other.example/mcp"},
    {auth:{CLIENT_ID:"beatapi-chatgpt"}},
    {auth:{CLIENT_ID:"beatapi-cursor",CLIENT_SECRET:"secret"}}]) {
    const changed = structuredClone(mcp);
    Object.assign(changed.mcpServers.beatapi, extra);
    assert.throws(() => validateCursorRemote(manifest, changed), /shared HTTPS/);
  }
  const extraServer = structuredClone(mcp);
  extraServer.mcpServers.local = {command:"node"};
  assert.throws(() => validateCursorRemote(manifest, extraServer), /shared HTTPS/);
  assert.throws(() => validateCursorRemote({...manifest,variables:{type:"object"}},mcp), /no local credential/);
  assert.throws(() => validateCursorRemote({...manifest,skills:"./skills/"},mcp), /remote skills/);
});

test("installed remote Skill preserves the canonical instructions and host fallback", () => {
  const shared = readFileSync(resolve(root,"submission/REMOTE-SKILL.md"),"utf8").trimEnd();
  const skill = readFileSync(resolve(root,"cursor/skills/beatapi/SKILL.md"),"utf8");
  assert.equal(skill,cursorSkill());
  assert.doesNotThrow(() => validateCursorSkill(skill));
  assert.throws(() => validateCursorSkill(`${skill}\nStale instructions`), /stale/);
  assert.ok(skill.startsWith(`${shared}\n\n`));
  for (const phrase of ["Authenticate or Reconnect", "pricing uncertainty",
    "ordinary chat", "advertised interval", "never silently upload",
    "available tool list", "Auto-run", "routine, schedule", "raw JSON"]) {
    assert.ok(skill.includes(phrase),phrase);
  }
});

test("OAuth permissions are explicit and cannot contain duplicate or malformed scopes", () => {
  for (const scopes of [[], ["mcp:tasks:read", "mcp:tasks:read"], ["offline_access"], [null]]) {
    const changed = structuredClone(mcp);
    changed.mcpServers.beatapi.auth.scopes = scopes;
    assert.throws(() => validateCursorRemote(manifest, changed), /scopes/);
  }
});

// 验证静态配置与标准 SDK 的兼容，不模拟 Cursor/Grok Bot 的私有 OAuth 实现。
for (const redirectUri of ["https://www.cursor.com/agents/mcp/oauth/callback", "http://localhost:8787/callback"]) {
  test(`offline SDK public-client PKCE and refresh wire format: ${redirectUri}`, async () => {
    const server = mcp.mcpServers.beatapi;
    const issuer = "https://oauth.example.test/mcp/oauth";
    const metadata = {issuer, authorization_endpoint:`${issuer}/authorize`,
      token_endpoint:`${issuer}/token`, response_types_supported:["code"],
      code_challenge_methods_supported:["S256"], token_endpoint_auth_methods_supported:["none"]};
    const clientInformation = {client_id:server.auth.CLIENT_ID, token_endpoint_auth_method:"none"};
    const {authorizationUrl, codeVerifier} = await startAuthorization(issuer, {
      metadata, clientInformation, redirectUrl:redirectUri,
      scope:server.auth.scopes.join(" "), state:"offline-test-state", resource:server.url,
    });
    assert.equal(authorizationUrl.searchParams.get("client_id"),server.auth.CLIENT_ID);
    assert.equal(authorizationUrl.searchParams.get("redirect_uri"),redirectUri);
    assert.equal(authorizationUrl.searchParams.get("resource"),server.url);
    assert.equal(authorizationUrl.searchParams.get("scope"),server.auth.scopes.join(" "));
    assert.equal(authorizationUrl.searchParams.get("state"),"offline-test-state");
    assert.equal(authorizationUrl.searchParams.get("code_challenge_method"),"S256");
    assert.equal(authorizationUrl.searchParams.get("code_challenge"),createHash("sha256").update(codeVerifier).digest("base64url"));
    const requests = [];
    const fetchFn = async (url, init) => {
      assert.equal(String(url),metadata.token_endpoint);
      assert.equal(new Headers(init.headers).has("authorization"),false);
      const body = new URLSearchParams(init.body);
      requests.push(body);
      assert.equal(body.get("client_id"),server.auth.CLIENT_ID);
      assert.equal(body.has("client_secret"),false);
      assert.equal(body.get("resource"),server.url);
      return Response.json({access_token:"offline-test-access",token_type:"Bearer",expires_in:60,refresh_token:"offline-test-refresh"});
    };
    const tokens = await exchangeAuthorization(issuer, {metadata,clientInformation,
      authorizationCode:"offline-test-code",codeVerifier,redirectUri,resource:server.url,fetchFn});
    assert.equal(requests[0].get("code_verifier"),codeVerifier);
    assert.equal(requests[0].get("redirect_uri"),redirectUri);
    assert.equal(requests[0].get("grant_type"),"authorization_code");
    await refreshAuthorization(issuer, {metadata,clientInformation,refreshToken:tokens.refresh_token,resource:server.url,fetchFn});
    assert.equal(requests[1].get("grant_type"),"refresh_token");
    assert.equal(requests[1].get("refresh_token"),"offline-test-refresh");
    assert.equal(requests.length,2);
  });
}

test("remote distribution includes only installable remote assets", () => {
  const parent = mkdtempSync(resolve(tmpdir(),"beatapi-cursor-"));
  const output = resolve(parent,"plugin");
  try {
    buildCursorPackage(output);
    const files = readdirSync(output,{recursive:true,withFileTypes:true})
      .filter((entry)=>entry.isFile())
      .map((entry)=>resolve(entry.parentPath,entry.name).slice(output.length+1)).sort();
    assert.deepEqual(files,[".cursor-plugin/plugin.json","LICENSE","README.md","OFFICIAL-COMPATIBILITY.md",
      "assets/logo.png","cursor/skills/beatapi/SKILL.md","mcp.json"].sort());
    assert.equal(readFileSync(resolve(output,"cursor/skills/beatapi/SKILL.md"),"utf8"),cursorSkill());
    assert.equal(readFileSync(resolve(output,"mcp.json"),"utf8"),readFileSync(resolve(root,"mcp.json"),"utf8"));
  } finally {
    rmSync(parent,{recursive:true,force:true});
  }
});
