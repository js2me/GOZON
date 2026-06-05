import type {
  CategoryPageDC,
  ProductDC,
  ProfileDC,
  ShopDC,
} from '../../shared/api/api';

export interface HeadApi {
  title: string;
  description?: string;
  /** Open Graph */
  ogTitle?: string;
  ogDescription?: string;
  /** Абсолютный или корневой URL изображения (для шаринга лучше абсолютный). */
  ogImage?: string;
  ogUrl?: string;
  /** Например `website`, `product`, `article`. */
  ogType?: string;
  ogSiteName?: string;
  /** Например `ru_RU`. */
  ogLocale?: string;
  /** Twitter Card */
  twitterCard?: 'summary' | 'summary_large_image';
  twitterTitle?: string;
  twitterDescription?: string;
  twitterImage?: string;
}

export interface SSRApi {
  head: HeadApi;
  getProfile(): Promise<ProfileDC>;
  getProductById(productId: number): Promise<ProductDC | null>;
  getShopById(shopId: number): Promise<ShopDC | null>;
  getCategoryById(categoryId: string): Promise<CategoryPageDC | null>;
  getSystemInfo(): { date: string };
}
