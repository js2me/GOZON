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
  }

  navigate() {}
}
