// Live prices from the API's anonymous catalog routes, the same the landing shows. A failure is never cached and gives
// null, so the prompt says prices are not available instead of quoting an old or empty one.

import { deadline } from './deadline.js';

function isPositive(value) {
  return typeof value === 'number' && Number.isFinite(value) && value > 0;
}

function trustedVm(o) {
  return o && typeof o.id === 'string' && o.id !== '' && typeof o.name === 'string'
    && Number.isInteger(o.vcpu) && o.vcpu > 0 && Number.isInteger(o.memoryMb) && o.memoryMb > 0 && isPositive(o.pricePerHour);
}

function trustedVolume(o) {
  return o && typeof o.id === 'string' && o.id !== '' && typeof o.name === 'string' && isPositive(o.pricePerGbPerHour);
}

export function createPrices({ apiBaseUrl, fetch = globalThis.fetch, ttlMs = 300_000, timeoutMs = 5_000, now = () => Date.now() }) {
  const base = apiBaseUrl.replace(/\/+$/, '');
  let cached = null;
  let cachedAt = 0;

  async function list(path, trusted) {
    const limit = deadline(timeoutMs);
    let body;
    try {
      const response = await fetch(`${base}${path}`, { signal: limit.signal });
      if (response.status !== 200) return null;
      body = await response.json();
    } finally {
      limit.clear();
    }
    if (!Array.isArray(body) || body.length === 0 || !body.every(trusted)) return null;
    return body;
  }

  return {
    async get() {
      if (cached !== null && now() - cachedAt < ttlMs) return cached;
      try {
        const [vm, volume] = await Promise.all([list('/v1/vm-offerings', trustedVm), list('/v1/volume-offerings', trustedVolume)]);
        if (vm === null || volume === null) return null;
        cached = { vm, volume };
        cachedAt = now();
        return cached;
      } catch {
        return null;
      }
    },
  };
}
