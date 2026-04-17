import type { Request, Response } from 'express';
import type { ProductsChunkDC, ProfileDC } from '../../shared/api/api';
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
    const productsChunk: ProductsChunkDC = {
      items,
      hasMore,
    };

    res.status(200).send(
      JSON.stringify(productsChunk),
    );
    return;
  }

  if (req.path === '/api/profile') {
    const profile: ProfileDC = {
      firstName: 'Сергей',
      lastName: 'Волков',
      dateBirth: '1996-09-05',
      male: true,
    };

    res.status(200).send(
      JSON.stringify(profile),
    );
    return;
  }
};
