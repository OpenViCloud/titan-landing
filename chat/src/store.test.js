import { test } from 'node:test';
import assert from 'node:assert/strict';
import pg from 'pg';
import { createStore, SCHEMA, RETENTION_DAYS } from './store.js';

const turn = {
  conversationId: '7b0e3c1e-2f4a-4d6b-9c1d-0a1b2c3d4e5f',
  lang: 'vi',
  question: 'Giá VM?',
  answer: 'Small 634.05 VND mỗi giờ',
  model: 'a:free',
};

function fakePool() {
  const queries = [];
  return { queries, async query(text, values) { queries.push({ text, values }); return { rowCount: 0, rows: [] }; } };
}

test('the table has the seven fields of the design and no column for an address', () => {
  for (const column of ['id', 'conversation_id', 'role', 'content', 'lang', 'model', 'created_at']) {
    assert.match(SCHEMA, new RegExp(`\\b${column}\\b`), column);
  }
  assert.doesNotMatch(SCHEMA, /\b(ip|address|remote)\b/i);
});

test('messages are kept 90 days', () => {
  assert.equal(RETENTION_DAYS, 90);
});

test('a turn is one statement writing the question and the answer', async () => {
  const pool = fakePool();
  await createStore({ pool }).saveTurn(turn);
  assert.equal(pool.queries.length, 1);
  const { text, values } = pool.queries[0];
  assert.match(text, /insert into chat_messages/i);
  assert.deepEqual(values, [turn.conversationId, turn.lang, turn.question, turn.answer, turn.model]);
});

test('no database configured: saving does nothing and does not fail', async () => {
  const store = createStore({ pool: null });
  await store.init();
  await store.saveTurn(turn);
  assert.equal(await store.purge(), 0);
});

// Postgres itself: the CI job starts one (ci-chat.yml); without TEST_DATABASE_URL these are skipped.
const url = process.env.TEST_DATABASE_URL;

test('on Postgres: a turn is two rows of one conversation, user then assistant', { skip: !url && 'no TEST_DATABASE_URL' }, async () => {
  const pool = new pg.Pool({ connectionString: url });
  try {
    await pool.query('drop table if exists chat_messages');
    const store = createStore({ pool });
    await store.init();
    await store.saveTurn(turn);
    const { rows } = await pool.query('select conversation_id, role, content, lang, model from chat_messages order by role desc');
    assert.deepEqual(rows, [
      { conversation_id: turn.conversationId, role: 'user', content: turn.question, lang: 'vi', model: 'a:free' },
      { conversation_id: turn.conversationId, role: 'assistant', content: turn.answer, lang: 'vi', model: 'a:free' },
    ]);
  } finally {
    await pool.end();
  }
});

test('on Postgres: the purge removes a message of 91 days and keeps one of 89', { skip: !url && 'no TEST_DATABASE_URL' }, async () => {
  const pool = new pg.Pool({ connectionString: url });
  try {
    await pool.query('drop table if exists chat_messages');
    const store = createStore({ pool });
    await store.init();
    await pool.query(`insert into chat_messages (conversation_id, role, content, lang, created_at) values
      ($1, 'user', 'old', 'en', now() - interval '91 days'),
      ($1, 'user', 'recent', 'en', now() - interval '89 days')`, [turn.conversationId]);
    assert.equal(await store.purge(), 1);
    const { rows } = await pool.query('select content from chat_messages');
    assert.deepEqual(rows, [{ content: 'recent' }]);
  } finally {
    await pool.end();
  }
});

test('on Postgres: init twice keeps the rows', { skip: !url && 'no TEST_DATABASE_URL' }, async () => {
  const pool = new pg.Pool({ connectionString: url });
  try {
    await pool.query('drop table if exists chat_messages');
    const store = createStore({ pool });
    await store.init();
    await store.saveTurn(turn);
    await store.init();
    const { rows } = await pool.query('select count(*)::int as n from chat_messages');
    assert.equal(rows[0].n, 2);
  } finally {
    await pool.end();
  }
});
