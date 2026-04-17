import type { Maybe } from 'yummies/types';
import { VM } from './vm';

export class PageVM<out TPageContext extends Maybe<{ key: string; }>> extends VM<{}, null> {
  ctx: TPageContext = this.globals.ctx as TPageContext;
  protected contextKey?: string;


  async loadContext(): Promise<TPageContext> {
    return null as TPageContext
  }

  mount() {
    const hasExpectedContext =
      this.contextKey &&
      this.ctx &&
      typeof this.ctx === 'object' &&
      'key' in this.ctx &&
      this.ctx.key === this.contextKey;

    if (!this.contextKey) {
      return super.mount();
    }

    if (hasExpectedContext) {
      return super.mount();
    }

    return this.loadContext().then((ctx) => {
      Object.assign(this.globals.ctx, ctx);
      return super.mount();
    });
  }
}
