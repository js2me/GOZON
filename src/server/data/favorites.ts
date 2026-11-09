import type { FavoritesDC } from '../../shared/api/api';
import { getProductById } from './products';
import { createWriteOrder, type WriteSync } from './write-order';

const favoriteProductIdsBySessionId = new Map<string, Set<number>>();
const checkWriteOrder = createWriteOrder();

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
  const productIds = Array.from(
    favoriteProductIdsBySessionId.get(sessionId) ?? [],
  );
  return { productIds };
}

export function replaceFavorites(
  sessionId: string,
  productIds: number[],
  sync?: WriteSync,
): { ok: true } | { ok: false; reason: 'invalid_payload' | 'sync_capacity' } {
  const normalized = normalizeProductIds(productIds);
  if (!normalized) {
    return { ok: false, reason: 'invalid_payload' };
  }

  const order = checkWriteOrder(sessionId, sync);
  if (order === 'invalid') return { ok: false, reason: 'invalid_payload' };
  if (order === 'full') return { ok: false, reason: 'sync_capacity' };
  if (order === 'stale') return { ok: true };

  favoriteProductIdsBySessionId.set(sessionId, new Set(normalized));
  return { ok: true };
}
