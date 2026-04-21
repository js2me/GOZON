import type { SSRApi } from '../../api/types';
import { createGetProductById } from './get-product-by-id';
import { createGetProfile } from './get-profile';
import { createGetShopById } from './get-shop-by-id';

const SSR_API_CACHE_TTL_MS = 3 * 24 * 60 * 60 * 1000;
const ssrApiBySessionId = new Map<
  string,
  { value: SSRApi; expiresAt: number }
>();

function getCachedSsrApi(sessionId: string): SSRApi | null {
  const now = Date.now();
  const cacheEntry = ssrApiBySessionId.get(sessionId);
  if (!cacheEntry) {
    return null;
  }

  if (cacheEntry.expiresAt <= now) {
    ssrApiBySessionId.delete(sessionId);
    return null;
  }

  return cacheEntry.value;
}

function cleanupExpiredSsrApiCache(now: number) {
  for (const [cachedSessionId, cacheEntry] of ssrApiBySessionId.entries()) {
    if (cacheEntry.expiresAt <= now) {
      ssrApiBySessionId.delete(cachedSessionId);
    }
  }
}

export function createSsrApi(sessionId: string): SSRApi {
  const cachedSsrApi = getCachedSsrApi(sessionId);
  if (cachedSsrApi) {
    return cachedSsrApi;
  }

  const now = Date.now();
  cleanupExpiredSsrApiCache(now);

  const ssrApi: SSRApi = {
    getProfile: createGetProfile(sessionId),
    getProductById: createGetProductById(),
    getShopById: createGetShopById(),
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

  ssrApiBySessionId.set(sessionId, {
    value: ssrApi,
    expiresAt: now + SSR_API_CACHE_TTL_MS,
  });

  return ssrApi;
}
