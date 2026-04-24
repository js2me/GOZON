import { debounce } from 'es-toolkit/function';
import { computed, makeObservable, observable, runInAction } from 'mobx';
import type { CartDC, CartItemDC, CartPromoDC } from '../../../shared/api/api';
import { loadCart, loadProductById, putCart } from '../../../shared/api/api';
import {
  cartPromoForLineCount,
  mapProductToCartItem,
} from '../../../shared/lib/cart-from-product';
import type { Router } from '../../router';
import { computeCartSummary } from './lib/compute-cart-summary';
import type { CartItemBenefit, CartItemInfo } from './types';

export type {
  CartItemBenefit,
  CartItemInfo,
  CartItemStockStatus,
} from './types';

export class CartStore {
  private readonly router: Router;

  constructor(router: Router) {
    this.router = router;
    makeObservable(this, {
      promo: observable.ref,
      isLoading: observable.ref,
      loadError: observable.ref,
      cartSyncInFlight: observable,
      items: computed,
      summary: computed,
      allSelected: computed,
      headerCount: computed,
      isSyncing: computed,
    });
  }

  /** Позиции корзины по `productId`; порядок — порядок вставки в карту. */
  private itemsMap = observable.map<number, CartItemDC>();
  promo: CartPromoDC | null = null;
  isLoading = true;
  addingProductIds = observable.set<number>();
  selectedProductIds = observable.set<number>();
  loadError: string | null = null;
  cartSyncInFlight = 0;
  private cartSyncRequestId = 0;

  private readonly syncCart = debounce(async () => {
    if (this.promo === null) {
      return;
    }

    runInAction(() => {
      this.cartSyncInFlight++;
    });

    const requestId = ++this.cartSyncRequestId;
    const payload = this.getSyncPayload();

    try {
      const data = await putCart(payload);
      runInAction(() => {
        if (requestId !== this.cartSyncRequestId) {
          return;
        }
        this.applyServerCart(data);
      });
    } catch {
      runInAction(() => {
        if (requestId !== this.cartSyncRequestId) {
          return;
        }
        this.loadError = 'Не удалось синхронизировать корзину';
      });
    } finally {
      runInAction(() => {
        this.cartSyncInFlight--;
      });
    }
  }, 350);

  get isSyncing(): boolean {
    return this.cartSyncInFlight > 0;
  }

  private getOrderedRawItems(): CartItemDC[] {
    return Array.from(this.itemsMap.values());
  }

  /** Тело для `PUT /api/cart` — по текущему порядку строк в `itemsMap`. */
  private getSyncPayload() {
    return this.getOrderedRawItems().map((item) => ({
      productId: item.productId,
      quantity: item.quantity.current,
    }));
  }

  get items(): CartItemInfo[] {
    const rawItems = this.getOrderedRawItems();

    return rawItems.map((item, index): CartItemInfo => {
      const types: CartItemBenefit[] = [];
      const hasSale = item.price.original > item.price.current;
      if (hasSale) {
        types.push('sale');
      }
      if (index % 2 === 0) {
        types.push('installment');
      }
      types.push('postpay');

      const isSelected = this.selectedProductIds.has(item.productId);
      const stockStatus =
        item.quantity.maxAvailable <= item.quantity.current + 2
          ? 'limited'
          : 'ok';

      return {
        ...item,
        productHref: this.router.routes.product.createUrl({
          productId: item.productId,
        }),
        types,
        isSelected,
        stockStatus,
      };
    });
  }

  get summary() {
    return computeCartSummary(this.items);
  }

  get allSelected(): boolean {
    return this.items.length > 0 && this.items.every((i) => i.isSelected);
  }

  get headerCount(): number {
    return this.summary.totalCount;
  }

  hasProduct = (productId: number): boolean => {
    return this.itemsMap.has(productId);
  };

  isAddingProduct = (productId: number): boolean => {
    return this.addingProductIds.has(productId);
  };

  load = async () => {
    this.syncCart.cancel();
    this.isLoading = true;
    this.loadError = null;
    try {
      const data = await loadCart();
      runInAction(() => {
        this.applyServerCart(data);
      });
    } catch {
      runInAction(() => {
        this.loadError = 'Не удалось загрузить корзину';
      });
    } finally {
      runInAction(() => {
        this.isLoading = false;
      });
    }
  };

  addProduct = async (productId: number) => {
    if (!Number.isInteger(productId) || this.isAddingProduct(productId)) {
      return;
    }

    this.addingProductIds.add(productId);
    try {
      const existing = this.itemsMap.get(productId);

      if (existing) {
        runInAction(() => {
          this.itemsMap.set(productId, {
            ...existing,
            quantity: {
              ...existing.quantity,
              current: existing.quantity.current + 1,
            },
          });
          this.promo = cartPromoForLineCount(this.itemsMap.size);
        });
        this.syncCart();
        return;
      }

      const product = await loadProductById(productId);
      const lineIndex = this.itemsMap.size;
      const newItem = mapProductToCartItem(product, 1, lineIndex);
      runInAction(() => {
        this.itemsMap.set(newItem.productId, newItem);
        this.promo = cartPromoForLineCount(this.itemsMap.size);
        this.reconcileSelection(
          this.getOrderedRawItems().map((i) => i.productId),
        );
      });
      this.syncCart();
    } catch {
      runInAction(() => {
        this.loadError = 'Не удалось добавить товар в корзину';
      });
    } finally {
      runInAction(() => {
        this.addingProductIds.delete(productId);
      });
    }
  };

  toggleItem = (productId: number) => {
    if (
      (!this.selectedProductIds.has(productId) &&
        !this.itemsMap.has(productId)) ||
      this.promo === null
    ) {
      return;
    }
    if (this.selectedProductIds.has(productId)) {
      this.selectedProductIds.delete(productId);
      return;
    }
    this.selectedProductIds.add(productId);
  };

  setAllSelected = (value: boolean) => {
    if (this.promo === null) {
      return;
    }

    if (value) {
      for (const item of this.itemsMap.values()) {
        this.selectedProductIds.add(item.productId);
      }
      return;
    }
    this.selectedProductIds.clear();
  };

  changeQuantity = (productId: number, nextQty: number) => {
    const raw = this.itemsMap.get(productId);
    if (!raw || this.promo === null) {
      return;
    }

    const clamped = Math.min(
      Math.max(1, Math.trunc(nextQty)),
      raw.quantity.maxAvailable,
    );
    this.itemsMap.set(productId, {
      ...raw,
      quantity: { ...raw.quantity, current: clamped },
    });
    this.syncCart();
  };

  increment = (productId: number) => {
    const item = this.items.find((i) => i.productId === productId);
    if (!item) {
      return;
    }
    this.changeQuantity(productId, item.quantity.current + 1);
  };

  decrement = (productId: number) => {
    const item = this.items.find((i) => i.productId === productId);
    if (!item) {
      return;
    }
    this.changeQuantity(productId, item.quantity.current - 1);
  };

  removeItem = (productId: number) => {
    if (!this.itemsMap.has(productId) || this.promo === null) {
      return;
    }

    runInAction(() => {
      this.itemsMap.delete(productId);
      this.promo = cartPromoForLineCount(this.itemsMap.size);
      this.reconcileSelection(
        this.getOrderedRawItems().map((i) => i.productId),
      );
    });
    this.syncCart();
  };

  private reconcileSelection(orderedProductIds: number[]) {
    const allowed = new Set(orderedProductIds);
    for (const pid of this.selectedProductIds) {
      if (!allowed.has(pid)) {
        this.selectedProductIds.delete(pid);
      }
    }
    if (!this.selectedProductIds.size && orderedProductIds[0] !== undefined) {
      this.selectedProductIds.add(orderedProductIds[0]);
    }
  }

  private applyServerCart(data: CartDC) {
    this.itemsMap.clear();
    for (const item of data.items) {
      this.itemsMap.set(item.productId, item);
    }
    this.promo = data.promo;
    this.reconcileSelection(data.items.map((item) => item.productId));
  }
}
