import { loadProducts } from '../../../shared/api/api';
import { mapProductToCard } from '../../home/model/map-product-to-card';
import type { ProductCardInfo } from '../../home/model/types';
import { computed, makeObservable, observableRef, when } from 'mobx';
import type { ViewModelParams } from 'mobx-view-model';
import type { Globals } from '../../../globals';
import { PageVM } from '../../../globals/stores/view-models/page-vm';

export class CartPageVM extends PageVM<null> {
  cart = this.globals.stores.cart;
  recommendations: ProductCardInfo[] = [];

  private loadRecommendations = async () => {
    const signal = this.unmountSignal;
    try {
      const { items } = await loadProducts({ limit: 10, offset: 0 }, signal);
      if (!signal.aborted) this.recommendations = items.map(mapProductToCard);
    } catch {
      // The empty cart remains usable if recommendations are unavailable.
    }
  };

  get isEmpty() {
    return !this.isLoading && this.localItems.length === 0;
  }

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

  refreshCart = () => {
    void this.cart.load();
  };

  toggleItem = (productId: number) => {
    this.globals.stores.cart.toggleItem(productId);
  };

  setAllSelected = (value: boolean) => {
    this.globals.stores.cart.setAllSelected(value);
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

  constructor(globals: Globals, params: ViewModelParams) {
    super(globals, params);

    makeObservable(this, {
      recommendations: observableRef,
      summary: computed,
      isEmpty: computed,
      allSelected: computed,
      headerCount: computed,
      localItems: computed,
      promo: computed,
      isLoading: computed,
      loadError: computed,
    });
  }

  willMount() {
    if (this.globals.ssr) {
      this.globals.ssr.head.title = `Корзина — ${this.globals.stores.appInfo.appName}`;
    } else {
      void this.globals.stores.cart.load();
      this.globals.stores.favorites.load();
      when(() => this.isEmpty, this.loadRecommendations, {
        signal: this.unmountSignal,
      });
    }
  }
}
