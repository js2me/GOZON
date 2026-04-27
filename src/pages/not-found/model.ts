import { PageVM } from '../../shared/lib/view-models/page-vm';

export class NotFoundPageVM extends PageVM<{ label: string }> {

  didCreate(): void {
    this.onInit(ssr => {
      if (ssr) {
        const systemInfo = this.globals.ssr.getSystemInfo();
        this.ctx = {
          label: `А на сервере сейчас ${new Date(systemInfo.date).toLocaleString()}`,
        };
      }
    })
  }
}
