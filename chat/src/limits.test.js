import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createDailyLimit, createKvDailyLimit, createReopeningLimit, createSharedLimit, openKvLimit } from './limits.js';

const day1 = new Date('2026-11-11T10:00:00Z');
const day1Late = new Date('2026-11-11T23:59:59Z');
const day2 = new Date('2026-11-12T00:00:01Z');

test('an address gets the cap and no more on one UTC day', () => {
  let now = day1;
  const limit = createDailyLimit({ perDay: 3, now: () => now });
  assert.deepEqual([limit.take('a'), limit.take('a'), limit.take('a')], [true, true, true]);
  now = day1Late;
  assert.equal(limit.take('a'), false);
});

test('another address keeps its own count', () => {
  const limit = createDailyLimit({ perDay: 1, now: () => day1 });
  assert.equal(limit.take('a'), true);
  assert.equal(limit.take('a'), false);
  assert.equal(limit.take('b'), true);
});

test('a new UTC day gives the address its answers back', () => {
  let now = day1;
  const limit = createDailyLimit({ perDay: 1, now: () => now });
  assert.equal(limit.take('a'), true);
  assert.equal(limit.take('a'), false);
  now = day2;
  assert.equal(limit.take('a'), true);
});

test('a new UTC day forgets yesterday’s addresses', () => {
  let now = day1;
  const limit = createDailyLimit({ perDay: 1, now: () => now });
  limit.take('a');
  limit.take('b');
  now = day2;
  limit.take('c');
  assert.equal(limit.size(), 1);
});

// A KV with revisions, as NATS keeps them: create fails when the key exists, update fails on a stale revision. Each
// call yields first, so takes from two pods interleave.
// What NATS answers when a conditional write finds another revision: JetStream API error 10071, wrong last sequence.
const conflict = () => Object.assign(new Error('wrong last sequence'), { code: 10071 });

function fakeKv() {
  const entries = new Map();
  let sequence = 0;
  const tick = () => new Promise((resolve) => setImmediate(resolve));
  return {
    entries,
    async get(key) {
      await tick();
      const entry = entries.get(key);
      return entry ? { operation: 'PUT', revision: entry.revision, string: () => entry.value } : null;
    },
    async create(key, value) {
      await tick();
      if (entries.has(key)) throw conflict();
      entries.set(key, { value, revision: ++sequence });
      return sequence;
    },
    async update(key, value, revision) {
      await tick();
      if (entries.get(key)?.revision !== revision) throw conflict();
      entries.set(key, { value, revision: ++sequence });
      return sequence;
    },
  };
}

test('two pods share one count for an address', async () => {
  const kv = fakeKv();
  const podA = createKvDailyLimit({ perDay: 3, kv, now: () => day1 });
  const podB = createKvDailyLimit({ perDay: 3, kv, now: () => day1 });
  assert.deepEqual([await podA.take('a'), await podA.take('a'), await podB.take('a'), await podB.take('a')],
    [true, true, true, false]);
  assert.equal(await podB.take('b'), true);
});

test('takes that race on two pods give the cap and no more', async () => {
  const kv = fakeKv();
  const pods = [createKvDailyLimit({ perDay: 10, kv, now: () => day1 }), createKvDailyLimit({ perDay: 10, kv, now: () => day1 })];
  const taken = await Promise.all(Array.from({ length: 30 }, (_, i) => pods[i % 2].take('a')));
  assert.equal(taken.filter(Boolean).length, 10);
});

test('the key is the UTC day and the hex of the address, never its raw text', async () => {
  const kv = fakeKv();
  let now = day1;
  const limit = createKvDailyLimit({ perDay: 1, kv, now: () => now });
  await limit.take('2001:db8::1');
  now = day2;
  assert.equal(await limit.take('2001:db8::1'), true);
  const keys = [...kv.entries.keys()];
  assert.equal(keys.length, 2);
  for (const key of keys) {
    assert.match(key, /^\d{4}-\d{2}-\d{2}\.[0-9a-f]+$/);
    assert.ok(!key.includes('2001:db8::1'));
  }
});

test('a write that fails for another reason is not tried again: the error goes to the caller', async () => {
  const kv = fakeKv();
  let writes = 0;
  kv.create = async () => { writes++; throw Object.assign(new Error('timeout'), { code: 'TIMEOUT' }); };
  const limit = createKvDailyLimit({ perDay: 3, kv, now: () => day1 });
  await assert.rejects(limit.take('a'), /timeout/);
  assert.equal(writes, 1);
});

test('a shared store that fails falls back to the pod’s own count, and the log names no address', async () => {
  const logs = [];
  const broken = { take: async () => { throw new Error('no responders'); } };
  const limit = createSharedLimit({ shared: broken, local: createDailyLimit({ perDay: 1, now: () => day1 }), log: (e) => logs.push(e) });
  assert.deepEqual([await limit.take('203.0.113.7'), await limit.take('203.0.113.7')], [true, false]);
  assert.equal(logs.length, 2);
  assert.ok(logs.every((e) => e.event === 'limit store failed' && !JSON.stringify(e).includes('203.0.113.7')));
});

test('a shared store that answers is the only count', async () => {
  const kv = fakeKv();
  const local = createDailyLimit({ perDay: 1, now: () => day1 });
  const limit = createSharedLimit({ shared: createKvDailyLimit({ perDay: 2, kv, now: () => day1 }), local, log: () => {} });
  assert.deepEqual([await limit.take('a'), await limit.take('a'), await limit.take('a')], [true, true, false]);
  assert.equal(local.size(), 0);
});

// The real store: NATS JetStream with a memory-only KV, as the cluster runs it. Skipped without TEST_NATS_URL; the CI job
// sets it and fails when this was skipped.
test('on NATS: pods racing on one address get the cap and no more, in a memory-only bucket', { skip: !process.env.TEST_NATS_URL && 'no TEST_NATS_URL' }, async () => {
  const pods = await Promise.all([1, 2].map(() => openKvLimit({ servers: process.env.TEST_NATS_URL, perDay: 10, bucket: 'test-race' })));
  try {
    const address = `test-${Date.now()}-${Math.random()}`;
    const taken = await Promise.all(Array.from({ length: 30 }, (_, i) => pods[i % 2].take(address)));
    assert.equal(taken.filter(Boolean).length, 10);
    const status = await pods[0].status();
    assert.equal(status.storage, 'memory');
    assert.equal(status.ttl, 48 * 60 * 60 * 1000);
    assert.equal(status.maxBytes, 8 * 1024 * 1024);
  } finally {
    await Promise.all(pods.map((pod) => pod.close()));
  }
});

// The bucket lives in NATS memory: a NATS restart loses it while the pod's connection comes back. A store that fails is
// dropped and opened again, which creates the bucket anew.
test('a store that fails is closed and opened again, at most once per wait, and the new one counts', async () => {
  let clock = 0;
  const opened = [];
  const open = async () => {
    const store = { closed: false, fails: opened.length === 0, close: async () => { store.closed = true; },
      take: async () => { if (store.fails) throw Object.assign(new Error('stream not found'), { code: 10059 }); return true; } };
    opened.push(store);
    return store;
  };
  const limit = createReopeningLimit({ open, againMs: 30_000, now: () => clock, log: () => {} });
  await limit.ready();
  clock = 30_000;
  await assert.rejects(limit.take('a'), /stream not found/);
  assert.equal(opened[0].closed, true);
  await limit.ready();
  assert.equal(opened.length, 2);
  assert.equal(await limit.take('a'), true);
});

test('a store that cannot open is tried again only after the wait', async () => {
  let clock = 0;
  let tries = 0;
  const open = async () => { tries++; throw Object.assign(new Error('no JetStream'), { code: 503 }); };
  const limit = createReopeningLimit({ open, againMs: 30_000, now: () => clock, log: () => {} });
  await limit.ready();
  await assert.rejects(limit.take('a'), /not open/);
  await limit.ready();
  assert.equal(tries, 1);
  clock = 30_000;
  await assert.rejects(limit.take('a'), /not open/);
  await limit.ready();
  assert.equal(tries, 2);
});

test('on NATS: a bucket lost as in a NATS restart is opened anew and counts again', { skip: !process.env.TEST_NATS_URL && 'no TEST_NATS_URL' }, async () => {
  const bucket = `test-${Date.now()}`;
  const opened = [];
  const open = async () => {
    const store = await openKvLimit({ servers: process.env.TEST_NATS_URL, perDay: 10, bucket });
    opened.push(store);
    return store;
  };
  const limit = createReopeningLimit({ open, againMs: 0, log: () => {} });
  try {
    await limit.ready();
    assert.equal(await limit.take('a'), true);
    await opened[0].dropBucket();
    await assert.rejects(limit.take('a'));
    await limit.ready();
    assert.equal(opened.length, 2);
    assert.equal(await limit.take('a'), true);
  } finally {
    await Promise.all(opened.map((store) => store.close().catch(() => {})));
  }
});
