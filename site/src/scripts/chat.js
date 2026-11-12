// The chat box of the landing (titan-ops features/public-site/design.md#chat-assistant): one question at a time to the
// service on the site's own origin. Anything but an answer of the service shows the busy text, at the latest after
// TIMEOUT_MS. These functions are tested in node with a fake fetch; Landing.astro wires them to the page.

export const CHAT_URL = '/api/chat';
// The service ends a turn at 90 s with its busy text; the browser waits a little longer than that.
const TIMEOUT_MS = 100_000;
// The limits the service accepts (chat/src/request.js): a longer body is refused before any model. The site image
// is built from site/ alone, so they are copies; chat.test.js holds them equal.
export const MAX_MESSAGE_CHARS = 500;
export const MAX_HISTORY = 6;
export const MAX_HISTORY_CHARS = 4000;
const KINDS = new Set(['answer', 'limit', 'unavailable']);

// Characters, not UTF-16 units: an emoji counts once, as in the service.
function length(text) {
  return Array.from(text).length;
}

// One conversation per page load. randomUUID needs a secure context and a recent browser; the fallback builds the
// same version 4 UUID from random bytes.
export function newConversationId(crypto) {
  if (typeof crypto.randomUUID === 'function') return crypto.randomUUID();
  const bytes = crypto.getRandomValues(new Uint8Array(16));
  bytes[6] = (bytes[6] & 0x0f) | 0x40;
  bytes[8] = (bytes[8] & 0x3f) | 0x80;
  const hex = Array.from(bytes, (byte) => byte.toString(16).padStart(2, '0')).join('');
  return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-${hex.slice(12, 16)}-${hex.slice(16, 20)}-${hex.slice(20)}`;
}

export function canSend(text) {
  return text.trim() !== '' && length(text) <= MAX_MESSAGE_CHARS;
}

export async function askAssistant({ fetch, conversationId, lang, message, history, busy, timeoutMs = TIMEOUT_MS }) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const response = await fetch(CHAT_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
      body: JSON.stringify({ conversationId, lang, message, history }),
      signal: controller.signal,
    });
    if (response.status !== 200) return { kind: 'unavailable', answer: busy };
    const body = await response.json();
    if (body === null || typeof body !== 'object' || !KINDS.has(body.kind)) return { kind: 'unavailable', answer: busy };
    if (typeof body.answer !== 'string' || body.answer.trim() === '') return { kind: 'unavailable', answer: busy };
    return { kind: body.kind, answer: body.answer };
  } catch {
    return { kind: 'unavailable', answer: busy };
  } finally {
    clearTimeout(timer);
  }
}

function clip(text) {
  return length(text) <= MAX_HISTORY_CHARS ? text : Array.from(text).slice(0, MAX_HISTORY_CHARS).join('');
}

// The cap text and the busy text are not part of the conversation the model reads.
export function historyAfter(history, message, reply) {
  if (reply.kind !== 'answer') return history;
  const next = [...history, { role: 'user', content: clip(message) }, { role: 'assistant', content: clip(reply.answer) }];
  return next.slice(-MAX_HISTORY);
}
