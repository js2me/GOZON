import { afterEach, expect, it, vi } from 'vitest';
import type { Globals } from '../../../globals';
import type { ProductDC } from '../../../shared/api/api';
import { CategoryPageVM } from './index';

const globals = {
  router: { routes: { category: { params: { categoryId: 'test' } } } },
} as unknown as Globals;
const product: ProductDC = {
  id: 1,
  categoryId: 'test',
  shopId: 1,
  title: 'Товар',
  price: 100,
  originalPrice: 200,
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
afterEach(() => vi.unstubAllGlobals());

it('starts the new filter request immediately and ignores stale results', async () => {
  const oldRequest = Promise.withResolvers<Response>();
  const newRequest = Promise.withResolvers<Response>();
  const fetch = vi
    .fn()
    .mockReturnValueOnce(oldRequest.promise)
    .mockReturnValueOnce(newRequest.promise);
  vi.stubGlobal('fetch', fetch);
  const model = new CategoryPageVM(globals, {
    id: 'category',
    payload: {},
    vmConfig: { observable: { viewModels: { useDecorators: false } } },
  });
  const loading = model.loadProductsChunk();
  model.setSort('price_asc');
  expect(fetch).toHaveBeenCalledTimes(2);
  expect(fetch.mock.calls[0][1].signal.aborted).toBe(true);
  expect(fetch.mock.calls[1][0]).toContain('sort=price_asc');

  oldRequest.reject(new Error('aborted'));
  await loading;
  expect(model.products).toEqual([]);
  expect(model.isLoadingMore).toBe(true);
  expect(model.loadError).toBeNull();
  newRequest.resolve(
    Response.json({ items: [{ ...product, id: 2 }], hasMore: false }),
  );
  await vi.waitFor(() => expect(model.isLoadingMore).toBe(false));
  expect(model.products.map((item) => item.id)).toEqual([2]);
  expect(model.offset).toBe(1);
});

it('handles failed requests without treating the error payload as products', async () => {
  vi.stubGlobal(
    'fetch',
    vi
      .fn()
      .mockResolvedValue(
        Response.json({ error: 'unavailable' }, { status: 503 }),
      ),
  );
  const model = new CategoryPageVM(globals, {
    id: 'category',
    payload: {},
    vmConfig: { observable: { viewModels: { useDecorators: false } } },
  });
  await model.loadProductsChunk();
  expect(model.loadError).toBe('Не удалось загрузить товары');
  expect(model.products).toEqual([]);
  expect(model.isLoadingMore).toBe(false);
});
