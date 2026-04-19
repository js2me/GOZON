import { PageVM } from '../../shared/lib/view-models/page-vm';

export class NotFoundPageVM extends PageVM<{ label: string }> {
  async loadContext() {
    const systemInfo = this.globals.db.getSystemInfo();

    return {
      label: `А на сервере сейчас ${new Date(systemInfo.date).toLocaleString()}`
    }
  }
}
