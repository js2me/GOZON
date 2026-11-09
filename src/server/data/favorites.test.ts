// @vitest-environment node
import { expect, it } from 'vitest';
import { getFavoritesDC, replaceFavorites } from './favorites';
import { allProducts } from './products';

it('rejects a favorites snapshot based on an outdated session version', () => {
  const sessionId = crypto.randomUUID();
  const first = allProducts[0]!.id;
  const second = allProducts[1]!.id;
  expect(replaceFavorites(sessionId, [first], 0)).toEqual({ ok: true });
  expect(replaceFavorites(sessionId, [second], 1)).toEqual({ ok: true });
  expect(replaceFavorites(sessionId, [first], 0)).toEqual({
    ok: false,
    reason: 'conflict',
    version: 2,
  });
  expect(getFavoritesDC(sessionId)).toEqual({
    productIds: [second],
    version: 2,
  });
});

it('rejects invalid versions', () => {
  expect(replaceFavorites(crypto.randomUUID(), [], null)).toEqual({
    ok: false,
    reason: 'invalid_payload',
  });
});
