export interface ProductCharacteristicDC {
  label: string;
  value: string;
}

/** Варианты доставки с бэка (строковый enum в JSON). */
export enum ProductDeliveryVariant {
  PartnerCourier = 'partner_courier',
  PartnerPickupPoints = 'partner_pickup_points',
}

export interface ProductCategoryDC {
  id: string;
  title: string;
}

export interface ProductDC {
  id: number;
  /** Каталоговая категория (страница `/category/:categoryId`). */
  categoryId: string;
  shopId: number;
  title: string;
  price: number;
  originalPrice: number;
  rating: number;
  reviewsCount: number;
  questionsCount: number;
  returnPeriodDays: number;
  deliveryText: string;
  deliveryVariants: ProductDeliveryVariant[];
  hasPriceDropBadge: boolean;
  categoriesPath: ProductCategoryDC[];
  characteristics: ProductCharacteristicDC[];
  colorText: string;
  images?: string[];
}

export interface ShopDC {
  id: number;
  name: string;
}

export interface CategorySubNavItemDC {
  id: string;
  label: string;
}

export interface CategoryTileDC {
  id: string;
  title: string;
  imageSrc: string;
}

export interface CategoryBrandDC {
  id: string;
  name: string;
}

export interface CategorySidebarItemDC {
  id: string;
  title: string;
  active?: boolean;
}

export interface CategoryPageDC {
  id: string;
  title: string;
  subNav: CategorySubNavItemDC[];
  /** Доп. пункты для выпадающего «Ещё». */
  subNavMore?: CategorySubNavItemDC[];
  gridTiles: CategoryTileDC[];
  brands: CategoryBrandDC[];
  sidebarCategories: CategorySidebarItemDC[];
}

export type ProductSortParam = 'popular' | 'price_asc' | 'price_desc';

export interface LoadProductsParams {
  limit: number;
  offset: number;
  /** Фильтр по категории маркетплейса. */
  categoryId?: string;
  /** Только товары со скидкой (цена ниже оригинальной). */
  saleOnly?: boolean;
  minPrice?: number;
  maxPrice?: number;
  sort?: ProductSortParam;
}

export interface ProductsChunkDC {
  items: ProductDC[];
  hasMore: boolean;
}

export interface ProfileDC {
  firstName: string;
  lastName: string;
  dateBirth: string;
  male: boolean;
  address: string;
}

export interface ProfileRatingProductDC {
  id: string;
  title: string;
}

export interface ProfileViewedProductDC {
  id: string;
  brand: string;
  title: string;
  imageSrc: string;
  price: string;
  originalPrice?: string;
  discount?: string;
  badge?: { label: string } | null;
}

export interface CartItemPriceDC {
  current: number;
  original: number;
  currency: '₽';
}

export interface CartItemQuantityDC {
  current: number;
  maxAvailable: number;
}

export interface CartItemDC {
  productId: number;
  title: string;
  imageUrl: string;
  variant: string;
  price: CartItemPriceDC;
  quantity: CartItemQuantityDC;
}

export interface CartPromoDC {
  saleDeadline: string;
  itemsPriceIncreasingCount: number;
}

/** Полное состояние корзины — один ответ `GET /api/cart`. */
export interface CartDC {
  items: CartItemDC[];
  promo: CartPromoDC;
}

export interface SyncCartItemPayload {
  productId: number;
  quantity: number;
}

export interface FavoritesDC {
  productIds: number[];
}

export const loadProducts = async (
  params: LoadProductsParams,
): Promise<ProductsChunkDC> => {
  const searchParams = new URLSearchParams({
    limit: String(params.limit),
    offset: String(params.offset),
  });
  if (params.categoryId) {
    searchParams.set('categoryId', params.categoryId);
  }
  if (params.saleOnly) {
    searchParams.set('saleOnly', '1');
  }
  if (params.minPrice != null && Number.isFinite(params.minPrice)) {
    searchParams.set('minPrice', String(params.minPrice));
  }
  if (params.maxPrice != null && Number.isFinite(params.maxPrice)) {
    searchParams.set('maxPrice', String(params.maxPrice));
  }
  if (params.sort && params.sort !== 'popular') {
    searchParams.set('sort', params.sort);
  }
  const response = await fetch(`/api/products?${searchParams.toString()}`);
  return response.json();
};

export const loadCategoryById = async (
  categoryId: string,
): Promise<CategoryPageDC | null> => {
  const response = await fetch(
    `/api/categories/${encodeURIComponent(categoryId)}`,
  );
  if (response.status === 404) {
    return null;
  }
  if (!response.ok) {
    throw new Error('Category load failed');
  }
  return response.json();
};

export const loadProductById = async (
  productId: number,
): Promise<ProductDC> => {
  const response = await fetch(`/api/products/${productId}`);
  if (!response.ok) {
    throw new Error('Product not found');
  }

  return response.json();
};

export const loadShopById = async (shopId: number): Promise<ShopDC> => {
  const response = await fetch(`/api/shops/${shopId}`);
  if (!response.ok) {
    throw new Error('Shop not found');
  }

  return response.json();
};

export const loadProfile = async (): Promise<ProfileDC> => {
  const response = await fetch('/api/profile');
  return response.json();
};

export const loadProfileRatingProducts = async (): Promise<
  ProfileRatingProductDC[]
> => {
  const response = await fetch('/api/profile/rating-products');
  return response.json();
};

export const loadProfileViewedProducts = async (): Promise<
  ProfileViewedProductDC[]
> => {
  const response = await fetch('/api/profile/viewed-products');
  return response.json();
};

export const putCart = async (
  items: SyncCartItemPayload[],
): Promise<CartDC> => {
  const response = await fetch('/api/cart', {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ items }),
    credentials: 'include',
  });
  if (!response.ok) {
    throw new Error('Failed to sync cart');
  }

  return response.json();
};

export const loadCart = async (): Promise<CartDC> => {
  const response = await fetch('/api/cart', { credentials: 'include' });
  if (!response.ok) {
    throw new Error('Cart load failed');
  }

  return response.json();
};

export const loadFavorites = async (): Promise<FavoritesDC> => {
  const response = await fetch('/api/favorites', { credentials: 'include' });
  if (!response.ok) {
    throw new Error('Favorites load failed');
  }

  return response.json();
};

export const putFavorites = async (
  productIds: number[],
): Promise<FavoritesDC> => {
  const response = await fetch('/api/favorites', {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ productIds }),
    credentials: 'include',
  });
  if (!response.ok) {
    throw new Error('Failed to sync favorites');
  }

  return response.json();
};
