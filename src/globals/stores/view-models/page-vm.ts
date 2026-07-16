import { makeObservable, observable } from 'mobx';
import { VM } from './vm';
import { Globals } from '../..';
import { InferViewModelParams } from 'mobx-view-model';

export class PageVM<
  out TPageContext extends Maybe<AnyObject> = null,
> extends VM<{}, null> {
  isInitializing = false;

  ctx: TPageContext = (this.viewModels.loadedContexts[this.id] ??
    null) as TPageContext;


  onInit?(): MaybePromise<Maybe<TPageContext> | void>;

  constructor(globals: Globals, params: InferViewModelParams<PageVM>) {
    super(globals, params);

    makeObservable(this, {
      ctx: observable.ref,
      isInitializing: observable.ref,
    });
  }

  async mount() {
    if (this.globals.ssr) {
      this.viewModels.loadingContexts.add(this.id);
        await this.onInit?.();
        console.log('pek???');
        this.viewModels.loadedContexts[this.id] = this.ctx;
        this.viewModels.loadingContexts.delete(this.id);
        await super.mount();
      } else if (!this.isInitializing) {
        this.isInitializing = true;
        await this.onInit?.();
        this.viewModels.loadedContexts[this.id] = this.ctx;
        await super.mount();
      }
  }
  // mount(): void {
  //   super.mount();


  //   void this.initOnClient();
  // }
}
