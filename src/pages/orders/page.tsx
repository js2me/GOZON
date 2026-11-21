import { Package, MapPin, ChevronRight } from 'lucide-react';
import { withViewModel } from 'mobx-view-model-react';
import { OrdersPageVM } from './model';

export function OrderSummary() {
  return (
    <article className="order-summary">
      <span className="order-icon">
        <Package size={30} />
      </span>
      <div>
        <strong>В службе доставки</strong>
        <p>Доставка в пункт выдачи</p>
        <small>22–27 апреля</small>
      </div>
    </article>
  );
}

export const OrdersPage = withViewModel(OrdersPageVM, () => {
  return (
    <main className="account-page">
      <a className="crumb" href="/profile">
        Личный кабинет <ChevronRight size={14} />
      </a>
      <h1>Заказы</h1>
      <div className="orders-layout">
        <section className="account-panel">
          <h2>Текущие заказы</h2>
          <OrderSummary />
        </section>
        <aside className="account-panel">
          <MapPin size={24} />
          <h2>Получение заказа</h2>
          <p>
            Статус доставки появится здесь, когда заказ поступит в пункт выдачи.
          </p>
        </aside>
      </div>
    </main>
  );
});
