import {
  type AnyViewModel,
  type AnyViewModelSimple,
  mergeVMConfigs,
  type ViewModelCreateConfig,
  ViewModelStoreBase,
} from 'mobx-view-model';
import type { Globals } from '../..';
import type { PageContextResource } from './page-context-resource';
import { VM } from './vm';

export class ViewModelsStore extends ViewModelStoreBase {
  constructor(
    private globals: Globals,
    pageContextResource: PageContextResource,
  ) {
    super({
      resource: pageContextResource,
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
    });
  }

  create(
    config: ViewModelCreateConfig<AnyViewModel | AnyViewModelSimple>,
  ): any {
    if (!VM.is(config.VM)) {
      return super.create(config);
    }

    const VMConstructor = config.VM as typeof VM;

    const vm = new VMConstructor(this.globals, {
      ...config,
      vmConfig: mergeVMConfigs(this.vmConfig, config.vmConfig),
    });

    return vm;
  }
}
