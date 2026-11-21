import { ShoppingCart } from 'lucide-react';
import { observer } from 'mobx-react-lite';
import { useViewModel } from 'mobx-view-model-react';
import { useEffect, useState } from 'react';
import { loadProducts } from '../../../../shared/api/api';
import { ItemCard } from '../../../../widgets/item-card';
import { mapProductToCard } from '../../../home/model/map-product-to-card';
import type { ProductCardInfo } from '../../../home/model/types';
import { CartPageVM } from '../../model';

export const CartEmpty = observer(() => {
  const model = useViewModel(CartPageVM);
  const [recommendations, setRecommendations] = useState<ProductCardInfo[]>([]);
  useEffect(() => {
    const controller = new AbortController();
    void loadProducts({ limit: 10, offset: 0 }, controller.signal)
      .then(({ items }) => {
        if (!controller.signal.aborted)
          setRecommendations(items.map(mapProductToCard));
      })
      .catch(() => {});
    return () => controller.abort();
  }, []);
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
