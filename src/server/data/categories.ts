import { readdirSync } from 'node:fs';
import path from 'node:path';

import type {
  CategoryBrandDC,
  CategoryPageDC,
  CategorySidebarItemDC,
  CategorySubNavItemDC,
  CategoryTileDC,
} from '../../shared/api/api';
import type { MainCategory } from '../../globals/stores/category';
import { app } from '../app';

const productImagesDir = path.resolve(
  app.serverDir,
  'data/assets/product-images',
);
const productImageUrls = readdirSync(productImagesDir)
  .filter((filename) => filename.endsWith('.webp'))
  .map((filename) => `/api/assets/product-images/${filename}`);

const CATEGORY_ID_COUNT = 6;

function buildUniqueCategoryIds(count: number): string[] {
  const ids = new Set<string>();
  while (ids.size < count) {
    ids.add(
      app.faker.string.alphanumeric({ length: 12, casing: 'lower' }),
    );
  }
  return [...ids];
}

/** Идентификаторы категорий — совпадают с `ProductDC.categoryId`, задаются faker при старте. */
export const CATEGORY_IDS: readonly string[] = buildUniqueCategoryIds(
  CATEGORY_ID_COUNT,
);

export type CategoryId = (typeof CATEGORY_IDS)[number];

/** Заголовки категорий — один раз через faker при старте процесса. */
const CATEGORY_TITLES: Record<CategoryId, string> = Object.fromEntries(
  CATEGORY_IDS.map((id) => [id, app.faker.commerce.department()]),
) as Record<CategoryId, string>;

const sidebarFor = (activeId: string): CategorySidebarItemDC[] =>
  CATEGORY_IDS.map((id) => ({
    id,
    title: CATEGORY_TITLES[id],
    active: id === activeId,
  }));

const buildSubNav = (): CategorySubNavItemDC[] =>
  app.faker.helpers.multiple(
    () => ({
      id: app.faker.string.alphanumeric({ length: 8, casing: 'lower' }),
      label: app.faker.commerce.department(),
    }),
    {
      count: app.faker.number.int({ min: 4, max: 7 }),
    },
  );

const buildSubNavMore = (): CategorySubNavItemDC[] | undefined => {
  if (!app.faker.datatype.boolean(0.5)) {
    return undefined;
  }

  return app.faker.helpers.multiple(
    () => ({
      id: app.faker.string.alphanumeric({ length: 8, casing: 'lower' }),
      label: app.faker.commerce.productAdjective(),
    }),
    {
      count: app.faker.number.int({ min: 2, max: 4 }),
    },
  );
};

const buildBrands = (): CategoryBrandDC[] =>
  app.faker.helpers.multiple(
    () => ({
      id: app.faker.string.alphanumeric({ length: 6, casing: 'lower' }),
      name: app.faker.company.name(),
    }),
    {
      count: app.faker.number.int({ min: 2, max: 6 }),
    },
  );

const buildGridTiles = (categoryId: string): CategoryTileDC[] => {
  if (productImageUrls.length === 0) {
    return [];
  }

  const shuffled = app.faker.helpers.shuffle([...productImageUrls]);
  const count = app.faker.number.int({ min: 8, max: 12 });

  return Array.from({ length: count }, (_, index) => ({
    id: `${categoryId}-${app.faker.string.alphanumeric({ length: 8, casing: 'lower' })}`,
    title: app.faker.commerce.productName(),
    imageSrc: shuffled[index % shuffled.length]!,
  }));
};

const pages: Record<string, CategoryPageDC> = Object.fromEntries(
  CATEGORY_IDS.map((id) => {
    const title = CATEGORY_TITLES[id];
    const page: CategoryPageDC = {
      id,
      title,
      subNav: buildSubNav(),
      subNavMore: buildSubNavMore(),
      gridTiles: buildGridTiles(id),
      brands: buildBrands(),
      sidebarCategories: sidebarFor(id),
    };

    return [id, page];
  }),
);

export function getCategoryById(categoryId: string): CategoryPageDC | null {
  return pages[categoryId] ?? null;
}

const MAIN_CATEGORY_IDS: CategoryId[] = app.faker.helpers
  .shuffle([...CATEGORY_IDS])
  .slice(0, 3);

export function getMainCategories(): MainCategory[] {
  return MAIN_CATEGORY_IDS.map((id) => {
    const page = pages[id];
    return {
      id,
      label: page?.title ?? id,
    };
  });
}
