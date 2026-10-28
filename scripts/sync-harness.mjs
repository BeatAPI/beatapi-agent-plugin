// [INPUT] Shared DSH runtime source. [OUTPUT] Self-contained installable packages.
// [POS] Bundle synchronization and validation. [PROTOCOL] --check never changes files.
import { readFile, writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
const root = new URL('../', import.meta.url);
let dirty = false;
for (const name of ['dsh-social', 'dsh-media']) {
  for (const file of ['runtime.mjs', 'plugin.mjs']) {
    const source = await readFile(new URL(`harness/shared/${file}`, root), 'utf8');
    const dest = new URL(`packages/${name}/${file}`, root);
    if (process.argv.includes('--check')) {
      const current = await readFile(dest, 'utf8').catch(() => '');
      if (current !== source) { console.error(`Out of sync: ${fileURLToPath(dest)}`); dirty = true; }
    } else await writeFile(dest, source);
  }
}
if (dirty) process.exitCode = 1;
