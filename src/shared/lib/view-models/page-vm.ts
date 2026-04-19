import type { AnyObject, Maybe } from 'yummies/types';
import { VM } from './vm';
import { computed, makeObservable } from 'mobx';

export class PageVM<out TPageContext extends Maybe<AnyObject> = null> extends VM<{}, null> {
  get ctx() {
    return this.viewModels.loadedContexts[this.id] as TPageContext;
  }

  /**
   * Загружает с сервера необходимые данные для первой отрисовки страницыЮ
   */
  async loadContext(): Promise<TPageContext> {
    return {} as TPageContext
  }


  mount(): void {
    makeObservable(this, {
      ctx: computed,
    });

    super.mount();
  }
}
