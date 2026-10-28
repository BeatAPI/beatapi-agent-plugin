// [INPUT] Public capability contracts and credential resolver. [OUTPUT] Scoped API requests.
// [POS] Shared DSH transport, copied into installable bundles. [PROTOCOL] No automatic paid retries.
import { createHash } from 'node:crypto';

export const API_ORIGIN = 'https://api.beatapi.io';
const SOCIAL = new Set(['tiktok', 'douyin', 'xigua', 'toutiao', 'xiaohongshu', 'lemon8', 'kuaishou', 'zhihu', 'pipixia', 'weibo', 'wechat_channels', 'wechat_mp', 'wechat_search', 'instagram', 'youtube', 'linkedin', 'bilibili', 'telegram', 'twitter', 'threads', 'reddit', 'hybrid', 'creator']);
export function fingerprint(value) {
  return createHash('sha256').update(JSON.stringify(value)).digest('hex').slice(0, 24);
}
export function assertSocial(reference) {
  if (typeof reference !== 'string' || !/^data:[a-z0-9_]+\.[a-zA-Z0-9_.]+$/.test(reference) || !SOCIAL.has(reference.slice(5).split('.')[0])) {
    throw new Error('Choose a Social Data reference returned by beat_social_search; web, model and workflow execution are outside this plugin.');
  }
  if (reference.slice(5).split('.').some(x => /^(create|publish|delete|send|update|upload|like|follow|unfollow|repost)(_|$)/.test(x))) throw new Error('Account mutations and publishing are outside this read-only plugin.');
}
export function assertMedia(contract) {
  if (!contract.reference?.startsWith('model:') || !contract.categories?.some(x => x === 'image' || x === 'video')) {
    throw new Error('Choose an image or video model returned by beat_media_search.');
  }
}
export function integer(value, fallback, min, max) {
  const n = value ?? fallback;
  if (!Number.isInteger(n) || n < min || n > max) throw new Error(`Expected an integer between ${min} and ${max}.`);
  return n;
}
export function discoveryCard(c) {
  return { reference: c.reference, kind: c.kind, title: c.title, summary: c.description ?? c.summary, readiness: c.readiness, platforms: c.platforms ?? (c.platform ? [c.platform] : undefined), categories: c.categories, pricing: c.pricing, required_inputs: c.input_schema?.required };
}
export function object(value) {
  if (!value || typeof value !== 'object' || Array.isArray(value)) throw new Error('input must be a JSON object.');
  return value;
}
function redact(value, key) {
  if (typeof value === 'string') return key ? value.split(key).join('[redacted]') : value;
  if (Array.isArray(value)) return value.map(x => redact(x, key));
  if (value && typeof value === 'object') return Object.fromEntries(Object.entries(value).filter(([k]) => !/^(authorization|api[_-]?key|access[_-]?token|secret)$/i.test(k)).map(([k, v]) => [k, redact(v, key)]));
  return value;
}
export function createApi({ getKey, fetchImpl = globalThis.fetch, timeoutMs = 60000 }) {
  return async function api(operation, body, { authenticated = false, signal, idempotencyKey } = {}) {
    if (!['search', 'inspect', 'run'].includes(operation)) throw new Error('Unsupported capability operation.');
    const key = authenticated ? await getKey() : undefined;
    if (authenticated && !key) throw new Error('Set your BeatAPI credential in Harness or BEATAPI_API_KEY before a data read or media task. Search and Inspect need no key.');
    const headers = { 'Content-Type': 'application/json', 'X-Beat-Client': 'http' };
    if (key) headers.Authorization = `Bearer ${key}`;
    if (idempotencyKey) headers['Idempotency-Key'] = idempotencyKey;
    let response;
    try {
      response = await fetchImpl(`${API_ORIGIN}/v1/capabilities/${operation}`, {
        method: 'POST', headers, body: JSON.stringify(body), redirect: 'error',
        signal: signal ? AbortSignal.any([signal, AbortSignal.timeout(timeoutMs)]) : AbortSignal.timeout(timeoutMs),
      });
    } catch {
      if (signal?.aborted) throw new Error('Cancelled. A submitted remote task may still run; resume its task ID instead of starting another.');
      throw new Error('BeatAPI request failed or timed out. Do not repeat a paid start with a new idempotency key; check the existing task or request first.');
    }
    let result;
    try { result = await response.json(); } catch { throw new Error(`BeatAPI returned a non-JSON response (HTTP ${response.status}).`); }
    if (!response.ok) {
      const code = /^[a-zA-Z0-9_]{1,64}$/.test(result?.error?.code ?? '') ? result.error.code : 'request_failed';
      throw new Error(`BeatAPI ${code} (HTTP ${response.status}). Check the input, credential or balance; this call was not automatically retried.`);
    }
    if (result.error || result.success === false) throw new Error('BeatAPI reported a failed operation. Inspect the contract and account state before retrying.');
    return redact(result, key);
  };
}
export async function inspect(api, reference, signal) {
  const response = await api('inspect', { reference }, { signal });
  const contract = response.data;
  if (!contract || contract.reference !== reference) throw new Error('The capability contract did not match the requested reference.');
  return contract;
}
export function prepareInput(contract, input) {
  const data = { ...object(input) };
  const model = contract.input_schema?.properties?.model?.enum;
  if (data.model === undefined && model?.length === 1) data.model = model[0];
  const missing = (contract.input_schema?.required ?? []).filter(k => data[k] === undefined);
  if (missing.length) throw new Error(`Missing required inputs: ${missing.join(', ')}. Read the inspected input_schema.`);
  if (contract.readiness === 'listed' || contract.execution?.executable === false) throw new Error('This capability is listed but not executable. Choose a ready or runnable capability.');
  return data;
}
export function quote(contract, input) {
  return {
    reference: contract.reference, title: contract.title, readiness: contract.readiness,
    input_schema: contract.input_schema, pricing: contract.pricing ?? null,
    pricing_ack: fingerprint({ reference: contract.reference, schema_hash: contract.schema_hash, pricing: contract.pricing, input }),
    executed: false,
    note: 'Catalog pricing is not an exact task estimate or a spending cap. Confirm the requested inputs and applicable pricing with the user. No paid execution has occurred.',
  };
}
export function requirePaidConsent(args, q) {
  if (!args.confirm_paid) return false;
  if (!q.pricing) throw new Error('Published pricing is unavailable; paid execution is disabled.');
  if (args.pricing_ack !== q.pricing_ack) throw new Error('Pricing or schema changed, or no current pricing acknowledgement was supplied. Preview again and confirm with the user.');
  if (typeof args.idempotency_key !== 'string' || !/^[A-Za-z0-9_.:-]{8,160}$/.test(args.idempotency_key)) throw new Error('Supply a stable idempotency_key (8–160 letters, digits, dot, dash, underscore or colon). Reuse it for retries of the same input.');
  return true;
}
export function wrapTool(defineTool, name, description, parameters, execute) {
  return defineTool({ name, description, parameters,
    output: { schema: { type: 'json' }, render: (_args, value) => [{ type: 'text', text: JSON.stringify(value) }] },
    execute: async (args, exec) => JSON.parse(JSON.stringify(await execute(args, exec?.signal))),
  });
}
