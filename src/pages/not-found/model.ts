import type { ViewModelParams } from 'mobx-view-model';
import type { Globals } from '../../globals';
import { PageVM } from '../../shared/lib/view-models/page-vm';

export class NotFoundPageVM extends PageVM<{ label: string }> {
  constructor(globals: Globals, params: ViewModelParams) {
    super(globals, params);

    this.onInit((ssr) => {
      if (ssr) {
        const systemInfo = ssr.getSystemInfo();
        this.ctx = {
          label: `А на сервере сейчас ${new Date(systemInfo.date).toLocaleString()}`,
        };
      }
    });
  }
}
