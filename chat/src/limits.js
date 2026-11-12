// Answers per visitor address per UTC day (titan-ops features/public-site/design.md#chat-assistant). Every pod counts
// in one memory-only NATS KV bucket, so a second pod does not double the cap; a store that fails falls back to the
// pod's own count in memory. The key holds the address hex-encoded (reversible), the log never does, and the bucket
// drops a key 48 hours after its last write.

import { connect } from '@nats-io/transport-node';
import { jetstream, jetstreamManager, JetStreamApiCodes } from '@nats-io/jetstream';
import { Kvm } from '@nats-io/kv';

const BUCKET = 'chat-limits';
const KEEP_MS = 48 * 60 * 60 * 1000;
// Pods asking for one address at once: the loser waits a random few milliseconds and reads again; more turns than this
// is a store that misbehaves.
const MAX_TRIES = 20;
const RETRY_WAIT_MS = 20;
// A store that does not answer must not hold the turn: the pod's own count takes over after this.
const STORE_TIMEOUT_MS = 1_000;
// Room for many days of addresses; a full bucket refuses writes, and the pod's own count takes over.
const BUCKET_MAX_BYTES = 8 * 1024 * 1024;

// Only a write that lost to another pod is tried again; any other error goes to the caller.
function lostToAnotherPod(error) {
  return error?.code === JetStreamApiCodes.StreamWrongLastSequence || error?.code === JetStreamApiCodes.StreamWrongLastSequenceUnknown;
}

function utcDay(date) {
  return date.toISOString().slice(0, 10);
}

export function createDailyLimit({ perDay, now = () => new Date() }) {
  let day = utcDay(now());
  let counts = new Map();

  function rollOver() {
    const today = utcDay(now());
    if (today !== day) {
      day = today;
      counts = new Map();
    }
  }

  return {
    // true when the address may ask once more today, and counts that question.
    take(address) {
      rollOver();
      const used = counts.get(address) ?? 0;
      if (used >= perDay) return false;
      counts.set(address, used + 1);
      return true;
    },
    size() {
      return counts.size;
    },
  };
}

// One count per address per day in a KV whose writes are conditional: create only when the key is new, update only at
// the revision just read. A write that loses to another pod reads again.
export function createKvDailyLimit({ perDay, kv, now = () => new Date() }) {
  return {
    async take(address) {
      const key = `${utcDay(now())}.${Buffer.from(address).toString('hex')}`;
      for (let attempt = 0; attempt < MAX_TRIES; attempt++) {
        const entry = await kv.get(key);
        const used = entry && entry.operation === 'PUT' ? Number(entry.string()) : 0;
        if (used >= perDay) return false;
        try {
          if (entry) await kv.update(key, String(used + 1), entry.revision);
          else await kv.create(key, '1');
          return true;
        } catch (error) {
          if (!lostToAnotherPod(error)) throw error;
          // Another pod wrote first: read the count it left.
          await new Promise((resolve) => setTimeout(resolve, Math.random() * RETRY_WAIT_MS));
        }
      }
      throw Object.assign(new Error('limit: the count kept changing'), { code: 'CONTENDED' });
    },
  };
}

// A store that is gone or out of reach, as opposed to one that answered with a refusal (a full bucket, writes that
// kept losing). Once the connection is back, a bucket lost in a NATS restart has no responders: the client wraps that
// in a RequestError on a read and a JetStreamNotEnabled on a write, so the error and its causes are read.
const LOST = new Set(['NoResponders', 'TimeoutError', 'ConnectionError', 'ClosedConnectionError', 'JetStreamNotEnabled',
  'StreamNotFoundError']);
export function storeLost(error) {
  for (let e = error, depth = 0; e && depth < 5; e = e.cause, depth++) {
    if (LOST.has(e.name)) return true;
    if (e.name === 'JetStreamApiError' && e.code === JetStreamApiCodes.StreamNotFound) return true;
  }
  return false;
}

// The shared store, kept open: opened at start without waiting, dropped and closed when a take finds it lost (a NATS
// restart loses the memory-only bucket while the connection comes back), and opened again at most once per againMs.
// Opening creates the bucket when it is gone.
export function createReopeningLimit({ open, log, againMs = 30_000, now = Date.now }) {
  let store = null;
  let opening = null;
  let lastTry = -Infinity;
  function tryOpen() {
    if (store || opening || now() - lastTry < againMs) return;
    lastTry = now();
    // Set before open runs, so an open that throws at once still clears it.
    opening = Promise.resolve()
      .then(open)
      .then((opened) => {
        store = opened;
        log({ event: 'limit store open' });
      })
      .catch((error) => log({ event: 'limit store open failed', reason: error.code ?? error.name }))
      .finally(() => {
        opening = null;
      });
  }
  tryOpen();
  return {
    // Settles when the open under way, if any, has ended.
    ready: () => opening ?? Promise.resolve(),
    async take(address) {
      tryOpen();
      if (!store) throw Object.assign(new Error('limit store not open'), { code: 'NOT_OPEN' });
      const current = store;
      try {
        return await current.take(address);
      } catch (error) {
        if (store === current && storeLost(error)) {
          store = null;
          current.close().catch(() => {});
          tryOpen();
        }
        throw error;
      }
    },
  };
}

export function createSharedLimit({ shared, local, log }) {
  return {
    async take(address) {
      try {
        return await shared.take(address);
      } catch (error) {
        log({ event: 'limit store failed', reason: error.code ?? error.name });
        return local.take(address);
      }
    },
  };
}

// Connects to NATS and opens the bucket. The first pod creates it (memory storage, one value per key, 48 hours, 8 MiB);
// a bucket that exists keeps the settings it was made with.
export async function openKvLimit({ servers, perDay, now, bucket = BUCKET }) {
  // Reconnects without end, so a NATS that comes back is reached again (createReopeningLimit opens the bucket anew).
  const nc = await connect({ servers, timeout: 3_000, maxReconnectAttempts: -1 });
  let kv;
  try {
    kv = await new Kvm(jetstream(nc, { timeout: STORE_TIMEOUT_MS }))
      .create(bucket, { storage: 'memory', history: 1, ttl: KEEP_MS, max_bytes: BUCKET_MAX_BYTES });
  } catch (error) {
    // No JetStream, or no room for the bucket: the next try opens a new connection, so this one closes.
    await nc.close();
    throw error;
  }
  const limit = createKvDailyLimit({ perDay, kv, now });
  return {
    take: limit.take,
    status: async () => {
      const status = await kv.status();
      return { storage: status.storage, ttl: status.ttl, maxBytes: status.max_bytes };
    },
    close: () => nc.close(),
    // For tests: what a NATS restart does to a memory-only bucket.
    dropBucket: async () => (await jetstreamManager(nc)).streams.delete(`KV_${bucket}`),
  };
}
