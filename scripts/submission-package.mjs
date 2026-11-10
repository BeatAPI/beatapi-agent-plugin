/**
 * [INPUT]: 本地展示源、品牌 PNG、审核案例、操作者已核验的录像链接与真实 OAuth/工具扫描
 * [OUTPUT]: 展示源校验/导出、完整预检及含录像链接的远程 ZIP，不验证录像内容或案例实绩
 * [POS]: OpenAI 公开包边界；展示不含促销和价格宣称，费用披露留在 Skill/审核信息，不替代门户审核
 * [PROTOCOL]: 变更时更新此头部，然后检查 AGENTS.md
 */
import { execFileSync } from "node:child_process";
import { cpSync, mkdirSync, mkdtempSync, readFileSync, renameSync, rmSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { z } from "zod";
import listingTranslations from "../submission/listing-translations.json" with { type: "json" };
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
const publisherName = "Logiavox LLC";
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

export function createRemoteManifest(local, version, releaseNotes, testCases) {
  const ui = local.interface;
  return {
    $schema: "https://agent-plugins.org/schemas/1.0.0/plugin.schema.json",
    name: local.name,
    version,
    description: "Combine social and web research, SEO analysis, text and decision models, and image/video creation through BeatAPI.",
    author: { ...local.author, name: publisherName },
    homepage: local.homepage,
    repository: local.repository,
    license: local.license,
    keywords: ["beatapi", "social-research", "web-search", "seo", "competitor-analysis", "text-generation", "image-generation", "video-generation", "workflows"],
    extensions: { "com.openai": {
      interface: {
        displayName: "BeatAPI Agent Toolkit",
        developerName: publisherName,
        category: "Data & Analytics",
        capabilities: ["Read", "Write"],
        websiteURL: ui.websiteURL,
        privacyPolicyURL: ui.privacyPolicyURL,
        termsOfServiceURL: ui.termsOfServiceURL,
        brandColor: ui.brandColor,
        composerIcon: "./assets/icon.png",
        composerIconDark: "./assets/logo-dark.png",
        logo: "./assets/logo.png",
        logoDark: "./assets/logo-dark.png",
        shortDescription: "Research, SEO and AI creation",
        longDescription: [
          "BeatAPI Agent Toolkit brings social and web research, SEO analysis, text and decision models, and image/video creation into one toolkit for market and content research. Analyze public information, compare competitors and identify content opportunities. Draft copy or create campaign assets when your task calls for it. Use each capability independently or combine the steps your task needs.",
          "Social research: Find public posts, videos, profiles and comments to investigate brand mentions, audience questions and competitor content. Compare discussion themes and available engagement signals, with source links and sample limits. Supported platforms include Xiaohongshu, Douyin, TikTok, Bilibili, Weibo, X, Instagram, YouTube and Reddit; available operations vary by platform.",
          "Web research: Search for current information, read relevant pages and research questions across multiple sources. Prepare market briefs, product comparisons and evidence summaries. Keep source links, distinguish retrieved facts from interpretation, and flag missing or unread evidence.",
          "SEO and competitor analysis: Explore keyword ideas, search volume, intent and difficulty. Compare domains, ranking keywords, top pages, backlinks, domain ratings and estimated traffic to prioritize content opportunities. Check the requested market and data dates: traffic figures are estimates, and ranking positions are historical snapshots, not live rank tracking.",
          "AI creation and workflows: Turn a creative brief into product visuals, ad creatives, social images and short videos. Discover image and video models, compare supported inputs and settings, and generate the options you choose. Start from a text prompt or reference images supplied as public HTTPS URLs, depending on the selected capability. Use product-video, music-video or video-analysis workflows when available, then track tasks and retrieve results.",
          "Text and decision models: Draft copy, summarize findings and evaluate options using the models selected for your task. For example, combine audience research and keyword data into a content brief, then create visuals if requested. Research does not require a generation step.",
          "Find a capability, inspect its inputs and availability, then run only the operations you choose. Track progress and retrieve saved results without starting a replacement task.",
          "Connect through OAuth without installing local software or sharing credentials in chat. Available operations depend on the connected server and your permissions.",
          "Social data is for reading and research, not posting, messaging or managing social accounts. Local file uploads, account administration, webhooks and Realtime setup are not included.",
        ].join("\n\n"),
        supportURL: "https://github.com/BeatAPI/beatapi-agent-plugin/issues",
        defaultPrompt: [
          "Use $beatapi to research my topic across social posts and the web, with sources and sample limits. Plan before running.",
          "Use $beatapi to plan SEO keyword and competitor analysis for my domain and target market.",
          "Use $beatapi to plan product visuals and a short video from these image URLs. Compare supported inputs before running.",
        ],
      },
      review: {
        ...(testCases ? { test_cases: testCases } : {}),
        commerce: false,
        commerce_description: "Execution consumes the connected user's existing BeatAPI balance. Users manage top-ups independently on the BeatAPI website. The plugin does not sell credits, initiate purchases, process payments, promote upgrades or direct users to checkout.",
      },
      publication: { countries: [], release_notes: releaseNotes, translations: structuredClone(listingTranslations) },
    } },
  };
}

export function checkListingAssets(root, ui) {
  for (const field of ["logo", "logoDark", "composerIcon", "composerIconDark"]) {
    const path = ui[field];
    if (!path && ["logoDark", "composerIconDark"].includes(field)) continue;
    if (!/^\.\/assets\/[a-zA-Z0-9_-]+\.png$/.test(path ?? "")) throw new Error(`Invalid icon path: ${field}`);
    const png = readFileSync(join(root, path));
    if (png.length < 33 || png.length > 5 * 1024 * 1024 ||
      png.subarray(0, 8).toString("hex") !== "89504e470d0a1a0a" || png.toString("ascii", 12, 16) !== "IHDR") {
      throw new Error(`Icon must be a PNG up to 5 MiB: ${field}`);
    }
    const width = png.readUInt32BE(16);
    const height = png.readUInt32BE(20);
    const minimum = field.startsWith("logo") ? 256 : 48;
    if (width !== height || width < minimum) throw new Error(`Icon must be square and at least ${minimum}px: ${field}`);
  }
}

export function checkRemoteSource(root) {
  const local = JSON.parse(readFileSync(join(root, ".codex-plugin/plugin.json"), "utf8"));
  const { version } = JSON.parse(readFileSync(join(root, "package.json"), "utf8"));
  const positive = z.object({ description: z.string().trim().min(1).max(4000), prompt: z.string().trim().min(1),
    tools_triggered: z.string().trim().min(1), expected_behavior: z.string().trim().min(1) }).strict();
  const testCases = z.object({ positive: z.array(positive).length(5),
    negative: z.array(positive.pick({ description: true, prompt: true })).length(3) }).strict()
    .parse(JSON.parse(readFileSync(join(root, "submission/test-cases.json"), "utf8")));
  const manifest = createRemoteManifest(local, version, readFileSync(join(root, "submission/release-notes.md"), "utf8"), testCases);
  const ui = manifest.extensions["com.openai"].interface;
  z.record(z.enum(["zh-CN", "ja-JP"]), z.object({
    subtitle: z.string().trim().min(1).max(30).refine((value) => !/[\r\n\t]/.test(value)),
    description: z.string().trim().min(1).max(4000).refine((value) => !/[\u0000-\u0009\u000b-\u001f\u007f]/.test(value)),
  }).strict()).parse(manifest.extensions["com.openai"].publication.translations);
  checkListingAssets(root, ui);
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

export function exportListing(root, directory) {
  const manifest = checkRemoteSource(root);
  const ui = manifest.extensions["com.openai"].interface;
  mkdirSync(join(directory, "assets"), { recursive: true });
  writeFileSync(join(directory, "plugin.json"), JSON.stringify(manifest, null, 2) + "\n");
  for (const path of new Set([ui.logo, ui.logoDark, ui.composerIcon, ui.composerIconDark].filter(Boolean))) {
    cpSync(join(root, path), join(directory, path));
  }
  return directory;
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

export async function buildRemotePackage(root, dist, config, fetcher = fetch, catalog, demoRecordingUrl) {
  mkdirSync(dist, { recursive: true });
  const archive = join(dist, "beatapi-agent-plugin-remote.zip");
  rmSync(archive, { force: true });
  const manifest = checkRemoteSource(root);
  if (!catalog) throw new Error("A pinned generated remote catalog is required for public packaging.");
  if (!demoRecordingUrl) throw new Error("Provide --demo-recording-url after verifying playback and reviewer access; a script is not a recording.");
  const recording = new URL(demoRecordingUrl);
  if (recording.protocol !== "https:" || recording.username || recording.password) {
    throw new Error("Demo recording must use HTTPS without embedded credentials.");
  }
  manifest.extensions["com.openai"].review.demo_recording_url = recording.href;
  const toolNames = new Set([...catalog.discovery, ...catalog.tools.map((tool) => tool.name)]);
  for (const item of manifest.extensions["com.openai"].review.test_cases.positive) {
    for (const name of item.tools_triggered.split(/,\s*/)) {
      if (!toolNames.has(name)) throw new Error(`Review case names an unavailable tool: ${name}`);
    }
  }
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
