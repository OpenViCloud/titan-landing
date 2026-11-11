import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createTurn, TEXTS } from './turn.js';
import { ModelError } from './models.js';
import { createDailyLimit } from './limits.js';

const request = {
  conversationId: '7b0e3c1e-2f4a-4d6b-9c1d-0a1b2c3d4e5f',
  lang: 'vi',
  message: 'OpenViCloud có những loại VM nào?',
  history: [],
};
const knowledge = { persona: 'P', docs: { en: 'E', vi: 'V' }, readmes: 'R' };

function setup({ answers = {}, perDay = 10, store, prices = async () => null, modelTimeoutMs = 1000, turnTimeoutMs = 2000 } = {}) {
  const calls = [];
  const saved = [];
  const logs = [];
  const provider = {
    async complete({ model, messages, signal }) {
      calls.push({ model, messages });
      const answer = answers[model];
      if (typeof answer === 'function') return answer(signal);
      if (answer instanceof Error) throw answer;
      if (answer === undefined) throw new ModelError('no answer', 0);
      return answer;
    },
  };
  const turn = createTurn({
    models: ['a:free', 'b:free', 'c:free'],
    provider,
    limit: createDailyLimit({ perDay }),
    knowledge,
    prices: { get: prices },
    store: store ?? { async saveTurn(t) { saved.push(t); } },
    log: (entry) => logs.push(entry),
    modelTimeoutMs,
    turnTimeoutMs,
  });
  return { turn, calls, saved, logs };
}

function hang(signal) {
  return new Promise((_, reject) => signal.addEventListener('abort', () => reject(new ModelError('timeout', 0))));
}

test('the first model answers and its links are dropped', async () => {
  const { turn, calls } = setup({ answers: { 'a:free': 'Xem [bảng giá](/vi/#pricing).' } });
  const result = await turn.answer({ request, address: '1.2.3.4' });
  assert.deepEqual(result, { kind: 'answer', answer: 'Xem bảng giá.' });
  assert.deepEqual(calls.map((c) => c.model), ['a:free']);
});

test('a failing model hands over to the next one, each model asked once', async () => {
  const { turn, calls } = setup({ answers: { 'a:free': new ModelError('429', 429), 'b:free': 'Có 4 kích thước.' } });
  assert.deepEqual(await turn.answer({ request, address: 'x' }), { kind: 'answer', answer: 'Có 4 kích thước.' });
  assert.deepEqual(calls.map((c) => c.model), ['a:free', 'b:free']);
});

test('an answer that is only links counts as empty', async () => {
  const { turn, calls } = setup({ answers: { 'a:free': 'https://github.com/OpenViCloud', 'b:free': 'Câu trả lời' } });
  assert.equal((await turn.answer({ request, address: 'x' })).answer, 'Câu trả lời');
  assert.equal(calls.length, 2);
});

test('every model failing gives the busy text in the visitor’s language', async () => {
  const { turn, calls } = setup();
  assert.deepEqual(await turn.answer({ request, address: 'x' }), { kind: 'unavailable', answer: TEXTS.vi.unavailable });
  assert.equal(calls.length, 3);
  const en = await turn.answer({ request: { ...request, lang: 'en' }, address: 'y' });
  assert.equal(en.answer, TEXTS.en.unavailable);
});

test('a model that hangs is cut at its own time, and the next one answers', async () => {
  const { turn } = setup({ answers: { 'a:free': hang, 'b:free': 'ok' }, modelTimeoutMs: 30 });
  assert.equal((await turn.answer({ request, address: 'x' })).answer, 'ok');
});

test('the whole turn stops at its time limit with the busy text', async () => {
  const { turn, calls } = setup({ answers: { 'a:free': hang, 'b:free': hang, 'c:free': hang }, modelTimeoutMs: 1000, turnTimeoutMs: 50 });
  const started = Date.now();
  const result = await turn.answer({ request, address: 'x' });
  assert.equal(result.kind, 'unavailable');
  assert.ok(Date.now() - started < 500);
  assert.equal(calls.length, 1);
});

test('an address over its daily cap gets the cap text, no model is asked and nothing is saved', async () => {
  const { turn, calls, saved } = setup({ answers: { 'a:free': 'ok' }, perDay: 1 });
  await turn.answer({ request, address: 'x' });
  assert.deepEqual(await turn.answer({ request, address: 'x' }), { kind: 'limit', answer: TEXTS.vi.limit });
  assert.equal(calls.length, 1);
  assert.equal(saved.length, 1);
});

test('a turn is saved once with the question, the answer and the model, and no address', async () => {
  const { turn, saved } = setup({ answers: { 'a:free': new ModelError('x', 403), 'b:free': 'Trả lời' } });
  await turn.answer({ request, address: '9.9.9.9' });
  assert.deepEqual(saved, [{
    conversationId: request.conversationId,
    lang: 'vi',
    question: request.message,
    answer: 'Trả lời',
    model: 'b:free',
  }]);
  assert.ok(!JSON.stringify(saved).includes('9.9.9.9'));
});

test('a busy turn is saved with no model', async () => {
  const { turn, saved } = setup();
  await turn.answer({ request, address: 'x' });
  assert.equal(saved[0].model, null);
  assert.equal(saved[0].answer, TEXTS.vi.unavailable);
});

test('a database that does not answer does not hold the answer', async () => {
  const { turn } = setup({ answers: { 'a:free': 'ok' }, store: { saveTurn: () => new Promise(() => {}) } });
  const started = Date.now();
  assert.deepEqual(await turn.answer({ request, address: 'x' }), { kind: 'answer', answer: 'ok' });
  assert.ok(Date.now() - started < 200);
});

test('a database that fails does not stop the answer', async () => {
  const { turn } = setup({ answers: { 'a:free': 'ok' }, store: { async saveTurn() { throw new Error('connection refused'); } } });
  assert.deepEqual(await turn.answer({ request, address: 'x' }), { kind: 'answer', answer: 'ok' });
});

test('the model gets the prices of this moment and the visitor’s history', async () => {
  const history = [{ role: 'user', content: 'trước' }, { role: 'assistant', content: 'đáp' }];
  const prices = async () => ({ vm: [{ id: 's', name: 'Small', vcpu: 1, memoryMb: 2048, pricePerHour: 634.05 }], volume: [] });
  const { turn, calls } = setup({ answers: { 'a:free': 'ok' }, prices });
  await turn.answer({ request: { ...request, history }, address: 'x' });
  const { messages } = calls[0];
  assert.ok(messages[0].content.includes('634.05'));
  assert.deepEqual(messages.slice(1), [...history, { role: 'user', content: request.message }]);
});

test('the log never holds the question, the answer or the address', async () => {
  const { turn, logs } = setup({ answers: { 'a:free': new ModelError('429', 429), 'b:free': 'BÍ MẬT câu trả lời' } });
  await turn.answer({ request: { ...request, message: 'BÍ MẬT câu hỏi' }, address: '5.6.7.8' });
  const text = JSON.stringify(logs);
  assert.ok(logs.length > 0);
  for (const secret of ['BÍ MẬT', '5.6.7.8']) assert.ok(!text.includes(secret), secret);
});

test('the cap text and the busy text, in both languages', () => {
  assert.equal(TEXTS.vi.limit, 'Trợ lý đã hết lượt trả lời hôm nay. Bạn quay lại vào ngày mai nhé.');
  assert.equal(TEXTS.en.limit, "The assistant has used up today's answers. Please come back tomorrow.");
  assert.equal(TEXTS.vi.unavailable, 'Trợ lý đang bận, chưa trả lời được. Bạn thử lại sau ít phút.');
  assert.equal(TEXTS.en.unavailable, "The assistant is busy and can't answer right now. Please try again in a few minutes.");
});
