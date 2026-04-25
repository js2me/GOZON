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

  toggleItem = (productId: number) => {
    this.globals.stores.cart.toggleItem(productId);
  };

  setAllSelected = (value: boolean) => {
    this.globals.stores.cart.setAllSelected(value);
  };

  changeQuantity = (productId: number, nextQty: number) => {
    this.globals.stores.cart.changeQuantity(productId, nextQty);
  };

  increment = (productId: number) => {
    this.globals.stores.cart.increment(productId);
  };

  decrement = (productId: number) => {
    this.globals.stores.cart.decrement(productId);
  };

  removeItem = (productId: number) => {
    this.globals.stores.cart.removeItem(productId);
  };

  toggleFavorite = (productId: number) => {
    this.globals.stores.favorites.toggleProduct(productId);
  };

  isFavorite = (productId: number): boolean => {
    return this.globals.stores.favorites.hasProduct(productId);
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

    this.onInit(ssr => {
      if (ssr) {
        ssr.head.title = `Корзина — ${this.globals.stores.appInfo.appName}`
      } else {
        void this.globals.stores.cart.load();
        this.globals.stores.favorites.load();
      }
    })
  }
}
