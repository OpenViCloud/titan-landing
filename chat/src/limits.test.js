import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createDailyLimit } from './limits.js';

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
