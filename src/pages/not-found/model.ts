import { PageVM } from '../../shared/lib/view-models/page-vm';

export class NotFoundPageVM extends PageVM<{ label: string }> {

  protected willMount(): void {
    this.onInit(ssr => {
      if (ssr) {
        const systemInfo = this.globals.ssr.getSystemInfo();
        return {
          label: `А на сервере сейчас ${new Date(systemInfo.date).toLocaleString()}`,
        };
      }
    })
  }
}
