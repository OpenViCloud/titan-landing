// One question and its answer: daily cap → prompt → free models in order → links dropped → saved.
// Rules: titan-ops features/public-site/design.md#chat-assistant.

import { buildMessages } from './prompt.js';
import { stripLinks } from './links.js';
import { deadline } from './deadline.js';

export const TEXTS = {
  vi: {
    limit: 'Trợ lý đã hết lượt trả lời hôm nay. Bạn quay lại vào ngày mai nhé.',
    unavailable: 'Trợ lý đang bận, chưa trả lời được. Bạn thử lại sau ít phút.',
  },
  en: {
    limit: "The assistant has used up today's answers. Please come back tomorrow.",
    unavailable: "The assistant is busy and can't answer right now. Please try again in a few minutes.",
  },
};

export function createTurn({ models, provider, limit, knowledge, prices, store, log, modelTimeoutMs = 45_000, turnTimeoutMs = 90_000 }) {
  // Each model once, in order: a 429 or 403 comes back at once and still counts against the account's day, so the
  // same model is not asked again.
  async function ask(messages, turnSignal) {
    for (const model of models) {
      if (turnSignal.aborted) break;
      const started = Date.now();
      const own = deadline(modelTimeoutMs);
      try {
        const raw = await provider.complete({ model, messages, signal: AbortSignal.any([turnSignal, own.signal]) });
        const answer = stripLinks(raw).trim();
        if (answer === '') {
          log({ event: 'model failed', model, status: 200, reason: 'only links', ms: Date.now() - started });
          continue;
        }
        log({ event: 'model answered', model, ms: Date.now() - started });
        return { answer, model };
      } catch (error) {
        log({ event: 'model failed', model, status: error?.status ?? 0, reason: error?.message ?? 'error', ms: Date.now() - started });
      } finally {
        own.clear();
      }
    }
    return null;
  }

  async function withDeadline(work, signal) {
    let onAbort;
    const stopped = new Promise((resolve) => {
      onAbort = () => resolve(null);
      signal.addEventListener('abort', onAbort, { once: true });
    });
    try {
      return await Promise.race([work, stopped]);
    } finally {
      signal.removeEventListener('abort', onAbort);
    }
  }

  return {
    async answer({ request, address }) {
      const { conversationId, lang, message, history } = request;
      if (!(await limit.take(address))) {
        log({ event: 'turn', kind: 'limit', lang });
        return { kind: 'limit', answer: TEXTS[lang].limit };
      }

      const turnLimit = deadline(turnTimeoutMs);
      const messages = buildMessages({ knowledge, prices: await prices.get(), lang, history, message });
      let result;
      try {
        result = await withDeadline(ask(messages, turnLimit.signal), turnLimit.signal);
      } finally {
        turnLimit.clear();
      }
      const kind = result === null ? 'unavailable' : 'answer';
      const answer = result === null ? TEXTS[lang].unavailable : result.answer;
      log({ event: 'turn', kind, lang, model: result?.model ?? null });

      // Not awaited: a database that does not answer must not hold the answer.
      const saveFailed = (error) => log({ event: 'save failed', reason: error?.code ?? error?.name ?? 'error' });
      try {
        store.saveTurn({ conversationId, lang, question: message, answer, model: result?.model ?? null }).catch(saveFailed);
      } catch (error) {
        saveFailed(error);
      }
      return { kind, answer };
    },
  };
}
