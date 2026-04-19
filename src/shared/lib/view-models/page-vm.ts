import type { AnyObject, Maybe } from 'yummies/types';
import { VM } from './vm';

export class PageVM<out TPageContext extends Maybe<AnyObject> = null> extends VM<{}, null> {
  ctx: TPageContext = this.globals.ctx[this.id] as TPageContext;


  protected async loadContext(): Promise<TPageContext> {
    return null as TPageContext
  }

  async mount() {
    const hasExpectedContext = this.id in this.globals.ctx;

    if (hasExpectedContext) {
      return super.mount();
    }

    const ctx = await this.loadContext();
    this.globals.ctx[this.id] = ctx;
    return super.mount();
  }
}
