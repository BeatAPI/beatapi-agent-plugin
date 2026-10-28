// [INPUT] Scoped API transport and Harness tool DSL. [OUTPUT] Social research tools.
// [POS] Social Data task facade. [PROTOCOL] Read-only social scope; preview before paid reads.
import { assertSocial, discoveryCard, inspect, integer, prepareInput, quote, requirePaidConsent, wrapTool } from './runtime.mjs';

function text(value) { return String(value ?? '').replaceAll('|', '\\|').replace(/[\r\n]+/g, ' '); }
function csv(value) {
  let s = String(value ?? '');
  if (/^[\s]*[=+@-]/.test(s)) s = `'${s}`;
  return `"${s.replaceAll('"', '""')}"`;
}
export function report(items) {
  if (!Array.isArray(items) || items.length < 1 || items.length > 100) throw new Error('Provide 1–100 source rows.');
  const columns = ['platform', 'title', 'url', 'author', 'published_at', 'retrieved_at', 'observed', 'analysis'];
  for (const row of items) {
    let url;
    try { url = new URL(row.url); } catch { throw new Error('Every source row needs its real source URL.'); }
    if (!['http:', 'https:'].includes(url.protocol) || url.username || url.password) throw new Error('Source URLs must be public HTTP(S) URLs without credentials.');
  }
  return {
    created_at: new Date().toISOString(), source_count: items.length,
    markdown: [`| ${columns.join(' | ')} |`, `| ${columns.map(() => '---').join(' | ')} |`, ...items.map(r => `| ${columns.map(k => text(r[k])).join(' | ')} |`)].join('\n'),
    csv: [columns.map(csv).join(','), ...items.map(r => columns.map(k => csv(r[k])).join(','))].join('\r\n'),
    note: 'Save these contents with the host file tools. This formatter did not fetch sources or verify analysis; missing fields remain empty. Comment findings describe the collected sample only.',
  };
}
export function createSocialTools(defineTool, api) {
  const tool = (n, d, p, f) => wrapTool(defineTool, n, d, p, f);
  return [
    tool('beat_social_search', 'Find public Social Data actions for a topic, post, account or comments. Free/keyless discovery. Follow with Inspect; platform coverage is action-specific.', {
      query: { type: 'string', required: true }, platform: { type: 'string' },
      limit: { type: 'integer' }, cursor: { type: 'string' },
    }, async (a, signal) => {
      const r = await api('search', { query: a.query, kind: 'data', platform: a.platform, limit: integer(a.limit, 5, 1, 20), cursor: a.cursor, view: 'full' }, { signal });
      const data = (r.data?.data ?? []).filter(c => { try { assertSocial(c.reference); return true; } catch { return false; } }).map(discoveryCard);
      return { ...r, data: { ...r.data, data, recommended: undefined, next: undefined, note: 'Only Social Data candidates are shown. Inspect an exact returned reference. Raw catalog totals may include other data capabilities.' } };
    }),
    tool('beat_social_inspect', 'Read current Social Data input schema, readiness and pricing. Free/keyless. Do not invent action IDs.', {
      reference: { type: 'string', required: true },
    }, async (a, signal) => { assertSocial(a.reference); return inspect(api, a.reference, signal); }),
    tool('beat_social_read', 'Read public social data. Defaults to a free pricing preview. Execute only after the human approves the applicable price and inputs: confirm_paid=true, current pricing_ack, and a stable idempotency_key. Not a publishing or account-action tool.', {
      reference: { type: 'string', required: true }, input: { type: 'object', additionalProperties: true, required: true },
      confirm_paid: { type: 'boolean' }, pricing_ack: { type: 'string' }, idempotency_key: { type: 'string' },
      max_items: { type: 'integer' },
    }, async (a, signal) => {
      assertSocial(a.reference);
      const contract = await inspect(api, a.reference, signal);
      if (contract.execution?.mode !== 'sync') throw new Error('This social reader supports synchronous Data actions only.');
      const input = prepareInput(contract, a.input), q = quote(contract, input);
      if (!requirePaidConsent(a, q)) return { ...q, input };
      return api('run', { reference: a.reference, operation: 'start', input, idempotency_key: a.idempotency_key, view: 'preview', max_items: integer(a.max_items, 10, 1, 50) }, { authenticated: true, signal, idempotencyKey: a.idempotency_key });
    }),
    tool('beat_social_result', 'Read a previously obtained full result or selected fields within the gateway retention period. Reuse its reference and request_id; this does not start another paid read.', {
      reference: { type: 'string', required: true }, request_id: { type: 'string', required: true }, fields: { type: 'array', items: { type: 'string' } },
    }, async (a, signal) => { assertSocial(a.reference); return api('run', { reference: a.reference, operation: 'result', request_id: a.request_id, fields: a.fields }, { authenticated: true, signal }); }),
    tool('beat_social_report', 'Format collected source rows into Markdown and spreadsheet-safe CSV. Separate observed facts from analysis; preserve source URLs and actual retrieval times. Does not fabricate or fetch evidence.', {
      items: { type: 'array', items: { type: 'object', additionalProperties: false, properties: Object.fromEntries(['platform', 'title', 'url', 'author', 'published_at', 'retrieved_at', 'observed', 'analysis'].map(k => [k, { type: 'string', ...(k === 'url' ? { required: true } : {}) }])) }, required: true },
    }, async a => report(a.items)),
  ];
}
