import type { Request, Response } from 'express';
import type {
  ProductDC,
  ProductsChunkDC,
  ProfileDC,
  ProfileRatingProductDC,
  ProfileViewedProductDC,
} from '../../shared/api/api';
import { getCartDC, removeCartItem, replaceCart } from '../data/cart';
import { getCategoryById } from '../data/categories';
import { getFavoritesDC, replaceFavorites } from '../data/favorites';
import {
  allProducts,
  type ProductSortOption,
  queryProducts,
} from '../data/products';
import { getShopById } from '../data/shops';

const delay = async (ms: number) => {
  await new Promise<void>((resolve) => {
    setTimeout(resolve, ms);
  });
};

const handleCartApiRequest = (
  req: Request,
  res: Response,
  sessionId: string,
): boolean => {
  const path = req.path;

  if (path === '/api/cart' && req.method === 'GET') {
    res.status(200).json(getCartDC(sessionId));
    return true;
  }

  if (path === '/api/cart' && req.method === 'PUT') {
    const rawBody = req.body as {
      items?: Array<{ productId?: unknown; quantity?: unknown }>;
    };
    const rawItems = rawBody.items;
    if (!Array.isArray(rawItems)) {
      res.status(400).json({ error: 'Invalid cart payload' });
      return true;
    }

    const result = replaceCart(
      sessionId,
      rawItems.map((item) => ({
        productId: Number(item.productId),
        quantity: Number(item.quantity),
      })),
    );
    if (!result.ok) {
      res.status(400).json({ error: 'Invalid cart payload' });
      return true;
    }

    res.status(200).json(getCartDC(sessionId));
    return true;
  }

  if (path.startsWith('/api/cart/items/') && req.method === 'DELETE') {
    const raw = decodeURIComponent(path.slice('/api/cart/items/'.length));
    const productId = Number(raw);
    if (!Number.isInteger(productId)) {
      res.status(400).json({ error: 'Invalid productId' });
      return true;
    }

    const result = removeCartItem(sessionId, productId);
    if (!result.ok) {
      res.status(404).json({ error: 'Cart item not found' });
      return true;
    }

    res.status(200).json(getCartDC(sessionId));
    return true;
  }

  return false;
};

const handleFavoritesApiRequest = (
  req: Request,
  res: Response,
  sessionId: string,
): boolean => {
  const path = req.path;

  if (path === '/api/favorites' && req.method === 'GET') {
    res.status(200).json(getFavoritesDC(sessionId));
    return true;
  }

  if (path === '/api/favorites' && req.method === 'PUT') {
    const rawBody = req.body as { productIds?: unknown };
    const rawIds = rawBody.productIds;
    if (!Array.isArray(rawIds)) {
      res.status(400).json({ error: 'Invalid favorites payload' });
      return true;
    }

    const result = replaceFavorites(
      sessionId,
      rawIds.map((id) => Number(id)),
    );
    if (!result.ok) {
      res.status(400).json({ error: 'Invalid favorites payload' });
      return true;
    }

    res.status(200).json(getFavoritesDC(sessionId));
    return true;
  }

  return false;
};

const handleCategoryApiRequest = (path: string, res: Response): boolean => {
  if (!path.startsWith('/api/categories/')) {
    return false;
  }

  const categoryIdRaw = path.slice('/api/categories/'.length);
  const categoryId = decodeURIComponent(categoryIdRaw);
  if (!categoryId) {
    res.status(404).json({ error: 'Category not found' });
    return true;
  }

  const category = getCategoryById(categoryId);
  if (!category) {
    res.status(404).json({ error: 'Category not found' });
    return true;
  }

  res.status(200).send(JSON.stringify(category));
  return true;
};

const handleProductsListApiRequest = (req: Request, res: Response): boolean => {
  if (req.path !== '/api/products') {
    return false;
  }

  const rawLimit = Number(req.query.limit);
  const rawOffset = Number(req.query.offset);
  const limit = Number.isFinite(rawLimit)
    ? Math.max(1, Math.min(Math.trunc(rawLimit), 100))
    : 20;
  const offset = Number.isFinite(rawOffset)
    ? Math.max(0, Math.trunc(rawOffset))
    : 0;

  const categoryId =
    typeof req.query.categoryId === 'string' ? req.query.categoryId : undefined;
  const saleOnlyRaw = req.query.saleOnly;
  const saleOnly =
    saleOnlyRaw === '1' || saleOnlyRaw === 'true' || saleOnlyRaw === 'yes';
  const rawMin = Number(req.query.minPrice);
  const rawMax = Number(req.query.maxPrice);
  const minPrice = Number.isFinite(rawMin) ? Math.max(0, rawMin) : undefined;
  const maxPrice = Number.isFinite(rawMax) ? Math.max(0, rawMax) : undefined;

  const sortRaw = req.query.sort;
  const sort: ProductSortOption =
    sortRaw === 'price_asc' || sortRaw === 'price_desc' ? sortRaw : 'popular';

  const filtered = queryProducts({
    categoryId,
    saleOnly: saleOnly || undefined,
    minPrice,
    maxPrice,
    sort,
  });

  const items = filtered.slice(offset, offset + limit);
  const hasMore = offset + items.length < filtered.length;
  const productsChunk: ProductsChunkDC = {
    items,
    hasMore,
  };

  res.status(200).send(JSON.stringify(productsChunk));
  return true;
};

export const handleApiRequest = async (
  req: Request,
  res: Response,
  sessionId: string,
) => {
  const path = req.path;

  if (handleCartApiRequest(req, res, sessionId)) {
    return;
  }

  if (handleFavoritesApiRequest(req, res, sessionId)) {
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

  if (handleCategoryApiRequest(path, res)) {
    return;
  }

  if (handleProductsListApiRequest(req, res)) {
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
