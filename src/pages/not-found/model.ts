import { computed, makeObservable } from 'mobx';
import { createTime } from 'mobx-swiss-knife';
import { PageVM } from '../../globals/stores/view-models/page-vm';

export class NotFoundPageVM extends PageVM<{ serverTime: number }> {
  private time = createTime();

  get labels() {
    const serverDate = new Date(this.ctx.serverTime);

    return {
      server: `На сервере было ${serverDate.toLocaleString()}`,
      user: `А у вас сейчас ${this.isHydrated ? this.time.value.toLocaleString() : serverDate.toLocaleString()}`,
    };
  }

  willMount() {
    makeObservable(this, {
      labels: computed,
    });

    if (this.globals.ssr) {
      const systemInfo = this.globals.ssr.getSystemInfo();
      this.ctx = {
        serverTime: new Date(systemInfo.date).getTime(),
      };
    }
  }
}
