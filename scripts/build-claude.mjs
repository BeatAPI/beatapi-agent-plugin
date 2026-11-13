/**
 * [INPUT]: Shared remote Skill, Claude host supplement and dedicated plugin folder
 * [OUTPUT]: Generated Claude Skill and checks for self-contained, secret-free host configuration
 * [POS]: Claude packaging only; no client registration, deployment or account access
 * [PROTOCOL]: Update this header and scripts/AGENTS.md when changing this file.
 */
import assert from 'node:assert/strict';
import { readFileSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(import.meta.dirname, '..');
export function claudeSkill() {
  return `${readFileSync(resolve(root, 'submission/REMOTE-SKILL.md'), 'utf8').trimEnd()}\n\n${readFileSync(resolve(root, 'claude/interaction.md'), 'utf8').trim()}\n`;
}
export function validateClaudePackage(base = resolve(root, 'claude/beatapi')) {
  const read = file => JSON.parse(readFileSync(resolve(base, file), 'utf8'));
  const manifest = read('.claude-plugin/plugin.json');
  assert.equal(manifest.name, 'beatapi');
  assert.match(manifest.version, /^\d+\.\d+\.\d+$/);
  assert.equal(manifest.license, 'MIT');
  assert.deepEqual(read('.mcp.json'), { mcpServers: { beatapi: {
    type: 'http', url: 'https://api.beatapi.io/mcp/openai',
    oauth: { clientId: 'beatapi-claude' },
  } } }, 'Claude must use its dedicated public client and shared HTTPS endpoint without secrets or local fallbacks');
  assert.equal(readFileSync(resolve(base, 'skills/beatapi/SKILL.md'), 'utf8'), claudeSkill(), 'Run npm run claude:build to refresh the shared Skill');
  assert.equal(readFileSync(resolve(base, 'LICENSE'), 'utf8'), readFileSync(resolve(root, 'LICENSE'), 'utf8'));
  assert.ok(readFileSync(resolve(base, 'README.md'), 'utf8').split(/\s+/).length >= 40);
  return manifest;
}
if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  if (!process.argv.includes('--check')) writeFileSync(resolve(root, 'claude/beatapi/skills/beatapi/SKILL.md'), claudeSkill());
  validateClaudePackage();
  process.stdout.write('Claude plugin sources are consistent; OAuth and directory acceptance require live verification.\n');
}
