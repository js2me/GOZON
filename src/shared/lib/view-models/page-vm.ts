import { computed, makeObservable, observable, runInAction } from 'mobx';
import type { AnyObject, Maybe } from 'yummies/types';
import { VM } from './vm';

export class PageVM<
  out TPageContext extends Maybe<AnyObject> = null,
> extends VM<{}, null> {
  isPageContextLoading = false;

  get ctx() {
    return this.viewModels.loadedContexts[this.id] as TPageContext;
  }

  /**
   * Загружает с сервера необходимые данные для первой отрисовки страницы
   */
  async init(_isClient = false): Promise<TPageContext> {
    return {} as TPageContext;
  }

  protected loadContextOnClientIfNeeded = async (): Promise<void> => {
    if (!this.globals.isClient || this.ctx || this.isPageContextLoading) {
      return;
    }

    runInAction(() => {
      this.isPageContextLoading = true;
    });
    try {
      const ctx = await this.init(true);
      runInAction(() => {
        this.viewModels.loadedContexts[this.id] = ctx;
      });
    } finally {
      runInAction(() => {
        this.isPageContextLoading = false;
      });
    }
  };

  mount(): void {
    makeObservable(this, {
      ctx: computed,
      isPageContextLoading: observable.ref,
    });

    super.mount();
    void this.loadContextOnClientIfNeeded();
  }
}
