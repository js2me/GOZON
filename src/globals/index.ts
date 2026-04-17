import { assert } from 'yummies/assert';
import type { AnyObject, Maybe } from 'yummies/types';
import { VMStore } from '../shared/lib/view-models/vm-store';
import { Router } from './router';
import { AppInfoStore } from './stores/app-info';
import type { GlobalsCreateParams } from './types';
import { SsrApi } from '../server/api/types';

export class Globals {
  readonly isClient: boolean;
  readonly isServer: boolean;

  readonly router: Router;
  readonly stores: { appInfo: AppInfoStore; viewModels: VMStore };
  readonly db!: SsrApi;
  readonly ctx: AnyObject;

  constructor(private params: GlobalsCreateParams) {
    this.isClient = typeof window !== 'undefined';
    this.isServer = !this.isClient;
    this.db = params.ssrApi!;
    this.ctx = params.ctx??{};
    this.router = new Router(params.router);
    this.stores = {
      appInfo: new AppInfoStore({
        router: this.router,
        appName: params.appName,
      }),
      viewModels: new VMStore(this, {
        vmConfig: {
          observable: {
            viewModels: {
              useDecorators: false,
            },
            viewModelStores: {
              useDecorators: false,
            },
          },
        },
      }),
    };
  }

  static fromSnapshot(ssrData: Maybe<AnyObject>): Globals {
    assert.defined(ssrData, 'Missing SSR data');
    return new Globals(ssrData);
  }

  toSnapshot(): GlobalsCreateParams {
    const { ssrApi, ...params } = this.params;
    return {
      ...params,
      ctx: this.ctx
    };
  }
}
