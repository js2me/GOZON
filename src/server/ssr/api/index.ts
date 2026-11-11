import type { SSRApi } from '../../api/types';
import { createGetCategoryById } from './get-category-by-id';
import { createGetProductById } from './get-product-by-id';
import { createGetProfile } from './get-profile';
import { createGetShopById } from './get-shop-by-id';

// Response metadata belongs to one document request, including concurrent requests
// from the same session.
export function createSsrApi(sessionId: string): SSRApi {
  const ssrApi: SSRApi = {
    statusCode: 200,
    getProfile: createGetProfile(sessionId),
    getProductById: createGetProductById(),
    getShopById: createGetShopById(),
    getCategoryById: createGetCategoryById(),
    getSystemInfo: () => {
      return {
        date: new Date().toISOString(),
      };
    },
    head: {
      title: '',
      ogSiteName: 'GOZON',
      ogLocale: 'ru_RU',
    },
  };

  return ssrApi;
}
