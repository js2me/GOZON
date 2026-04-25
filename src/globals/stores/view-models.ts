import { computed, makeObservable, observable, when } from 'mobx';
import {
  type AnyViewModel,
  mergeVMConfigs,
  type ViewModelCreateConfig,
  ViewModelStoreBase,
} from 'mobx-view-model';
import { PageVM } from '../../shared/lib/view-models/page-vm';
import type { Globals } from '..';

export class ViewModelsStore extends ViewModelStoreBase {
  loadedContexts: AnyObject;
  loadingContexts;

  constructor(
    private globals: Globals,
    pageContexts?: AnyObject,
  ) {
    super({
      vmConfig: {
        useReactIds: true,
        observable: {
          viewModels: {
            useDecorators: false,
          },
          viewModelStores: {
            useDecorators: false,
          },
        },
        suspendUntil: () => {
          if (globals.isServer) {
            return when(() => !this.loadingContexts.size);
          }
        },
      },
    });

    this.loadingContexts = observable.set<string>();
    this.loadedContexts = { ...pageContexts };

    makeObservable(this, {
      isContextLoaded: computed,
      loadedContexts: observable.shallow,
    });
  }

  get isContextLoaded() {
    return !this.loadingContexts.size;
  }

  createViewModel<VM extends AnyViewModel>(
    config: ViewModelCreateConfig<VM>,
  ): VM {
    const vm = new config.VM(this.globals, {
      ...config,
      vmConfig: mergeVMConfigs(this.vmConfig, config.vmConfig),
    });

    if (vm instanceof PageVM && !vm.ctx && this.globals.isServer) {
      this.loadingContexts.add(vm.id);

      console.log('inti?:))))');

      vm.init(this.globals.ssr)
        .then((ctx) => {
          this.loadedContexts[vm.id] = ctx;
        })
        .finally(() => {
          this.loadingContexts.delete(vm.id);
        });
    }

    return vm;
  }
}
