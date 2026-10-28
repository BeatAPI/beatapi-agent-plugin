// [INPUT] Harness MCP client and the released BeatBrowser runtime. [OUTPUT] Namespaced Chrome tools.
// [POS] Browser connector bundle. [PROTOCOL] Existing TaskSpace takeover and consent rules remain authoritative.
import * as mcp from '@deepseek-ai/dsh-mcp-client';
import Schema from '@deepseek-ai/schemastery';
import { createRequire } from 'node:module';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
const require = createRequire(import.meta.url);
export const name = 'beatbrowser-harness';
export const inject = [];
export const Config = Schema.object({
  toolCallTimeoutMs: Schema.number().min(1000).max(180000).default(60000).description('Per browser tool call timeout.'),
});
export function apply(ctx, config) {
  ctx.plugin(mcp, {
    serverName: 'beatbrowser', transport: 'stdio', command: process.execPath,
    args: [require.resolve('@beatapi/beat-browser/src/cli.js'), 'mcp'],
    toolCallTimeoutMs: config.toolCallTimeoutMs, failOnStartupError: true,
  });
  const skillUrl = new URL('./SKILL.md', import.meta.url);
  const content = readFileSync(skillUrl, 'utf8').replace(/^---\r?\n[\s\S]*?\r?\n---\r?\n/, '');
  ctx.inject(['skills'], c => c.skills.register({ name, description: 'Use your signed-in Chrome through BeatBrowser background TaskSpaces.', source: 'bundled', provider: name, content, resourceBase: { kind: 'directory', path: fileURLToPath(new URL('.', skillUrl)) } }));
  ctx.inject(['systemPrompt'], c => c.systemPrompt.section({ name: `tool:${name}`, order: 161, text: 'BeatBrowser provides mcp__beatbrowser__* tools for the user\'s real Chrome. Load beatbrowser-harness before control. Start with status and spaces profiles. Always use the owned spaceId/tabId. User focus pauses control; resume only after a new explicit instruction following that interruption. A connected bridge does not prove website login or task success. Normal local tools are free; optional FAST is not enabled or configured by this connector.' }));
}
