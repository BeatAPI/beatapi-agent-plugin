/**
 * [INPUT]: MCP 工具真实结果和宿主提供的当前工具入参
 * [OUTPUT]: 有限研究/媒体投影、安全链接和唯一的只读刷新调用
 * [POS]: 纯展示模型；不运行模型、不信任正文 next、不创造来源或缺失数据
 * [PROTOCOL]: 变更时更新此头部，然后检查 AGENTS.md
 */
export const taskTool = "beatapi_get_capability_task";
export const resultTool = "beatapi_get_capability_result";
export const record = value => value && typeof value === "object" && !Array.isArray(value) ? value : {};
const scalar = value => ["string", "number", "boolean"].includes(typeof value);
const secret = /^(authorization|cookie|password|secret|api_?key|access_token|refresh_token|private_data|upstream.*|provider.*|channel.*|plugin_key|supplier.*)$/i;

export function publicUrl(value) {
  if (typeof value !== "string") return null;
  try {
    const url = new URL(value);
    if (url.protocol !== "https:" || url.username || url.password || url.port ||
      !url.hostname.includes(".") || /(^|\.)(localhost|local|internal)$/.test(url.hostname) ||
      /^\d+\.\d+\.\d+\.\d+$/.test(url.hostname) || url.hostname.includes(":")) return null;
    return url.href;
  } catch { return null; }
}

export function refreshCall(input) {
  const value = record(input);
  if (typeof value.reference !== "string" || !/^(model|data|workflow):\S+$/.test(value.reference)) return null;
  if (typeof value.task_id === "string" && value.task_id.trim()) {
    return { name: taskTool, arguments: { reference: value.reference, task_id: value.task_id, view: "preview" } };
  }
  if (value.reference.startsWith("data:") && typeof value.request_id === "string" && value.request_id.trim()) {
    return { name: resultTool, arguments: { reference: value.reference, request_id: value.request_id, view: "preview" } };
  }
  return null;
}

export function resultBody(result) {
  if (result.structuredContent) return record(result.structuredContent);
  for (const item of result.content ?? []) {
    if (item.type !== "text") continue;
    try { return record(JSON.parse(item.text)); } catch { /* 非 JSON 文本不作为结构化事实。 */ }
  }
  return {};
}

export function displayValue(value) {
  if (value === null || value === undefined) return null;
  return scalar(value) ? String(value) : null;
}

export function projectResult(result, input = {}) {
  const body = resultBody(result);
  const data = record(body.data ?? body);
  const output = record(data.output ?? data.data ?? data);
  const error = record(body.error);
  const status = result.isError || body.error ? "failed" : typeof data.status === "string" ? data.status : "result";
  const failed = ["failed", "cancelled", "expired"].includes(status);
  const items = Array.isArray(output.items) ? output.items : Array.isArray(output.sources) ? output.sources : Array.isArray(data.data) ? data.data : [];
  const rows = items.slice(0, 10).map((item) => record(item));
  const columns = [...new Set(rows.flatMap(row => Object.keys(row).filter(key => !secret.test(key) && scalar(row[key]))))].slice(0, 8);
  const media = failed ? [] : (Array.isArray(output.media) ? output.media : []).slice(0, 12).flatMap(item => {
    if (!item || typeof item !== "object") return [];
    const url = publicUrl(item.url);
    if (!url || !["image", "video", "audio"].includes(item.type)) return [];
    const inline = ["media.beatapi.io", "cdn.beatapi.io"].includes(new URL(url).hostname);
    return [{ type: item.type, url, inline }];
  });
  const usage = record(data.usage ?? body.usage);
  const charged = usage.cost_usd;
  const fields = Object.entries(output).filter(([key, value]) => !secret.test(key) && scalar(value) &&
    !["research_notes", "summary", "report", "r2_url", "object", "status", "id", "request_id", "items_total"].includes(key) && !publicUrl(value)).slice(0, 16);
  return {
    status, error: displayValue(error.message ?? data.error_message ?? (failed ? data.fail_reason : null)),
    id: displayValue(data.id ?? data.request_id ?? input.task_id ?? input.request_id),
    title: displayValue(data.title ?? data.model),
    active: ["queued", "processing", "running", "submitted"].includes(status),
    pollAfter: typeof data.poll_after_seconds === "number" ? Math.max(1, data.poll_after_seconds) : 8,
    media, rows, columns, fields,
    summary: displayValue(output.research_notes ?? output.summary ?? output.report),
    total: typeof output.items_total === "number" ? output.items_total : null,
    charged: typeof charged === "number" && Number.isFinite(charged) ? charged : null,
    hasData: output.has_data !== false && data.has_data !== false,
    refresh: refreshCall(input),
  };
}
