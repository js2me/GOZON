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


  /**
   * Загружает с сервера необходимые данные для первой отрисовки страницы
   */
  async initOnServer(): Promise<TPageContext> {
    const result = this.onInit?.();
    return (result ?? null) as TPageContext;
  }

  /**
   * Инициализирует с клиента
   */
  private initOnClient = async (): Promise<void> => {
    if (this.globals.ssr || this.isInitializing || !this.onInit) {
      return;
    }

    this.isInitializing = true;
    try {
      await this.onInit();
      this.viewModels.loadedContexts[this.id] = this.ctx;
    } finally {
      this.isInitializing = false;
    }
  };

  onInit?(): MaybePromise<Maybe<TPageContext> | void>;

  constructor(globals: Globals, params: InferViewModelParams<PageVM>) {
    super(globals, params);

    makeObservable(this, {
      ctx: observable.ref,
      isInitializing: observable.ref,
    });
  }

  mount(): void {
    super.mount();


    void this.initOnClient();
  }
}
