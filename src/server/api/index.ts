import type { Request, Response } from 'express';
import type {
  ProductDC,
  ProductsChunkDC,
  ProfileDC,
  ProfileRatingProductDC,
  ProfileViewedProductDC,
} from '../../shared/api/api';
import { addProductToCart, getCartDC } from '../data/cart';
import { allProducts } from '../data/products';
import { getShopById } from '../data/shops';

const delay = async (ms: number) => {
  await new Promise<void>((resolve) => {
    setTimeout(resolve, ms);
  });
};

export const handleApiRequest = async (
  req: Request,
  res: Response,
  sessionId: string,
) => {
  const path = req.path;

  if (path === '/api/cart' && req.method === 'GET') {
    res.status(200).json(getCartDC(sessionId));
    return;
  }

  if (path === '/api/cart/items' && req.method === 'POST') {
    const raw = req.body as { productId?: unknown };
    const productId = Number(raw.productId);
    if (!Number.isInteger(productId)) {
      res.status(400).json({ error: 'Invalid productId' });
      return;
    }

    const result = addProductToCart(sessionId, productId);
    if (!result.ok) {
      res.status(404).json({ error: 'Product not found' });
      return;
    }

    res.status(200).json(getCartDC(sessionId));
    return;
  }

  if (path.startsWith('/api/products/')) {
    const productIdRaw = path.slice('/api/products/'.length);
    const productId = Number(productIdRaw);
    const product = allProducts.find((item) => item.id === productId) ?? null;

    if (!Number.isInteger(productId) || !product) {
      res.status(404).json({ error: 'Product not found' });
      return;
    }

    const productDc: ProductDC = product;
    res.status(200).send(JSON.stringify(productDc));
    return;
  }

  if (path.startsWith('/api/shops/')) {
    const shopIdRaw = path.slice('/api/shops/'.length);
    const shopId = Number(shopIdRaw);
    const shop = getShopById(shopId);

    if (!Number.isInteger(shopId) || !shop) {
      res.status(404).json({ error: 'Shop not found' });
      return;
    }

    res.status(200).send(JSON.stringify(shop));
    return;
  }

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

    res.status(200).send(JSON.stringify(productsChunk));
    return;
  }

  if (path === '/api/profile') {
    const profile: ProfileDC = {
      firstName: 'Сергей',
      lastName: 'Волков',
      dateBirth: '1996-09-05',
      male: true,
      address: 'Высоковский пр-д, 20',
    };

    res.status(200).send(JSON.stringify(profile));
    return;
  }

  if (path === '/api/profile/rating-products') {
    await delay(100);

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
    await delay(100);

    const viewedProducts: ProfileViewedProductDC[] = allProducts
      .slice(3, 9)
      .map((product) => {
        const discountPercent = Math.round(
          ((product.originalPrice - product.price) / product.originalPrice) *
            100,
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
