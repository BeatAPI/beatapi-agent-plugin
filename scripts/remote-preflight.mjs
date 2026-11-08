/**
 * [INPUT]: 固定远程目录、公开范围策略、第一方 MCP URL 与匿名 HTTP；使用官方 MCP Client/Transport
 * [OUTPUT]: validateRemoteCatalog 校验构建目录，probeRemoteTools 精确比对真实分页工具及 UI/outputSchema 元数据
 * [POS]: 发布前只读工具扫描；不注册 OAuth 客户端、不签发令牌、不调用任何业务工具
 * [PROTOCOL]: 变更时更新此头部，然后检查 AGENTS.md
 */
import { createHash } from "node:crypto";
import { isDeepStrictEqual } from "node:util";
import { z } from "zod";
import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { StreamableHTTPClientTransport } from "@modelcontextprotocol/sdk/client/streamableHttp.js";
import { createRemoteDispatcher, discoveryTools, taskTool, resultTool, remoteCapabilityExclusions } from "./remote-capabilities.mjs";
import { resultOutputSchema, validatePublicSchema, unsupportedPublicInputSchema } from "./remote-schema.mjs";

export const firstPartyUrl = z.string().url().refine((value) => {
  const url = new URL(value);
  return url.protocol === "https:" && !url.username && !url.password && !url.port && !url.search && !url.hash &&
    ["beatapi.io", "api.beatapi.io", "mcp.beatapi.io"].includes(url.hostname);
}, "Use a real first-party BeatAPI HTTPS URL without credentials, port, query or fragment.");

const annotations = z.object({ readOnlyHint: z.boolean(), destructiveHint: z.boolean(), openWorldHint: z.boolean() });
const oauthScheme = z.object({ type: z.literal("oauth2"), scopes: z.array(z.string()) }).strict();
const catalogSchema = z.object({
  version: z.literal(2), discovery: z.tuple([z.literal("capabilities_search"), z.literal("capabilities_inspect")]),
  tools: z.array(z.object({ name: z.string().regex(/^[a-zA-Z0-9_-]{1,64}$/), title: z.string().min(1), description: z.string().min(1),
    inputSchema: z.record(z.string(), z.unknown()), outputSchema: z.record(z.string(), z.unknown()), annotations, securitySchemes: z.array(oauthScheme).min(1),
    _meta: z.object({ securitySchemes: z.array(oauthScheme).min(1),
      "beatapi/capability": z.object({ reference: z.string(), schemaHash: z.string().min(1), operation: z.literal("start") }).strict().optional(),
      "beatapi/operation": z.enum(["status", "result"]).optional(),
      ui: z.object({ resourceUri: z.literal("ui://beatapi/results-v1.html"), visibility: z.tuple([z.literal("model"), z.literal("app")]) }).strict().optional(),
      "openai/toolInvocation/invoking": z.string().max(64).optional(),
      "openai/toolInvocation/invoked": z.string().max(64).optional() }).strict() }).strict()).min(1).max(20_000),
  bindings: z.record(z.string(), z.object({ reference: z.string().regex(/^(model|data|workflow):[^\s]+$/), operation: z.literal("start"),
    schemaHash: z.string().min(1), mode: z.enum(["sync", "async"]), statusSupported: z.boolean() }).strict()),
  excluded: z.array(z.object({ reference: z.string(), reason: z.string() }).strict()),
}).strict();

export function validateRemoteCatalog(value) {
  if (value?.version !== 2) throw new Error("Rebuild the remote catalog: format v2 requires SDK-visible OAuth metadata.");
  const catalog = catalogSchema.parse(value);
  const names = new Set();
  const references = new Set();
  for (const tool of catalog.tools) {
    validatePublicSchema(tool.inputSchema, `${tool.name} inputSchema`);
    validatePublicSchema(tool.outputSchema, `${tool.name} outputSchema`);
    if (!isDeepStrictEqual(tool.outputSchema, resultOutputSchema)) throw new Error(`Unexpected result outputSchema: ${tool.name}`);
    if (unsupportedPublicInputSchema(tool.inputSchema)) throw new Error(`Unsupported public input schema: ${tool.name}`);
    if (names.has(tool.name)) throw new Error(`Duplicate catalog tool: ${tool.name}`);
    names.add(tool.name);
    if (!isDeepStrictEqual(tool.securitySchemes, tool._meta.securitySchemes)) throw new Error(`Conflicting OAuth declarations: ${tool.name}`);
    const binding = catalog.bindings[tool.name];
    if (!binding && ![taskTool, resultTool].includes(tool.name)) throw new Error(`Missing catalog binding: ${tool.name}`);
    if (binding && tool._meta.ui) throw new Error(`Paid tools must not mount a result UI: ${tool.name}`);
    if (binding) {
      if (Object.hasOwn(remoteCapabilityExclusions, binding.reference)) throw new Error(`Capability outside public research/creation scope: ${binding.reference}`);
      if (!isDeepStrictEqual(tool._meta["beatapi/capability"], { reference: binding.reference, schemaHash: binding.schemaHash, operation: "start" })) {
        throw new Error(`Catalog binding metadata mismatch: ${tool.name}`);
      }
      if (references.has(binding.reference)) throw new Error(`Duplicate bound reference: ${binding.reference}`);
      references.add(binding.reference);
      if (tool.inputSchema.additionalProperties !== false || !tool.inputSchema.required?.includes("idempotency_key") ||
        !tool.inputSchema.required?.includes("input") || tool.inputSchema.properties?.reference || tool.inputSchema.properties?.operation) {
        throw new Error(`Invalid fixed-reference input contract: ${tool.name}`);
      }
    }
  }
  if (!references.size || Object.keys(catalog.bindings).some((name) => !names.has(name))) throw new Error("Incomplete catalog bindings.");
  if ([...discoveryTools, "capabilities_run"].some((name) => names.has(name))) throw new Error("Generic or discovery tools cannot be execution bindings.");
  createRemoteDispatcher(catalog);
  return catalog;
}

function canonical(value) {
  if (Array.isArray(value)) return value.map(canonical);
  if (value && typeof value === "object") return Object.fromEntries(Object.keys(value).sort().map((key) => [key, canonical(value[key])]));
  return value;
}

function validateResultResource(content) {
  if (content.mimeType !== "text/html;profile=mcp-app" || !content.text?.trim()) throw new Error("Invalid UI resource content or MIME type.");
  const ui = content._meta?.ui;
  let domain;
  try { domain = new URL(ui?.domain); } catch { throw new Error("Missing or invalid UI domain."); }
  if (domain.protocol !== "https:" || domain.origin !== ui.domain || domain.username || domain.password || domain.port ||
      domain.hostname.includes("*") || ["web-sandbox.oaiusercontent.com", "oaiusercontent.com"].includes(domain.hostname)) throw new Error("UI domain must be a dedicated HTTPS origin.");
  const csp = ui.csp;
  if (!csp || !Array.isArray(csp.connectDomains) || csp.connectDomains.length || !Array.isArray(csp.resourceDomains) ||
      !isDeepStrictEqual([...(csp.resourceDomains ?? [])].sort(), ["https://cdn.beatapi.io", "https://media.beatapi.io"]) ||
      (csp.frameDomains?.length ?? 0)) throw new Error("Unexpected result UI CSP.");
  return { uri: content.uri, domain: domain.origin, sha256: createHash("sha256").update(content.text).digest("hex") };
}

export async function probeRemoteTools(url, value, fetcher = fetch) {
  firstPartyUrl.parse(url);
  const catalog = validateRemoteCatalog(value);
  const expected = new Map(catalog.tools.map((tool) => [tool.name, tool]));
  const seen = new Set();
  const cursors = new Set();
  // 无 authProvider：SDK 遇到 401 直接失败，不能触发注册、刷新或授权。
  const transport = new StreamableHTTPClientTransport(new URL(url), {
    reconnectionOptions: { maxRetries: 0, initialReconnectionDelay: 1000, maxReconnectionDelay: 1000, reconnectionDelayGrowFactor: 1 },
    fetch: (input, init = {}) => {
      if (String(input) !== url) throw new Error("Tool scan attempted to leave its configured MCP endpoint.");
      const headers = new Headers(init.headers);
      if (["authorization", "cookie", "proxy-authorization"].some((name) => headers.has(name))) throw new Error("Tool scan must remain anonymous.");
      if (init.method === "POST") {
        const message = JSON.parse(init.body);
        if (!["initialize", "notifications/initialized", "tools/list", "resources/list", "resources/read"].includes(message.method)) throw new Error("Tool scan refuses business operations.");
      } else if (init.method !== "GET") throw new Error("Unexpected tool scan HTTP method.");
      const deadline = AbortSignal.timeout(15_000);
      return fetcher(input, { ...init, headers, redirect: "error", credentials: "omit",
        signal: init.signal ? AbortSignal.any([init.signal, deadline]) : deadline });
    },
  });
  const client = new Client({ name: "beatapi-public-tool-preflight", version: "0.4.0" });
  try {
    await client.connect(transport, { timeout: 15_000 });
    let cursor;
    do {
      const page = await client.listTools(cursor ? { cursor } : undefined, { timeout: 15_000 });
      for (const tool of page.tools) {
        if (seen.has(tool.name)) throw new Error(`Duplicate remote tool: ${tool.name}`);
        seen.add(tool.name);
        if (seen.size > expected.size + discoveryTools.length) throw new Error("Remote tool count exceeds the pinned catalog.");
        annotations.parse(tool.annotations);
        if (!tool.title?.trim() || !tool.description?.trim()) throw new Error(`Missing remote title or description: ${tool.name}`);
        const security = tool.securitySchemes ?? tool._meta?.securitySchemes;
        if (discoveryTools.includes(tool.name)) {
          validatePublicSchema(tool.outputSchema, `${tool.name} outputSchema`);
          if (!isDeepStrictEqual(tool.outputSchema, resultOutputSchema)) throw new Error(`Discovery outputSchema mismatch: ${tool.name}`);
          if (tool.annotations.readOnlyHint !== true || tool.annotations.destructiveHint !== false ||
            !Array.isArray(security) || !security.some((scheme) => scheme.type === "noauth")) throw new Error(`Public discovery policy mismatch: ${tool.name}`);
          continue;
        }
        const pinned = expected.get(tool.name);
        if (!pinned) throw new Error(`Unexposed remote tool: ${tool.name}`);
        for (const field of ["title", "description", "inputSchema", "outputSchema"]) {
          if (!isDeepStrictEqual(tool[field], pinned[field])) throw new Error(`Remote ${field} drift: ${tool.name}`);
        }
        for (const field of ["readOnlyHint", "destructiveHint", "openWorldHint"]) {
          if (tool.annotations[field] !== pinned.annotations[field]) throw new Error(`Remote annotation drift: ${tool.name}`);
        }
        if (!isDeepStrictEqual(security, pinned.securitySchemes)) throw new Error(`Remote OAuth policy drift: ${tool.name}`);
        for (const field of ["beatapi/capability", "beatapi/operation", "ui", "openai/toolInvocation/invoking", "openai/toolInvocation/invoked"]) {
          if (!isDeepStrictEqual(tool._meta?.[field], pinned._meta[field])) throw new Error(`Remote binding metadata drift: ${tool.name}`);
        }
      }
      cursor = page.nextCursor;
      if (cursor && (cursors.has(cursor) || !page.tools.length)) throw new Error("Remote tool pagination did not advance.");
      cursors.add(cursor);
    } while (cursor);
    for (const name of [...discoveryTools, ...expected.keys()]) if (!seen.has(name)) throw new Error(`Missing remote tool: ${name}`);
    const linked = new Set(catalog.tools.flatMap(tool => tool._meta.ui ? [tool._meta.ui.resourceUri] : []));
    const registered = new Set();
    const resourceCursors = new Set();
    cursor = undefined;
    do {
      const page = await client.listResources(cursor ? { cursor } : undefined, { timeout: 15_000 });
      for (const resource of page.resources) registered.add(resource.uri);
      cursor = page.nextCursor;
      if (cursor && (resourceCursors.has(cursor) || !page.resources.length)) throw new Error("UI resource pagination did not advance.");
      resourceCursors.add(cursor);
    } while (cursor);
    const uiResources = [];
    for (const uri of linked) {
      if (!registered.has(uri)) throw new Error(`Missing linked UI resource: ${uri}`);
      const response = await client.readResource({ uri }, { timeout: 15_000 });
      if (response.contents.length !== 1 || response.contents[0].uri !== uri) throw new Error(`Invalid UI resource response: ${uri}`);
      uiResources.push(validateResultResource(response.contents[0]));
    }
    return {
      catalogSha256: createHash("sha256").update(JSON.stringify(canonical(catalog))).digest("hex"),
      server: client.getServerVersion(), toolCount: seen.size, anonymousToolListing: true, uiResources,
      notVerified: ["user OAuth consent, refresh and revocation", "anonymous Search and Inspect execution",
        "per-tool scope enforcement and account isolation", "paid execution, billing and idempotency", "host tool limits and Portal review"],
    };
  } finally {
    await client.close();
  }
}
