import { assert } from 'yummies/assert';
import type { AnyObject, Maybe } from 'yummies/types';
import { VMStore } from '../shared/lib/view-models/vm-store';
import { Router } from './router';
import { AppInfoStore } from './stores/app-info';
import type { GlobalsCreateParams } from './types';

export class Globals {
  readonly isClient: boolean;
  readonly isServer: boolean;

  readonly router: Router;
  readonly stores: { appInfo: AppInfoStore; viewModels: VMStore };

  constructor(private params: GlobalsCreateParams) {
    this.isClient = typeof window !== 'undefined';
    this.isServer = !this.isClient;
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
    return this.params;
  }
}
