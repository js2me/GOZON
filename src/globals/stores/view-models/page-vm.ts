import { makeObservable, observable } from 'mobx';
import type { InferViewModelParams } from 'mobx-view-model';
import type { Globals } from '../..';
import { VM } from './vm';

export class PageVM<
  out TPageContext extends Maybe<AnyObject> = null,
> extends VM<{}, null> {
  ctx: TPageContext = (this.vm.data ?? null) as TPageContext;

  constructor(globals: Globals, params: InferViewModelParams<PageVM>) {
    super(globals, params);

    makeObservable(this, {
      ctx: observable.ref,
    });
  }

  mount() {
    const result = super.mount();

    if (result instanceof Promise) {
      return result.then(() => {
        this.viewModels.pageContextResource.save(this.id, this.ctx);
      });
    }

    this.viewModels.pageContextResource.save(this.id, this.ctx);
    return result;
  }
}
