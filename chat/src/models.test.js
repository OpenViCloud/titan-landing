import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createOpenRouter, ModelError, DEFAULT_MODELS } from './models.js';
import { deadline } from './deadline.js';

function fakeFetch(respond) {
  const calls = [];
  const fetch = async (url, init) => {
    calls.push({ url, init, body: JSON.parse(init.body) });
    return respond(calls.at(-1));
  };
  return { fetch, calls };
}

function json(status, body) {
  return new Response(JSON.stringify(body), { status, headers: { 'content-type': 'application/json' } });
}

const messages = [{ role: 'system', content: 'rules' }, { role: 'user', content: 'hi' }];

test('the default model list is the order of the design', () => {
  assert.deepEqual(DEFAULT_MODELS, [
    'nvidia/nemotron-3-ultra-550b-a55b:free',
    'nvidia/nemotron-3.5-super-vl:free',
    'google/gemma-4-31b-it:free',
  ]);
});

test('a completion sends the key, the model and the messages, and returns the answer', async () => {
  const { fetch, calls } = fakeFetch(() => json(200, { choices: [{ message: { content: 'Xin chào' } }] }));
  const provider = createOpenRouter({ apiKey: 'sk-test', fetch });
  const text = await provider.complete({ model: 'm:free', messages });
  assert.equal(text, 'Xin chào');
  assert.equal(calls[0].url, 'https://openrouter.ai/api/v1/chat/completions');
  assert.equal(calls[0].init.headers.Authorization, 'Bearer sk-test');
  assert.equal(calls[0].body.model, 'm:free');
  assert.deepEqual(calls[0].body.messages, messages);
  assert.equal(calls[0].body.stream, false);
  assert.deepEqual(calls[0].body.reasoning, { effort: 'low', exclude: true });
});

test('a status other than 200 is a model error carrying the status', async () => {
  for (const status of [429, 403, 500]) {
    const { fetch } = fakeFetch(() => json(status, { error: { message: 'no' } }));
    const provider = createOpenRouter({ apiKey: 'k', fetch });
    await assert.rejects(provider.complete({ model: 'm', messages }), (e) => e instanceof ModelError && e.status === status);
  }
});

test('an empty answer, a 200 with an error, or a body off shape is a model error', async () => {
  const bodies = [
    { choices: [{ message: { content: '' } }] },
    { choices: [{ message: { content: '   ' } }] },
    { choices: [{ message: { content: null, reasoning: 'thinking…' } }] },
    { error: { code: 429, message: 'rate limited' } },
    { choices: [] },
  ];
  for (const body of bodies) {
    const { fetch } = fakeFetch(() => json(200, body));
    const provider = createOpenRouter({ apiKey: 'k', fetch });
    await assert.rejects(provider.complete({ model: 'm', messages }), ModelError, JSON.stringify(body));
  }
});

test('a timeout is a model error', async () => {
  const fetch = (url, init) => new Promise((_, reject) => init.signal.addEventListener('abort', () => reject(init.signal.reason)));
  const provider = createOpenRouter({ apiKey: 'k', fetch });
  await assert.rejects(provider.complete({ model: 'm', messages, signal: deadline(20).signal }), ModelError);
});

test('a model error never carries the key', async () => {
  const { fetch } = fakeFetch(() => json(401, { error: { message: 'bad key sk-secret' } }));
  const provider = createOpenRouter({ apiKey: 'sk-secret', fetch });
  await assert.rejects(provider.complete({ model: 'm', messages }), (e) => !String(e.message).includes('sk-secret'));
});
