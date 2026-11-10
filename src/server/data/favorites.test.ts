// @vitest-environment node
import { expect, it } from 'vitest';
import { getFavoritesDC, toggleFavorite } from './favorites';
import { allProducts } from './products';

it('toggles favorites independently for each session', () => {
  const sessionId = crypto.randomUUID();
  const productId = allProducts[0]!.id;
  expect(toggleFavorite(sessionId, productId)).toEqual({ ok: true });
  expect(getFavoritesDC(sessionId).productIds).toEqual([productId]);
  expect(getFavoritesDC(crypto.randomUUID()).productIds).toEqual([]);
  expect(toggleFavorite(sessionId, productId)).toEqual({ ok: true });
  expect(getFavoritesDC(sessionId).productIds).toEqual([]);
});

it('rejects nonexistent products', () => {
  expect(toggleFavorite(crypto.randomUUID(), -1)).toEqual({
    ok: false,
    reason: 'not_found',
  });
});
