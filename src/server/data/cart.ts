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

export function getCartDC(sessionId: string): CartDC {
  const stored = cartBySessionId.get(sessionId) ?? [];
  const lines = stored.length > 0 ? stored : [];

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

export function removeCartItem(
  sessionId: string,
  itemId: string,
): { ok: true } | { ok: false; reason: 'not_found' } {
  const cart = getCartDC(sessionId);
  const item = cart.items.find((cartItem) => cartItem.id === itemId);
  if (!item) {
    return { ok: false, reason: 'not_found' };
  }

  const prev = cartBySessionId.get(sessionId) ?? [];
  const next = prev.filter((line) => line.productId !== item.productId);
  cartBySessionId.set(sessionId, next);
  return { ok: true };
}

export function replaceCart(
  sessionId: string,
  lines: SessionCartLine[],
): { ok: true } | { ok: false; reason: 'invalid_payload' } {
  const normalized: SessionCartLine[] = [];

  for (const line of lines) {
    if (!Number.isInteger(line.productId) || !Number.isInteger(line.quantity)) {
      return { ok: false, reason: 'invalid_payload' };
    }
    if (line.quantity <= 0) {
      continue;
    }
    const product = allProducts.find((item) => item.id === line.productId);
    if (!product) {
      return { ok: false, reason: 'invalid_payload' };
    }
    normalized.push({
      productId: line.productId,
      quantity: line.quantity,
    });
  }

  cartBySessionId.set(sessionId, normalized);
  return { ok: true };
}
