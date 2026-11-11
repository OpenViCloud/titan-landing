// Conversations kept to improve the assistant: database chat, role chat, 90 days, no visitor address
// (titan-ops features/public-site/design.md#chat-assistant). The service owns its one table and creates it at start.
// With no database configured nothing is kept, and the assistant still answers.

export const RETENTION_DAYS = 90;

export const SCHEMA = `
create table if not exists chat_messages (
  id uuid primary key default gen_random_uuid(),
  conversation_id uuid not null,
  role text not null check (role in ('user', 'assistant')),
  content text not null,
  lang text not null check (lang in ('en', 'vi')),
  model text,
  created_at timestamptz not null default now()
);
create index if not exists chat_messages_created_at on chat_messages (created_at);
`;

export function createStore({ pool }) {
  if (pool === null) {
    return { async init() {}, async saveTurn() {}, async purge() { return 0; } };
  }
  return {
    async init() {
      await pool.query(SCHEMA);
    },
    // One statement, so a question is never kept without its answer.
    async saveTurn({ conversationId, lang, question, answer, model }) {
      await pool.query(
        `insert into chat_messages (conversation_id, role, content, lang, model, created_at)
         values ($1, 'user', $3, $2, $5, clock_timestamp()), ($1, 'assistant', $4, $2, $5, clock_timestamp())`,
        [conversationId, lang, question, answer, model],
      );
    },
    async purge() {
      const result = await pool.query(`delete from chat_messages where created_at < now() - make_interval(days => ${RETENTION_DAYS})`);
      return result.rowCount;
    },
  };
}
