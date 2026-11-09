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

interface SessionCart {
  lines: SessionCartLine[];
  version: number;
}

const cartBySessionId = new Map<string, SessionCart>();

export function getCartDC(sessionId: string): CartDC {
  const { lines, version } = cartBySessionId.get(sessionId) ?? {
    lines: [],
    version: 0,
  };

  const items: CartItemDC[] = [];
  for (let index = 0; index < lines.length; index++) {
    const line = lines[index]!;
    const product = allProducts.find((p) => p.id === line.productId);
    if (!product) {
      continue;
    }
    items.push(mapProductToCartItem(product, line.quantity, index));
  }

  return { items, promo: cartPromoForLineCount(lines.length), version };
}

export function removeCartItem(
  sessionId: string,
  productId: number,
): { ok: true } | { ok: false; reason: 'not_found' } {
  const prev = cartBySessionId.get(sessionId);
  if (!prev?.lines.some((line) => line.productId === productId)) {
    return { ok: false, reason: 'not_found' };
  }

  const next = prev.lines.filter((line) => line.productId !== productId);
  cartBySessionId.set(sessionId, { lines: next, version: prev.version + 1 });
  return { ok: true };
}

export function replaceCart(
  sessionId: string,
  lines: SessionCartLine[],
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

  const version = cartBySessionId.get(sessionId)?.version ?? 0;
  if (expectedVersion !== version) {
    return { ok: false, reason: 'conflict', version };
  }
  cartBySessionId.set(sessionId, { lines: normalized, version: version + 1 });
  return { ok: true };
}
