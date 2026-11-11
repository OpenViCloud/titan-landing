// The body of POST /api/chat. Anything off shape is refused before a model is called, so a bad request never spends
// the account's daily answers.

export const MAX_MESSAGE_CHARS = 500;
export const MAX_HISTORY = 6;
const LANGS = new Set(['en', 'vi']);
const ROLES = new Set(['user', 'assistant']);
const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
// History holds earlier answers too, which run longer than a question.
const MAX_HISTORY_CHARS = 4000;

function refuse(reason) {
  return { ok: false, reason };
}

export function parseChatRequest(raw) {
  let body;
  try {
    body = JSON.parse(raw);
  } catch {
    return refuse('body is not JSON');
  }
  if (body === null || typeof body !== 'object' || Array.isArray(body)) return refuse('body is not an object');

  const { conversationId, lang, message } = body;
  const history = body.history ?? [];
  if (typeof conversationId !== 'string' || !UUID.test(conversationId)) return refuse('conversationId is not a UUID');
  if (!LANGS.has(lang)) return refuse('lang is not en or vi');
  if (typeof message !== 'string' || message.trim() === '') return refuse('message is empty');
  // Characters, not UTF-16 units: an emoji counts once.
  if (Array.from(message).length > MAX_MESSAGE_CHARS) return refuse('message is too long');
  if (!Array.isArray(history) || history.length > MAX_HISTORY) return refuse('history is not a short list');
  for (const item of history) {
    if (item === null || typeof item !== 'object' || !ROLES.has(item.role)) return refuse('history has an unknown role');
    if (typeof item.content !== 'string' || Array.from(item.content).length > MAX_HISTORY_CHARS) return refuse('history has a bad message');
  }

  return {
    ok: true,
    value: {
      conversationId,
      lang,
      message,
      history: history.map(({ role, content }) => ({ role, content })),
    },
  };
}
