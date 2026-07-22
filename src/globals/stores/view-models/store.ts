import { computed, makeObservable, observable } from 'mobx';
import {
  type AnyViewModel,
  AnyViewModelSimple, mergeVMConfigs,
  type ViewModelCreateConfig,
  ViewModelStoreBase
} from 'mobx-view-model';
import { VM } from './vm';
import type { Globals } from '../..';

export class ViewModelsStore extends ViewModelStoreBase {
  loadedContexts: AnyObject;
  loadingContexts;

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
        }
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

  create(config: ViewModelCreateConfig<AnyViewModel | AnyViewModelSimple>): any {
    if (!VM.is(config.VM)) {
      return super.create(config);
    }

    const VMConstructor = config.VM as typeof VM;

    const vm = new VMConstructor(this.globals, {
      ...config,
      vmConfig: mergeVMConfigs(this.vmConfig, config.vmConfig),
    });

    // if (vm instanceof PageVM && !vm.ctx && this.globals.ssr) {
    //   this.loadingContexts.add(vm.id);

    //   vm.initOnServer()
    //     .then(() => {
    //       this.loadedContexts[vm.id] = vm.ctx;
    //     })
    //     .finally(() => {
    //       this.loadingContexts.delete(vm.id);
    //     });
    // }

    return vm;
  }
}
