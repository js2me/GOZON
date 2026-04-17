import { Maybe } from 'yummies/types';
import { VM } from './vm';

export class PageVM<out TPageContext extends Maybe<{ key: string; }>> extends VM<{}, null> {
  ctx: TPageContext = this.globals.ctx as TPageContext;


  async loadContext(): Promise<TPageContext> {
    return null as TPageContext
  }

  async mount() {
    if (this.globals.isClient) {
      return super.mount();
    } else {
      const ctx = await this.loadContext();
      Object.assign(this.globals.ctx, ctx);
      return super.mount();
    }
  }
}
