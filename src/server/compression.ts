import zlib from 'node:zlib';
import type { Request, Response, NextFunction } from 'express';

function getPreferredEncoding(
  req: Request,
): 'br' | 'gzip' | null {
  const accept = req.headers['accept-encoding'] ?? '';
  if (accept.includes('br')) return 'br';
  if (accept.includes('gzip')) return 'gzip';
  return null;
}

function createCompressStream(encoding: 'br' | 'gzip') {
  return encoding === 'br'
    ? zlib.createBrotliCompress()
    : zlib.createGzip();
}

export function compression(req: Request, res: Response, next: NextFunction) {
  const encoding = getPreferredEncoding(req);

  if (!encoding || (req.method !== 'GET' && req.method !== 'HEAD')) {
    return next();
  }

  const compress = createCompressStream(encoding);

  res.setHeader('Content-Encoding', encoding);
  res.setHeader('Vary', 'Accept-Encoding');
  res.removeHeader('Content-Length');

  const originalWrite = res.write.bind(res);
  const originalEnd = res.end.bind(res);

  compress.on('data', (chunk) => originalWrite(chunk));
  compress.on('end', () => originalEnd());

  res.write = (chunk: any, ...args: any[]) => compress.write(chunk, ...args);
  res.end = (chunk?: any, ...args: any[]) => {
    if (chunk) compress.write(chunk);
    compress.end();
    return res;
  };

  next();
}
