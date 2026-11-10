/**
 * [INPUT]: 固定对照服务与内存工具快照
 * [OUTPUT]: 数量/UI、SDK 传输和不执行业务的回归证据
 * [POS]: 独立诊断保护，不改变正式插件测试
 * [PROTOCOL]: 变更时更新此头部，然后检查 AGENTS.md
 */
import test from "node:test";
import assert from "node:assert/strict";
import { createHandler, selectVariant } from "./worker.mjs";
const ui = { resourceUri: "ui://test" };
const tool = { name: "example", description: "Example", inputSchema: { type: "object" }, _meta: { ui, "openai/outputTemplate": "ui://test", keep: true } };
const snapshot = { tools: Array.from({length: 988}, (_, i) => ({...tool, name: `example_${i}`})), resources: [{uri:"ui://test",name:"test"}], contents: [{uri:"ui://test",mimeType:"text/html;profile=mcp-app",text:"<p>test</p>"}] };
const env = {DIAGNOSTIC_UNTIL:"2099-01-01T00:00:00Z"};
const rpc = (method, params) => new Request("https://api.beatapi.io/mcp/scan-controls/full-ui", {method:"POST",headers:{accept:"application/json, text/event-stream","content-type":"application/json","mcp-protocol-version":"2025-03-26"},body:JSON.stringify({jsonrpc:"2.0",id:1,method,params})});
test("matrix changes only tool count and UI fields; source remains unchanged", () => {
  assert.equal(selectVariant(snapshot,"baseline").tools.length,1);
  assert.equal(selectVariant(snapshot,"count-only").tools.length,988);
  assert.equal(new Set(selectVariant(snapshot,"count-only").tools.map(t=>t.name)).size,988);
  assert.ok(selectVariant(snapshot,"count-only").tools.every(t=>!t._meta?.ui));
  assert.equal(selectVariant(snapshot,"slice-0-494").tools.length,494);
  assert.equal(selectVariant(snapshot,"slice-494-988").tools[0].name,"example_494");
  assert.equal(selectVariant(snapshot,"slice-0-989"),null);
  assert.equal(selectVariant(snapshot,"single-ui").tools.length,1);
  assert.equal(selectVariant(snapshot,"full-ui").tools.length,988);
  assert.deepEqual(selectVariant(snapshot,"full-ui").tools,snapshot.tools);
  const text=selectVariant(snapshot,"full-text");
  assert.equal(text.tools.length,988); assert.equal(text.resources.length,0); assert.equal(text.contents.length,0);
  assert.deepEqual(text.tools[0]._meta,{keep:true}); assert.ok(snapshot.tools[0]._meta.ui);
  assert.equal(selectVariant(snapshot,"unknown"),null);
});
test("SDK returns paginated descriptors, UI and rejects business without fetch", async () => {
  const logs=[]; const handle=createHandler(snapshot,row=>logs.push(row));
  let res=await handle(rpc("tools/list",{}),env); let body=await res.json();
  assert.equal(res.status,200); assert.equal(body.result.tools.length,100); assert.equal(body.result.nextCursor,"100");
  res=await handle(rpc("tools/list",{cursor:"900"}),env); body=await res.json();
  assert.equal(body.result.tools.length,88); assert.equal(body.result.nextCursor,undefined);
  res=await handle(rpc("resources/read",{uri:"ui://test"}),env); assert.equal((await res.json()).result.contents[0].text,"<p>test</p>");
  res=await handle(rpc("tools/call",{name:"example_1",arguments:{secret:"not-logged"}}),env);
  assert.equal((await res.json()).result.isError,true); assert.ok(!JSON.stringify(logs).includes("not-logged"));
});
test("unknown and expired endpoints fail closed, invalid cursor rejected", async () => {
  const handle=createHandler(snapshot,()=>{});
  assert.equal((await handle(new Request("https://api.beatapi.io/mcp/openai"),env)).status,404);
  assert.equal((await handle(rpc("tools/list",{}),{DIAGNOSTIC_UNTIL:"2000-01-01T00:00:00Z"})).status,410);
  const res=await handle(rpc("tools/list",{cursor:"bad"}),env); assert.equal((await res.json()).error.code,-32602);
});
test("explicit deployment control changes every client equally and invalid control fails closed", async()=>{
  const handle=createHandler(snapshot,()=>{});
  const request=()=>new Request("https://api.beatapi.io/mcp/scan-controls/single-text",rpc("tools/list",{}));
  const response=await handle(request(),{...env,ACTIVE_CONTROL:"full-text"});
  const body=await response.json();assert.equal(body.result.tools.length,100);assert.equal(body.result.nextCursor,"100");assert.equal(body.result.tools[0]._meta.ui,undefined);
  assert.equal((await handle(request(),{...env,ACTIVE_CONTROL:"invalid"})).status,503);
});
test("shared instructions are advertised through initialize without changing tool schemas",async()=>{
  const handle=createHandler({...snapshot,instructions:"Respect selected parameters and inspect pricing."},()=>{});
  const response=await handle(rpc("initialize",{protocolVersion:"2025-03-26",capabilities:{},clientInfo:{name:"test",version:"1"}}),env);
  assert.equal((await response.json()).result.instructions,"Respect selected parameters and inspect pricing.");
  const tools=await handle(rpc("tools/list",{}),env);
  assert.deepEqual((await tools.json()).result.tools,snapshot.tools.slice(0,100));
});
