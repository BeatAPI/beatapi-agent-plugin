/**
 * [INPUT]: 正式端点匿名发现 API 与本地品牌资产
 * [OUTPUT]: 固定公开快照、摘要及独立诊断 ZIP
 * [POS]: 诊断准备；只允许元数据 RPC，不读取用户数据或写入正式包
 * [PROTOCOL]: 变更时更新此头部，然后检查 AGENTS.md
 */
import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { StreamableHTTPClientTransport } from "@modelcontextprotocol/sdk/client/streamableHttp.js";
import { writeFileSync, mkdirSync, cpSync, readFileSync, existsSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { resolve, join } from "node:path";
import { execFileSync } from "node:child_process";
import { createHash } from "node:crypto";
const dir=fileURLToPath(new URL(".",import.meta.url)), root=resolve(dir,"../.."), out=resolve(dir,"../artifacts/mcp-scan-controls-20261108");
mkdirSync(out,{recursive:true});
const path=join(dir,"snapshot.json");
if (!existsSync(path)) {
  const url="https://api.beatapi.io/mcp/openai";
  const client=new Client({name:"BeatAPI-readonly-diagnostic",version:"1"});
  const transport=new StreamableHTTPClientTransport(new URL(url),{fetch:(input,init={})=>{
    if(String(input)!==url || init.method!=="POST" || !["initialize","notifications/initialized","tools/list","resources/list","resources/read"].includes(JSON.parse(init.body).method)) throw Error("Only anonymous metadata POSTs allowed");
    if(new Headers(init.headers).has("authorization") || new Headers(init.headers).has("cookie")) throw Error("Credentials prohibited");
    console.log(`Reading public metadata: ${JSON.parse(init.body).method}`);
    const headers=new Headers(init.headers);
    const args=["--silent","--show-error","--max-time","20","--request","POST",url,"--data-binary",init.body,"--write-out","\n%{http_code}"];
    for(const [name,value] of headers) args.push("--header",`${name}: ${value}`);
    const output=execFileSync("curl",args,{encoding:"utf8",maxBuffer:8*1024*1024});
    const split=output.lastIndexOf("\n"),status=Number(output.slice(split+1));
    return Promise.resolve(new Response([202,204].includes(status)?null:output.slice(0,split),{status,headers:{"content-type":"application/json"}}));
  }});
  try {
    await client.connect(transport); const tools=[],resources=[],contents=[];
    let cursor; do { const page=await client.listTools(cursor?{cursor}:undefined);tools.push(...page.tools);cursor=page.nextCursor;if(tools.length>2000)throw Error("Unexpected tool count"); } while(cursor);
    do {const page=await client.listResources(cursor?{cursor}:undefined);resources.push(...page.resources);cursor=page.nextCursor;}while(cursor);
    for(const r of resources) contents.push(...(await client.readResource({uri:r.uri})).contents);
    writeFileSync(path,JSON.stringify({capturedAt:new Date().toISOString(),tools,resources,contents}));
  } finally {await client.close();}
}
const snapshot=JSON.parse(readFileSync(path));
writeFileSync(join(out,"snapshot-summary.json"),JSON.stringify({capturedAt:snapshot.capturedAt,sha256:createHash("sha256").update(readFileSync(path)).digest("hex"),toolCount:snapshot.tools.length,resources:snapshot.resources,content:snapshot.contents.map(c=>({uri:c.uri,bytes:Buffer.byteLength(c.text ?? ""),sha256:createHash("sha256").update(c.text ?? "").digest("hex"),meta:c._meta}))},null,2));
const variants=["baseline","single-text","single-ui","full-text","full-ui"];
for(const [i,variant] of variants.entries()) {
  const stage=join(out,variant,"beatapi-scan-diagnostic");mkdirSync(join(stage,"assets"),{recursive:true});
  mkdirSync(join(stage,"skills/scan-diagnostic"),{recursive:true});
  writeFileSync(join(stage,"skills/scan-diagnostic/SKILL.md"),"---\nname: scan-diagnostic\ndescription: Private metadata-only MCP scan diagnostic, not a production capability.\n---\n\nThis plugin is a temporary metadata diagnostic. Do not run business tools, access accounts, generate content, submit for review or publish it. Only inspect its tool and resource descriptors.\n");
  cpSync(join(root,"assets/icon.png"),join(stage,"assets/icon.png"));
  const manifest={name:"beatapi-scan-diagnostic",version:`0.0.${i+1}`,description:"Temporary metadata scan diagnostic. Not for publication.",author:{name:"Logiavox LLC",url:"https://beatapi.io"},homepage:"https://beatapi.io",license:"MIT",extensions:{"com.openai":{interface:{displayName:"BeatAPI Scan Diagnostic",developerName:"Logiavox LLC",shortDescription:"Private metadata diagnostic",longDescription:"Temporary metadata-only diagnostic. Business execution is disabled. Do not publish or submit for review.",category:"Developer Tools",capabilities:["Read"],websiteURL:"https://beatapi.io",privacyPolicyURL:"https://beatapi.io/privacy-policy",termsOfServiceURL:"https://beatapi.io/terms-of-service",logo:"./assets/icon.png",composerIcon:"./assets/icon.png"},publication:{release_notes:`Private diagnostic control: ${variant}. Not a production release.`}}}};
  manifest.$schema="https://agent-plugins.org/schemas/1.0.0/plugin.schema.json";
  writeFileSync(join(stage,"plugin.json"),JSON.stringify(manifest,null,2));
  writeFileSync(join(stage,"mcp.json"),JSON.stringify({$schema:"https://agent-plugins.org/schemas/1.0.0/mcp.schema.json",mcpServers:{diagnostic:{type:"streamable-http",url:`https://api.beatapi.io/mcp/scan-controls/${variant}`,extensions:{"com.openai":{auth:{type:"none"}}}}}},null,2));
  execFileSync("zip",["-X","-q","-r",join(out,`${variant}-portable.zip`),"plugin.json","mcp.json","skills","assets"],{cwd:stage});
  if(variant==="baseline") {
    manifest.version="0.1.0";
    manifest.name="beatapi-scan-matrix";
    manifest.extensions["com.openai"].interface.displayName="BeatAPI Scan Matrix";
    manifest.extensions["com.openai"].interface.supportURL="https://github.com/BeatAPI/beatapi-agent-plugin/issues";
    writeFileSync(join(stage,"plugin.json"),JSON.stringify(manifest,null,2));
    const mcpServers=Object.fromEntries(variants.filter(v=>v!=="baseline").map(v=>[v.replaceAll("-","_"),{type:"streamable-http",url:`https://api.beatapi.io/mcp/scan-controls/${v}`,extensions:{"com.openai":{auth:{type:"none"}}}}]));
    writeFileSync(join(stage,"mcp.json"),JSON.stringify({$schema:"https://agent-plugins.org/schemas/1.0.0/mcp.schema.json",mcpServers},null,2));
    execFileSync("zip",["-X","-q","-r",join(out,"matrix.zip"),"plugin.json","mcp.json","skills","assets"],{cwd:stage});
  }
}
console.log(JSON.stringify({out,toolCount:snapshot.tools.length,variants}));
