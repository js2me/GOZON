export interface ProductCharacteristicDC {
  label: string;
  value: string;
}

export interface ProductCategoryDC {
  id: string;
  title: string;
}

export interface ProductDC {
  id: number;
  shopId: number;
  title: string;
  price: number;
  originalPrice: number;
  rating: number;
  reviewsCount: number;
  questionsCount: number;
  returnPeriodDays: number;
  deliveryText: string;
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

export interface LoadProductsParams {
  limit: number;
  offset: number;
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
  id: string;
  productId: number;
  title: string;
  imageUrl: string;
  variant: string;
  price: CartItemPriceDC;
  quantity: CartItemQuantityDC;
}

export interface CartSummaryDC {
  totalCount: number;
  totalSelectedCount: number;
  totalWeight: string;
  basePrice: number;
  totalDiscount: number;
  finalPriceWithLoyalty: number;
  finalPriceStandard: number;
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

export const loadProducts = async ({
  limit,
  offset,
}: LoadProductsParams): Promise<ProductsChunkDC> => {
  const searchParams = new URLSearchParams({
    limit: String(limit),
    offset: String(offset),
  });
  const response = await fetch(`/api/products?${searchParams.toString()}`);
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

export const postAddToCart = async (productId: number): Promise<CartDC> => {
  const response = await fetch('/api/cart/items', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ productId }),
    credentials: 'include',
  });
  if (!response.ok) {
    throw new Error('Failed to add to cart');
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
