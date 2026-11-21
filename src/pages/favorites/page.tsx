import { Heart } from 'lucide-react';
import { observer } from 'mobx-react-lite';
import { useViewModel } from 'mobx-view-model-react';
import { useEffect, useState } from 'react';
import type { ProductDC } from '../../shared/api/api';
import { ItemCard } from '../../widgets/item-card';
import type { LayoutVM } from '../../widgets/layout/model';
import { mapProductToCard } from '../home/model/map-product-to-card';

export const FavoritesPage = observer(() => {
  const { globals, favorites } = useViewModel<LayoutVM>();
  if (globals.ssr) globals.ssr.head.title = 'Избранное — GOZON';
  const [products, setProducts] = useState<ProductDC[] | null>(null);
  const [failed, setFailed] = useState(false);
  const [attempt, setAttempt] = useState(0);
  useEffect(() => {
    const controller = new AbortController();
    setFailed(false);
    void Promise.all([
      favorites.load(),
      fetch('/api/favorites/products', { signal: controller.signal }).then(
        async (response) => {
          if (!response.ok) throw Error();
          return (await response.json()) as ProductDC[];
        },
      ),
    ])
      .then(([, items]) => {
        if (!controller.signal.aborted) setProducts(items);
      })
      .catch(() => {
        if (!controller.signal.aborted) setFailed(true);
      });
    return () => controller.abort();
  }, [favorites, attempt]);
  const items = products?.filter((item) => favorites.hasProduct(item.id));
  return (
    <main className="account-page">
      <h1>Избранное</h1>
      {failed ? (
        <div className="empty-panel">
          <p>Не удалось загрузить товары</p>
          <button
            type="button"
            className="primary-link"
            onClick={() => setAttempt(attempt + 1)}
          >
            Повторить
          </button>
        </div>
      ) : !items ? (
        <p role="status">Загружаем товары…</p>
      ) : items.length ? (
        <div className="product-grid">
          {items.map((item) => (
            <ItemCard
              {...mapProductToCard(item)}
              key={item.id}
              isFavorite
              onFavoriteClick={() => void favorites.toggleProduct(item.id)}
            />
          ))}
        </div>
      ) : (
        <div className="empty-panel">
          <Heart />
          <h2>В избранном пока пусто</h2>
          <p>Нажимайте на сердечко у товаров, чтобы сохранить их здесь.</p>
          <a className="primary-link" href="/">
            Перейти к покупкам
          </a>
        </div>
      )}
    </main>
  );
});
