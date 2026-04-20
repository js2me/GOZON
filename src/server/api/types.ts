import type { ProductDC, ProfileDC, ShopDC } from '../../shared/api/api';

export interface SsrApi {
  getProfile(): Promise<ProfileDC>;
  getProductById(productId: number): Promise<ProductDC | null>;
  getShopById(shopId: number): Promise<ShopDC | null>;
  getSystemInfo(): { date: string }
}
