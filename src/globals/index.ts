import { assert } from 'yummies/assert';
import { Router } from './router';
import { AppInfoStore } from './stores/app-info';
import { CartStore } from './stores/cart/index';
import { CategoryStore } from './stores/category';
import { FavoritesStore } from './stores/favorites';
import { ViewModelsStore } from './stores/view-models';
import type { GlobalsCreateParams } from './types';

export class Globals {
  readonly isClient: boolean;
  readonly isServer: boolean;

  readonly router: Router;
  readonly stores: {
    appInfo: AppInfoStore;
    category: CategoryStore;
    cart: CartStore;
    favorites: FavoritesStore;
    viewModels: ViewModelsStore;
  };

  constructor(private params: GlobalsCreateParams) {
    this.isClient = typeof window !== 'undefined';
    this.isServer = !this.isClient;
    this.router = new Router(params.router);
    this.stores = {
      appInfo: new AppInfoStore({
        router: this.router,
        appName: params.appName,
      }),
      category: new CategoryStore(this.router, params.mainCategories ?? []),
      cart: new CartStore(this.router),
      favorites: new FavoritesStore(),
      viewModels: new ViewModelsStore(this, params.pageContexts),
    };
  }

  get ssr() {
    return this.params.ssr;
  }

  static fromSnapshot(ssrData: Maybe<AnyObject>): Globals {
    assert.defined(ssrData, 'Missing SSR data');
    return new Globals(ssrData);
  }

  toSnapshot(): GlobalsCreateParams {
    const { ssr, ...params } = this.params;
    return {
      ...params,
      pageContexts: this.stores.viewModels.loadedContexts,
    };
  }
}
