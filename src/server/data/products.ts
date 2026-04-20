import { readdirSync } from 'node:fs';
import path from 'node:path';

import type { ProductDC } from '../../shared/api/api';
import { app } from '../app';
import { allShops } from './shops';

const productImagesDir = path.resolve(
  app.serverDir,
  'data/assets/product-images',
);
const productImageUrls = readdirSync(productImagesDir)
  .filter((filename) => filename.endsWith('.webp'))
  .map((filename) => `/api/assets/product-images/${filename}`);

function getRandomProductImages(): string[] | undefined {
  if (productImageUrls.length === 0) {
    return undefined;
  }

  const count = app.faker.number.int({
    min: 1,
    max: Math.min(4, productImageUrls.length),
  });
  return app.faker.helpers.shuffle(productImageUrls).slice(0, count);
}

export const allProducts = app.faker.helpers.multiple(
  (_, id): ProductDC => ({
    id,
    shopId: allShops[id % allShops.length]?.id ?? 1,
    originalPrice: +app.faker.commerce.price({ min: 1, max: 10000 }),
    price: +app.faker.commerce.price({ min: 1, max: 10000 }),
    rating: app.faker.number.float({ min: 1, max: 5, fractionDigits: 1 }),
    title: app.faker.commerce.productDescription(),
    reviewsCount: app.faker.number.int({ min: 0, max: 9999999 }),
    images: app.faker.helpers.maybe(getRandomProductImages, {
      probability: 0.95,
    }),
  }),
  {
    count: { min: 2000, max: 5000 },
  },
);

export function getProductById(productId: number): ProductDC | null {
  return allProducts.find((product) => product.id === productId) ?? null;
}
