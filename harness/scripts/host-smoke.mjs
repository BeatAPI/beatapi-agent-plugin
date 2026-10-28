// [INPUT] Official DSH runtime. [OUTPUT] Isolated-profile bundle/Skill/tool smoke evidence.
// [POS] Cross-version test runner. [PROTOCOL] No paid calls or existing-profile mutations.
import { mkdtemp, readFile, writeFile, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { execFile, spawn } from 'node:child_process';
import { promisify } from 'node:util';
const exec = promisify(execFile), root = fileURLToPath(new URL('../../', import.meta.url));
const runtime = resolve(process.argv[2] ?? process.env.DSH_RUNTIME_DIR ?? 'node_modules/@deepseek-ai/dsh');
const version = JSON.parse(await readFile(join(runtime, 'package.json'), 'utf8')).version;
const dir = await mkdtemp(join(tmpdir(), 'beatapi-dsh-smoke-'));
const env = { ...process.env, DSH_HOME: join(dir, 'home') };
let child, logs = '';
try {
  const packs = [];
  for (const kind of ['social', 'media', 'browser']) {
    const { stdout } = await exec('npm', ['pack', `./packages/dsh-${kind}`, '--pack-destination', dir, '--json'], { cwd: root });
    packs.push(join(dir, JSON.parse(stdout)[0].filename));
  }
  const bin = join(runtime, 'lib/bin.js');
  await exec(process.execPath, [bin, 'plugin', '--profile', 'web', 'add', ...packs], { env, cwd: root, maxBuffer: 4 * 1024 * 1024 });
  const report = join(dir, 'report.json'), probe = join(dir, 'probe.mjs');
  await writeFile(probe, `import {writeFile} from 'node:fs/promises';
export const name='beatapi-package-smoke';export const inject=['tools','skills'];
export function apply(ctx){ctx.effect(()=>{const timer=setTimeout(async()=>{try{
const names=ctx.tools.schemas().map(t=>t.name).filter(n=>/^beat_(social|media)_|^mcp__beatbrowser__/.test(n));
const skillNames=(await ctx.skills.list()).map(s=>s.name);
const report=await ctx.tools.execute({name:'beat_social_report',arguments:{items:[{url:'https://example.com/',observed:'Offline fixture'}]},callId:'package-smoke',signal:AbortSignal.timeout(10000)});
await writeFile(${JSON.stringify(report)},JSON.stringify({names,skillNames,reportError:report.isError}));
}catch(e){await writeFile(${JSON.stringify(report)},JSON.stringify({error:e.message}));}},2000);return()=>clearTimeout(timer);});}`);
  const patch = join(dir, 'probe.yml');
  await writeFile(patch, `- insert:\n    - id: beatapi-package-smoke\n      name: ${JSON.stringify(probe)}\n`);
  const args = [bin, 'web', '--patch', patch, '--port', '0'];
  if (version.startsWith('0.2.')) args.push('--no-open');
  child = spawn(process.execPath, args, { env, cwd: root, stdio: ['ignore', 'pipe', 'pipe'] });
  for (const stream of [child.stdout, child.stderr]) stream.on('data', b => { logs = (logs + b.toString()).slice(-12000); });
  let result;
  for (let n = 0; n < 240; n++) {
    result = await readFile(report, 'utf8').then(JSON.parse).catch(() => undefined);
    if (result || child.exitCode !== null) break;
    await new Promise(r => setTimeout(r, 250));
  }
  if (!result || result.error || result.reportError || result.names?.length !== 33 || !['beatapi-social-research', 'beatapi-media-kit', 'beatbrowser-harness'].every(n => result.skillNames?.includes(n))) {
    throw new Error(`DSH ${version} smoke failed: ${JSON.stringify(result)}\n${logs.replace(/token=[^\s]+/g, 'token=[redacted]')}`);
  }
  console.log(JSON.stringify({ host_version: version, packages_installed: 3, native_tools: 9, browser_tools: 24, skills: 3, report_tool: 'passed', paid_calls: 0 }));
} finally {
  if (child && child.exitCode === null) {
    child.kill('SIGTERM');
    await Promise.race([new Promise(r => child.once('exit', r)), new Promise(r => setTimeout(r, 5000))]);
    if (child.exitCode === null) child.kill('SIGKILL');
  }
  await rm(dir, { recursive: true, force: true });
}
