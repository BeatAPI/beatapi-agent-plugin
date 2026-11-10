/**
 * [INPUT]: 原始 MCP HTTP 请求、诊断截止时间与源站 fetch
 * [OUTPUT]: 原响应及无凭证/业务正文的协议白名单日志
 * [POS]: 临时单路径边缘观察；不规范化请求、不处理 OAuth、不实现业务执行
 * [PROTOCOL]: 变更时更新此头部，然后检查 AGENTS.md
 */
const methods = new Set(["initialize", "notifications/initialized", "tools/list", "tools/call", "resources/list", "resources/read", "resources/templates/list", "ping", "logging/setLevel"]);
const errors = new Map([
  ["Accept must contain both 'application/json' and 'text/event-stream'", "accept_requires_json_and_sse"],
  ["Content-Type must be 'application/json'", "content_type_requires_json"],
  ["MCP credentials and parameters must not appear in the URL", "url_query_not_allowed"],
  ["Invalid MCP request", "invalid_json"],
  ["Origin is not allowed", "origin_not_allowed"],
  ["POST requires a non-empty body", "empty_post_body"],
]);

async function smallText(body, limit) {
  if (!body) return null;
  const reader = body.getReader();
  let timer;
  const reading = (async () => {
    const decoder = new TextDecoder();
    let size = 0, text = "";
    while (true) {
      const { done, value } = await reader.read();
      if (done) return text + decoder.decode();
      size += value.byteLength;
      if (size > limit) return null;
      text += decoder.decode(value, { stream: true });
    }
  })();
  try {
    return await Promise.race([reading, new Promise(resolve => { timer = setTimeout(() => resolve(null), 500); })]);
  } catch { return null; }
  finally { clearTimeout(timer); void reader.cancel().catch(() => {}); }
}

async function rpcMethod(copy) {
  const text = await smallText(copy.body, 4096);
  try {
    const method = JSON.parse(text).method;
    return methods.has(method) ? method : "other";
  } catch { return "unobserved"; }
}

async function protocolError(copy) {
  if (copy.status !== 400) return null;
  const text = await smallText(copy.body, 1024);
  if (!text) return "unobserved";
  if (errors.has(text.trim())) return errors.get(text.trim());
  if (text.startsWith("Bad Request: Unsupported protocol version")) return "unsupported_protocol_version";
  if (text.startsWith("JSON-RPC batching is not supported")) return "rpc_batch_not_supported";
  try {
    const code = JSON.parse(text).error?.code;
    if ([-32700, -32600, -32601, -32602].includes(code)) return `json_rpc_${code}`;
  } catch {}
  return "unclassified";
}

function clientFamily(value) {
  return value.match(/^(openai-mcp\/[\d.]+|curl\/[\d.]+|Python\/[\d.]+ aiohttp\/[\d.]+|BeatAPI-readonly-diagnostic\/\d+)/)?.[0] ?? "other";
}

export function createDiagnosticHandler({ fetchOrigin = fetch, emit = value => console.log(JSON.stringify(value)) } = {}) {
  const log = value => { try { emit(value); } catch {} };
  return async (request, env, ctx) => {
    const url = new URL(request.url);
    if (url.origin !== "https://api.beatapi.io" || url.pathname !== "/mcp/openai" || !(Date.now() < Date.parse(env.DIAGNOSTIC_UNTIL))) return fetchOrigin(request);
    const started = Date.now();
    const accept = request.headers.get("accept") ?? "";
    const version = request.headers.get("mcp-protocol-version");
    const ray = request.headers.get("cf-ray") ?? "";
    const row = {
      event: "beatapi_mcp_protocol", time: new Date(started).toISOString(),
      ray: /^[a-f0-9]{16,32}(?:-[A-Z]{3})?$/.test(ray) ? ray : null,
      method: ["GET", "POST", "HEAD", "DELETE", "OPTIONS", "PUT", "PATCH"].includes(request.method) ? request.method : "other",
      path: "/mcp/openai", queryPresent: Boolean(url.search), client: clientFamily(request.headers.get("user-agent") ?? ""),
      accept: { present: Boolean(accept), json: /(?:^|[,\s])application\/json(?:\s|;|,|$)/i.test(accept), eventStream: /(?:^|[,\s])text\/event-stream(?:\s|;|,|$)/i.test(accept), wildcard: accept.includes("*/*") },
      contentType: request.headers.get("content-type")?.split(";")[0].trim().toLowerCase() === "application/json" ? "application/json" : "other_or_missing",
      protocolVersion: !version ? "missing" : /^\d{4}-\d{2}-\d{2}$/.test(version) ? version : "invalid",
    };
    const method = request.method === "POST" ? rpcMethod(request.clone()) : Promise.resolve(null);
    let response;
    try { response = await fetchOrigin(request); }
    catch {
      ctx.waitUntil(method.then(rpc => log({ ...row, rpcMethod: rpc, status: null, durationMs: Date.now() - started, protocolError: "origin_fetch_failed" })));
      throw new Error("MCP origin fetch failed");
    }
    const durationMs = Date.now() - started;
    const error = response.status === 400 ? protocolError(response.clone()) : Promise.resolve(null);
    ctx.waitUntil(Promise.all([method, error]).then(([rpc, error]) => log({ ...row, rpcMethod: rpc, status: response.status, durationMs, protocolError: error })));
    return response;
  };
}

export default { fetch: createDiagnosticHandler() };
