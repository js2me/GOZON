import { computed, makeObservable, observable, runInAction } from 'mobx';
import type { CartDC, CartPromoDC } from '../../../shared/api/api';
import {
  deleteCartItem,
  loadCart,
  postAddToCart,
  putCart,
} from '../../../shared/api/api';
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
      data: observable.ref,
      isLoading: observable.ref,
      loadError: observable.ref,
      cartSyncInFlight: observable,
      items: computed,
      promo: computed,
      summary: computed,
      allSelected: computed,
      headerCount: computed,
      isSyncing: computed,
    });
  }

  data: CartDC | null = null;
  isLoading = true;
  addingProductIds = observable.set<number>();
  selectedItemIds = observable.set<string>();
  loadError: string | null = null;
  cartSyncInFlight = 0;
  private cartSyncRequestId = 0;

  get isSyncing(): boolean {
    return this.cartSyncInFlight > 0;
  }

  get items(): CartItemInfo[] {
    const rawItems = this.data?.items ?? [];

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

      const isSelected = this.selectedItemIds.has(item.id);
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

  get promo(): CartPromoDC | null {
    return this.data?.promo ?? null;
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
    return this.items.some((item) => item.productId === productId);
  };

  isAddingProduct = (productId: number): boolean => {
    return this.addingProductIds.has(productId);
  };

  load = async () => {
    this.isLoading = true;
    this.loadError = null;
    try {
      const data = await loadCart();
      runInAction(() => {
        this.setData(data);
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
      const data = await postAddToCart(productId);
      runInAction(() => {
        this.setData(data);
      });
      void this.syncCart();
    } finally {
      runInAction(() => {
        this.addingProductIds.delete(productId);
      });
    }
  };

  toggleItem = (id: string) => {
    if (
      !this.data ||
      (!this.selectedItemIds.has(id) &&
        !this.data.items.some((item) => item.id === id))
    ) {
      return;
    }
    if (this.selectedItemIds.has(id)) {
      this.selectedItemIds.delete(id);
      return;
    }
    this.selectedItemIds.add(id);
  };

  setAllSelected = (value: boolean) => {
    if (!this.data) {
      return;
    }

    if (value) {
      for (const item of this.data.items) {
        this.selectedItemIds.add(item.id);
      }
      return;
    }
    this.selectedItemIds.clear();
  };

  changeQuantity = (id: string, nextQty: number) => {
    if (!this.data) {
      return;
    }

    this.data = {
      ...this.data,
      items: this.items.map((item) => {
        if (item.id !== id) {
          return item;
        }

        const clamped = Math.min(
          Math.max(1, Math.trunc(nextQty)),
          item.quantity.maxAvailable,
        );
        return {
          ...item,
          quantity: { ...item.quantity, current: clamped },
        };
      }),
    };
    this.syncCart();
  };

  increment = (id: string) => {
    const item = this.items.find((i) => i.id === id);
    if (!item) {
      return;
    }
    this.changeQuantity(id, item.quantity.current + 1);
  };

  decrement = (id: string) => {
    const item = this.items.find((i) => i.id === id);
    if (!item) {
      return;
    }
    this.changeQuantity(id, item.quantity.current - 1);
  };

  removeItem = async (id: string) => {
    if (!this.data) {
      return;
    }

    const hasItem = this.data.items.some((item) => item.id === id);
    if (!hasItem) {
      return;
    }

    try {
      const data = await deleteCartItem(id);
      runInAction(() => {
        this.setData(data);
      });
      void this.syncCart();
    } catch {
      runInAction(() => {
        this.loadError = 'Не удалось удалить товар из корзины';
      });
    }
  };

  private setData(data: CartDC) {
    this.data = data;
    const allowedIds = new Set(data.items.map((item) => item.id));
    for (const id of this.selectedItemIds) {
      if (!allowedIds.has(id)) {
        this.selectedItemIds.delete(id);
      }
    }
    if (!this.selectedItemIds.size && data.items[0]) {
      this.selectedItemIds.add(data.items[0].id);
    }
  }

  private syncCart = async () => {
    if (!this.data) {
      return;
    }

    runInAction(() => {
      this.cartSyncInFlight++;
    });

    const requestId = ++this.cartSyncRequestId;
    const payload = this.data.items.map((item) => ({
      productId: item.productId,
      quantity: item.quantity.current,
    }));

    try {
      const data = await putCart(payload);
      runInAction(() => {
        if (requestId !== this.cartSyncRequestId) {
          return;
        }
        this.setData(data);
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
  };
}
