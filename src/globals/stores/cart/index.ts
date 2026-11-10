import { computed, makeObservable, observable, runInAction } from 'mobx';
import type { CartDC, CartItemDC, CartPromoDC } from '../../../shared/api/api';
import {
  changeCartItem,
  loadCart,
  removeCartItem,
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
      promo: observable.ref,
      isLoading: observable.ref,
      loadError: observable.ref,
      isSyncing: observable.ref,
      items: computed,
      summary: computed,
      allSelected: computed,
      headerCount: computed,
    });
  }

  /** Позиции корзины по `productId`; порядок — порядок вставки в карту. */
  private itemsMap = observable.map<number, CartItemDC>();
  promo: CartPromoDC | null = null;
  isLoading = true;
  addingProductIds = observable.set<number>();
  selectedProductIds = observable.set<number>();
  loadError: string | null = null;
  isSyncing = false;
  private loadingPromise: Promise<void> | null = null;
  private mutationPromise: Promise<void> | null = null;

  private mutate(request: () => Promise<CartDC>, error: string): Promise<void> {
    const previous = this.mutationPromise ?? this.loadingPromise;
    const task = (async () => {
      if (previous) await previous;
      try {
        const data = await request();
        runInAction(() => this.applyServerCart(data));
        this.loadError = null;
      } catch {
        this.loadError = error;
      } finally {
        this.isLoading = false;
      }
    })();
    this.mutationPromise = task;
    this.isSyncing = true;
    void task.finally(() => {
      if (this.mutationPromise === task) {
        this.mutationPromise = null;
        this.isSyncing = false;
      }
    });
    return task;
  }

  private getOrderedRawItems(): CartItemDC[] {
    return Array.from(this.itemsMap.values());
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
    if (this.mutationPromise) return this.mutationPromise;
    if (this.loadingPromise) {
      return this.loadingPromise;
    }

    this.isLoading = true;
    this.loadError = null;
    this.loadingPromise = (async () => {
      try {
        const data = await loadCart();
        runInAction(() => this.applyServerCart(data));
      } catch {
        this.loadError = 'Не удалось загрузить корзину';
      } finally {
        this.isLoading = false;
        this.loadingPromise = null;
      }
    })();
    return this.loadingPromise;
  };

  addProduct = async (productId: number) => {
    if (!Number.isInteger(productId) || this.isAddingProduct(productId)) {
      return;
    }

    this.addingProductIds.add(productId);
    await this.mutate(
      () => changeCartItem(productId, 1),
      'Не удалось добавить товар в корзину',
    );
    this.addingProductIds.delete(productId);
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

  increment = (productId: number) => {
    void this.mutate(
      () => changeCartItem(productId, 1),
      'Не удалось изменить корзину',
    );
  };

  decrement = (productId: number) => {
    void this.mutate(
      () => changeCartItem(productId, -1),
      'Не удалось изменить корзину',
    );
  };

  removeItem = (productId: number) => {
    void this.mutate(
      () => removeCartItem(productId),
      'Не удалось удалить товар из корзины',
    );
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
