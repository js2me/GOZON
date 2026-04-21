import type {
  CartDC,
  CartItemDC,
  CartPromoDC,
  ProductDC,
} from '../../shared/api/api';
import { allProducts } from './products';

interface SessionCartLine {
  productId: number;
  quantity: number;
}

const cartBySessionId = new Map<string, SessionCartLine[]>();

const VARIANTS = ['Белый', 'Чёрный', 'Синий', 'Серый', 'Графит'];

function mapProductToCartItem(
  product: ProductDC,
  quantity: number,
  index: number,
): CartItemDC {
  const maxAvailable = index === 0 ? Math.max(quantity + 2, 3) : 99;

  return {
    id: `cart-${product.id}-${index}`,
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

/** Демо-корзина при пустой сессии: 36 шт., выбрана первая позиция. */
function defaultDemoLines(): SessionCartLine[] {
  const p = allProducts;
  return [
    { productId: p[0]!.id, quantity: 1 },
    { productId: p[1]!.id, quantity: 5 },
    { productId: p[2]!.id, quantity: 10 },
    { productId: p[3]!.id, quantity: 20 },
  ];
}

export function getCartDC(sessionId: string): CartDC {
  const stored = cartBySessionId.get(sessionId) ?? [];
  const lines = stored.length > 0 ? stored : defaultDemoLines();

  const items: CartItemDC[] = [];
  for (let index = 0; index < lines.length; index++) {
    const line = lines[index]!;
    const product = allProducts.find((p) => p.id === line.productId);
    if (!product) {
      continue;
    }
    items.push(mapProductToCartItem(product, line.quantity, index));
  }

  const promo: CartPromoDC = {
    saleDeadline: lines.length === 0 ? '—' : 'Осталось 2 дня',
    itemsPriceIncreasingCount: lines.length === 0 ? 0 : 18,
  };

  return { items, promo };
}

export function addProductToCart(
  sessionId: string,
  productId: number,
): { ok: true } | { ok: false; reason: 'not_found' } {
  const product = allProducts.find((item) => item.id === productId);
  if (!product) {
    return { ok: false, reason: 'not_found' };
  }

  const prev = cartBySessionId.get(sessionId) ?? [];
  const existing = prev.find((item) => item.productId === productId);
  let items: SessionCartLine[];
  if (existing) {
    items = prev.map((item) =>
      item.productId === productId
        ? { ...item, quantity: item.quantity + 1 }
        : item,
    );
  } else {
    items = [...prev, { productId, quantity: 1 }];
  }

  cartBySessionId.set(sessionId, items);
  return { ok: true };
}
