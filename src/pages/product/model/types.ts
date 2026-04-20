import type { ProductDC, ProfileDC, ShopDC } from '../../../shared/api/api';

export interface ProductPageContext {
  product: ProductDC | null;
  profile: ProfileDC | null;
  shop: ShopDC | null;
}
