import { afterEach, expect, it, vi } from 'vitest';
import type { CartDC } from '../../../shared/api/api';
import type { Router } from '../../router';
import { CartStore } from './index';

const item: CartDC['items'][number] = {
  productId: 1,
  title: 'Товар',
  imageUrl: '',
  variant: '',
  price: { current: 100, original: 100, currency: '₽' },
  quantity: { current: 1, maxAvailable: 20 },
};
const cart = (items: CartDC['items'] = [item]): CartDC => ({
  items,
  promo: { saleDeadline: '', itemsPriceIncreasingCount: 0 },
});
const quantity = (value: number) =>
  Response.json(
    cart([{ ...item, quantity: { ...item.quantity, current: value } }]),
  );
const router = {
  routes: { product: { createUrl: () => '/products/1' } },
} as unknown as Router;

afterEach(() => {
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
});

it('sends rapid quantity changes in order and uses server responses', async () => {
  const first = Promise.withResolvers<Response>();
  const second = Promise.withResolvers<Response>();
  const fetch = vi
    .fn()
    .mockResolvedValueOnce(Response.json(cart()))
    .mockReturnValueOnce(first.promise)
    .mockReturnValueOnce(second.promise);
  vi.stubGlobal('fetch', fetch);
  const store = new CartStore(router);
  await store.load();

  store.increment(1);
  store.increment(1);
  expect(fetch).toHaveBeenCalledTimes(2);
  first.resolve(quantity(2));
  await vi.waitFor(() => expect(fetch).toHaveBeenCalledTimes(3));
  expect(store.items[0]?.quantity.current).toBe(2);
  expect(JSON.parse(fetch.mock.calls[2][1].body)).toEqual({ delta: 1 });
  second.resolve(quantity(3));
  await vi.waitFor(() => expect(store.isSyncing).toBe(false));
  expect(store.items[0]?.quantity.current).toBe(3);
});

it('waits for an initial cart load before applying a mutation', async () => {
  const initial = Promise.withResolvers<Response>();
  const fetch = vi
    .fn()
    .mockReturnValueOnce(initial.promise)
    .mockResolvedValueOnce(quantity(1));
  vi.stubGlobal('fetch', fetch);
  const store = new CartStore(router);
  const loading = store.load();
  const adding = store.addProduct(1);
  expect(fetch).toHaveBeenCalledTimes(1);
  initial.resolve(Response.json(cart([])));
  await Promise.all([loading, adding]);
  expect(fetch).toHaveBeenCalledTimes(2);
  expect(store.hasProduct(1)).toBe(true);
  expect(store.isAddingProduct(1)).toBe(false);
});

it('keeps the server state after a failed mutation and reloads on retry', async () => {
  const fetch = vi
    .fn()
    .mockResolvedValueOnce(Response.json(cart()))
    .mockRejectedValueOnce(new Error('offline'))
    .mockResolvedValueOnce(quantity(1));
  vi.stubGlobal('fetch', fetch);
  const store = new CartStore(router);
  await store.load();
  store.increment(1);
  await vi.waitFor(() => expect(store.isSyncing).toBe(false));
  expect(store.items[0]?.quantity.current).toBe(1);
  expect(store.loadError).toBe('Не удалось изменить корзину');
  await store.load();
  expect(store.loadError).toBeNull();
});

it('selects the next item after removing the selected item', async () => {
  const next = { ...item, productId: 2 };
  const fetch = vi
    .fn()
    .mockResolvedValueOnce(Response.json(cart([item, next])))
    .mockResolvedValueOnce(Response.json(cart([next])));
  vi.stubGlobal('fetch', fetch);
  const store = new CartStore(router);
  await store.load();
  expect(store.selectedProductIds.has(1)).toBe(true);
  store.removeItem(1);
  await vi.waitFor(() => expect(store.isSyncing).toBe(false));
  expect(fetch.mock.calls[1][1].method).toBe('DELETE');
  expect(store.selectedProductIds.has(2)).toBe(true);
  expect(store.hasProduct(1)).toBe(false);
});
