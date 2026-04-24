import type { CartItemDC, CartPromoDC, ProductDC } from '../api/api';

const VARIANTS = ['Белый', 'Чёрный', 'Синий', 'Серый', 'Графит'] as const;

export function cartPromoForLineCount(lineCount: number): CartPromoDC {
  return {
    saleDeadline: lineCount === 0 ? '—' : 'Осталось 2 дня',
    itemsPriceIncreasingCount: lineCount === 0 ? 0 : 18,
  };
}

export function mapProductToCartItem(
  product: ProductDC,
  quantity: number,
  index: number,
): CartItemDC {
  const maxAvailable = index === 0 ? Math.max(quantity + 2, 3) : 99;

  return {
    productId: product.id,
    title: product.title,
    imageUrl: product.images?.[0] ?? '/vite.svg',
    variant: VARIANTS[index % VARIANTS.length] ?? 'Белый',
    price: {
      current: Math.round(product.price),
      original: Math.round(product.originalPrice),
      currency: '₽',
    },
    quantity: {
      current: quantity,
      maxAvailable,
    },
  };
}
