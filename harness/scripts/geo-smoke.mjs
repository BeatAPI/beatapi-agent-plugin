// [INPUT] Real DSH host and synthetic authenticated MCP fixture. [OUTPUT] Connector installation/scope/failure evidence.
// [POS] BeatGEO bridge acceptance. [PROTOCOL] Fixture data only; no real product database, credentials or paid calls.
import { mkdtemp,readFile,writeFile,rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join,resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { execFile,spawn } from 'node:child_process';
import { promisify } from 'node:util';
import http from 'node:http';
import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StreamableHTTPServerTransport } from '@modelcontextprotocol/sdk/server/streamableHttp.js';
import { ListToolsRequestSchema,CallToolRequestSchema } from '@modelcontextprotocol/sdk/types.js';
const exec=promisify(execFile),root=fileURLToPath(new URL('../../',import.meta.url)),runtime=resolve(process.argv[2]);
const dir=await mkdtemp(join(tmpdir(),'geo-harness-smoke-')),missing=process.argv.includes('--missing-key');
const full=process.argv.includes('--full-catalog');
const catalog=JSON.parse(await readFile(new URL('../fixtures/beatgeo-mcp-catalog.json',import.meta.url),'utf8')).tools;
const version=JSON.parse(await readFile(join(runtime,'package.json'),'utf8')).version;
let child,fixture,logs='',calls=0;
const sessions=[];
try{
  fixture=http.createServer(async(req,res)=>{
    if(req.url!=='/api/mcp'||req.headers.authorization!=='Bearer fixture-workspace-token'){res.writeHead(401).end();return;}
    const server=new Server({name:'synthetic-beatgeo-read-only',version:'1.0.0'},{capabilities:{tools:{}}});
    server.setRequestHandler(ListToolsRequestSchema,()=>({tools:full?catalog:[{name:'whoami',description:'Synthetic read-only identity fixture.',inputSchema:{type:'object',properties:{}}}]}));
    server.setRequestHandler(CallToolRequestSchema,request=>{if(request.params.name!=='whoami')throw new Error('No write tools in fixture');calls++;return{content:[{type:'text',text:JSON.stringify({fixture:true,scopes:['read'],note:'Synthetic identity, not real product evidence.'})}]};});
    const transport=new StreamableHTTPServerTransport({sessionIdGenerator:undefined});
    sessions.push({server,transport});await server.connect(transport);await transport.handleRequest(req,res);
  });
  await new Promise(r=>fixture.listen(0,'127.0.0.1',r));
  const keyFile=join(dir,'workspace.env');
  if(!missing)await writeFile(keyFile,'BEAT_GEO_MCP_TOKEN=fixture-workspace-token\n',{mode:0o600});
  const env={...process.env,DSH_HOME:join(dir,'home')};delete env.BEAT_GEO_MCP_TOKEN;
  const {stdout}=await exec('npm',['pack','./packages/dsh-geo','--pack-destination',dir,'--json'],{cwd:root});
  const target=process.argv.includes('--registry')?'@beatapi/dsh-geo@0.1.0':join(dir,JSON.parse(stdout)[0].filename);
  const bin=join(runtime,'lib/bin.js');
  await exec(process.execPath,[bin,'plugin','--profile','web','add',target],{cwd:root,env,maxBuffer:4*1024*1024});
  const report=join(dir,'report.json'),probe=join(dir,'probe.mjs');
  await writeFile(probe,`import{writeFile}from'node:fs/promises';export const name='geo-smoke';export const inject=['tools','skills'];export function apply(ctx){ctx.effect(()=>{let done=false;const timer=setInterval(async()=>{if(done)return;try{
const names=ctx.tools.schemas().map(x=>x.name);const geo=names.filter(x=>x.startsWith('mcp__beatgeo__'));
if(!names.includes('beatgeo_connection')||(${!missing}&&!geo.includes('mcp__beatgeo__whoami')))return;done=true;
const status=await ctx.tools.execute({name:'beatgeo_connection',arguments:{},callId:'geo-status',signal:AbortSignal.timeout(10000)});
const identity=${missing} ? null : await ctx.tools.execute({name:'mcp__beatgeo__whoami',arguments:{},callId:'geo-identity',signal:AbortSignal.timeout(10000)});
await writeFile(${JSON.stringify(report)},JSON.stringify({geo,status,identity,skills:(await ctx.skills.list()).map(x=>x.name)}));
}catch{done=true;await writeFile(${JSON.stringify(report)},JSON.stringify({error:'Probe failed'}));}},500);return()=>clearInterval(timer);});}`);
  const patch=join(dir,'probe.yml');
  await writeFile(patch,`- id: beatgeo-harness\n  config:\n    url: http://127.0.0.1:${fixture.address().port}/api/mcp\n    keyFile: ${JSON.stringify(keyFile)}\n- insert:\n    - id: geo-smoke\n      name: ${JSON.stringify(probe)}\n`);
  const args=[bin,'web','--patch',patch,'--port','0'];if(version.startsWith('0.2.'))args.push('--no-open');
  child=spawn(process.execPath,args,{cwd:root,env,stdio:['ignore','pipe','pipe']});for(const stream of[child.stdout,child.stderr])stream.on('data',b=>{logs=(logs+b).slice(-16000);});
  let result;for(let n=0;n<200;n++){result=await readFile(report,'utf8').then(JSON.parse).catch(()=>undefined);if(result||child.exitCode!==null)break;await new Promise(r=>setTimeout(r,250));}
  if(!result||result.error||result.status.isError||!result.skills.includes('beatgeo-harness')||(!missing&&(result.identity?.isError||result.geo.length!==(full?catalog.length:1)||calls!==1))||(missing&&result.geo.length))throw new Error(`Geo fixture smoke failed: ${JSON.stringify(result)}\n${logs.replaceAll('fixture-workspace-token','[fixture credential]').replace(/token=[^\s]+/g,'token=[redacted]')}`);
  const status=JSON.stringify(result.status);if(!status.includes(`"credential_configured":${!missing}`)&&!status.includes(`\\"credential_configured\\":${!missing}`))throw new Error('Incorrect setup state');
  console.log(JSON.stringify({host_version:version,source:process.argv.includes('--registry')?'public npm':'packed bundle',fixture:true,missing_key:missing,skill:true,setup_tool:'passed',catalog:missing?'no workspace tools':full?'27 real product schemas; fixture responses':'only allowed read-only fixture tool',proxy_call:missing?'not attempted':'passed',paid_calls:0}));
}finally{
  if(child&&child.exitCode===null){child.kill('SIGTERM');await Promise.race([new Promise(r=>child.once('exit',r)),new Promise(r=>setTimeout(r,5000))]);if(child.exitCode===null)child.kill('SIGKILL');}
  await Promise.allSettled(sessions.map(async({server,transport})=>{await server.close();await transport.close();}));
  if(fixture){fixture.closeAllConnections();await new Promise(r=>fixture.close(r));}
  await rm(dir,{recursive:true,force:true});
}
