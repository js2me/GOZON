import type { Request, Response } from 'express';
import type {
  ProductsChunkDC,
  ProfileDC,
  ProfileRatingProductDC,
  ProfileViewedProductDC,
} from '../../shared/api/api';
import { allProducts } from '../data/products';

export const handleApiRequest = (req: Request, res: Response) => {
  const path = req.path;

  if (path === '/api/products') {
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

  if (path === '/api/profile') {
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

  if (path === '/api/profile/rating-products') {
    const ratingProducts: ProfileRatingProductDC[] = allProducts
      .slice(0, 3)
      .map((product) => ({
        id: String(product.id),
        title: product.title,
      }));

    res.status(200).send(JSON.stringify(ratingProducts));
    return;
  }

  if (path === '/api/profile/viewed-products') {
    const viewedProducts: ProfileViewedProductDC[] = allProducts
      .slice(3, 9)
      .map((product) => {
        const discountPercent = Math.round(
          ((product.originalPrice - product.price) / product.originalPrice) * 100,
        );

        return {
          id: String(product.id),
          brand: product.title.split(' ')[0] ?? 'GOZON',
          title: product.title,
          imageSrc: product.images?.[0] ?? '',
          price: `${product.price.toLocaleString('ru-RU')} ₽`,
          originalPrice:
            discountPercent > 0
              ? `${product.originalPrice.toLocaleString('ru-RU')} ₽`
              : undefined,
          discount: discountPercent > 0 ? `-${discountPercent}%` : undefined,
          badge:
            discountPercent >= 50
              ? { label: 'Распродажа' }
              : discountPercent >= 30
                ? { label: 'Хит продаж' }
                : null,
        };
      });

    res.status(200).send(JSON.stringify(viewedProducts));
    return;
  }

  res.status(404).json({ error: 'API route not found' });
};
