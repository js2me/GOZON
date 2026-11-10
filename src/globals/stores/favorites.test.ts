import { afterEach, expect, it, vi } from 'vitest';
import { FavoritesStore } from './favorites';

const response = (productIds: number[]) => Response.json({ productIds });

afterEach(() => {
  sessionStorage.clear();
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
});

it('serializes rapid toggles and applies each server response', async () => {
  const first = Promise.withResolvers<Response>();
  const second = Promise.withResolvers<Response>();
  const fetch = vi
    .fn()
    .mockResolvedValueOnce(response([]))
    .mockReturnValueOnce(first.promise)
    .mockReturnValueOnce(second.promise);
  vi.stubGlobal('fetch', fetch);
  const store = new FavoritesStore();
  await store.load();
  const toggles = [store.toggleProduct(1), store.toggleProduct(2)];
  expect(fetch).toHaveBeenCalledTimes(2);
  first.resolve(response([1]));
  await vi.waitFor(() => expect(fetch).toHaveBeenCalledTimes(3));
  expect(store.hasProduct(1)).toBe(true);
  second.resolve(response([1, 2]));
  await Promise.all(toggles);
  expect(store.hasProduct(2)).toBe(true);
  expect(store.isLoading).toBe(false);
});

it('waits for the initial load before toggling', async () => {
  const initial = Promise.withResolvers<Response>();
  const fetch = vi
    .fn()
    .mockReturnValueOnce(initial.promise)
    .mockResolvedValueOnce(response([1, 2]));
  vi.stubGlobal('fetch', fetch);
  const store = new FavoritesStore();
  const loading = store.load();
  const toggling = store.toggleProduct(2);
  expect(fetch).toHaveBeenCalledTimes(1);
  initial.resolve(response([1]));
  await Promise.all([loading, toggling]);
  expect(fetch).toHaveBeenCalledTimes(2);
  expect(fetch.mock.calls[1][0]).toBe('/api/favorites/items/2');
  expect(store.hasProduct(1)).toBe(true);
  expect(store.hasProduct(2)).toBe(true);
});

it('recovers from a failed toggle by reloading server state', async () => {
  const fetch = vi
    .fn()
    .mockResolvedValueOnce(response([]))
    .mockRejectedValueOnce(new Error('offline'))
    .mockResolvedValueOnce(response([1]));
  vi.stubGlobal('fetch', fetch);
  const store = new FavoritesStore();
  await store.load();
  await store.toggleProduct(1);
  expect(store.hasProduct(1)).toBe(false);
  expect(store.loadError).toBe('Не удалось изменить избранное');
  await store.refresh();
  expect(store.hasProduct(1)).toBe(true);
  expect(store.loadError).toBeNull();
});

it('continues queued toggles after a failed request', async () => {
  const first = Promise.withResolvers<Response>();
  const fetch = vi
    .fn()
    .mockResolvedValueOnce(response([]))
    .mockReturnValueOnce(first.promise)
    .mockResolvedValueOnce(response([2]));
  vi.stubGlobal('fetch', fetch);
  const store = new FavoritesStore();
  await store.load();
  const toggles = [store.toggleProduct(1), store.toggleProduct(2)];
  first.reject(new Error('offline'));
  await Promise.all(toggles);
  expect(fetch).toHaveBeenCalledTimes(3);
  expect(store.hasProduct(2)).toBe(true);
  expect(store.loadError).toBeNull();
});
