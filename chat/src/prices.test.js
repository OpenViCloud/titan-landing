import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createPrices } from './prices.js';

const vm = [{ id: 's', name: 'Small', cpu: 1, vcpu: 1, memoryMb: 2048, pricePerHour: 634.05 }];
const volume = [{ id: 'standard', name: 'Standard', sizeGb: 0, isCustomized: true, pricePerGbPerHour: 1.369863 }];

function api({ vmBody = vm, volumeBody = volume, status = 200 } = {}) {
  const calls = [];
  const fetch = async (url) => {
    calls.push(url);
    const body = url.endsWith('/v1/vm-offerings') ? vmBody : volumeBody;
    return new Response(JSON.stringify(body), { status });
  };
  return { fetch, calls };
}

test('prices come from the two anonymous routes of the API', async () => {
  const { fetch, calls } = api();
  const prices = createPrices({ apiBaseUrl: 'http://cp:8080/', fetch });
  assert.deepEqual(await prices.get(), { vm, volume });
  assert.deepEqual(calls.sort(), ['http://cp:8080/v1/vm-offerings', 'http://cp:8080/v1/volume-offerings']);
});

test('prices are kept for the cache time, then asked again', async () => {
  let now = 0;
  const { fetch, calls } = api();
  const prices = createPrices({ apiBaseUrl: 'http://cp', fetch, ttlMs: 300_000, now: () => now });
  await prices.get();
  now = 299_999;
  await prices.get();
  assert.equal(calls.length, 2);
  now = 300_000;
  await prices.get();
  assert.equal(calls.length, 4);
});

test('an API error or a body off shape gives no prices', async () => {
  for (const setup of [{ status: 500 }, { vmBody: [] }, { vmBody: [{ id: 's', pricePerHour: 0 }] }, { volumeBody: { not: 'a list' } }]) {
    const { fetch } = api(setup);
    const prices = createPrices({ apiBaseUrl: 'http://cp', fetch });
    assert.equal(await prices.get(), null, JSON.stringify(setup));
  }
});

test('an API that does not answer in time gives no prices', async () => {
  const fetch = (url, init) => new Promise((_, reject) => init.signal.addEventListener('abort', () => reject(init.signal.reason)));
  const prices = createPrices({ apiBaseUrl: 'http://cp', fetch, timeoutMs: 20 });
  assert.equal(await prices.get(), null);
});

test('a failure is not kept: the next question asks again', async () => {
  let status = 500;
  const calls = [];
  const fetch = async (url) => {
    calls.push(url);
    return new Response(JSON.stringify(url.endsWith('vm-offerings') ? vm : volume), { status });
  };
  const prices = createPrices({ apiBaseUrl: 'http://cp', fetch });
  assert.equal(await prices.get(), null);
  status = 200;
  assert.deepEqual(await prices.get(), { vm, volume });
});
