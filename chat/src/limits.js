// Answers per visitor address per UTC day (titan-ops features/public-site/design.md#chat-assistant). Every pod counts
// in one memory-only NATS KV bucket, so a second pod does not double the cap; a store that fails falls back to the
// pod's own count in memory. The key holds the address hex-encoded, the log never does, and the bucket drops a key
// after 48 hours.

import { connect } from '@nats-io/transport-node';
import { Kvm } from '@nats-io/kv';

const BUCKET = 'chat-limits';
const KEEP_MS = 48 * 60 * 60 * 1000;
// Pods asking for one address at once: the loser waits a random few milliseconds and reads again; more turns than this
// is a store that misbehaves.
const MAX_TRIES = 20;
const RETRY_WAIT_MS = 20;

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
        } catch {
          // Another pod wrote first: read the count it left.
          await new Promise((resolve) => setTimeout(resolve, Math.random() * RETRY_WAIT_MS));
        }
      }
      throw new Error('limit: the count kept changing');
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

// Connects to NATS and opens the bucket, creating it on first use: memory storage, one value per key, 48 hours.
export async function openKvLimit({ servers, perDay, now }) {
  // Reconnects without end: a NATS restart must not leave the pod on its own count for good.
  const nc = await connect({ servers, timeout: 3_000, maxReconnectAttempts: -1 });
  const kv = await new Kvm(nc).create(BUCKET, { storage: 'memory', history: 1, ttl: KEEP_MS });
  const limit = createKvDailyLimit({ perDay, kv, now });
  return {
    take: limit.take,
    status: async () => {
      const status = await kv.status();
      return { storage: status.storage, ttl: status.ttl };
    },
    close: () => nc.close(),
  };
}
