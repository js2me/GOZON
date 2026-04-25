import { computed, makeObservable, observable } from 'mobx';
import { VM } from './vm';
import { SSRApi } from '../../../server/api/types';

type InitFn<TPageContext extends Maybe<AnyObject>> = (ssr: Maybe<SSRApi>) => MaybePromise<Maybe<TPageContext> | void>

export class PageVM<
  out TPageContext extends Maybe<AnyObject> = null,
> extends VM<{}, null> {
  private initFn?: InitFn<TPageContext>;

  isPageContextLoading = false;

  get ctx() {
    return this.viewModels.loadedContexts[this.id] as TPageContext;
  }

  /**
   * Загружает с сервера необходимые данные для первой отрисовки страницы
   */
  async init(ssr: SSRApi): Promise<TPageContext> {
    const result = this.initFn?.(ssr);
    return (result ?? null) as TPageContext;
  }

  private loadContextOnClient = async (): Promise<void> => {
    if (!this.globals.isClient || this.ctx || this.isPageContextLoading || !this.initFn) {
      return;
    }

    this.isPageContextLoading = true;
    try {
      const ctx = await this.initFn(null);
      this.viewModels.loadedContexts[this.id] = ctx;
    } finally {
      this.isPageContextLoading = false;
    }
  };

  protected onInit(initFn: InitFn<TPageContext>) {
    this.initFn = initFn;
  }

  mount(): void {
    makeObservable(this, {
      ctx: computed,
      isPageContextLoading: observable.ref,
    });

    super.mount();

    void this.loadContextOnClient();
  }
}
