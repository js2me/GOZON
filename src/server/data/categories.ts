import { productShowcase } from './product-showcase';
import type { MainCategory } from '../../globals/stores/category';
import type {
  CategoryPageDC,
  CategorySidebarItemDC,
  CategoryTileDC,
} from '../../shared/api/api';

// Category URLs must keep working after the mock server restarts.
export const CATEGORY_IDS: readonly string[] = [
  'xkt444roxdb8',
  '4eispor8l55j',
  'xcjpx3yypiij',
  'fzptk27f2lr0',
  'c3y3nhrm9gxq',
  'ykro1ikvlcn8',
];

export type CategoryId = (typeof CATEGORY_IDS)[number];

const CATEGORY_TITLES: Record<CategoryId, string> = Object.fromEntries(
  CATEGORY_IDS.map((id, index) => [
    id,
    [
      'Электроника',
      'Одежда и обувь',
      'Дом и сад',
      'Красота и здоровье',
      'Спорт и отдых',
      'Детские товары',
    ][index],
  ]),
) as Record<CategoryId, string>;

const sidebarFor = (activeId: string): CategorySidebarItemDC[] =>
  CATEGORY_IDS.map((id) => ({
    id,
    title: CATEGORY_TITLES[id],
    active: id === activeId,
  }));

const buildGridTiles = (categoryId: string): CategoryTileDC[] => {
  return productShowcase
    .flatMap((product, index) =>
      CATEGORY_IDS[product.category] === categoryId
        ? [
            {
              id: String(index),
              title: product.title,
              imageSrc: `/api/assets/product-images/${product.image}`,
            },
          ]
        : [],
    )
    .slice(0, 12);
};

const pages: Record<string, CategoryPageDC> = Object.fromEntries(
  CATEGORY_IDS.map((id) => {
    const title = CATEGORY_TITLES[id];
    const page: CategoryPageDC = {
      id,
      title,
      subNav: CATEGORY_IDS.filter((other) => other !== id).map((other) => ({
        id: other,
        label: CATEGORY_TITLES[other],
      })),
      gridTiles: buildGridTiles(id),
      ...(id === CATEGORY_IDS[3]
        ? {
            banner: '/category/beauty/0.webp',
            collections: [
              'Уход за лицом',
              'Уход за телом',
              'Уход за волосами',
              'Декоративная косметика',
              'Парфюмерия',
              'Акции и скидки',
            ].map((label, i) => ({
              label,
              imageSrc: `/category/beauty/${i + 1}.webp`,
            })),
          }
        : {}),
      brands:
        id === CATEGORY_IDS[3]
          ? [
              'GRACEFACE',
              'Clarins',
              'DIVAGE',
              'АКС',
              'ARAVIA Professional',
              'GEGEMOON',
              'Vivienne Sabo',
              'Wally Plastic',
            ].map((name, i) => ({
              id: name,
              name,
              imageSrc: `/category/beauty/${i + 7}.webp`,
            }))
          : [],
      sidebarCategories: sidebarFor(id),
    };

    return [id, page];
  }),
);

export function getCategoryById(categoryId: string): CategoryPageDC | null {
  return (
    pages[categoryId === 'kjllp1jfjs1l' ? CATEGORY_IDS[3] : categoryId] ?? null
  );
}

export function getMainCategories(): MainCategory[] {
  return CATEGORY_IDS.map((id) => {
    const page = pages[id];
    return {
      id,
      label: page?.title ?? id,
    };
  });
}
