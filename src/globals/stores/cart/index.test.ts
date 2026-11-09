import { afterEach, expect, it, vi } from 'vitest';
import type { CartDC } from '../../../shared/api/api';
import type { Router } from '../../router';
import { CartStore } from './index';

const cart: CartDC = {
  items: [
    {
      productId: 1,
      title: 'Товар',
      imageUrl: '',
      variant: '',
      price: { current: 100, original: 100, currency: '₽' },
      quantity: { current: 1, maxAvailable: 20 },
    },
  ],
  promo: { saleDeadline: '', itemsPriceIncreasingCount: 0 },
};

const router = {
  routes: { product: { createUrl: () => '/products/1' } },
} as unknown as Router;

function response(quantity: number) {
  return Response.json({
    ...cart,
    items: [
      { ...cart.items[0], quantity: { current: quantity, maxAvailable: 20 } },
    ],
  });
}

afterEach(() => {
  vi.clearAllTimers();
  vi.useRealTimers();
  vi.unstubAllGlobals();
});

it('preserves edits made while a previous write is waiting for its response', async () => {
  vi.useFakeTimers();
  const firstWrite = Promise.withResolvers<Response>();
  const secondWrite = Promise.withResolvers<Response>();
  const fetch = vi
    .fn()
    .mockResolvedValueOnce(Response.json(cart))
    .mockReturnValueOnce(firstWrite.promise)
    .mockReturnValueOnce(secondWrite.promise);
  vi.stubGlobal('fetch', fetch);
  const store = new CartStore(router);
  await store.load();
  store.changeQuantity(1, 2);
  await vi.advanceTimersByTimeAsync(350);
  store.changeQuantity(1, 3);
  await vi.advanceTimersByTimeAsync(350);
  expect(fetch).toHaveBeenCalledTimes(2);

  firstWrite.resolve(response(2));
  await vi.advanceTimersByTimeAsync(0);
  expect(store.items[0].quantity.current).toBe(3);
  expect(JSON.parse(fetch.mock.calls[2][1].body).items[0].quantity).toBe(3);
  secondWrite.resolve(response(3));
  await vi.advanceTimersByTimeAsync(0);
  expect(store.isSyncing).toBe(false);
  expect(store.items[0].quantity.current).toBe(3);
});

it('deduplicates initial loads and does not reload over local edits', async () => {
  vi.useFakeTimers();
  const initialLoad = Promise.withResolvers<Response>();
  const fetch = vi.fn().mockReturnValue(initialLoad.promise);
  vi.stubGlobal('fetch', fetch);
  const store = new CartStore(router);
  const loads = [store.load(), store.load()];
  expect(fetch).toHaveBeenCalledTimes(1);
  initialLoad.resolve(Response.json(cart));
  await Promise.all(loads);
  store.changeQuantity(1, 3);
  await store.load();
  expect(fetch).toHaveBeenCalledTimes(1);
  expect(store.items[0].quantity.current).toBe(3);
});

it('keeps local edits and exposes a failed write', async () => {
  vi.useFakeTimers();
  vi.stubGlobal(
    'fetch',
    vi
      .fn()
      .mockResolvedValueOnce(Response.json(cart))
      .mockRejectedValue(new Error('offline')),
  );
  const store = new CartStore(router);
  await store.load();
  store.changeQuantity(1, 2);
  await vi.advanceTimersByTimeAsync(350);
  expect(store.items[0].quantity.current).toBe(2);
  expect(store.loadError).toBe('Не удалось синхронизировать корзину');
  expect(store.isSyncing).toBe(false);
});

it('ignores a refresh response when the user edits the cart during loading', async () => {
  vi.useFakeTimers();
  const refresh = Promise.withResolvers<Response>();
  const fetch = vi
    .fn()
    .mockResolvedValueOnce(Response.json(cart))
    .mockReturnValueOnce(refresh.promise);
  vi.stubGlobal('fetch', fetch);
  const store = new CartStore(router);
  await store.load();
  const loading = store.load();
  store.changeQuantity(1, 3);
  refresh.resolve(response(1));
  await loading;
  expect(store.items[0].quantity.current).toBe(3);
});
