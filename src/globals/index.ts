import { assert } from 'yummies/assert';
import { Router } from './router';
import { AppInfoStore } from './stores/app-info';
import { CartStore } from './stores/cart/index';
import { CategoryStore } from './stores/category';
import { FavoritesStore } from './stores/favorites';
import { PageContextResource } from './stores/view-models/page-context-resource';
import { ViewModelsStore } from './stores/view-models/store';
import type { GlobalsCreateParams } from './types';

export class Globals {
  readonly router: Router;
  readonly pageContextResource: PageContextResource;
  readonly stores: {
    appInfo: AppInfoStore;
    category: CategoryStore;
    cart: CartStore;
    favorites: FavoritesStore;
    viewModels: ViewModelsStore;
  };

  constructor(private params: GlobalsCreateParams) {
    this.router = new Router(params.router);
    this.pageContextResource = new PageContextResource(params.pageContexts);
    this.stores = {
      appInfo: new AppInfoStore({
        router: this.router,
        appName: params.appName,
      }),
      category: new CategoryStore(this.router, params.mainCategories ?? []),
      cart: new CartStore(this.router),
      favorites: new FavoritesStore(),
      viewModels: new ViewModelsStore(this, this.pageContextResource),
    };
  }

  get ssr() {
    return this.params.ssr;
  }

  static async fromSnapshot(ssrData: Maybe<AnyObject>): Promise<Globals> {
    assert.defined(ssrData, 'Missing SSR data');
    const globals = new Globals(ssrData);

    // Restore route state so React hydration matches SSR tree structure
    const openedRoutes = (ssrData as GlobalsCreateParams).openedRoutes;
    if (openedRoutes) {
      await Promise.all(
        openedRoutes.map((routeName) => {
          const route =
            globals.router.routes[
              routeName as keyof typeof globals.router.routes
            ];
          if (route && !route.isOpened) {
            return (route.open as () => Promise<void>)();
          }
          return undefined;
        }),
      );
    }

    return globals;
  }

  toSnapshot(): GlobalsCreateParams {
    const { ssr, ...params } = this.params;
    const openedRoutes = Object.entries(this.router.routes)
      .filter(([_, r]) => r.isOpened)
      .map(([name]) => name);
    return {
      ...params,
      openedRoutes,
      pageContexts: this.pageContextResource.snapshot(),
    };
  }
}

export type ServerSideGlobals = Globals &
  DefinedKeys<Pick<Globals, 'ssr'>, 'ssr'>;
