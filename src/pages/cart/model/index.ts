import { computed, makeObservable } from 'mobx';
import { PageVM } from '../../../shared/lib/view-models/page-vm';

export class CartPageVM extends PageVM<null> {
  get summary() {
    return this.globals.stores.cart.summary;
  }

  get allSelected(): boolean {
    return this.globals.stores.cart.allSelected;
  }

  get headerCount(): number {
    return this.globals.stores.cart.headerCount;
  }

  get localItems() {
    return this.globals.stores.cart.items;
  }

  get promo() {
    return this.globals.stores.cart.promo;
  }

  get isLoading() {
    return this.globals.stores.cart.isLoading;
  }

  get loadError() {
    return this.globals.stores.cart.loadError;
  }

  toggleItem = (id: string) => {
    this.globals.stores.cart.toggleItem(id);
  };

  setAllSelected = (value: boolean) => {
    this.globals.stores.cart.setAllSelected(value);
  };

  changeQuantity = (id: string, nextQty: number) => {
    this.globals.stores.cart.changeQuantity(id, nextQty);
  };

  increment = (id: string) => {
    this.globals.stores.cart.increment(id);
  };

  decrement = (id: string) => {
    this.globals.stores.cart.decrement(id);
  };

  removeItem = (id: string) => {
    this.globals.stores.cart.removeItem(id);
  };

  toggleFavorite = (id: string) => {
    const item = this.globals.stores.cart.items.find((cartItem) => cartItem.id === id);
    if (!item) {
      return;
    }
    this.globals.stores.favorites.toggleProduct(item.productId);
  };

  isFavorite = (id: string): boolean => {
    const item = this.globals.stores.cart.items.find((cartItem) => cartItem.id === id);
    if (!item) {
      return false;
    }
    return this.globals.stores.favorites.hasProduct(item.productId);
  };

  protected willMount(): void {
    makeObservable(this, {
      summary: computed,
      allSelected: computed,
      headerCount: computed,
      localItems: computed,
      promo: computed,
      isLoading: computed,
      loadError: computed,
    });

    if (this.globals.isClient) {
      void this.globals.stores.cart.load();
      this.globals.stores.favorites.load();
    }
  }

  async init(): Promise<null> {
    this.globals.ssr.head.title = `Корзина — ${this.globals.stores.appInfo.appName}`;
    return null;
  }
}
