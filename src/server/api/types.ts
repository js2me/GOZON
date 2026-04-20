import type { ProductDC, ProfileDC, ShopDC } from '../../shared/api/api';

export interface HeadApi {
  title: string;
}

export interface SSRApi {
  head: HeadApi;
  getProfile(): Promise<ProfileDC>;
  getProductById(productId: number): Promise<ProductDC | null>;
  getShopById(shopId: number): Promise<ShopDC | null>;
  getSystemInfo(): { date: string }
}
