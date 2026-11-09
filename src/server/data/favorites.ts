import type { FavoritesDC } from '../../shared/api/api';
import { getProductById } from './products';

const favoritesBySessionId = new Map<
  string,
  { productIds: Set<number>; version: number }
>();

function normalizeProductIds(productIds: number[]): number[] | null {
  const nextIds: number[] = [];
  const seen = new Set<number>();

  for (const productId of productIds) {
    if (!Number.isInteger(productId)) {
      return null;
    }
    if (!getProductById(productId)) {
      return null;
    }
    if (seen.has(productId)) {
      continue;
    }
    seen.add(productId);
    nextIds.push(productId);
  }

  return nextIds;
}

export function getFavoritesDC(sessionId: string): FavoritesDC {
  const stored = favoritesBySessionId.get(sessionId);
  return {
    productIds: Array.from(stored?.productIds ?? []),
    version: stored?.version ?? 0,
  };
}

export function replaceFavorites(
  sessionId: string,
  productIds: number[],
  expectedVersion: unknown,
):
  | { ok: true }
  | { ok: false; reason: 'invalid_payload' }
  | { ok: false; reason: 'conflict'; version: number } {
  if (
    typeof expectedVersion !== 'number' ||
    !Number.isSafeInteger(expectedVersion) ||
    expectedVersion < 0
  ) {
    return { ok: false, reason: 'invalid_payload' };
  }
  const normalized = normalizeProductIds(productIds);
  if (!normalized) {
    return { ok: false, reason: 'invalid_payload' };
  }

  const version = favoritesBySessionId.get(sessionId)?.version ?? 0;
  if (expectedVersion !== version) {
    return { ok: false, reason: 'conflict', version };
  }

  favoritesBySessionId.set(sessionId, {
    productIds: new Set(normalized),
    version: version + 1,
  });
  return { ok: true };
}
