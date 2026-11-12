import { test } from 'node:test';
import assert from 'node:assert/strict';
import { CHAT_URL, MAX_MESSAGE_CHARS, MAX_HISTORY, MAX_HISTORY_CHARS, canSend, askAssistant, historyAfter, newConversationId } from './chat.js';
import { copy } from '../i18n/landing.js';
import { TEXTS } from '../../../chat/src/turn.js';
import * as service from '../../../chat/src/request.js';

const conversationId = '0b6f7a52-2c1e-4f7e-9f00-5c8a3d1e2b47';
const busy = copy.en.chat.busy;

function answering(status, body) {
  const calls = [];
  const fetch = async (url, init) => {
    calls.push({ url, init });
    return { status, json: async () => (typeof body === 'function' ? body() : body) };
  };
  return { fetch, calls };
}

test('the widget asks its own origin and no other host', () => {
  assert.equal(CHAT_URL, '/api/chat');
  assert.ok(CHAT_URL.startsWith('/') && !CHAT_URL.startsWith('//'));
});

test('a question is sent with the conversation, the page language and the history', async () => {
  const { fetch, calls } = answering(200, { kind: 'answer', answer: 'Small is 161.388 ₫/hour.' });
  const history = [{ role: 'user', content: 'Hi' }, { role: 'assistant', content: 'Hello' }];
  const reply = await askAssistant({ fetch, conversationId, lang: 'vi', message: 'Giá VM?', history, busy });
  assert.deepEqual(reply, { kind: 'answer', answer: 'Small is 161.388 ₫/hour.' });
  assert.equal(calls.length, 1);
  assert.equal(calls[0].url, '/api/chat');
  assert.equal(calls[0].init.method, 'POST');
  assert.equal(calls[0].init.headers['Content-Type'], 'application/json');
  assert.deepEqual(JSON.parse(calls[0].init.body), { conversationId, lang: 'vi', message: 'Giá VM?', history });
});

test('the cap text and the busy text of the service are shown as they come', async () => {
  for (const kind of ['limit', 'unavailable']) {
    const { fetch } = answering(200, { kind, answer: TEXTS.en[kind] });
    assert.deepEqual(await askAssistant({ fetch, conversationId, lang: 'en', message: 'Hi', history: [], busy }), { kind, answer: TEXTS.en[kind] });
  }
});

test('no answer from the service shows the busy text: network error, other status, bad JSON, unknown kind, empty answer', async () => {
  const cases = [
    async () => { throw new TypeError('fetch failed'); },
    answering(404, { message: 'not found' }).fetch,
    answering(500, { kind: 'answer', answer: 'x' }).fetch,
    answering(200, () => { throw new SyntaxError('bad json'); }).fetch,
    answering(200, { kind: 'joke', answer: 'x' }).fetch,
    answering(200, { kind: 'answer', answer: '' }).fetch,
    answering(200, { kind: 'answer' }).fetch,
    answering(200, null).fetch,
  ];
  for (const fetch of cases) {
    assert.deepEqual(await askAssistant({ fetch, conversationId, lang: 'en', message: 'Hi', history: [], busy }), { kind: 'unavailable', answer: busy });
  }
});

test('a service that does not answer in time shows the busy text and the request is cancelled', async () => {
  let aborted = false;
  const fetch = (url, init) => new Promise((resolve, reject) => {
    init.signal.addEventListener('abort', () => {
      aborted = true;
      reject(new DOMException('aborted', 'AbortError'));
    });
  });
  const reply = await askAssistant({ fetch, conversationId, lang: 'en', message: 'Hi', history: [], busy, timeoutMs: 20 });
  assert.deepEqual(reply, { kind: 'unavailable', answer: busy });
  assert.equal(aborted, true);
});

test('the busy text of the widget is the busy text of the service, in both languages', () => {
  assert.equal(copy.en.chat.busy, TEXTS.en.unavailable);
  assert.equal(copy.vi.chat.busy, TEXTS.vi.unavailable);
});

test('an empty question, only spaces, or more than 500 characters cannot be sent', () => {
  assert.equal(canSend(''), false);
  assert.equal(canSend('   \n '), false);
  assert.equal(canSend('Giá VM?'), true);
  assert.equal(canSend('a'.repeat(500)), true);
  assert.equal(canSend('a'.repeat(501)), false);
  // Characters, as the service counts them: 500 emoji are 1000 UTF-16 units.
  assert.equal(canSend('😀'.repeat(500)), true);
  assert.equal(canSend('😀'.repeat(501)), false);
});

test('a conversation id is a UUID the service accepts, with or without crypto.randomUUID', () => {
  // The pattern of chat/src/request.js, narrowed to version 4 and its variant.
  const uuid = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/;
  assert.equal(newConversationId({ randomUUID: () => conversationId }), conversationId);
  const withoutRandomUuid = { getRandomValues: (bytes) => globalThis.crypto.getRandomValues(bytes) };
  const first = newConversationId(withoutRandomUuid);
  assert.match(first, uuid);
  assert.notEqual(newConversationId(withoutRandomUuid), first);
});

test('the widget limits are the limits the service accepts', () => {
  assert.equal(MAX_MESSAGE_CHARS, service.MAX_MESSAGE_CHARS);
  assert.equal(MAX_HISTORY, service.MAX_HISTORY);
  assert.equal(MAX_HISTORY_CHARS, service.MAX_HISTORY_CHARS);
});

test('only an answered turn joins the history', () => {
  const answered = historyAfter([], 'Q', { kind: 'answer', answer: 'A' });
  assert.deepEqual(answered, [{ role: 'user', content: 'Q' }, { role: 'assistant', content: 'A' }]);
  assert.deepEqual(historyAfter(answered, 'Q2', { kind: 'limit', answer: TEXTS.en.limit }), answered);
  assert.deepEqual(historyAfter(answered, 'Q2', { kind: 'unavailable', answer: busy }), answered);
});

test('the history keeps the last 6 messages, each cut to 4000 characters', () => {
  let history = [];
  for (let turn = 1; turn <= 5; turn += 1) history = historyAfter(history, `Q${turn}`, { kind: 'answer', answer: `A${turn}` });
  assert.deepEqual(history.map((item) => item.content), ['Q3', 'A3', 'Q4', 'A4', 'Q5', 'A5']);

  const long = historyAfter([], 'Q', { kind: 'answer', answer: '😀'.repeat(4100) });
  assert.equal(Array.from(long[1].content).length, 4000);
});
