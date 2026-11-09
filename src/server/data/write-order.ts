export interface WriteSync {
  clientId?: unknown;
  sequence?: unknown;
}

export type WriteOrderResult = 'accept' | 'stale' | 'invalid' | 'full';

/** Tracks only recent in-flight client generations; old browser writes time out after 10 seconds. */
export function createWriteOrder(maxEntries = 10_000, ttlMs = 5 * 60_000) {
  const lastByClient = new Map<
    string,
    { sequence: number; expiresAt: number }
  >();

  return (sessionId: string, sync?: WriteSync): WriteOrderResult => {
    if (sync === undefined) return 'accept';
    const { clientId, sequence } = sync;
    if (
      typeof clientId !== 'string' ||
      clientId.length === 0 ||
      clientId.length > 100 ||
      typeof sequence !== 'number' ||
      !Number.isSafeInteger(sequence) ||
      sequence < 1
    ) {
      return 'invalid';
    }

    const now = Date.now();
    const key = JSON.stringify([sessionId, clientId]);
    const last = lastByClient.get(key);
    if (last && last.expiresAt > now) {
      if (sequence <= last.sequence) return 'stale';
    } else {
      lastByClient.delete(key);
      if (lastByClient.size >= maxEntries) {
        for (const [clientKey, entry] of lastByClient) {
          if (entry.expiresAt <= now) lastByClient.delete(clientKey);
        }
        if (lastByClient.size >= maxEntries) return 'full';
      }
    }

    lastByClient.set(key, { sequence, expiresAt: now + ttlMs });
    return 'accept';
  };
}
