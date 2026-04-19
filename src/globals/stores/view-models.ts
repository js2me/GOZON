import { computed, makeObservable, observable } from 'mobx';
import {
  type AnyViewModel,
  mergeVMConfigs,
  type ViewModelCreateConfig, ViewModelStoreBase
} from 'mobx-view-model';
import { Globals } from '..';
import { PageVM } from '../../shared/lib/view-models/page-vm';
import { AnyObject } from 'yummies/types';

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
      },
    });

    this.loadingContexts = observable.set<string>();
    this.loadedContexts = { ...pageContexts }

    makeObservable(this, {
      isContextLoaded: computed,
      loadedContexts: observable.shallow
    });
  }

  get isContextLoaded() {
    return !this.loadingContexts.size
  }

  createViewModel<VM extends AnyViewModel>(
    config: ViewModelCreateConfig<VM>,
  ): VM {
    const vm = new config.VM(this.globals, {
      ...config,
      vmConfig: mergeVMConfigs(this.vmConfig, config.vmConfig),
    });

    if (vm instanceof PageVM && !vm.ctx) {
      this.loadingContexts.add(vm.id);
      vm.loadContext().then(ctx => {
        this.loadedContexts[vm.id] = ctx;
      }).finally(() => {
        this.loadingContexts.delete(vm.id);
      })
    }

    return vm;
  }
}
