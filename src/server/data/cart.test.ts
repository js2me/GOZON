// @vitest-environment node
import { expect, it } from 'vitest';
import { getCartDC, removeCartItem, replaceCart } from './cart';
import { allProducts } from './products';

it('rejects a cart snapshot based on an outdated session version', () => {
  const sessionId = crypto.randomUUID();
  const productId = allProducts[0]!.id;
  expect(replaceCart(sessionId, [{ productId, quantity: 1 }], 0)).toEqual({
    ok: true,
  });
  expect(replaceCart(sessionId, [{ productId, quantity: 2 }], 1)).toEqual({
    ok: true,
  });
  expect(replaceCart(sessionId, [{ productId, quantity: 1 }], 0)).toEqual({
    ok: false,
    reason: 'conflict',
    version: 2,
  });
  expect(getCartDC(sessionId).items[0]?.quantity.current).toBe(2);
  expect(getCartDC(sessionId).version).toBe(2);
});

it('rejects invalid versions', () => {
  expect(replaceCart(crypto.randomUUID(), [], null)).toEqual({
    ok: false,
    reason: 'invalid_payload',
  });
});

it('does not remove an item after a newer cart write', () => {
  const sessionId = crypto.randomUUID();
  const productId = allProducts[0]!.id;
  replaceCart(sessionId, [{ productId, quantity: 1 }], 0);
  replaceCart(sessionId, [{ productId, quantity: 2 }], 1);

  expect(removeCartItem(sessionId, productId, 1)).toEqual({
    ok: false,
    reason: 'conflict',
    version: 2,
  });
  expect(getCartDC(sessionId).items[0]?.quantity.current).toBe(2);
  expect(removeCartItem(sessionId, productId, 2)).toEqual({ ok: true });
});
