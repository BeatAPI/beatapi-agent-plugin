// [INPUT] Live model contracts and user-approved task inputs. [OUTPUT] Media tasks and resumable status.
// [POS] Image/video capability facade. [PROTOCOL] No automatic paid retries or hidden model substitution.
import { assertMedia, discoveryCard, inspect, integer, prepareInput, quote, requirePaidConsent, wrapTool } from './runtime.mjs';

export function createMediaTools(defineTool, api) {
  const tool = (n, d, p, f) => wrapTool(defineTool, n, d, p, f);
  const getContract = async (reference, signal) => {
    if (typeof reference !== 'string' || !reference.startsWith('model:')) throw new Error('Use a model reference returned by beat_media_search.');
    const c = await inspect(api, reference, signal); assertMedia(c); return c;
  };
  return [
    tool('beat_media_search', 'Discover image/video generation and editing models. Free/keyless. Inspect the returned model for supported reference media, dimensions and current pricing.', {
      query: { type: 'string', required: true }, media_type: { type: 'string', enum: ['image', 'video'] }, limit: { type: 'integer' }, cursor: { type: 'string' },
    }, async (a, signal) => {
      const r = await api('search', { query: `${a.media_type ?? 'image video'} ${a.query}`, kind: 'model', limit: integer(a.limit, 8, 1, 20), cursor: a.cursor, view: 'full' }, { signal });
      const data = (r.data?.data ?? []).filter(c => { try { assertMedia(c); return !a.media_type || c.categories.includes(a.media_type); } catch { return false; } }).map(discoveryCard);
      return { ...r, data: { ...r.data, data, recommended: undefined, next: undefined, note: 'Only matching image/video contracts are shown. Inspect an exact returned reference; catalog totals may include other modalities.' } };
    }),
    tool('beat_media_inspect', 'Read exact media input schema, reference-image/video support and pricing tiers. Free/keyless. A base price is not a full-input quote.', {
      reference: { type: 'string', required: true },
    }, async (a, signal) => getContract(a.reference, signal)),
    tool('beat_media_generate', 'Create an image/video task with the requested model and supported inputs. Defaults to pricing preview only. Human approval is required before confirm_paid=true; pass the current pricing_ack and reuse one idempotency_key for retries. Returns a task ID, not a completed asset.', {
      reference: { type: 'string', required: true }, input: { type: 'object', additionalProperties: true, required: true },
      confirm_paid: { type: 'boolean' }, pricing_ack: { type: 'string' }, idempotency_key: { type: 'string' },
    }, async (a, signal) => {
      const c = await getContract(a.reference, signal), input = prepareInput(c, a.input), q = quote(c, input);
      if (!requirePaidConsent(a, q)) return { ...q, input };
      return api('run', { reference: a.reference, operation: 'start', input, idempotency_key: a.idempotency_key }, { authenticated: true, signal, idempotencyKey: a.idempotency_key });
    }),
    tool('beat_media_status', 'Resume an existing generation task using its original reference and task_id. Obey poll_after_seconds. A timeout/cancelled wait does not cancel remote generation. Report completed only after succeeded and real output URLs; never replace a failed task silently.', {
      reference: { type: 'string', required: true }, task_id: { type: 'string', required: true },
    }, async (a, signal) => {
      await getContract(a.reference, signal);
      return api('run', { reference: a.reference, operation: 'status', task_id: a.task_id }, { authenticated: true, signal });
    }),
  ];
}
