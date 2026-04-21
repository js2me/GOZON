import { computed, makeObservable, observable, runInAction } from 'mobx';
import type { CartDC, CartItemDC, CartPromoDC } from '../../shared/api/api';
import { loadCart, postAddToCart } from '../../shared/api/api';
import { computeCartSummary } from '../../shared/lib/compute-cart-summary';

export type CartBadgeColorType = 'sale' | 'installment' | 'postpay';
export type CartItemStockStatus = 'ok' | 'limited' | 'out';

export interface CartItemBadgeVM {
  label: string;
  colorType: CartBadgeColorType;
}

export interface CartItemVM extends CartItemDC {
  productHref: string;
  isSelected: boolean;
  badges: CartItemBadgeVM[];
  stockStatus: CartItemStockStatus;
}

export class CartStore {
  data: CartDC | null = null;
  isLoading = true;
  addingProductIds = observable.set<number>();
  selectedItemIds = observable.set<string>();
  loadError: string | null = null;

  constructor() {
    makeObservable(this, {
      data: observable.ref,
      isLoading: observable.ref,
      loadError: observable.ref,
      items: computed,
      promo: computed,
      summary: computed,
      allSelected: computed,
      headerCount: computed,
    });
  }

  get items(): CartItemVM[] {
    const rawItems = this.data?.items ?? [];
    return rawItems.map((item, index): CartItemVM => {
      const badges: CartItemBadgeVM[] = [];
      const hasSale = item.price.original > item.price.current;
      if (hasSale) {
        badges.push({ label: 'Распродажа', colorType: 'sale' });
      }
      if (index % 2 === 0) {
        badges.push({ label: '0% до 140 дней', colorType: 'installment' });
      }
      badges.push({ label: 'Постоплата', colorType: 'postpay' });

      const isSelected = this.selectedItemIds.has(item.id);
      const stockStatus =
        item.quantity.maxAvailable <= item.quantity.current + 2
          ? 'limited'
          : 'ok';

      return {
        ...item,
        productHref: `/products/${item.productId}`,
        badges,
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

  removeItem = (id: string) => {
    if (!this.data) {
      return;
    }

    const hasItem = this.data.items.some((item) => item.id === id);
    if (!hasItem) {
      return;
    }

    this.data = {
      ...this.data,
      items: this.data.items.filter((item) => item.id !== id),
    };
    this.selectedItemIds.delete(id);
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
}
