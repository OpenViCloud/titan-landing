// POST /api/chat and GET /healthz. Same origin as the site, so the browser talks to no third host
// (titan-ops features/public-site/design.md#chat-assistant).

import http from 'node:http';
import { pathToFileURL } from 'node:url';
import pg from 'pg';
import { parseChatRequest } from './request.js';
import { createTurn } from './turn.js';
import { createOpenRouter, DEFAULT_MODELS } from './models.js';
import { createDailyLimit, createSharedLimit, openKvLimit } from './limits.js';
import { createPrices } from './prices.js';
import { createStore } from './store.js';
import { loadKnowledge } from './knowledge.js';

const MAX_BODY_BYTES = 32 * 1024;
// The account has 50 free answers a day, so one address may not take them all (titan-ops features/public-site/design.md#chat-assistant).
const ANSWERS_PER_ADDRESS_PER_DAY = 10;
const PURGE_EVERY_MS = 24 * 60 * 60 * 1000;
const OPEN_LIMIT_AGAIN_MS = 30_000;

// Behind Cloudflare the connection comes from the tunnel, and Cloudflare names the visitor in this header.
export function visitorAddress(req) {
  const header = req.headers['cf-connecting-ip'];
  if (typeof header === 'string' && header.trim() !== '') return header.trim();
  return req.socket.remoteAddress ?? 'unknown';
}

function send(res, status, body) {
  res.writeHead(status, { 'content-type': 'application/json; charset=utf-8', 'cache-control': 'no-store' });
  res.end(JSON.stringify(body));
}

function readBody(req) {
  return new Promise((resolve, reject) => {
    const chunks = [];
    let size = 0;
    // Past the cap the rest is read and dropped, so the client still gets its 413 instead of a cut connection.
    req.on('data', (chunk) => {
      size += chunk.length;
      if (size <= MAX_BODY_BYTES) chunks.push(chunk);
    });
    req.on('end', () => {
      if (size > MAX_BODY_BYTES) reject(Object.assign(new Error('body too large'), { tooLarge: true }));
      else resolve(Buffer.concat(chunks).toString('utf8'));
    });
    req.on('error', reject);
  });
}

export function createServer({ turn, log }) {
  return http.createServer(async (req, res) => {
    const path = new URL(req.url, 'http://x').pathname;
    if (path === '/healthz') return send(res, 200, { status: 'ok' });
    if (path !== '/api/chat') return send(res, 404, { error: 'not found' });
    if (req.method !== 'POST') return send(res, 405, { error: 'method not allowed' });

    let raw;
    try {
      raw = await readBody(req);
    } catch (error) {
      log({ event: 'request', status: error.tooLarge ? 413 : 400 });
      return send(res, error.tooLarge ? 413 : 400, { error: 'bad body' });
    }
    const parsed = parseChatRequest(raw);
    if (!parsed.ok) {
      log({ event: 'request', status: 400, reason: parsed.reason });
      return send(res, 400, { error: parsed.reason });
    }
    try {
      const result = await turn.answer({ request: parsed.value, address: visitorAddress(req) });
      log({ event: 'request', status: 200, kind: result.kind });
      return send(res, 200, result);
    } catch (error) {
      log({ event: 'request', status: 500, reason: error?.name ?? 'error' });
      return send(res, 500, { kind: 'unavailable', error: 'internal error' });
    }
  });
}

async function main() {
  const log = (entry) => process.stdout.write(`${JSON.stringify({ time: new Date().toISOString(), ...entry })}\n`);
  const env = process.env;
  for (const name of ['OPENROUTER_API_KEY', 'API_BASE_URL']) {
    if (!env[name]) throw new Error(`${name} is not set`);
  }
  const root = new URL('..', import.meta.url).pathname;
  const knowledge = loadKnowledge({
    docsDir: env.DOCS_DIR ?? `${root}knowledge/docs`,
    readmesDir: `${root}knowledge/readmes`,
    personaPath: `${root}persona.md`,
  });
  // Short timeouts: a database host that never replies must fail fast, not after the system's TCP timeout.
  const pool = env.DATABASE_URL
    ? new pg.Pool({ connectionString: env.DATABASE_URL, max: 4, connectionTimeoutMillis: 3_000, query_timeout: 5_000, statement_timeout: 5_000 })
    : null;
  pool?.on('error', (error) => log({ event: 'database error', reason: error.code ?? error.name }));
  const store = createStore({ pool });
  const purge = async () => {
    try {
      log({ event: 'purge', removed: await store.purge() });
    } catch (error) {
      log({ event: 'purge failed', reason: error.code ?? error.name });
    }
  };

  // With NATS_URL every pod counts in one bucket; until it opens, or while it fails, each pod counts on its own.
  const local = createDailyLimit({ perDay: ANSWERS_PER_ADDRESS_PER_DAY });
  let kvLimit = null;
  const openLimit = async () => {
    try {
      kvLimit = await openKvLimit({ servers: env.NATS_URL, perDay: ANSWERS_PER_ADDRESS_PER_DAY });
      log({ event: 'limit store open' });
    } catch (error) {
      log({ event: 'limit store open failed', reason: error.code ?? error.name });
      setTimeout(openLimit, OPEN_LIMIT_AGAIN_MS);
    }
  };
  const limit = env.NATS_URL
    ? createSharedLimit({
        shared: {
          take: async (address) => {
            if (!kvLimit) throw Object.assign(new Error('limit store not open'), { code: 'NOT_OPEN' });
            return kvLimit.take(address);
          },
        },
        local,
        log,
      })
    : local;

  const models = env.CHAT_MODELS ? env.CHAT_MODELS.split(',').map((m) => m.trim()).filter(Boolean) : DEFAULT_MODELS;
  const turn = createTurn({
    models,
    provider: createOpenRouter({ apiKey: env.OPENROUTER_API_KEY }),
    limit,
    knowledge,
    prices: createPrices({ apiBaseUrl: env.API_BASE_URL }),
    store,
    log,
  });
  const port = Number(env.PORT ?? 8080);
  createServer({ turn, log }).listen(port, () => log({ event: 'listening', port, models }));

  if (env.NATS_URL) openLimit();

  // After listen: a database that is down at start must not keep the assistant down (it answers, keeping nothing).
  try {
    await store.init();
  } catch (error) {
    log({ event: 'database init failed', reason: error.code ?? error.name });
  }
  await purge();
  setInterval(purge, PURGE_EVERY_MS);
}

if (import.meta.url === pathToFileURL(process.argv[1] ?? '').href) {
  main().catch((error) => {
    process.stderr.write(`${error.message}\n`);
    process.exit(1);
  });
}
