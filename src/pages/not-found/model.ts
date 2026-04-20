import { PageVM } from '../../shared/lib/view-models/page-vm';

export class NotFoundPageVM extends PageVM<{ label: string }> {
  async init() {
    const systemInfo = this.globals.ssr.getSystemInfo();

    return {
      label: `А на сервере сейчас ${new Date(systemInfo.date).toLocaleString()}`
    }
  }
}
