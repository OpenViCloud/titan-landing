import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createServer, visitorAddress } from './server.js';

const body = { conversationId: '7b0e3c1e-2f4a-4d6b-9c1d-0a1b2c3d4e5f', lang: 'en', message: 'hi', history: [] };

async function withServer(turn, run) {
  const logs = [];
  const server = createServer({ turn, log: (e) => logs.push(e) });
  await new Promise((resolve) => server.listen(0, '127.0.0.1', resolve));
  const base = `http://127.0.0.1:${server.address().port}`;
  try {
    await run(base, logs);
  } finally {
    await new Promise((resolve) => server.close(resolve));
  }
}

function fakeTurn(result = { kind: 'answer', answer: 'Hello' }) {
  const calls = [];
  return { calls, async answer(args) { calls.push(args); return result; } };
}

test('POST /api/chat answers with the turn’s answer and kind', async () => {
  const turn = fakeTurn();
  await withServer(turn, async (base) => {
    const res = await fetch(`${base}/api/chat`, { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify(body) });
    assert.equal(res.status, 200);
    assert.deepEqual(await res.json(), { kind: 'answer', answer: 'Hello' });
    assert.equal(res.headers.get('cache-control'), 'no-store');
    assert.equal(turn.calls[0].request.message, 'hi');
  });
});

test('a bad body is 400 and the turn is never run', async () => {
  const turn = fakeTurn();
  await withServer(turn, async (base) => {
    for (const bad of ['{nope', JSON.stringify({ ...body, message: '' }), JSON.stringify({ ...body, lang: 'fr' })]) {
      const res = await fetch(`${base}/api/chat`, { method: 'POST', body: bad });
      assert.equal(res.status, 400, bad);
    }
    assert.equal(turn.calls.length, 0);
  });
});

test('a body larger than the cap is 413 and the turn is never run', async () => {
  const turn = fakeTurn();
  await withServer(turn, async (base) => {
    const res = await fetch(`${base}/api/chat`, { method: 'POST', body: 'x'.repeat(64 * 1024) });
    assert.equal(res.status, 413);
    assert.equal(turn.calls.length, 0);
  });
});

test('another method on /api/chat is 405; another path is 404', async () => {
  await withServer(fakeTurn(), async (base) => {
    assert.equal((await fetch(`${base}/api/chat`)).status, 405);
    assert.equal((await fetch(`${base}/api/other`, { method: 'POST', body: '{}' })).status, 404);
  });
});

test('/healthz answers without asking any model', async () => {
  const turn = fakeTurn();
  await withServer(turn, async (base) => {
    const res = await fetch(`${base}/healthz`);
    assert.equal(res.status, 200);
    assert.equal(turn.calls.length, 0);
  });
});

test('the visitor address is the Cloudflare header when there is one, else the connection’s', () => {
  assert.equal(visitorAddress({ headers: { 'cf-connecting-ip': '203.0.113.7' }, socket: { remoteAddress: '10.0.0.1' } }), '203.0.113.7');
  assert.equal(visitorAddress({ headers: { 'cf-connecting-ip': '' }, socket: { remoteAddress: '10.0.0.1' } }), '10.0.0.1');
  assert.equal(visitorAddress({ headers: {}, socket: { remoteAddress: '10.0.0.1' } }), '10.0.0.1');
});

test('the request log holds no question and no address', async () => {
  await withServer(fakeTurn({ kind: 'answer', answer: 'SECRET answer' }), async (base, logs) => {
    await fetch(`${base}/api/chat`, { method: 'POST', headers: { 'cf-connecting-ip': '198.51.100.9' }, body: JSON.stringify({ ...body, message: 'SECRET question' }) });
    await fetch(`${base}/api/chat`, { method: 'POST', body: JSON.stringify({ ...body, message: '' }) });
    const text = JSON.stringify(logs);
    assert.ok(logs.length >= 2);
    for (const secret of ['SECRET', '198.51.100.9']) assert.ok(!text.includes(secret), secret);
  });
});

test('a turn that throws is a 500 with the busy kind, not a hang', async () => {
  const turn = { async answer() { throw new Error('boom'); } };
  await withServer(turn, async (base) => {
    const res = await fetch(`${base}/api/chat`, { method: 'POST', body: JSON.stringify(body) });
    assert.equal(res.status, 500);
    assert.equal((await res.json()).kind, 'unavailable');
  });
});
