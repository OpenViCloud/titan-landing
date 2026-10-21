import { test } from 'node:test';
import assert from 'node:assert/strict';
import { counterpartPath, decideTarget, readSavedLang, saveLang, countryFromTrace, langOfPath } from './language.js';

function memoryStorage(initial = {}) {
  const data = new Map(Object.entries(initial));
  return {
    getItem: (key) => (data.has(key) ? data.get(key) : null),
    setItem: (key, value) => { data.set(key, value); },
    removeItem: (key) => { data.delete(key); },
  };
}

const throwingStorage = {
  getItem: () => { throw new Error('denied'); },
  setItem: () => { throw new Error('denied'); },
  removeItem: () => { throw new Error('denied'); },
};

test('the language of a path: /vi/ and below is Vietnamese, the rest English', () => {
  assert.equal(langOfPath('/'), 'en');
  assert.equal(langOfPath('/docs/guides/vm/'), 'en');
  assert.equal(langOfPath('/vi/'), 'vi');
  assert.equal(langOfPath('/vi/docs/guides/vm/'), 'vi');
  assert.equal(langOfPath('/video/'), 'en');
});

test('the counterpart of a page keeps the slug', () => {
  assert.equal(counterpartPath('/', 'vi'), '/vi/');
  assert.equal(counterpartPath('/docs/', 'vi'), '/vi/docs/');
  assert.equal(counterpartPath('/docs/guides/vm/', 'vi'), '/vi/docs/guides/vm/');
  assert.equal(counterpartPath('/vi/', 'en'), '/');
  assert.equal(counterpartPath('/vi/docs/concepts/zone/', 'en'), '/docs/concepts/zone/');
});

test('only the landing and the docs have a counterpart', () => {
  assert.equal(counterpartPath('/404.html', 'vi'), null);
  assert.equal(counterpartPath('/config.json', 'vi'), null);
  assert.equal(counterpartPath('/vi/unknown/', 'en'), null);
});

test('the saved language is read back, and only en or vi count', () => {
  assert.equal(readSavedLang(memoryStorage({ 'ovc-lang': 'vi' })), 'vi');
  assert.equal(readSavedLang(memoryStorage({ 'ovc-lang': 'en' })), 'en');
  assert.equal(readSavedLang(memoryStorage({ 'ovc-lang': 'fr' })), null);
  assert.equal(readSavedLang(memoryStorage()), null);
});

test('blocked storage reads as nothing saved and saving does not throw', () => {
  assert.equal(readSavedLang(throwingStorage), null);
  assert.equal(readSavedLang(null), null);
  assert.doesNotThrow(() => saveLang(throwingStorage, 'vi'));
  assert.doesNotThrow(() => saveLang(null, 'vi'));
});

test('saving writes the key the next page reads', () => {
  const storage = memoryStorage();
  saveLang(storage, 'vi');
  assert.equal(readSavedLang(storage), 'vi');
});

test('the country is the loc line of the trace', () => {
  assert.equal(countryFromTrace('fl=1\nh=x\nip=1.2.3.4\nloc=VN\ncolo=SIN\n'), 'VN');
  assert.equal(countryFromTrace('loc=US'), 'US');
  assert.equal(countryFromTrace('<html>404</html>'), null);
  assert.equal(countryFromTrace(''), null);
  assert.equal(countryFromTrace(null), null);
});

// [saved, page language, country, expected target or null to stay]
const table = [
  [null, 'en', 'VN', 'vi'],
  [null, 'en', 'US', null],
  [null, 'en', null, null],
  [null, 'vi', 'US', null],
  [null, 'vi', null, null],
  ['en', 'en', 'VN', null],
  ['en', 'vi', 'VN', 'en'],
  ['vi', 'en', 'US', 'vi'],
  ['vi', 'vi', 'US', null],
];

for (const [saved, pageLang, country, expected] of table) {
  test(`saved=${saved} page=${pageLang} country=${country} goes to ${expected}`, () => {
    assert.equal(decideTarget({ saved, pageLang, country }), expected);
  });
}
