import { test } from 'node:test';
import assert from 'node:assert/strict';
import { copy } from '../i18n/landing.js';

// Walks both dictionaries together and lists every place where their shape differs: a missing key, an array of
// another length, a value of another type, or an empty string.
function shapeProblems(en, vi, path) {
  const problems = [];
  if (Array.isArray(en)) {
    if (!Array.isArray(vi)) return [`${path}: array in en, not in vi`];
    if (en.length !== vi.length) problems.push(`${path}: ${en.length} items in en, ${vi.length} in vi`);
    const length = Math.min(en.length, vi.length);
    for (let index = 0; index < length; index += 1) problems.push(...shapeProblems(en[index], vi[index], `${path}[${index}]`));
    return problems;
  }
  if (en !== null && typeof en === 'object') {
    if (vi === null || typeof vi !== 'object' || Array.isArray(vi)) return [`${path}: object in en, not in vi`];
    const keys = new Set([...Object.keys(en), ...Object.keys(vi)]);
    for (const key of keys) {
      if (!(key in en)) problems.push(`${path}.${key}: only in vi`);
      else if (!(key in vi)) problems.push(`${path}.${key}: only in en`);
      else problems.push(...shapeProblems(en[key], vi[key], `${path}.${key}`));
    }
    return problems;
  }
  if (typeof en !== typeof vi) return [`${path}: ${typeof en} in en, ${typeof vi} in vi`];
  if (typeof en === 'string' && (en.trim() === '' || vi.trim() === '')) return [`${path}: empty string`];
  return problems;
}

test('the comparison finds a planted difference (the check can fail)', () => {
  const problems = shapeProblems({ a: 'x', list: ['1', '2'] }, { a: '', list: ['1'], b: 'y' }, 'copy');
  assert.deepEqual(problems.sort(), ['copy.a: empty string', 'copy.b: only in vi', 'copy.list: 2 items in en, 1 in vi'].sort());
});

test('the landing has the same keys, lists and value types in English and Vietnamese', () => {
  assert.ok(Object.keys(copy.en).length > 20, 'the dictionary must not be empty');
  assert.deepEqual(shapeProblems(copy.en, copy.vi, 'copy'), []);
});

test('each language says its own lang and links into its own pages', () => {
  assert.equal(copy.en.lang, 'en');
  assert.equal(copy.vi.lang, 'vi');
  assert.equal(copy.en.home, '/');
  assert.equal(copy.vi.home, '/vi/');
  for (const step of copy.vi.steps) assert.ok(step.href.startsWith('/vi/docs/'), step.href);
  for (const step of copy.en.steps) assert.ok(step.href.startsWith('/docs/'), step.href);
});

test('the switch on each page points at the other language', () => {
  assert.equal(copy.en.switchTo.lang, 'vi');
  assert.equal(copy.en.switchTo.href, '/vi/');
  assert.equal(copy.vi.switchTo.lang, 'en');
  assert.equal(copy.vi.switchTo.href, '/');
});
