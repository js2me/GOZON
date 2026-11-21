import { computed, makeObservable, observableRef } from 'mobx';
import type { ViewModelParams } from 'mobx-view-model';
import type { Globals } from '../../globals';
import { PageVM } from '../../globals/stores/view-models/page-vm';
import { loadFavoriteProducts, type ProductDC } from '../../shared/api/api';
import { mapProductToCard } from '../home/model/map-product-to-card';

export class FavoritesPageVM extends PageVM {
  products: ProductDC[] | null = null;
  failed = false;
  favorites = this.globals.stores.favorites;

  constructor(globals: Globals, params: ViewModelParams) {
    super(globals, params);
    makeObservable(this, {
      products: observableRef,
      failed: observableRef,
      items: computed,
    });
  }

  get items() {
    return this.products
      ?.filter((item) => this.favorites.hasProduct(item.id))
      .map(mapProductToCard);
  }

  load = async () => {
    const signal = this.unmountSignal;
    this.failed = false;
    try {
      const [, items] = await Promise.all([
        this.favorites.load(),
        loadFavoriteProducts(signal),
      ]);
      if (!signal.aborted) {
        this.products = items;
        this.failed = Boolean(this.favorites.loadError);
      }
    } catch {
      if (!signal.aborted) this.failed = true;
    }
  };

  willMount() {
    if (this.globals.ssr) this.globals.ssr.head.title = 'Избранное — GOZON';
    else void this.load();
  }
}
