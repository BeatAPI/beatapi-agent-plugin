/**
 * [INPUT]: 本地 metadata、远程 Skill、固定目录、真实 OAuth 配置与 SDK discovery/工具扫描
 * [OUTPUT]: 源检查、probeRemoteRelease 完整元数据预检、仅在 OAuth 与工具一致时生成的 ZIP
 * [POS]: OpenAI 公开包边界；不继承本地接线，也不替代网关授权或门户审核
 * [PROTOCOL]: 变更时更新此头部，然后检查 AGENTS.md
 */
import { execFileSync } from "node:child_process";
import { cpSync, mkdirSync, mkdtempSync, readFileSync, renameSync, rmSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { z } from "zod";
import {
  discoverAuthorizationServerMetadata,
  discoverOAuthProtectedResourceMetadata,
  extractWWWAuthenticateParams,
} from "@modelcontextprotocol/sdk/client/auth.js";
import { firstPartyUrl, probeRemoteTools, validateRemoteCatalog } from "./remote-preflight.mjs";

const clientSchema = z.discriminatedUnion("mode", [
  z.object({ mode: z.literal("provided"), clientId: z.string().trim().min(1),
    tokenEndpointAuthMethod: z.enum(["none", "client_secret_basic", "client_secret_post"]).optional() }).strict(),
  z.object({ mode: z.literal("dcr") }).strict(),
  z.object({ mode: z.literal("cimd") }).strict(),
]);
const scopes = z.array(z.string().trim().min(1));
const remoteConfigSchema = z.object({
  $schema: z.literal("https://agent-plugins.org/schemas/1.0.0/mcp.schema.json").optional(),
  mcpServers: z.object({ beatapi: z.object({
    type: z.literal("streamable-http"),
    url: firstPartyUrl,
    extensions: z.object({ "com.openai": z.object({ auth: z.object({
      type: z.literal("oauth"),
      client: clientSchema,
      authorizationUrl: firstPartyUrl.optional(),
      tokenUrl: firstPartyUrl.optional(),
      registrationUrl: firstPartyUrl.optional(),
      authorizationServerBase: firstPartyUrl.optional(),
      resource: firstPartyUrl.optional(),
      baseScopes: scopes.optional(),
      defaultScopes: scopes.optional(),
    }).strict() }).strict() }).strict(),
  }).strict() }).strict(),
}).strict();

export function validateRemoteConfig(config) {
  return remoteConfigSchema.parse(config).mcpServers.beatapi;
}

export function createRemoteManifest(local, version, releaseNotes) {
  const ui = local.interface;
  return {
    $schema: "https://agent-plugins.org/schemas/1.0.0/plugin.schema.json",
    name: local.name,
    version,
    description: "Research public data and combine text, decision, image, video and media workflows through BeatAPI.",
    author: local.author,
    homepage: local.homepage,
    repository: local.repository,
    license: local.license,
    keywords: ["beatapi", "social-research", "web-search", "text-generation", "image-generation", "video-generation", "workflows"],
    extensions: { "com.openai": {
      interface: {
        displayName: ui.displayName,
        developerName: ui.developerName,
        category: "Productivity",
        capabilities: ["Read", "Write"],
        websiteURL: ui.websiteURL,
        privacyPolicyURL: ui.privacyPolicyURL,
        termsOfServiceURL: ui.termsOfServiceURL,
        brandColor: ui.brandColor,
        composerIcon: "./assets/icon.png",
        logo: "./assets/logo.png",
        logoDark: "./assets/logo-dark.png",
        shortDescription: "Research, models and workflows",
        longDescription: "Use BeatAPI to research social and web data, run text and decision models, generate images and videos, and combine media workflows. Search for a capability, inspect its current inputs and pricing, then use the connected server's exposed operation. Social data is for reading and research, not posting or managing social accounts. Executions use your existing BeatAPI balance. Available operations depend on the connected server and your account permissions. Sign-in uses the host OAuth flow, without local software or credentials in chat. Local uploads, account administration, purchases, webhooks and Realtime setup are not included.",
        supportURL: "https://github.com/BeatAPI/beatapi-agent-plugin/issues",
        defaultPrompt: [
          "Use $beatapi to find social research capabilities for my topic. Do not run paid queries yet.",
          "Use $beatapi to compare text, decision, image and video options for this project without running them.",
          "Use $beatapi to plan research and a product video from these image URLs. Show the steps before running.",
        ],
      },
      publication: { release_notes: releaseNotes },
    } },
  };
}

export function checkRemoteSource(root) {
  const local = JSON.parse(readFileSync(join(root, ".codex-plugin/plugin.json"), "utf8"));
  const { version } = JSON.parse(readFileSync(join(root, "package.json"), "utf8"));
  const manifest = createRemoteManifest(local, version, readFileSync(join(root, "submission/release-notes.md"), "utf8"));
  const ui = manifest.extensions["com.openai"].interface;
  for (const [field, max] of Object.entries({ displayName: 30, shortDescription: 30, longDescription: 4000, developerName: 80 })) {
    z.string().trim().min(1).max(max).parse(ui[field]);
  }
  for (const field of ["websiteURL", "supportURL", "privacyPolicyURL", "termsOfServiceURL"]) {
    const url = new URL(ui[field]);
    if (url.protocol !== "https:" || url.username || url.password || url.href.length > 1024) throw new Error(`Invalid listing URL: ${field}`);
  }
  const prompts = z.array(z.string().trim().min(1).max(128).refine((p) => !/[\r\n]/.test(p))).max(3).parse(ui.defaultPrompt);
  if (new Set(prompts.map((p) => p.replace(/\s+/g, " "))).size !== prompts.length) throw new Error("Duplicate starter prompts.");
  const skill = readFileSync(join(root, "submission/REMOTE-SKILL.md"), "utf8");
  if (!skill.startsWith("---\nname: beatapi\n") || /npm install|BEATAPI_CLI_PATH|BEATAPI_API_KEY|capabilities_run|beatapi_upload_file/.test(skill)) {
    throw new Error("Remote Skill must use the host OAuth connection, without local or generic-executor fallbacks.");
  }
  return manifest;
}

export async function probeRemoteOAuth(config, fetcher = fetch) {
  const server = validateRemoteConfig(config);
  const auth = server.extensions["com.openai"].auth;
  // 只做 discovery 和 initialize；不申请令牌、不注册客户端、不执行付费工具。
  const safeFetch = (url, init = {}) => {
    firstPartyUrl.parse(String(url));
    return fetcher(url, { ...init, redirect: "error", signal: AbortSignal.timeout(15_000) });
  };
  const response = await safeFetch(server.url, {
    method: "POST",
    headers: { "content-type": "application/json", accept: "application/json, text/event-stream" },
    body: JSON.stringify({ jsonrpc: "2.0", id: 1, method: "initialize", params: {
      protocolVersion: "2025-06-18", capabilities: {}, clientInfo: { name: "beatapi-public-preflight", version: "0.4.0" },
    } }),
  });
  const { resourceMetadataUrl } = extractWWWAuthenticateParams(response);
  await response.body?.cancel();
  if (![200, 401].includes(response.status) || (response.status === 401 && !resourceMetadataUrl)) {
    throw new Error("Remote MCP is not OAuth-ready: allow anonymous initialize with discoverable OAuth metadata, or return HTTP 401 with a Bearer resource_metadata challenge. API-key-only /mcp is not a public OAuth connection.");
  }
  const resource = await discoverOAuthProtectedResourceMetadata(server.url, { resourceMetadataUrl }, safeFetch);
  if (resource.resource !== (auth.resource ?? server.url)) throw new Error("OAuth resource does not match the configured MCP resource.");
  const issuer = auth.authorizationServerBase ?? resource.authorization_servers?.[0];
  if (!issuer || !resource.authorization_servers?.includes(issuer)) throw new Error("Missing matching OAuth authorization server.");
  firstPartyUrl.parse(issuer);
  const metadata = await discoverAuthorizationServerMetadata(issuer, { fetchFn: safeFetch });
  if (!metadata?.code_challenge_methods_supported?.includes("S256")) throw new Error("OAuth server must advertise PKCE S256.");
  if (metadata.issuer !== issuer || !metadata.response_types_supported.includes("code")) throw new Error("Invalid OAuth issuer or authorization-code support.");
  for (const endpoint of [metadata.authorization_endpoint, metadata.token_endpoint, metadata.registration_endpoint].filter(Boolean)) firstPartyUrl.parse(endpoint);
  if (auth.authorizationUrl && auth.authorizationUrl !== metadata.authorization_endpoint) throw new Error("authorizationUrl differs from OAuth discovery.");
  if (auth.tokenUrl && auth.tokenUrl !== metadata.token_endpoint) throw new Error("tokenUrl differs from OAuth discovery.");
  const registrationUrl = auth.registrationUrl ?? metadata.registration_endpoint;
  if (auth.client.mode === "dcr" && !registrationUrl) throw new Error("OAuth DCR requires an actual registration endpoint.");
  if (auth.client.mode === "cimd" && !metadata.client_id_metadata_document_supported) throw new Error("OAuth server does not advertise CIMD support.");
  if (auth.client.mode === "provided" && auth.client.tokenEndpointAuthMethod &&
    !(metadata.token_endpoint_auth_methods_supported ?? ["client_secret_basic"]).includes(auth.client.tokenEndpointAuthMethod)) {
    throw new Error("Provided client's token endpoint authentication method is not advertised by the OAuth server.");
  }
  for (const scope of [...(auth.baseScopes ?? []), ...(auth.defaultScopes ?? [])]) {
    if (!metadata.scopes_supported?.includes(scope) || !resource.scopes_supported?.includes(scope)) throw new Error(`OAuth scope is not advertised by both servers: ${scope}`);
  }
  return { resource: resource.resource, issuer, clientMode: auth.client.mode };
}

export async function probeRemoteRelease(config, catalog, fetcher = fetch) {
  validateRemoteCatalog(catalog);
  const oauth = await probeRemoteOAuth(config, fetcher);
  const tools = await probeRemoteTools(validateRemoteConfig(config).url, catalog, fetcher);
  return { oauth, tools };
}

export async function buildRemotePackage(root, dist, config, fetcher = fetch, catalog) {
  mkdirSync(dist, { recursive: true });
  const archive = join(dist, "beatapi-agent-plugin-remote.zip");
  rmSync(archive, { force: true });
  const manifest = checkRemoteSource(root);
  if (!catalog) throw new Error("A pinned generated remote catalog is required for public packaging.");
  await probeRemoteRelease(config, catalog, fetcher);
  const temporary = mkdtempSync(join(dist, ".remote-build-"));
  try {
    const stage = join(temporary, manifest.name);
    mkdirSync(join(stage, "assets"), { recursive: true });
    mkdirSync(join(stage, "skills/beatapi"), { recursive: true });
    for (const name of ["logo.png", "logo-dark.png", "icon.png"]) cpSync(join(root, "assets", name), join(stage, "assets", name));
    cpSync(join(root, "LICENSE"), join(stage, "LICENSE"));
    cpSync(join(root, "submission/REMOTE-SKILL.md"), join(stage, "skills/beatapi/SKILL.md"));
    writeFileSync(join(stage, "plugin.json"), JSON.stringify(manifest, null, 2) + "\n");
    writeFileSync(join(stage, "mcp.json"), JSON.stringify({
      $schema: "https://agent-plugins.org/schemas/1.0.0/mcp.schema.json", mcpServers: config.mcpServers,
    }, null, 2) + "\n");
    const zip = join(temporary, "remote.zip");
    execFileSync("zip", ["-X", "-q", "-r", zip, manifest.name], { cwd: temporary });
    renameSync(zip, archive);
    return archive;
  } finally {
    rmSync(temporary, { recursive: true, force: true });
  }
}
