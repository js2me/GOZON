import type { Request, Response } from 'express';
import { allProducts } from '../data/products';

export const handleApiRequest = (req: Request, res: Response) => {
  if (req.path === '/api/products') {
    const rawLimit = Number(req.query.limit);
    const rawOffset = Number(req.query.offset);
    const limit = Number.isFinite(rawLimit)
      ? Math.max(1, Math.min(Math.trunc(rawLimit), 100))
      : 20;
    const offset = Number.isFinite(rawOffset)
      ? Math.max(0, Math.trunc(rawOffset))
      : 0;

    const items = allProducts.slice(offset, offset + limit);
    const hasMore = offset + items.length < allProducts.length;
    res.status(200).send(
      JSON.stringify({
        items,
        hasMore,
      }),
    );
    return;
  }
};
