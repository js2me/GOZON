import { readdirSync } from 'node:fs';
import path from 'node:path';

import { type ProductDC, ProductDeliveryVariant } from '../../shared/api/api';
import { app } from '../app';
import { CATEGORY_IDS } from './categories';
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

function getCharacteristics() {
  return [
    {
      label: 'Материал',
      value: app.faker.helpers.arrayElement(['Лен', 'Хлопок', 'Вискоза']),
    },
    {
      label: 'Состав материала',
      value: app.faker.helpers.arrayElement([
        '100% хлопок',
        '70% хлопок, 30% лен',
        '95% хлопок, 5% эластан',
      ]),
    },
    {
      label: 'Коллекция',
      value: app.faker.helpers.arrayElement([
        'Базовая коллекция',
        'Летняя коллекция',
        'Премиум коллекция',
      ]),
    },
    {
      label: 'Рост',
      value: app.faker.helpers.arrayElement(['155-185', '165-190', '170-195']),
    },
  ];
}

function getCategoriesPath() {
  const root = app.faker.helpers.arrayElement([
    'Одежда',
    'Обувь',
    'Аксессуары',
  ]);
  const middle = app.faker.helpers.arrayElement([
    'Мужская одежда',
    'Женская одежда',
    'Спортивная одежда',
  ]);
  const leaf = app.faker.helpers.arrayElement(['Брюки', 'Футболки', 'Рубашки']);

  return [
    { id: 'root', title: root },
    { id: 'middle', title: middle },
    { id: 'leaf', title: leaf },
  ];
}

export const allProducts = app.faker.helpers.multiple(
  (_, id): ProductDC => ({
    id,
    categoryId: app.faker.helpers.arrayElement([...CATEGORY_IDS]),
    shopId: allShops[id % allShops.length]?.id ?? 1,
    originalPrice: +app.faker.commerce.price({ min: 1, max: 10000 }),
    price: +app.faker.commerce.price({ min: 1, max: 10000 }),
    rating: app.faker.number.float({ min: 1, max: 5, fractionDigits: 1 }),
    title: app.faker.commerce.productDescription(),
    reviewsCount: app.faker.number.int({ min: 0, max: 9999999 }),
    questionsCount: app.faker.number.int({ min: 0, max: 9999 }),
    returnPeriodDays: app.faker.helpers.arrayElement([7, 14, 15, 21, 30]),
    deliveryText: app.faker.helpers.arrayElement([
      'Доставим завтра',
      'Доставим послезавтра',
      'Доставка за 2-3 дня',
    ]),
    deliveryVariants: app.faker.helpers.arrayElements(
      [
        ProductDeliveryVariant.PartnerCourier,
        ProductDeliveryVariant.PartnerPickupPoints,
      ],
      { min: 1, max: 2 },
    ),
    hasPriceDropBadge: app.faker.datatype.boolean(0.7),
    categoriesPath: getCategoriesPath(),
    characteristics: getCharacteristics(),
    colorText: app.faker.helpers.arrayElement([
      'Хлопок и лен серый',
      'Графитовый меланж',
      'Молочный',
      'Темно-синий',
    ]),
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

export type ProductSortOption = 'popular' | 'price_asc' | 'price_desc';

export interface QueryProductsFilters {
  categoryId?: string;
  saleOnly?: boolean;
  minPrice?: number;
  maxPrice?: number;
  sort?: ProductSortOption;
}

export function queryProducts(filters: QueryProductsFilters): ProductDC[] {
  const list = allProducts.filter((p) => {
    if (filters.categoryId && p.categoryId !== filters.categoryId) {
      return false;
    }
    if (filters.saleOnly && !(p.originalPrice > p.price)) {
      return false;
    }
    if (filters.minPrice != null && p.price < filters.minPrice) {
      return false;
    }
    if (filters.maxPrice != null && p.price > filters.maxPrice) {
      return false;
    }
    return true;
  });

  const sort = filters.sort ?? 'popular';
  const sorted = [...list];
  if (sort === 'price_asc') {
    sorted.sort((a, b) => a.price - b.price);
  } else if (sort === 'price_desc') {
    sorted.sort((a, b) => b.price - a.price);
  } else {
    sorted.sort((a, b) => b.reviewsCount - a.reviewsCount);
  }
  return sorted;
}
