// [INPUT] Official DSH runtime and workspace bundles. [OUTPUT] Isolated installation and real workspace handshake evidence.
// [POS] Workspace connector acceptance. [PROTOCOL] Only temporary data; no paid calls or user workspace changes.
import { mkdtemp, readFile, writeFile, rm, stat } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { execFile, spawn } from 'node:child_process';
import { promisify } from 'node:util';
const exec = promisify(execFile), root = fileURLToPath(new URL('../../', import.meta.url));
const runtime = resolve(process.argv[2]);
const dir = await mkdtemp(join(tmpdir(), 'beatapi-workspace-smoke-'));
const version = JSON.parse(await readFile(join(runtime, 'package.json'), 'utf8')).version;
const env = { ...process.env, DSH_HOME: join(dir, 'home') };
let child, logs = '';
try {
  const { stdout } = await exec('npm', ['pack', './packages/dsh-design', '--pack-destination', dir, '--json'], { cwd: root });
  const target = process.argv.includes('--registry') ? '@beatapi/dsh-design@0.1.0' : join(dir, JSON.parse(stdout)[0].filename);
  const bin = join(runtime, 'lib/bin.js');
  await exec(process.execPath, [bin, 'plugin', '--profile', 'web', 'add', target], { env, cwd: root, maxBuffer: 4 * 1024 * 1024 });
  const report = join(dir, 'report.json'), probe = join(dir, 'probe.mjs');
  await writeFile(probe, `import {writeFile} from 'node:fs/promises';
export const name='workspace-smoke';export const inject=['tools','skills'];
export function apply(ctx){ctx.effect(()=>{let done=false;const timer=setInterval(async()=>{if(done)return;try{
const names=ctx.tools.schemas().map(t=>t.name).filter(n=>n.startsWith('mcp__beatdesign__'));
if(names.length!==30)return;done=true;
const skillNames=(await ctx.skills.list()).map(s=>s.name);
const result=await ctx.tools.execute({name:'mcp__beatdesign__bdesign_project_list',arguments:{},callId:'workspace-smoke',signal:AbortSignal.timeout(10000)});
const created=await ctx.tools.execute({name:'mcp__beatdesign__bdesign_project_create',arguments:{name:'Harness isolated acceptance'},callId:'workspace-create',signal:AbortSignal.timeout(10000)});
const opened=await ctx.tools.execute({name:'mcp__beatdesign__bdesign_project_open',arguments:{view:'canvas'},callId:'workspace-open',signal:AbortSignal.timeout(10000)});
await writeFile(${JSON.stringify(report)},JSON.stringify({names,skillNames,toolError:result.isError||created.isError||opened.isError,result,created,opened}));
}catch(e){done=true;await writeFile(${JSON.stringify(report)},JSON.stringify({error:'Workspace smoke tool failed'}));}},500);return()=>clearInterval(timer);});}`);
  const patch = join(dir, 'probe.yml');
  await writeFile(patch, `- id: beatdesign-harness\n  config:\n    dataDirectory: ${JSON.stringify(join(dir, 'design-data'))}\n- insert:\n    - id: workspace-smoke\n      name: ${JSON.stringify(probe)}\n`);
  const args = [bin, 'web', '--patch', patch, '--port', '0'];
  if (version.startsWith('0.2.')) args.push('--no-open');
  child = spawn(process.execPath, args, { env, cwd: root, stdio: ['ignore', 'pipe', 'pipe'] });
  for (const stream of [child.stdout, child.stderr]) stream.on('data', b => { logs = (logs + b).slice(-16000); });
  let result;
  for (let n=0;n<240;n++) {result=await readFile(report,'utf8').then(JSON.parse).catch(()=>undefined);if(result||child.exitCode!==null)break;await new Promise(r=>setTimeout(r,250));}
  if (!result || result.error || result.toolError || result.names.length!==30 || !result.skillNames.includes('beatdesign-harness')) throw new Error(`DSH ${version} workspace smoke failed: ${JSON.stringify(result)}\n${logs.replace(/token=[^\s]+/g,'token=[redacted]')}`);
  await stat(join(dir,'design-data','local.db'));
  const ping=await fetch('http://127.0.0.1:3020/api/ping').then(r=>r.json());
  if(ping.message!=='pong')throw new Error('Workspace HTTP health check failed');
  console.log(JSON.stringify({host_version:version,source:process.argv.includes('--registry')?'public npm':'packed bundle',design_tools:30,skill:true,project_list:'passed',workspace_http:'passed',project_create_and_handoff:'passed',paid_calls:0}));
} finally {
  if(child&&child.exitCode===null){child.kill('SIGTERM');await Promise.race([new Promise(r=>child.once('exit',r)),new Promise(r=>setTimeout(r,5000))]);if(child.exitCode===null)child.kill('SIGKILL');}
  await rm(dir,{recursive:true,force:true});
}
