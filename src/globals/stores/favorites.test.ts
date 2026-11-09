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
