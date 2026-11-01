// [INPUT] Harness MCP, credential and tool services. [OUTPUT] BeatGEO tools and setup diagnostics.
// [POS] Local BeatGEO connector. [PROTOCOL] Existing product owns authentication, brand scope, data and paid confirmations.
import * as mcp from '@deepseek-ai/dsh-mcp-client';
import Schema from '@deepseek-ai/schemastery';
import { credentialRef } from '@deepseek-ai/dsh-credentials';
import { defineTool } from '@deepseek-ai/dsh-tools';
import { readFileSync } from 'node:fs';
import { homedir } from 'node:os';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { endpoint, readToken } from './connection.mjs';
export const name='beatgeo-harness';
export const inject=['credentials','tools'];
export const Config=Schema.object({
  url:Schema.string().default('http://localhost:3140/api/mcp').description('Existing local BeatGEO MCP endpoint. Loopback only.'),
  apiKeyRef:Schema.string().default('BEAT_GEO_MCP_TOKEN').description('Harness credential reference for a BeatGEO dashboard-issued MCP key; not the BeatAPI billing key.'),
  keyFile:Schema.string().default(join(homedir(),'.beat-geo','harness-mcp.env')).description('Optional private MCP key file. Never paste a key into this field.'),
  toolCallTimeoutMs:Schema.number().min(1000).max(180000).default(60000),
});
export async function apply(ctx,config){
  const url=endpoint(config.url);
  const getCredential=async()=>(await ctx.credentials.resolve(credentialRef(config.apiKeyRef)))?.value;
  ctx.tools.register(defineTool({
    name:'beatgeo_connection',description:'Check local BeatGEO connection setup without reading workspace data or making paid calls. Does not install or start the product.',parameters:{},output:{schema:{type:'json'},render:(_args,value)=>[{type:'text',text:JSON.stringify(value)}]},
    execute:async()=>{let configured=false;try{await readToken(config.keyFile,await getCredential());configured=true;}catch{}return{endpoint:url.href,credential_configured:configured,workspace_tools_registered:ctx.tools.schemas().some(t=>t.name.startsWith('mcp__beatgeo__')),workspace_url:url.origin,setup:'Start BeatGEO locally, create a scoped MCP key in workspace settings, and store it in Harness credentials or the private key file. Reload the plugin after changing a Harness credential. SEO uses the existing BeatGEO connection; do not bind a second BeatAPI key here.'};},
  }));
  const skillUrl=new URL('./SKILL.md',import.meta.url);
  const content=readFileSync(skillUrl,'utf8').replace(/^---\r?\n[\s\S]*?\r?\n---\r?\n/,'');
  ctx.inject(['skills'],c=>c.skills.register({name,description:'Operate the existing local BeatGEO brand, evidence and SEO/GEO workspace.',source:'bundled',provider:name,content,resourceBase:{kind:'directory',path:fileURLToPath(new URL('.',skillUrl))}}));
  ctx.inject(['systemPrompt'],c=>c.systemPrompt.section({name:`tool:${name}`,order:163,text:'Load beatgeo-harness for local SEO/GEO tasks. beatgeo_connection checks setup; mcp__beatgeo__* mirrors only tools allowed by the actual workspace key. Use the same brands, monitoring evidence and product Connections. SEO UI availability does not imply an SEO MCP tool exists: inspect the actual catalog and hand off to the brand SEO page when needed. No paid queries, recurring monitoring, publishing or authenticated browser collection without appropriate user instruction.'}));
  const secret=await getCredential();
  ctx.plugin(mcp,{serverName:'beatgeo',transport:'stdio',command:process.execPath,args:[fileURLToPath(new URL('./bridge.mjs',import.meta.url))],env:{BEAT_GEO_MCP_URL:url.href,BEAT_GEO_MCP_KEY_FILE:config.keyFile,...(secret?{BEAT_GEO_MCP_TOKEN:secret}:{})},toolCallTimeoutMs:config.toolCallTimeoutMs,failOnStartupError:false});
}
