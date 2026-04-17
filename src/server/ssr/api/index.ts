import type express from 'express';
import type { SsrApi } from '../../api/types';
import { createGetProfile } from './get-profile';

const SSR_API_CACHE_TTL_MS = 3 * 24 * 60 * 60 * 1000;
const ssrApiBySessionId = new Map<
  string,
  { value: SsrApi; expiresAt: number }
>();

function getSessionId(req: express.Request): string {
  const cookieHeader = req.headers.cookie ?? '';
  const sessionCookie = cookieHeader
    .split(';')
    .map((part) => part.trim())
    .find((part) => part.startsWith('sessionId='));

  if (sessionCookie) {
    return decodeURIComponent(sessionCookie.slice('sessionId='.length));
  }

  const userAgent = req.get('user-agent') ?? 'unknown-user-agent';
  return `${req.ip}:${userAgent}`;
}

function getCachedSsrApi(sessionId: string): SsrApi | null {
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

export function createSsrApi(req: express.Request): SsrApi {
  const sessionId = getSessionId(req);
  const cachedSsrApi = getCachedSsrApi(sessionId);
  if (cachedSsrApi) {
    return cachedSsrApi;
  }

  const now = Date.now();
  cleanupExpiredSsrApiCache(now);
  const ssrApi: SsrApi = {
    getProfile: createGetProfile(sessionId),
  };

  ssrApiBySessionId.set(sessionId, {
    value: ssrApi,
    expiresAt: now + SSR_API_CACHE_TTL_MS,
  });

  return ssrApi;
}
