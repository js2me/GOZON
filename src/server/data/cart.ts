import type { CartDC, CartItemDC } from '../../shared/api/api';
import {
  cartPromoForLineCount,
  mapProductToCartItem,
} from '../../shared/lib/cart-from-product';
import { allProducts } from './products';

interface SessionCartLine {
  productId: number;
  quantity: number;
}

const cartBySessionId = new Map<string, SessionCartLine[]>();
const lastSequenceByClient = new Map<string, number>();

export function getCartDC(sessionId: string): CartDC {
  const stored = cartBySessionId.get(sessionId) ?? [];
  const lines = stored.length > 0 ? stored : [];

  const items: CartItemDC[] = [];
  for (let index = 0; index < lines.length; index++) {
    const line = lines[index]!;
    const product = allProducts.find((p) => p.id === line.productId);
    if (!product) {
      continue;
    }
    items.push(mapProductToCartItem(product, line.quantity, index));
  }

  return { items, promo: cartPromoForLineCount(lines.length) };
}

export function removeCartItem(
  sessionId: string,
  productId: number,
): { ok: true } | { ok: false; reason: 'not_found' } {
  const prev = cartBySessionId.get(sessionId) ?? [];
  if (!prev.some((line) => line.productId === productId)) {
    return { ok: false, reason: 'not_found' };
  }

  const next = prev.filter((line) => line.productId !== productId);
  cartBySessionId.set(sessionId, next);
  return { ok: true };
}

export function replaceCart(
  sessionId: string,
  lines: SessionCartLine[],
  sync?: { clientId?: unknown; sequence?: unknown },
): { ok: true } | { ok: false; reason: 'invalid_payload' } {
  const clientId = sync?.clientId;
  const sequence = sync?.sequence;
  if (
    sync !== undefined &&
    (typeof clientId !== 'string' ||
      clientId.length === 0 ||
      clientId.length > 100 ||
      typeof sequence !== 'number' ||
      !Number.isSafeInteger(sequence) ||
      sequence < 1)
  ) {
    return { ok: false, reason: 'invalid_payload' };
  }
  const normalized: SessionCartLine[] = [];

  for (const line of lines) {
    if (!Number.isInteger(line.productId) || !Number.isInteger(line.quantity)) {
      return { ok: false, reason: 'invalid_payload' };
    }
    if (line.quantity <= 0) {
      continue;
    }
    const product = allProducts.find((item) => item.id === line.productId);
    if (!product) {
      return { ok: false, reason: 'invalid_payload' };
    }
    normalized.push({
      productId: line.productId,
      quantity: line.quantity,
    });
  }

  if (typeof clientId === 'string' && typeof sequence === 'number') {
    const key = JSON.stringify([sessionId, clientId]);
    if (sequence < (lastSequenceByClient.get(key) ?? 0)) {
      return { ok: true };
    }
    lastSequenceByClient.set(key, sequence);
  }
  cartBySessionId.set(sessionId, normalized);
  return { ok: true };
}
