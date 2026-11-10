/**
 * [INPUT]: 网关完整能力契约、remote-schema 公共 Schema 与 remote-presentation 的领域展示；不读取凭证
 * [OUTPUT]: 公开范围、显式媒体设置门禁、最小权限工具与只读结果 UI 编译和协议 next 改写
 * [POS]: 公开 MCP 的构建期契约编译器；不启动服务器、不鉴权、不执行或扣费
 * [PROTOCOL]: 变更时更新此头部，然后检查 AGENTS.md
 */
import { createHash } from "node:crypto";
import { z } from "zod";
import { AjvJsonSchemaValidator } from "@modelcontextprotocol/sdk/validation/ajv";
import { normalizePublicSchema, resultOutputSchema, unsupportedPublicInputSchema } from "./remote-schema.mjs";
import { describeRemoteCapability } from "./remote-presentation.mjs";

const contractSchema = z.object({
  reference: z.string().regex(/^(model|data|workflow):[^\s]+$/),
  kind: z.enum(["model", "data", "workflow"]),
  title: z.string().min(1),
  description: z.string().optional(),
  readiness: z.enum(["ready", "runnable", "listed"]),
  input_schema: z.record(z.string(), z.unknown()).optional(),
  schema_hash: z.string().optional(),
  execution: z.object({ mode: z.string(), executable: z.boolean(),
    run_supported: z.boolean().optional(), status_supported: z.boolean().optional() }).passthrough(),
}).passthrough();

export const discoveryTools = ["capabilities_search", "capabilities_inspect"];
export const taskTool = "beatapi_get_capability_task";
export const resultTool = "beatapi_get_capability_result";
export const resultResourceUri = "ui://beatapi/results-v1.html";
const read = { readOnlyHint: true, destructiveHint: false, openWorldHint: false };

export const remoteCapabilityExclusions = Object.freeze({
  "data:bilibili.huahuo.account_session_info": "advertiser session identity is not public research",
  "data:bilibili.huahuo.dmp_pkg_list": "custom audience packages await advertiser authorization evidence",
  "data:douyin.app.v3.open_douyin_app_to_send_private_message": "messaging deep links are not research",
  "data:tiktok.app.v3.open_tiktok_app_to_send_private_message": "messaging deep links are not research",
  "data:douyin.app.v3.register_device": "device registration is not research",
  "data:tiktok.web.device_register": "device registration and guest credentials are not public research",
  "data:douyin.web.fetch_douyin_web_guest_cookie": "guest credential acquisition is not research",
  "data:tiktok.web.fetch_tiktok_web_guest_cookie": "guest credential acquisition is not research",
  "data:tiktok.web.generate_real_mstoken": "credential generation is not research",
});

function toolName(reference) {
  const slug = reference.replace(/[^a-zA-Z0-9]+/g, "_").toLowerCase();
  const suffix = createHash("sha256").update(reference).digest("hex").slice(0, 10);
  return `beatapi_${slug.slice(0, 45)}_${suffix}`;
}

export function compileRemoteCatalog(contracts) {
  const parsed = z.array(contractSchema).min(1).parse(contracts);
  const references = new Set();
  const tools = [];
  const bindings = {};
  const excluded = [];
  for (const contract of parsed.sort((a, b) => a.reference.localeCompare(b.reference, "en"))) {
    const reference = contract.reference;
    if (references.has(reference)) throw new Error(`Duplicate capability reference: ${reference}`);
    references.add(reference);
    if (!reference.startsWith(contract.kind + ":")) throw new Error(`Capability kind mismatch: ${reference}`);
    let reason;
    if (Object.hasOwn(remoteCapabilityExclusions, reference)) reason = `outside public research/creation scope: ${remoteCapabilityExclusions[reference]}`;
    else if (contract.readiness === "listed" || !contract.execution.executable || contract.execution.run_supported === false || !["sync", "async"].includes(contract.execution.mode)) reason = "not executable through Run";
    else if (contract.input_schema?.type !== "object" || !contract.input_schema.properties) reason = "missing object input contract";
    else if (unsupportedPublicInputSchema(contract.input_schema)) reason = "credential input or unresolved schema reference";
    else if (!contract.schema_hash) reason = "missing contract schema hash";
    if (reason) {
      excluded.push({ reference, reason });
      continue;
    }
    const presentation = describeRemoteCapability(contract, toolName(reference));
    const name = presentation.name;
    const scope = contract.kind === "data" ? "mcp:data:read" : contract.kind === "workflow" || contract.execution.mode === "async" ? "mcp:media:create" : "mcp:models:run";
    if (bindings[name]) throw new Error(`Generated tool name collision: ${name}`);
    bindings[name] = { reference, operation: "start", schemaHash: contract.schema_hash,
      mode: contract.execution.mode, statusSupported: contract.execution.status_supported === true };
    const inputSchema = normalizePublicSchema(contract.input_schema);
    const confirmation = inputSchema["x-beatapi-agent-input"];
    if (confirmation !== undefined) {
      if (!confirmation || typeof confirmation !== "object" || Array.isArray(confirmation)) throw new Error(`Invalid agent input contract: ${reference}`);
      inputSchema.allOf = [...(inputSchema.allOf ?? []), confirmation];
      delete inputSchema["x-beatapi-agent-input"];
    }
    tools.push({
      ...presentation,
      inputSchema: {
        type: "object", additionalProperties: false, required: ["input", "idempotency_key"],
        properties: {
          input: { ...inputSchema, additionalProperties: inputSchema.additionalProperties ?? false },
          idempotency_key: { type: "string", minLength: 1, maxLength: 255, pattern: "\\S", not: { const: "<idempotency_key>" } },
        },
      },
      outputSchema: structuredClone(resultOutputSchema),
      // Run 会持久化结果或启动任务，不能因为社媒平台未被修改就标成纯只读。
      annotations: { readOnlyHint: false, destructiveHint: false, openWorldHint: true },
      securitySchemes: [{ type: "oauth2", scopes: [scope] }],
      _meta: { securitySchemes: [{ type: "oauth2", scopes: [scope] }],
        "openai/toolInvocation/invoking": contract.kind === "data" ? "Running query" : "Submitting request",
        "openai/toolInvocation/invoked": contract.execution.mode === "async" ? "Task submitted" : "Request complete",
        "beatapi/capability": { reference, schemaHash: contract.schema_hash, operation: "start" } },
    });
  }
  const active = Object.values(bindings);
  if (active.length === 0) throw new Error("No executable capability contracts; refusing an empty remote catalog.");
  const view = {
    view: { type: "string", enum: ["preview", "full"] },
    max_items: { type: "integer", minimum: 1, maximum: 50 },
    fields: { type: "array", maxItems: 50, items: { type: "string", minLength: 1 } },
  };
  for (const [name, description, properties, required] of [
    [taskTool, "Read an owned capability task; never start or replace a task.", {
      reference: { type: "string", enum: active.filter((b) => b.statusSupported).map((b) => b.reference) },
      task_id: { type: "string", minLength: 1 },
      ...view,
    }, ["reference", "task_id"]],
    [resultTool, "Read an owned stored data result within its retention window; never rerun to recover expired data.", {
      reference: { type: "string", enum: active.filter((b) => b.reference.startsWith("data:")).map((b) => b.reference) },
      request_id: { type: "string", minLength: 1 },
      ...view,
    }, ["reference", "request_id"]],
  ]) {
    if (properties.reference.enum.length) tools.push({ name, title: description.split(";")[0], description,
      inputSchema: { type: "object", additionalProperties: false, properties, required }, annotations: { ...read },
      outputSchema: structuredClone(resultOutputSchema),
      securitySchemes: [{ type: "oauth2", scopes: ["mcp:tasks:read"] }],
      _meta: { securitySchemes: [{ type: "oauth2", scopes: ["mcp:tasks:read"] }],
        ui: { resourceUri: resultResourceUri, visibility: ["model", "app"] },
        "openai/toolInvocation/invoking": name === taskTool ? "Checking task" : "Reading saved result",
        "openai/toolInvocation/invoked": name === taskTool ? "Task status updated" : "Saved result ready",
        "beatapi/operation": name === taskTool ? "status" : "result" } });
  }
  return { version: 2, discovery: [...discoveryTools], tools, bindings, excluded };
}

// 返回现有网关 Run 的请求体；身份、scope、目录版本和扣费校验仍由接入方执行。
export function createRemoteDispatcher(catalog) {
  const provider = new AjvJsonSchemaValidator();
  const validators = new Map(catalog.tools.map((tool) => [tool.name, provider.getValidator(tool.inputSchema)]));
  return (name, args) => {
    const validate = validators.get(name);
    if (!validate) throw new Error("Tool is not exposed by this remote catalog.");
    const result = validate(args);
    if (!result.valid) throw new Error(`Invalid tool arguments: ${result.errorMessage}`);
    const binding = catalog.bindings[name];
    if (binding) return { reference: binding.reference, operation: "start", input: args.input,
      idempotency_key: args.idempotency_key, view: "preview" };
    if (name === taskTool) return { ...args, operation: "status", view: args.view ?? "preview" };
    if (name === resultTool) return { ...args, operation: "result", view: args.view ?? "preview" };
    throw new Error("Missing remote tool binding.");
  };
}

// 只改写协议约定位置的 next，不遍历评论、网页、模型输出等不可信正文。
export function adaptRemoteNext(catalog, response) {
  const copy = structuredClone(response);
  for (const container of [copy, copy?.data, copy?.error]) {
    if (!container?.next?.call) continue;
    const next = container.next;
    const { tool, arguments: args } = next.call;
    if (discoveryTools.includes(tool)) continue;
    const entry = Object.entries(catalog.bindings).find(([, b]) => b.reference === args?.reference);
    const unavailable = () => { container.next = { action: "none", note: "This operation is not exposed by this remote catalog. Search for an available alternative." }; };
    if (tool !== "capabilities_run" || !entry) { unavailable(); continue; }
    const operation = args.operation ?? "start";
    if (operation === "start") {
      next.call = { tool: entry[0], arguments: { input: args.input,
        idempotency_key: args.idempotency_key ?? "<idempotency_key>" } };
    } else {
      const name = operation === "status" ? taskTool : operation === "result" ? resultTool : null;
      const target = catalog.tools.find((item) => item.name === name);
      if (!target?.inputSchema.properties.reference.enum.includes(args.reference)) { unavailable(); continue; }
      const key = operation === "status" ? "task_id" : "request_id";
      const view = Object.fromEntries(["view", "max_items", "fields"].filter((key) => args[key] !== undefined).map((key) => [key, args[key]]));
      next.call = { tool: name, arguments: { reference: args.reference, [key]: args[key], ...view } };
    }
  }
  return copy;
}
