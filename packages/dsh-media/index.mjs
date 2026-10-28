// [INPUT] Harness tools, settings and credentials. [OUTPUT] Image/video generation integration.
// [POS] Installable Media Kit bundle. [PROTOCOL] Preserve model, price consent and task identity.
import { install } from './plugin.mjs';
import { createMediaTools } from './tools.mjs';
export { Config } from './plugin.mjs';
export const name = 'beatapi-media-kit';
export const inject = ['tools', 'settings', 'credentials'];
export function apply(ctx, config) {
  install(ctx, config, { id: name, title: 'Discover image/video models, preview pricing, submit approved generations and resume tasks.', createTools: createMediaTools, skillUrl: new URL('./SKILL.md', import.meta.url) });
}
