// @vitest-environment node
import { expect, it } from 'vitest';
import { getCartDC, replaceCart } from './cart';
import { allProducts } from './products';

it('ignores a cart write that arrives after a newer write from the same client', () => {
  const sessionId = crypto.randomUUID();
  const productId = allProducts[0]!.id;
  const clientId = crypto.randomUUID();

  expect(
    replaceCart(sessionId, [{ productId, quantity: 3 }], {
      clientId,
      sequence: 2,
    }),
  ).toEqual({ ok: true });
  expect(
    replaceCart(sessionId, [{ productId, quantity: 2 }], {
      clientId,
      sequence: 1,
    }),
  ).toEqual({ ok: true });
  expect(getCartDC(sessionId).items[0]?.quantity.current).toBe(3);
});
