import { computed, makeObservable, observable, when } from 'mobx';
import {
  type AnyViewModel,
  mergeVMConfigs,
  type ViewModelCreateConfig,
  ViewModelStoreBase,
} from 'mobx-view-model';
import { PageVM } from '../../shared/lib/view-models/page-vm';
import type { VM } from '../../shared/lib/view-models/vm';
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

  createViewModel(config: ViewModelCreateConfig<AnyViewModel>): any {
    const VMClass = config.VM as unknown as Class<
      VM | PageVM,
      ConstructorParameters<typeof VM | typeof PageVM>
    >;
    const vm = new VMClass(this.globals, {
      ...config,
      vmConfig: mergeVMConfigs(this.vmConfig, config.vmConfig),
    });

    vm.didCreate();

    if (vm instanceof PageVM && !vm.ctx && this.globals.isServer) {
      this.loadingContexts.add(vm.id);

      vm.initOnServer(this.globals.ssr)
        .then(() => {
          this.loadedContexts[vm.id] = vm.ctx;
        })
        .finally(() => {
          this.loadingContexts.delete(vm.id);
        });
    }

    return vm;
  }
}
