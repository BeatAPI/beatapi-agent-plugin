/**
 * [INPUT]: 公开目录编译器、只读结果视图模型与真实能力输入契约
 * [OUTPUT]: 显式媒体设置、防漏参、组件接线和结果真实性边界回归
 * [POS]: ChatGPT UI 本机验收；不调用供应商、不代表线上宿主已更新
 * [PROTOCOL]: 变更时更新此头部，然后检查 AGENTS.md
 */
import assert from "node:assert/strict";
import test from "node:test";
import { compileRemoteCatalog, createRemoteDispatcher, taskTool, resultTool } from "../scripts/remote-capabilities.mjs";
import { projectResult, publicUrl } from "../ui/view-model.mjs";

const fixture = {
  reference: "model:minimax-h3-normal", kind: "model", title: "MiniMax H3 Normal", readiness: "ready", schema_hash: "media-schema",
  execution: { mode: "async", executable: true, status_supported: true },
  input_schema: { type: "object", additionalProperties: false, required: ["model", "prompt"], properties: {
    model: { type: "string", enum: ["minimax-h3-normal"] }, prompt: { type: "string", minLength: 1 },
    duration: { type: "integer", minimum: 5, maximum: 15, default: 5 },
    resolution: { type: "string", enum: ["480p", "768p", "1080p"], default: "768p" },
    aspect_ratio: { type: "string", enum: ["16:9", "9:16", "1:1"], default: "16:9" },
    images: { type: "array", items: { type: "string" }, minItems: 1, maxItems: 2 },
    reference_images: { type: "array", items: { type: "string" }, minItems: 1, maxItems: 4 },
  }, allOf: [{ if: {required:["images"]}, then: {not:{required:["aspect_ratio"]}} }],
    "x-beatapi-agent-input": { required: ["duration", "resolution"], allOf: [
      { if: {required:["images"]}, else: {required:["aspect_ratio"]} },
    ] },
  },
};

test("MiniMax confirmed settings must be present in the actual execution payload", () => {
  const catalog = compileRemoteCatalog([fixture]);
  const tool = catalog.tools.find(t => catalog.bindings[t.name]);
  const run = createRemoteDispatcher(catalog);
  const input = { model: "minimax-h3-normal", prompt: "A bottle turns", duration: 8, resolution: "480p", aspect_ratio: "9:16" };
  for (const field of ["duration", "resolution", "aspect_ratio"]) {
    const missing = { ...input };
    delete missing[field];
    assert.throws(() => run(tool.name, { input: missing, idempotency_key: "one-job" }), /Invalid tool arguments/);
  }
  assert.deepEqual(run(tool.name, { input, idempotency_key: "one-job" }).input, input);
  const frame = { ...input, images: ["https://cdn.beatapi.io/square.png"] };
  assert.throws(() => run(tool.name, { input: frame, idempotency_key: "frame" }), /Invalid tool arguments/);
  delete frame.aspect_ratio;
  assert.deepEqual(run(tool.name, { input: frame, idempotency_key: "frame" }).input, frame);
  const reference = { ...input, reference_images: frame.images };
  assert.deepEqual(run(tool.name, { input: reference, idempotency_key: "reference" }).input, reference);
  assert.deepEqual(fixture.input_schema.required, ["model", "prompt"], "do not mutate the provider contract");
});

test("only existing read-only retrieval tools mount the shared result component", () => {
  const catalog = compileRemoteCatalog([fixture, { ...fixture, reference: "data:research", kind: "data" }]);
  for (const tool of catalog.tools) {
    if ([taskTool, resultTool].includes(tool.name)) {
      assert.equal(tool._meta.ui.resourceUri, "ui://beatapi/results-v1.html");
      assert.deepEqual(tool._meta.ui.visibility, ["model", "app"]);
      assert.equal(tool.outputSchema.type, "object");
      assert.equal(tool.annotations.readOnlyHint, true);
    } else assert.equal(tool._meta.ui, undefined, "paid starts must not mount or expose a paid UI action");
  }
});

test("new capabilities inherit interaction constraints without any model-name branch", () => {
  const next = structuredClone(fixture);
  next.reference = "model:future-model";
  next.input_schema.properties.model.enum = ["future-model"];
  const catalog = compileRemoteCatalog([next]);
  const tool = catalog.tools.find(t => catalog.bindings[t.name]);
  const run = createRemoteDispatcher(catalog);
  const input = {model:"future-model",prompt:"test",duration:8,resolution:"480p",images:["https://cdn.beatapi.io/first.png"]};
  assert.deepEqual(run(tool.name,{input,idempotency_key:"future"}).input,input);
  assert.throws(()=>run(tool.name,{input:{...input,aspect_ratio:"9:16"},idempotency_key:"future"}),/Invalid tool arguments/);
  const omitted = {...input}; delete omitted.duration;
  assert.throws(()=>run(tool.name,{input:omitted,idempotency_key:"future"}),/Invalid tool arguments/);
});

test("result projection preserves unknowns, hides private routing and never refreshes from nested next", () => {
  const input = { reference: "model:minimax-h3-normal", task_id: "owned-task" };
  const result = projectResult({ structuredContent: { data: { status: "processing", output: {
    duration: 8, provider: "private", channel_id: 146, upstream_model: "private",
    items: [{ keyword: "video", difficulty: 0, provider_name: "private", cookie: "secret" }],
  }, usage: { credits_charged: 42, price_usd: 0.14 }, next: { call: { tool: "paid-start" } } } } }, input);
  assert.equal(result.charged, null, "credits and quotes are not actual USD charges");
  assert.deepEqual(result.fields, [["duration", 8]]);
  assert.deepEqual(result.columns, ["keyword", "difficulty"]);
  assert.deepEqual(result.refresh, { name: taskTool, arguments: { ...input, view: "preview" } });
  const failed = projectResult({ isError: true, structuredContent: { error: { message: "Unavailable" }, data: { output: { media: [{type:"video",url:"https://media.beatapi.io/old.mp4"}] } } } });
  assert.equal(failed.status, "failed");
  assert.deepEqual(failed.media, []);
  for (const url of ["javascript:alert(1)", "http://beatapi.io", "https://127.0.0.1/file", "https://u:p@beatapi.io/file", "https://host.internal/file"]) assert.equal(publicUrl(url), null);
});
