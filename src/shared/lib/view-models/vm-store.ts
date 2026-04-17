import { when } from 'mobx';
import {
  type AnyViewModel,
  mergeVMConfigs,
  type ViewModelCreateConfig,
  ViewModelStoreBase,
  type ViewModelStoreConfig,
} from 'mobx-view-model';
import type { Globals } from '../../../globals';

export class VMStore extends ViewModelStoreBase {
  constructor(
    private globals: Globals,
    config?: ViewModelStoreConfig,
  ) {
    super(config);
  }

  // с помощью такого метода мы можем дождаться полноценного маунта всех VM
  async waitUnitMountAllViews() {
    await when(() => {
      console.log('this.mountingViews.size', this.mountingViews.size);
      return !this.mountingViews.size;
    });
    console.log("resolve")
  }

  createViewModel<VM extends AnyViewModel>(
    config: ViewModelCreateConfig<VM>,
  ): VM {
    return new config.VM(this.globals, {
      ...config,
      vmConfig: mergeVMConfigs(this.vmConfig, config.vmConfig),
    });
  }
}
