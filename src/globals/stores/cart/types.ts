import type { CartItemDC } from '../../../shared/api/api';

export interface CartSummary {
  totalCount: number;
  totalSelectedCount: number;
  totalWeight: string;
  basePrice: number;
  totalDiscount: number;
  finalPriceWithLoyalty: number;
  finalPriceStandard: number;
}

export type CartItemBenefit = 'sale' | 'installment' | 'postpay';
export type CartItemStockStatus = 'ok' | 'limited' | 'out';

export interface CartItemInfo extends CartItemDC {
  productHref: string;
  isSelected: boolean;
  types: CartItemBenefit[];
  stockStatus: CartItemStockStatus;
}
