import { PageVM } from '../../globals/stores/view-models/page-vm';

export class NotFoundPageVM extends PageVM<{ label: string }> {
  willMount() {
    if (this.globals.ssr) {
      const systemInfo = this.globals.ssr.getSystemInfo();
      this.ctx = {
        label: `А на сервере сейчас ${new Date(systemInfo.date).toLocaleString()}`,
      };
    }
  }
}
