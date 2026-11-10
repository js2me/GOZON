import type { FavoritesDC } from '../../shared/api/api';
import { getProductById } from './products';

const favoriteProductIdsBySessionId = new Map<string, Set<number>>();

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

export function toggleFavorite(
  sessionId: string,
  productId: number,
): { ok: true } | { ok: false; reason: 'not_found' } {
  if (!Number.isInteger(productId) || !getProductById(productId)) {
    return { ok: false, reason: 'not_found' };
  }
  const productIds = favoriteProductIdsBySessionId.get(sessionId) ?? new Set();
  if (productIds.has(productId)) productIds.delete(productId);
  else productIds.add(productId);
  favoriteProductIdsBySessionId.set(sessionId, productIds);
  return { ok: true };
}

export function replaceFavorites(
  sessionId: string,
  productIds: number[],
): { ok: true } | { ok: false; reason: 'invalid_payload' } {
  const normalized = normalizeProductIds(productIds);
  if (!normalized) {
    return { ok: false, reason: 'invalid_payload' };
  }

  favoriteProductIdsBySessionId.set(sessionId, new Set(normalized));
  return { ok: true };
}
