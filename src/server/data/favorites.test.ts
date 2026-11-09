// @vitest-environment node
import { expect, it } from 'vitest';
import { getFavoritesDC, replaceFavorites } from './favorites';
import { allProducts } from './products';

it('ignores an earlier favorites write after a newer one', () => {
  const sessionId = crypto.randomUUID();
  const first = allProducts[0]!.id;
  const second = allProducts[1]!.id;
  expect(
    replaceFavorites(sessionId, [first], { clientId: 'a', sequence: 1 }),
  ).toEqual({ ok: true });
  expect(
    replaceFavorites(sessionId, [second], { clientId: 'a', sequence: 2 }),
  ).toEqual({ ok: true });
  expect(
    replaceFavorites(sessionId, [first], { clientId: 'a', sequence: 1 }),
  ).toEqual({ ok: true });
  expect(getFavoritesDC(sessionId).productIds).toEqual([second]);
});
