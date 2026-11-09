import { afterEach, expect, it, vi } from 'vitest';
import type { Globals } from '../../../globals';
import { createSsrApi } from '../../../server/ssr/api';
import { ProductPageVM } from './index';

afterEach(() => vi.unstubAllGlobals());

it.each(['999999999999999', 'invalid'])(
  'returns a not-found context for SSR product %s',
  async (productId) => {
    const ssr = createSsrApi('product-test');
    const shop = vi.spyOn(ssr, 'getShopById');
    const globals = {
      ssr,
      router: { routes: { product: { params: { productId } } } },
    } as unknown as Globals;
    const model = new ProductPageVM(globals, {
      id: 'product',
      payload: {},
      vmConfig: { observable: { viewModels: { useDecorators: false } } },
    });
    await model.willMount();
    expect(model.ctx).toEqual({ product: null, profile: null, shop: null });
    expect(ssr.statusCode).toBe(404);
    expect(shop).not.toHaveBeenCalled();
  },
);

it('handles an API 404 during client navigation', async () => {
  vi.stubGlobal(
    'fetch',
    vi
      .fn()
      .mockResolvedValue(
        Response.json({ error: 'Product not found' }, { status: 404 }),
      ),
  );
  const globals = {
    router: { routes: { product: { params: { productId: '999' } } } },
  } as unknown as Globals;
  const model = new ProductPageVM(globals, {
    id: 'product',
    payload: {},
    vmConfig: { observable: { viewModels: { useDecorators: false } } },
  });
  await model.willMount();
  expect(model.ctx).not.toBeNull();
  expect(model.product).toBeNull();
});

it('keeps response metadata separate for requests from the same session', () => {
  const first = createSsrApi('same-session');
  first.statusCode = 404;
  first.head.ogTitle = 'Old product';
  const second = createSsrApi('same-session');
  expect(second.statusCode).toBe(200);
  expect(second.head.ogTitle).toBeUndefined();
});
