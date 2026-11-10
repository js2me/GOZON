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
): { ok: true } | { ok: false; reason: 'invalid_payload' } {
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

  cartBySessionId.set(sessionId, normalized);
  return { ok: true };
}
