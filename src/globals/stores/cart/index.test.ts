import { afterEach, expect, it, vi } from 'vitest';
import type { CartDC, ProductDC } from '../../../shared/api/api';
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
  version: 0,
};

const router = {
  routes: { product: { createUrl: () => '/products/1' } },
} as unknown as Router;

function response(quantity: number, version = 1) {
  return Response.json({
    ...cart,
    version,
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
  secondWrite.resolve(response(3, 2));
  await vi.advanceTimersByTimeAsync(0);
  expect(store.isSyncing).toBe(false);
  expect(store.items[0].quantity.current).toBe(3);
});

it('deduplicates initial loads and sends local edits without reloading', async () => {
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
  expect(fetch).toHaveBeenCalledTimes(2);
  expect(fetch.mock.calls[1][1].method).toBe('PUT');
  expect(store.items[0].quantity.current).toBe(3);
});

it('submits a newer edit after the previous write fails', async () => {
  vi.useFakeTimers();
  const firstWrite = Promise.withResolvers<Response>();
  const fetch = vi
    .fn()
    .mockResolvedValueOnce(Response.json(cart))
    .mockReturnValueOnce(firstWrite.promise)
    .mockResolvedValueOnce(response(3));
  vi.stubGlobal('fetch', fetch);
  const store = new CartStore(router);
  await store.load();
  store.changeQuantity(1, 2);
  await vi.advanceTimersByTimeAsync(350);
  store.changeQuantity(1, 3);
  await vi.advanceTimersByTimeAsync(350);
  firstWrite.reject(new Error('offline'));
  await vi.advanceTimersByTimeAsync(0);
  expect(JSON.parse(fetch.mock.calls[2][1].body).items[0].quantity).toBe(3);
  expect(store.items[0].quantity.current).toBe(3);
  expect(store.loadError).toBeNull();
});

it('retries a failed dirty snapshot on the next cart load', async () => {
  vi.useFakeTimers();
  const fetch = vi
    .fn()
    .mockResolvedValueOnce(Response.json(cart))
    .mockRejectedValueOnce(new Error('offline'))
    .mockResolvedValueOnce(response(2));
  vi.stubGlobal('fetch', fetch);
  const store = new CartStore(router);
  await store.load();
  store.changeQuantity(1, 2);
  await vi.advanceTimersByTimeAsync(350);
  expect(store.loadError).not.toBeNull();
  await store.load();
  expect(fetch).toHaveBeenCalledTimes(3);
  expect(fetch.mock.calls[2][1].method).toBe('PUT');
  expect(store.loadError).toBeNull();
});

it('stops on a cart conflict until the user reloads the server cart', async () => {
  vi.useFakeTimers();
  const otherItem = { ...cart.items[0]!, productId: 2 };
  const fetch = vi
    .fn()
    .mockResolvedValueOnce(Response.json(cart))
    .mockResolvedValueOnce(Response.json({ version: 2 }, { status: 409 }))
    .mockResolvedValueOnce(
      Response.json({ ...cart, version: 2, items: [...cart.items, otherItem] }),
    );
  vi.stubGlobal('fetch', fetch);
  const store = new CartStore(router);
  await store.load();
  store.changeQuantity(1, 2);
  await vi.advanceTimersByTimeAsync(350);
  expect(fetch).toHaveBeenCalledTimes(2);
  expect(JSON.parse(fetch.mock.calls[1][1].body).version).toBe(0);
  expect(store.hasConflict).toBe(true);
  expect(store.items[0].quantity.current).toBe(2);
  store.changeQuantity(1, 3);
  await vi.advanceTimersByTimeAsync(350);
  expect(fetch).toHaveBeenCalledTimes(2);
  await store.reloadAfterConflict();
  expect(fetch).toHaveBeenCalledTimes(3);
  expect(store.hasConflict).toBe(false);
  expect(store.items[0].quantity.current).toBe(1);
  expect(store.hasProduct(2)).toBe(true);
  expect(store.loadError).toBeNull();
});

it('stops a timed-out write and keeps the local edit for retry', async () => {
  vi.useFakeTimers();
  const controller = new AbortController();
  const timeout = vi
    .spyOn(AbortSignal, 'timeout')
    .mockReturnValue(controller.signal);
  const fetch = vi
    .fn()
    .mockResolvedValueOnce(Response.json(cart))
    .mockImplementationOnce((_url: string, options: RequestInit) => {
      return new Promise<Response>((_resolve, reject) => {
        options.signal?.addEventListener('abort', () =>
          reject(new Error('timeout')),
        );
      });
    });
  vi.stubGlobal('fetch', fetch);
  const store = new CartStore(router);
  await store.load();
  store.changeQuantity(1, 2);
  await vi.advanceTimersByTimeAsync(350);
  expect(timeout).toHaveBeenCalledWith(10_000);
  controller.abort();
  await vi.advanceTimersByTimeAsync(0);
  expect(store.isSyncing).toBe(false);
  expect(store.loadError).toBe('Не удалось синхронизировать корзину');
  expect(store.items[0].quantity.current).toBe(2);
  timeout.mockRestore();
});

it.each([
  {
    name: 'removal',
    edit: (store: CartStore) => store.removeItem(1),
    expectedItems: [],
  },
  {
    name: 'adding an existing product',
    edit: (store: CartStore) => store.addProduct(1),
    expectedItems: [{ productId: 1, quantity: 3 }],
  },
  {
    name: 'adding a new product',
    edit: (store: CartStore) => store.addProduct(2),
    expectedItems: [
      { productId: 1, quantity: 2 },
      { productId: 2, quantity: 1 },
    ],
  },
])(
  'preserves $name during a pending write',
  async ({ edit, expectedItems }) => {
    vi.useFakeTimers();
    const firstWrite = Promise.withResolvers<Response>();
    const product: ProductDC = {
      id: 2,
      categoryId: 'test',
      shopId: 1,
      title: 'Новый товар',
      price: 100,
      originalPrice: 100,
      rating: 5,
      reviewsCount: 0,
      questionsCount: 0,
      returnPeriodDays: 7,
      deliveryText: '',
      deliveryVariants: [],
      hasPriceDropBadge: false,
      categoriesPath: [],
      characteristics: [],
      colorText: '',
    };
    let writes = 0;
    const fetch = vi.fn((url: string, options?: RequestInit) => {
      if (url === '/api/products/2')
        return Promise.resolve(Response.json(product));
      if (options?.method === 'PUT') {
        writes++;
        if (writes === 1) return firstWrite.promise;
        return Promise.resolve(
          Response.json({
            ...cart,
            version: 2,
            items: expectedItems.map(({ productId, quantity }) => ({
              ...cart.items[0],
              productId,
              quantity: { current: quantity, maxAvailable: 20 },
            })),
          }),
        );
      }
      return Promise.resolve(Response.json(cart));
    });
    vi.stubGlobal('fetch', fetch);
    const store = new CartStore(router);
    await store.load();
    store.changeQuantity(1, 2);
    await vi.advanceTimersByTimeAsync(350);
    await edit(store);
    firstWrite.resolve(response(2));
    await vi.advanceTimersByTimeAsync(0);
    const putCalls = fetch.mock.calls.filter(
      ([, options]) => options?.method === 'PUT',
    );
    expect(JSON.parse(putCalls[1][1]?.body as string).items).toEqual(
      expectedItems,
    );
    expect(
      store.items.map((item) => ({
        productId: item.productId,
        quantity: item.quantity.current,
      })),
    ).toEqual(expectedItems);
  },
);

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
