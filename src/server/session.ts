import crypto from 'node:crypto';
import type { Request, Response } from 'express';

const SESSION_COOKIE = 'sessionId';
/** ~1 год */
const SESSION_MAX_AGE_SEC = 60 * 60 * 24 * 400;

/**
 * Возвращает идентификатор сессии из cookie или создаёт новый и выставляет Set-Cookie.
 */
export function getOrCreateSessionId(req: Request, res: Response): string {
  const cookieHeader = req.headers.cookie ?? '';
  const sessionPart = cookieHeader
    .split(';')
    .map((part) => part.trim())
    .find((part) => part.startsWith(`${SESSION_COOKIE}=`));

  if (sessionPart) {
    const raw = sessionPart.slice(SESSION_COOKIE.length + 1);
    try {
      const id = decodeURIComponent(raw);
      if (id.length > 0 && id.length < 512) {
        return id;
      }
    } catch {
      /* невалидная cookie */
    }
  }

  const id = crypto.randomUUID();
  res.append(
    'Set-Cookie',
    `${SESSION_COOKIE}=${encodeURIComponent(id)}; Path=/; HttpOnly; SameSite=Lax; Max-Age=${SESSION_MAX_AGE_SEC}`,
  );
  return id;
}
