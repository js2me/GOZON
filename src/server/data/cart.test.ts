// @vitest-environment node
import { expect, it } from 'vitest';
import { changeCartItem, getCartDC, removeCartItem } from './cart';
import { allProducts } from './products';

it('applies quantity changes to one session on the server', () => {
  const sessionId = crypto.randomUUID();
  const productId = allProducts[0]!.id;
  expect(changeCartItem(sessionId, productId, 1)).toEqual({ ok: true });
  expect(changeCartItem(sessionId, productId, 1)).toEqual({ ok: true });
  expect(getCartDC(sessionId).items[0]?.quantity.current).toBe(2);
  expect(getCartDC(crypto.randomUUID()).items).toEqual([]);
  expect(changeCartItem(sessionId, productId, -1)).toEqual({ ok: true });
  expect(changeCartItem(sessionId, productId, -1)).toEqual({ ok: true });
  expect(getCartDC(sessionId).items).toEqual([]);
});

it('rejects invalid changes and keeps the existing delete route', () => {
  const sessionId = crypto.randomUUID();
  const productId = allProducts[0]!.id;
  expect(changeCartItem(sessionId, productId, 2)).toEqual({
    ok: false,
    reason: 'invalid_payload',
  });
  expect(changeCartItem(sessionId, -1, 1)).toEqual({
    ok: false,
    reason: 'not_found',
  });
  changeCartItem(sessionId, productId, 1);
  expect(removeCartItem(sessionId, productId)).toEqual({ ok: true });
  expect(getCartDC(sessionId).items).toEqual([]);
});
