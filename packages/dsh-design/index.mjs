// [INPUT] Harness MCP client and the published BeatDesign runtime. [OUTPUT] Shared local creative workspace tools.
// [POS] BeatDesign connector. [PROTOCOL] No remote generation without explicit approval; local data stays local.
import * as mcp from '@deepseek-ai/dsh-mcp-client';
import Schema from '@deepseek-ai/schemastery';
import { createRequire } from 'node:module';
import { readFileSync } from 'node:fs';
import { isAbsolute } from 'node:path';
import { fileURLToPath } from 'node:url';
const require = createRequire(import.meta.url);
export const name = 'beatdesign-harness';
export const inject = [];
export const Config = Schema.object({
  dataDirectory: Schema.string().default('').description('Optional absolute local project storage directory. Empty uses the standard BeatDesign application data directory.'),
  toolCallTimeoutMs: Schema.number().min(1000).max(180000).default(60000).description('Tool timeout; rendering may need a longer wait.'),
});
export function apply(ctx, config) {
  if (config.dataDirectory && !isAbsolute(config.dataDirectory)) throw new Error('BeatDesign storage must be an absolute directory.');
  ctx.plugin(mcp, {
    serverName: 'beatdesign', transport: 'stdio', command: process.execPath,
    args: [require.resolve('@beatapi/beatdesign-workbuddy/bin/beatdesign-workbuddy.mjs')],
    env: config.dataDirectory ? { BEATDESIGN_DATA_DIR: config.dataDirectory } : {},
    toolCallTimeoutMs: config.toolCallTimeoutMs, failOnStartupError: false,
  });
  const skillUrl = new URL('./SKILL.md', import.meta.url);
  const content = readFileSync(skillUrl, 'utf8').replace(/^---\r?\n[\s\S]*?\r?\n---\r?\n/, '');
  ctx.inject(['skills'], c => c.skills.register({ name, description: 'Create and edit in the local BeatDesign Canvas and Timeline shared with the user.', source: 'bundled', provider: name, content, resourceBase: { kind: 'directory', path: fileURLToPath(new URL('.', skillUrl)) } }));
  ctx.inject(['systemPrompt'], c => c.systemPrompt.section({ name: `tool:${name}`, order: 162, text: 'BeatDesign supplies mcp__beatdesign__* tools and a local visual workspace. Load beatdesign-harness. Preserve project scope, revisions, idempotency and exact asset versions. Local work needs no API key; only user-approved remote generation/analysis may use provider credentials. Open the exact workspace URL returned by a tool for review. If tools are unavailable, inspect local runtime startup: port 3020 may already be owned by another workspace; do not stop it without instruction.' }));
}
