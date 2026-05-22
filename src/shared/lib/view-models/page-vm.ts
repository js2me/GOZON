import { makeObservable, observable } from 'mobx';
import type { SSRApi } from '../../../server/api/types';
import { VM } from './vm';

type InitFn<TPageContext extends Maybe<AnyObject>> = (
  ssr: Maybe<SSRApi>,
) => MaybePromise<Maybe<TPageContext> | void>;

export class PageVM<
  out TPageContext extends Maybe<AnyObject> = null,
> extends VM<{}, null> {
  private initFn?: InitFn<TPageContext>;

  isInitializing = false;

  ctx: TPageContext = (this.viewModels.loadedContexts[this.id] ??
    null) as TPageContext;

  /**
   * Загружает с сервера необходимые данные для первой отрисовки страницы
   */
  async initOnServer(ssr: SSRApi): Promise<TPageContext> {
    const result = this.initFn?.(ssr);
    return (result ?? null) as TPageContext;
  }

  /**
   * Инициализирует с клиента
   */
  private initOnClient = async (): Promise<void> => {
    if (!this.globals.isClient || this.isInitializing || !this.initFn) {
      return;
    }

    this.isInitializing = true;
    try {
      await this.initFn(null);
      this.viewModels.loadedContexts[this.id] = this.ctx;
    } finally {
      this.isInitializing = false;
    }
  };

  protected onInit(initFn: InitFn<TPageContext>) {
    this.initFn = initFn;
  }

  mount(): void {
    makeObservable(this, {
      ctx: observable.ref,
      isInitializing: observable.ref,
    });

    super.mount();

    void this.initOnClient();
  }
}
