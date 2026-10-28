// [INPUT] Recorded official runtime package versions. [OUTPUT] Coherent isolated DSH test host.
// [POS] CI host installer. [PROTOCOL] Pin tested packages; never alter the user's Harness installation.
import { readFile, writeFile, mkdir } from 'node:fs/promises';
import { resolve, join } from 'node:path';
import { spawnSync } from 'node:child_process';
const [version, target] = process.argv.slice(2);
const pins = JSON.parse(await readFile(new URL('../fixtures/runtime-pins.json', import.meta.url), 'utf8'));
if (!pins[version] || !target) throw new Error('Usage: node harness/scripts/install-host.mjs <recorded-dsh-version> <isolated-target>');
const prefix = resolve(target);
const nativePackage = name => /-(darwin|linux|win32|windows)-(arm64|x64)$/.test(name);
await mkdir(prefix, { recursive: true });
const existing = await readFile(join(prefix, 'package.json'), 'utf8').then(JSON.parse).catch(() => undefined);
if (existing && existing.name !== 'beatapi-dsh-test-host') throw new Error('Refusing to overwrite another project. Choose a fresh isolated target.');
await writeFile(join(prefix, 'package.json'), JSON.stringify({
  name: 'beatapi-dsh-test-host', private: true,
  // Declare the complete recorded official peer composition explicitly. Letting
  // npm auto-select peers can float a prerelease graph to a different RC.
  dependencies: Object.fromEntries(Object.entries(pins[version]).filter(([name]) => !nativePackage(name))),
  optionalDependencies: Object.fromEntries(Object.entries(pins[version]).filter(([name]) => nativePackage(name))),
  overrides: pins[version],
}, null, 2) + '\n');
const result = spawnSync('npm', ['install', '--legacy-peer-deps', '--ignore-scripts', '--no-audit', '--no-fund'], { cwd: prefix, stdio: 'inherit', timeout: 240000 });
if (result.error) throw result.error;
if (result.status !== 0) process.exit(result.status ?? 1);
// Old node-pty distributions have no Linux prebuild; compile this specific
// official-host dependency instead of enabling every dependency's install hook.
if (process.platform === 'linux') {
  const build = spawnSync('npm', ['rebuild', 'node-pty', '--foreground-scripts', '--ignore-scripts=false'], { cwd: prefix, stdio: 'inherit', timeout: 180000 });
  if (build.error) throw build.error;
  if (build.status !== 0) process.exit(build.status ?? 1);
}
