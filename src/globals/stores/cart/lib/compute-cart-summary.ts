import type {
  CartItemPriceDC,
  CartItemQuantityDC,
} from '../../../../shared/api/api';
import type { CartSummary } from '../types';

interface CartSummaryInputItem {
  isSelected: boolean;
  price: CartItemPriceDC;
  quantity: CartItemQuantityDC;
}

/** Итоги считаются только по выбранным позициям. */
export function computeCartSummary<TItem extends CartSummaryInputItem>(
  items: TItem[],
): CartSummary {
  const selected = items.filter((i) => i.isSelected);
  const totalCount = items.reduce((s, i) => s + i.quantity.current, 0);
  const totalSelectedCount = selected.reduce(
    (s, i) => s + i.quantity.current,
    0,
  );

  let basePrice = 0;
  let currentSum = 0;
  for (const i of selected) {
    const q = i.quantity.current;
    basePrice += i.price.original * q;
    currentSum += i.price.current * q;
  }
  const totalDiscount = basePrice - currentSum;
  const finalPriceStandard = Math.round(currentSum);
  const loyaltyRatio = 116 / 122;
  const finalPriceWithLoyalty = Math.max(
    0,
    Math.round(finalPriceStandard * loyaltyRatio),
  );

  const totalWeight =
    totalSelectedCount === 1
      ? '11 гр'
      : `${Math.max(1, totalSelectedCount * 11)} гр`;

  return {
    totalCount,
    totalSelectedCount,
    totalWeight,
    basePrice: Math.round(basePrice),
    totalDiscount: Math.round(totalDiscount),
    finalPriceWithLoyalty,
    finalPriceStandard,
  };
}
