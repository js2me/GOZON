import { afterEach, expect, it, vi } from 'vitest';
import { FavoritesStore } from './favorites';

afterEach(() => {
  sessionStorage.clear();
  vi.unstubAllGlobals();
});

it('serializes writes and preserves toggles during a pending response', async () => {
  const firstWrite = Promise.withResolvers<Response>();
  const secondWrite = Promise.withResolvers<Response>();
  const fetch = vi
    .fn()
    .mockResolvedValueOnce(Response.json({ productIds: [] }))
    .mockReturnValueOnce(firstWrite.promise)
    .mockReturnValueOnce(secondWrite.promise);
  vi.stubGlobal('fetch', fetch);
  const store = new FavoritesStore();
  await store.toggleProduct(1);
  await store.toggleProduct(2);
  expect(fetch).toHaveBeenCalledTimes(2);
  firstWrite.resolve(Response.json({ productIds: [1] }));
  await vi.waitFor(() => expect(fetch).toHaveBeenCalledTimes(3));
  expect(store.hasProduct(2)).toBe(true);
  expect(JSON.parse(fetch.mock.calls[2][1].body)).toEqual({
    productIds: [1, 2],
  });
  secondWrite.resolve(Response.json({ productIds: [1, 2] }));
  await vi.waitFor(() => expect(store.isLoading).toBe(false));
  expect(store.hasProduct(1)).toBe(true);
  expect(store.hasProduct(2)).toBe(true);
});

it('waits for the initial server state before applying a toggle', async () => {
  const initialLoad = Promise.withResolvers<Response>();
  const fetch = vi
    .fn()
    .mockReturnValueOnce(initialLoad.promise)
    .mockResolvedValue(Response.json({ productIds: [1, 2] }));
  vi.stubGlobal('fetch', fetch);
  const store = new FavoritesStore();
  const loading = store.load();
  const toggling = store.toggleProduct(2);
  expect(fetch).toHaveBeenCalledTimes(1);
  initialLoad.resolve(Response.json({ productIds: [1] }));
  await Promise.all([loading, toggling]);
  expect(JSON.parse(fetch.mock.calls[1][1].body)).toEqual({
    productIds: [1, 2],
  });
  await vi.waitFor(() => expect(store.isLoading).toBe(false));
});

it('exposes synchronization errors and retains the local selection', async () => {
  vi.stubGlobal(
    'fetch',
    vi
      .fn()
      .mockResolvedValueOnce(Response.json({ productIds: [] }))
      .mockRejectedValue(new Error('offline')),
  );
  const store = new FavoritesStore();
  await store.toggleProduct(1);
  await vi.waitFor(() =>
    expect(store.loadError).toBe('Не удалось синхронизировать избранное'),
  );
  expect(store.hasProduct(1)).toBe(true);
  expect(store.isLoading).toBe(false);
});

it('keeps a toggle after failed initial loading and reconciles it on retry', async () => {
  const fetch = vi
    .fn()
    .mockRejectedValueOnce(new Error('offline'))
    .mockRejectedValueOnce(new Error('offline'))
    .mockResolvedValueOnce(Response.json({ productIds: [1] }))
    .mockResolvedValueOnce(Response.json({ productIds: [1, 2] }));
  vi.stubGlobal('fetch', fetch);
  const store = new FavoritesStore();
  await store.load();
  await store.toggleProduct(2);
  expect(store.hasProduct(2)).toBe(true);
  expect(store.loadError).toBe('Не удалось загрузить избранное');
  await store.retrySync();
  expect(JSON.parse(fetch.mock.calls[3][1].body)).toEqual({
    productIds: [1, 2],
  });
  expect(store.hasProduct(1)).toBe(true);
  expect(store.hasProduct(2)).toBe(true);
  expect(store.loadError).toBeNull();
});

it('submits a newer toggle after a failed write and retains a retry path', async () => {
  const firstWrite = Promise.withResolvers<Response>();
  const fetch = vi
    .fn()
    .mockResolvedValueOnce(Response.json({ productIds: [] }))
    .mockReturnValueOnce(firstWrite.promise)
    .mockRejectedValueOnce(new Error('offline'))
    .mockResolvedValueOnce(Response.json({ productIds: [1, 2] }));
  vi.stubGlobal('fetch', fetch);
  const store = new FavoritesStore();
  await store.toggleProduct(1);
  await store.toggleProduct(2);
  firstWrite.reject(new Error('offline'));
  await vi.waitFor(() => expect(store.isLoading).toBe(false));
  expect(JSON.parse(fetch.mock.calls[2][1].body)).toEqual({
    productIds: [1, 2],
  });
  expect(store.loadError).toBe('Не удалось синхронизировать избранное');
  expect(store.hasProduct(2)).toBe(true);
  await store.retrySync();
  expect(store.loadError).toBeNull();
  expect(store.hasProduct(2)).toBe(true);
});
