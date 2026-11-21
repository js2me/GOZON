import { ShoppingCart } from 'lucide-react';
import { observer } from 'mobx-react-lite';
import { useViewModel } from 'mobx-view-model-react';
import { ItemCard } from '../../../../widgets/item-card';
import { CartPageVM } from '../../model';

export const CartEmpty = observer(() => {
  const model = useViewModel(CartPageVM);
  const { recommendations } = model;
  return (
    <>
      <div className="empty-panel">
        <ShoppingCart />
        <h2>Корзина пуста</h2>
        <p>Воспользуйтесь поиском, чтобы найти всё, что нужно.</p>
        <a className="primary-link" href="/">
          Перейти к покупкам
        </a>
      </div>
      {recommendations.length > 0 && (
        <section className="cart-recommendations">
          <h2>Рекомендуем</h2>
          <div className="product-grid">
            {recommendations.map((item) => (
              <ItemCard
                key={item.id}
                {...item}
                isFavorite={model.isFavorite(item.id)}
                onFavoriteClick={() => model.toggleFavorite(item.id)}
              />
            ))}
          </div>
        </section>
      )}
    </>
  );
});
