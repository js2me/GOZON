import {
  type AnyViewModel,
  type AnyViewModelSimple,
  mergeVMConfigs,
  type ViewModelCreateConfig,
  ViewModelStoreBase,
} from 'mobx-view-model';
import type { Globals } from '../..';
import { PageContextResource } from './page-context-resource';
import { VM } from './vm';

export class ViewModelsStore extends ViewModelStoreBase {
  readonly pageContextResource: PageContextResource;

  constructor(
    private globals: Globals,
    pageContexts?: AnyObject,
  ) {
    super({
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

    this.pageContextResource = new PageContextResource(pageContexts);
    this.resource = this.pageContextResource;
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
