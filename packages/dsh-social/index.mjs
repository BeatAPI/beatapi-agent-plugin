// [INPUT] Harness tools, settings and credentials. [OUTPUT] Social research integration.
// [POS] Installable Social Research bundle. [PROTOCOL] Follow the published Data contract.
import { install } from './plugin.mjs';
import { createSocialTools } from './tools.mjs';
export { Config } from './plugin.mjs';
export const name = 'beatapi-social-research';
export const inject = ['tools', 'settings', 'credentials'];
export function apply(ctx, config) {
  install(ctx, config, { id: name, title: 'Research social posts, accounts and comment samples with traceable source tables.', createTools: createSocialTools, skillUrl: new URL('./SKILL.md', import.meta.url) });
}
