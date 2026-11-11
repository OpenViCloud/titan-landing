// The one place that knows the model provider. Another provider means another object with the same complete().
// Order of the free models: titan-ops features/public-site/design.md#chat-assistant.

export const DEFAULT_MODELS = [
  'nvidia/nemotron-3-ultra-550b-a55b:free',
  'nvidia/nemotron-3.5-super-vl:free',
  'google/gemma-4-31b-it:free',
];

const URL = 'https://openrouter.ai/api/v1/chat/completions';
const MAX_TOKENS = 1200;

// status is the HTTP status, or 0 when no response came back (timeout, network).
export class ModelError extends Error {
  constructor(message, status) {
    super(message);
    this.name = 'ModelError';
    this.status = status;
  }
}

export function createOpenRouter({ apiKey, fetch = globalThis.fetch }) {
  return {
    async complete({ model, messages, signal }) {
      let response;
      try {
        response = await fetch(URL, {
          method: 'POST',
          headers: { Authorization: `Bearer ${apiKey}`, 'Content-Type': 'application/json', 'X-Title': 'OpenViCloud assistant' },
          body: JSON.stringify({
            model,
            messages,
            stream: false,
            max_tokens: MAX_TOKENS,
            // A reasoning model otherwise spends max_tokens thinking and answers nothing.
            reasoning: { effort: 'low', exclude: true },
          }),
          signal,
        });
      } catch (error) {
        throw new ModelError(error?.name === 'TimeoutError' || error?.name === 'AbortError' ? 'timeout' : 'network error', 0);
      }
      // The provider's error text is not passed on: it can quote the request.
      if (response.status !== 200) throw new ModelError(`status ${response.status}`, response.status);
      let body;
      try {
        body = await response.json();
      } catch {
        throw new ModelError('body is not JSON', 200);
      }
      if (body?.error) throw new ModelError(`error in a 200 (${body.error.code ?? 'no code'})`, Number(body.error.code) || 200);
      const content = body?.choices?.[0]?.message?.content;
      if (typeof content !== 'string' || content.trim() === '') throw new ModelError('empty answer', 200);
      return content;
    },
  };
}
