import { readdirSync } from 'node:fs';
import path from 'node:path';

import { type ProductDC, ProductDeliveryVariant } from '../../shared/api/api';
import { app } from '../app';
import { mockReview, productFeedback } from './product-feedback';
import { productShowcase } from './product-showcase';
import { CATEGORY_IDS, getCategoryById } from './categories';
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
  (_, id): ProductDC => {
    const sample = productShowcase[id];
    const categoryId = sample
      ? CATEGORY_IDS[sample.category]!
      : app.faker.helpers.arrayElement([...CATEGORY_IDS]);
    const price = app.faker.number.int({ min: 149, max: 6599 });
    const reviewsCount = sample ? 5 + (id % 4) : 2 + (id % 3);
    const stars = Array.from(
      { length: reviewsCount },
      (_, index) => mockReview(id, index).stars,
    );
    return {
      id,
      categoryId,
      shopId: allShops[id % allShops.length]?.id ?? 1,
      originalPrice: Math.round(
        price * app.faker.helpers.arrayElement([1, 1.15, 1.4, 1.7, 2.1, 2.6]),
      ),
      price,
      rating: Number(
        (stars.reduce((total, n) => total + n, 0) / reviewsCount).toFixed(1),
      ),
      title: sample?.title ?? app.faker.commerce.productName(),
      reviewsCount,
      questionsCount: 3,
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
      categoriesPath: sample
        ? [{ id: categoryId, title: getCategoryById(categoryId)!.title }]
        : getCategoriesPath(),
      characteristics: sample
        ? [
            { label: 'Категория', value: getCategoryById(categoryId)!.title },
            ...(sample.features ?? []),
            { label: 'Артикул', value: String(id) },
          ]
        : getCharacteristics(),
      colorText: sample
        ? (sample.color ?? '')
        : app.faker.helpers.arrayElement([
            'Хлопок и лен серый',
            'Графитовый меланж',
            'Молочный',
            'Темно-синий',
          ]),
      images: sample
        ? [sample.image, ...(sample.gallery ?? [])].map(
            (file) => `/api/assets/product-images/${file}`,
          )
        : app.faker.helpers.maybe(getRandomProductImages, {
            probability: 0.95,
          }),
    };
  },
  {
    count: { min: 2000, max: 5000 },
  },
);

export function getProductById(productId: number): ProductDC | null {
  const product = allProducts.find((item) => item.id === productId);
  if (!product) return null;
  const shop = allShops.find((item) => item.id === product.shopId);
  return {
    ...product,
    feedback: productFeedback(product, shop?.name ?? 'GOZON'),
  };
}

export type ProductSortOption = 'popular' | 'price_asc' | 'price_desc';

export interface QueryProductsFilters {
  collection?: string;
  query?: string;
  categoryId?: string;
  saleOnly?: boolean;
  minPrice?: number;
  maxPrice?: number;
  sort?: ProductSortOption;
}

export function queryProducts(filters: QueryProductsFilters): ProductDC[] {
  const list = allProducts.filter((p) => {
    if (filters.query && !p.title.toLowerCase().includes(filters.query))
      return false;
    if (
      filters.collection &&
      !productShowcase[p.id]?.collections?.includes(filters.collection)
    )
      return false;
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
