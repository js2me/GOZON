import { PageVM } from '../../globals/stores/view-models/page-vm';
import { createTime } from 'mobx-swiss-knife';

export class NotFoundPageVM extends PageVM<{ label: string }> {
  private time = createTime();

  get label() {
    return `А у вас сейчас ${this.time.value.toLocaleString()}`
  }
  
  willMount() {
    if (this.globals.ssr) {
      const systemInfo = this.globals.ssr.getSystemInfo();
      this.ctx = {
        label: `На сервере было ${new Date(systemInfo.date).toLocaleString()}`,
      };
    }
  }
}
