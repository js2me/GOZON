import { reaction } from 'mobx';
import {
  createBrowserHistory,
  createMemoryHistory,
  createQueryParams,
  type MemoryHistoryOptions,
  type WithObservableHistoryParams,
} from 'mobx-location-history';
import {
  createRoute,
  createVirtualRoute,
  Router as RouterLib,
  routeConfig,
} from 'mobx-route';

export interface RouterParams {
  history?: WithObservableHistoryParams<MemoryHistoryOptions>;
}

const defineRoutes = () => ({
  home: createRoute('/', { exact: true }),
  profile: createRoute('/profile', { exact: true }),
  cart: createRoute('/cart', { exact: true }),
  category: createRoute('/category/:categoryId', { exact: true }),
  product: createRoute('/products/:productId', { exact: true }),
  notFound: createVirtualRoute(),
});

type RoutesMap = ReturnType<typeof defineRoutes>;

export class Router extends RouterLib<RoutesMap> {
  history;

  query;

  constructor(params?: RouterParams) {
    const history =
      typeof window === 'undefined'
        ? createMemoryHistory(params?.history)
        : createBrowserHistory(params?.history);

    const query = createQueryParams({ history });

    routeConfig.set({
      history,
      queryParams: query,
    });

    super({
      routes: defineRoutes(),
      history,
      queryParams: query,
    });

    this.query = query;
    this.history = history;

    const routeKeys = (Object.keys(this.routes) as (keyof RoutesMap)[]).filter(
      (key) => key !== 'notFound',
    );

    reaction(
      () =>
        routeKeys.every(
          (key) => !this.routes[key].isOpening && !this.routes[key].isOpened,
        ),
      (isAllRoutesNotOpened) => {
        if (isAllRoutesNotOpened) {
          this.routes.notFound.open();
        }
      },
      {
        fireImmediately: true,
      },
    );
  }

  navigate() {}
}
