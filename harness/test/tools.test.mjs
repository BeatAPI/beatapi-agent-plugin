// [INPUT] Fake gateway responses and real task facades. [OUTPUT] Regression evidence.
// [POS] DSH package behavior tests. [PROTOCOL] No external calls or paid tasks.
import test from 'node:test';
import assert from 'node:assert/strict';
import { createApi, assertSocial } from '../shared/runtime.mjs';
import { createSocialTools, report } from '../../packages/dsh-social/tools.mjs';
import { createMediaTools } from '../../packages/dsh-media/tools.mjs';

const social = { reference: 'data:twitter.web.fetch_search_timeline', title: 'Search', readiness: 'ready', schema_hash: 'social-v1', input_schema: { required: ['keyword'] }, execution: { mode: 'sync', executable: true }, pricing: { unit: 'request', price_usd: '0.003' } };
const image = { reference: 'model:test-image', title: 'Image', categories: ['image'], readiness: 'ready', schema_hash: 'image-v1', input_schema: { properties: { model: { enum: ['test-image'] } }, required: ['model', 'prompt'] }, execution: { mode: 'async', executable: true }, pricing: { unit: 'image', price_usd: '0.015', tiers: [{ id: '1k', price_usd: '0.015' }] } };
function fixture(contract = social) {
  const calls = [];
  const api = async (op, body, opts) => {
    calls.push({ op, body, opts });
    if (op === 'inspect') return { data: structuredClone(contract) };
    if (op === 'search') return { data: { data: [structuredClone(contract)], total: 1 } };
    return { data: { status: body.operation === 'status' ? 'succeeded' : 'pending', task_id: 'test-task', request_id: 'test-request', output: { media: [{ type: 'image', url: 'https://example.org/test.png' }] } } };
  };
  return { api, calls };
}
const find = (defs, name) => defs.find(x => x.name === name);
const define = d => d;
test('discovery never attaches credentials; only authenticated runs resolve them', async () => {
  const calls = [];
  let reads = 0;
  const api = createApi({ getKey: async () => { reads++; return 'test-secret'; }, fetchImpl: async (url, init) => { calls.push({ url, init }); return Response.json({ data: { ok: true } }); } });
  await api('search', { query: 'X' });
  assert.equal(reads, 0); assert.equal(calls[0].init.headers.Authorization, undefined);
  await api('run', {}, { authenticated: true, idempotencyKey: 'task-test' });
  assert.equal(reads, 1); assert.equal(calls[1].init.headers.Authorization, 'Bearer test-secret');
  assert.equal(calls[1].init.redirect, 'error'); assert.equal(calls[1].init.headers['Idempotency-Key'], 'task-test');
});
test('missing credential prevents any paid network request', async () => {
  let calls = 0;
  const api = createApi({ getKey: async () => undefined, fetchImpl: async () => { calls++; } });
  await assert.rejects(api('run', {}, { authenticated: true }), /Set your BeatAPI credential/);
  assert.equal(calls, 0);
});
test('gateway failures never expose private error text and are never retried', async () => {
  let calls = 0;
  const api = createApi({ getKey: async () => 'test-secret', fetchImpl: async () => { calls++; return Response.json({ error: { code: 'invalid_input', message: 'supplier: test-secret private-url' } }, { status: 400 }); } });
  await assert.rejects(api('run', {}, { authenticated: true }), e => !/supplier|test-secret|private-url/.test(e.message) && /invalid_input/.test(e.message));
  assert.equal(calls, 1);
});
test('response redaction strips credential fields and the resolved key', async () => {
  const api = createApi({ getKey: async () => 'test-secret', fetchImpl: async () => Response.json({ data: { api_key: 'test-secret', body: 'echo test-secret' } }) });
  assert.deepEqual(await api('run', {}, { authenticated: true }), { data: { body: 'echo [redacted]' } });
});
test('social scope refuses web, models, workflows and account writes', () => {
  for (const ref of ['data:web.search', 'model:test', 'workflow:test', 'data:twitter.web.publish_post', 'data:instagram.v2.delete_post']) assert.throws(() => assertSocial(ref));
  assert.doesNotThrow(() => assertSocial(social.reference));
});
test('social read previews pricing before any paid operation', async () => {
  const f = fixture(); const read = find(createSocialTools(define, f.api), 'beat_social_read');
  const q = await read.execute({ reference: social.reference, input: { keyword: 'agent tools' } });
  assert.equal(q.executed, false); assert.ok(q.pricing_ack); assert.equal(f.calls.length, 1);
  await assert.rejects(read.execute({ reference: social.reference, input: { keyword: 'x' }, confirm_paid: true, pricing_ack: 'stale', idempotency_key: 'task-test-1' }), /Pricing or schema changed/);
  assert.equal(f.calls.filter(c => c.op === 'run').length, 0);
});
test('approved social read preserves inputs, identity and bounded output', async () => {
  const f = fixture(); const read = find(createSocialTools(define, f.api), 'beat_social_read');
  const args = { reference: social.reference, input: { keyword: 'agent tools' } };
  const q = await read.execute(args);
  await read.execute({ ...args, confirm_paid: true, pricing_ack: q.pricing_ack, idempotency_key: 'task-test-1', max_items: 3 });
  const run = f.calls.find(x => x.op === 'run');
  assert.deepEqual(run.body.input, args.input); assert.equal(run.body.idempotency_key, 'task-test-1'); assert.equal(run.body.max_items, 3); assert.equal(run.body.view, 'preview');
});
test('paid starts require explicit idempotency and reject listed or incomplete input', async () => {
  const f = fixture(); const read = find(createSocialTools(define, f.api), 'beat_social_read');
  await assert.rejects(read.execute({ reference: social.reference, input: {} }), /Missing required/);
  const args = { reference: social.reference, input: { keyword: 'x' } }; const q = await read.execute(args);
  await assert.rejects(read.execute({ ...args, confirm_paid: true, pricing_ack: q.pricing_ack }), /idempotency_key/);
  const listed = fixture({ ...social, readiness: 'listed', execution: { executable: false, mode: 'sync' } });
  await assert.rejects(find(createSocialTools(define, listed.api), 'beat_social_read').execute(args), /not executable/);
});
test('stored-result retrieval uses result rather than another paid start', async () => {
  const f = fixture(); const result = find(createSocialTools(define, f.api), 'beat_social_result');
  await result.execute({ reference: social.reference, request_id: 'original', fields: ['items[].title'] });
  assert.equal(f.calls[0].body.operation, 'result'); assert.equal(f.calls[0].body.request_id, 'original');
});
test('reports preserve missing facts, escape tables and neutralize spreadsheet formulas', () => {
  const r = report([{ url: 'https://example.org/post/1', title: '=HYPERLINK("bad")', observed: 'a|b\nc' }]);
  assert.match(r.csv, /'=HYPERLINK/); assert.match(r.markdown, /a\\\|b c/); assert.equal(r.source_count, 1);
  assert.throws(() => report([{ url: 'javascript:alert(1)' }]));
  assert.throws(() => report([{ title: 'no evidence' }]));
});
test('media rejects text models and preserves selected model and references', async () => {
  const bad = fixture({ ...image, categories: ['text'] });
  await assert.rejects(find(createMediaTools(define, bad.api), 'beat_media_inspect').execute({ reference: image.reference }), /image or video/);
  const f = fixture(image); const gen = find(createMediaTools(define, f.api), 'beat_media_generate');
  const args = { reference: image.reference, input: { prompt: 'test', images: ['https://example.org/ref.png'] } };
  const q = await gen.execute(args); assert.equal(q.input.model, 'test-image');
  await gen.execute({ ...args, confirm_paid: true, pricing_ack: q.pricing_ack, idempotency_key: 'test-media-1' });
  assert.equal(f.calls.at(-1).body.reference, image.reference); assert.deepEqual(f.calls.at(-1).body.input.images, args.input.images);
});
test('media resume checks the original task and never starts a replacement', async () => {
  const f = fixture(image); const status = find(createMediaTools(define, f.api), 'beat_media_status');
  const r = await status.execute({ reference: image.reference, task_id: 'original-task' });
  assert.equal(r.data.status, 'succeeded'); assert.equal(f.calls.at(-1).body.operation, 'status'); assert.equal(f.calls.at(-1).body.task_id, 'original-task');
});
test('a changed generation specification invalidates the pricing acknowledgement', async () => {
  const f = fixture(image); const gen = find(createMediaTools(define, f.api), 'beat_media_generate');
  const args = { reference: image.reference, input: { prompt: 'test', resolution: '1K' } };
  const q = await gen.execute(args);
  await assert.rejects(gen.execute({ ...args, input: { ...args.input, resolution: '4K' }, confirm_paid: true, pricing_ack: q.pricing_ack, idempotency_key: 'test-media-2' }), /Pricing or schema changed/);
  assert.equal(f.calls.filter(c => c.op === 'run').length, 0);
});
test('search tools filter out unrelated capability domains', async () => {
  const api = async () => ({ data: { data: [social, image, { reference: 'data:web.search' }], total: 3 } });
  const s = await find(createSocialTools(define, api), 'beat_social_search').execute({ query: 'test' });
  assert.deepEqual(s.data.data.map(x => x.reference), [social.reference]);
  const m = await find(createMediaTools(define, api), 'beat_media_search').execute({ query: 'test', media_type: 'image' });
  assert.deepEqual(m.data.data.map(x => x.reference), [image.reference]);
  assert.equal(m.data.data[0].input_schema, undefined);
  assert.equal(m.data.data[0].output_schema, undefined);
  assert.ok(!JSON.stringify(m).includes('undefined'));
});
