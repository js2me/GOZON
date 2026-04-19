import {
  createBrowserHistory,
  createMemoryHistory,
  createQueryParams,
  type MemoryHistoryOptions,
  type WithObservableHistoryParams,
} from 'mobx-location-history';
import { createRoute, routeConfig, Router as RouterLib } from 'mobx-route';

export interface RouterParams {
  history?: WithObservableHistoryParams<MemoryHistoryOptions>;
}

const defineRoutes = () => ({
  home: createRoute('/', { exact: true }),
  profile: createRoute('/profile', { exact: true })
})

export class Router extends RouterLib<ReturnType<typeof defineRoutes>> {
  history;

  query;

  constructor(params?: RouterParams) {

    const history = typeof window === 'undefined'
      ? createMemoryHistory(params?.history)
      : createBrowserHistory(params?.history);

    const query = createQueryParams({ history })

    routeConfig.set({
      history,
      queryParams: query,
    })


    super({
      routes: defineRoutes(),
      history,
      queryParams: query,
    })

    this.query = query;
    this.history = history;
  }

  navigate() { }
}
