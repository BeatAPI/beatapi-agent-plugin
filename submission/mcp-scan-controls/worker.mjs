/**
 * [INPUT]: 官方 MCP SDK、公开元数据快照与可选共享 instructions
 * [OUTPUT]: 固定数量/UI 变体，只读发现和明确拒绝的业务调用
 * [POS]: 独立诊断服务核心；没有源站 fetch、账户或执行凭证
 * [PROTOCOL]: 变更时更新此头部，然后检查 AGENTS.md
 */
import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { WebStandardStreamableHTTPServerTransport } from "@modelcontextprotocol/sdk/server/webStandardStreamableHttp.js";
import { ListToolsRequestSchema, CallToolRequestSchema, ListResourcesRequestSchema, ReadResourceRequestSchema, ListResourceTemplatesRequestSchema, McpError, ErrorCode } from "@modelcontextprotocol/sdk/types.js";

const baseline = { name: "diagnostic_status", title: "Diagnostic status", description: "Return a static diagnostic status. No account access or business execution.", inputSchema: { type: "object", properties: {}, additionalProperties: false }, annotations: { readOnlyHint: true, destructiveHint: false, openWorldHint: false, idempotentHint: true }, securitySchemes: [{type:"noauth"}] };
export function selectVariant(snapshot, variant) {
  if (variant === "baseline") return {tools:[baseline],resources:[],contents:[]};
  if (variant === "count-only") return {tools:snapshot.tools.map((_,i)=>({...baseline,name:`diagnostic_status_${i}`})),resources:[],contents:[]};
  const range=variant.match(/^slice-(\d+)-(\d+)$/);
  if(range && !(Number(range[1])<Number(range[2]) && Number(range[2])<=snapshot.tools.length)) return null;
  if (!range && !["single-text","single-ui","full-text","full-ui"].includes(variant)) return null;
  const withUI=variant.endsWith("-ui");
  const tools=range ? snapshot.tools.slice(Number(range[1]),Number(range[2])) : variant.startsWith("single-") ? [snapshot.tools.find(t=>t._meta?.ui || t._meta?.["openai/outputTemplate"])] : snapshot.tools;
  if (!tools[0]) throw new Error("No UI-linked tool in snapshot");
  return {tools:withUI ? tools : tools.map(t=>{
    const copy=structuredClone(t);
    for (const key of Object.keys(copy._meta ?? {})) if (key === "ui" || key.startsWith("openai/widget") || key === "openai/outputTemplate" || key.startsWith("openai/toolInvocation/")) delete copy._meta[key];
    return copy;
  }),resources:withUI ? snapshot.resources : [],contents:withUI ? snapshot.contents : []};
}

export function createHandler(snapshot, emit = row => console.log(JSON.stringify(row))) {
  return async (request, env) => {
    const url=new URL(request.url);
    const match=url.origin === "https://api.beatapi.io" && url.pathname.match(/^\/mcp\/scan-controls\/(baseline|single-text|single-ui|full-text|full-ui)$/);
    if (!match || url.search) return new Response("Not found",{status:404});
    if (!(Date.now()<Date.parse(env.DIAGNOSTIC_UNTIL))) return new Response("Diagnostic window closed",{status:410});
    const variant=match[1] === "single-text" && env.ACTIVE_CONTROL ? env.ACTIVE_CONTROL : match[1];
    const selected=selectVariant(snapshot,variant), started=Date.now();
    if(!selected) return new Response("Invalid diagnostic control",{status:503});
    let method="unobserved", itemCount;
    const server=new Server({name:"BeatAPI isolated metadata diagnostic",version:"1.0.0"},{capabilities:{tools:{},resources:{}},instructions:snapshot.instructions});
    server.setRequestHandler(ListToolsRequestSchema,async req=>{
      method="tools/list";
      const cursor=req.params?.cursor ?? "0";
      if (!/^(0|[1-9]\d*)$/.test(cursor) || Number(cursor)>selected.tools.length) throw new McpError(ErrorCode.InvalidParams,"Invalid diagnostic cursor");
      const offset=Number(cursor), tools=selected.tools.slice(offset,offset+100); itemCount=tools.length;
      return {tools,...(offset+100<selected.tools.length ? {nextCursor:String(offset+100)} : {})};
    });
    server.setRequestHandler(ListResourcesRequestSchema,async()=>{method="resources/list";itemCount=selected.resources.length;return {resources:selected.resources};});
    server.setRequestHandler(ListResourceTemplatesRequestSchema,async()=>{method="resources/templates/list";return {resourceTemplates:[]};});
    server.setRequestHandler(ReadResourceRequestSchema,async req=>{
      method="resources/read";
      const contents=selected.contents.filter(c=>c.uri===req.params.uri); itemCount=contents.length;
      if (!contents.length) throw new McpError(ErrorCode.InvalidParams,"Unknown diagnostic resource");
      return {contents};
    });
    server.setRequestHandler(CallToolRequestSchema,async req=>{
      method="tools/call";
      if(variant==="baseline" && req.params.name===baseline.name) return {content:[{type:"text",text:"Isolated diagnostic only. No business execution."}]};
      return {isError:true,content:[{type:"text",text:"Metadata-only diagnostic. Business execution is disabled."}]};
    });
    const transport=new WebStandardStreamableHTTPServerTransport({sessionIdGenerator:undefined,enableJsonResponse:true});
    await server.connect(transport);
    try {
      const response=await transport.handleRequest(request);
      try { emit({event:"beatapi_scan_control",time:new Date(started).toISOString(),variant,method,status:response.status,itemCount,durationMs:Date.now()-started}); } catch {}
      return response;
    } finally { await server.close(); }
  };
}
