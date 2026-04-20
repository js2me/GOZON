export interface ProductDC {
  id: number;
  shopId: number;
  title: string;
  price: number;
  originalPrice: number;
  rating: number;
  reviewsCount: number;
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

export const loadProductById = async (productId: number): Promise<ProductDC> => {
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
