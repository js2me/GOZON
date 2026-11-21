import { PageVM } from '../../globals/stores/view-models/page-vm';

export class OrdersPageVM extends PageVM {
  willMount() {
    if (this.globals.ssr) this.globals.ssr.head.title = 'Заказы — GOZON';
  }
}
