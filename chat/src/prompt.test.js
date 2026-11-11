import { test } from 'node:test';
import assert from 'node:assert/strict';
import { buildMessages, pricesText } from './prompt.js';

const knowledge = {
  persona: 'PERSONA: be kind',
  docs: { en: 'EN DOCS: a VM runs', vi: 'VI DOCS: một VM chạy' },
  readmes: 'README of titan-cli',
};
const prices = {
  vm: [{ id: 's', name: 'Small', vcpu: 1, memoryMb: 2048, pricePerHour: 634.05 }],
  volume: [{ id: 'standard', name: 'Standard', pricePerGbPerHour: 1.369863 }],
};

test('the system message holds the persona, the docs of the asked language, the READMEs and the prices', () => {
  const [system] = buildMessages({ knowledge, prices, lang: 'vi', history: [], message: 'hỏi' });
  assert.equal(system.role, 'system');
  for (const part of ['PERSONA: be kind', 'VI DOCS', 'README of titan-cli', '634.05', '1.369863', 'Small']) {
    assert.ok(system.content.includes(part), part);
  }
  assert.ok(!system.content.includes('EN DOCS'));
});

test('English questions get the English docs', () => {
  const [system] = buildMessages({ knowledge, prices, lang: 'en', history: [], message: 'q' });
  assert.ok(system.content.includes('EN DOCS'));
  assert.ok(!system.content.includes('VI DOCS'));
});

test('the rules say: only from the documents, otherwise say you do not know; no links', () => {
  const [system] = buildMessages({ knowledge, prices, lang: 'en', history: [], message: 'q' });
  assert.match(system.content, /do not know/i);
  assert.match(system.content, /no links/i);
});

test('history comes after the system message and the question comes last', () => {
  const history = [{ role: 'user', content: 'a' }, { role: 'assistant', content: 'b' }];
  const messages = buildMessages({ knowledge, prices, lang: 'en', history, message: 'c' });
  assert.deepEqual(messages.slice(1), [...history, { role: 'user', content: 'c' }]);
});

test('without prices the prompt says prices are not available, and quotes no number', () => {
  const [system] = buildMessages({ knowledge, prices: null, lang: 'vi', history: [], message: 'q' });
  assert.match(system.content, /prices are not available/i);
  assert.ok(!system.content.includes('634.05'));
});

test('price lines keep every decimal the API sends', () => {
  const text = pricesText(prices);
  assert.match(text, /Small \(s\): 1 vCPU, 2 GB RAM, 634\.05 VND per hour/);
  assert.match(text, /Standard \(standard\): 1\.369863 VND per GB per hour/);
});
