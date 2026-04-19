import { assert } from 'yummies/assert';
import type { AnyObject, Maybe } from 'yummies/types';
import { Router } from './router';
import { AppInfoStore } from './stores/app-info';
import type { GlobalsCreateParams } from './types';
import { SsrApi } from '../server/api/types';
import { ViewModelsStore } from './stores/view-models';

export class Globals {
  readonly isClient: boolean;
  readonly isServer: boolean;

  readonly router: Router;
  readonly stores: { appInfo: AppInfoStore; viewModels: ViewModelsStore };
  readonly db!: SsrApi;

  constructor(private params: GlobalsCreateParams) {
    this.isClient = typeof window !== 'undefined';
    this.isServer = !this.isClient;
    this.db = params.db!;
    this.router = new Router(params.router);
    this.stores = {
      appInfo: new AppInfoStore({
        router: this.router,
        appName: params.appName,
      }),
      viewModels: new ViewModelsStore(this, params.pageContexts),
    };
  }

  static fromSnapshot(ssrData: Maybe<AnyObject>): Globals {
    assert.defined(ssrData, 'Missing SSR data');
    return new Globals(ssrData);
  }

  toSnapshot(): GlobalsCreateParams {
    const { db, ...params } = this.params;
    return {
      ...params,
      pageContexts: this.stores.viewModels.loadedContexts,
    };
  }
}
