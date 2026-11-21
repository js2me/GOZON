import { Heart } from 'lucide-react';
import { withViewModel } from 'mobx-view-model-react';
import { ItemCard } from '../../widgets/item-card';
import { FavoritesPageVM } from './model';

export const FavoritesPage = withViewModel(FavoritesPageVM, ({ model }) => {
  const items = model.items;
  return (
    <main className="account-page">
      <h1>Избранное</h1>
      {model.failed ? (
        <div className="empty-panel">
          <p>Не удалось загрузить товары</p>
          <button type="button" className="primary-link" onClick={model.load}>
            Повторить
          </button>
        </div>
      ) : !items ? (
        <p role="status">Загружаем товары…</p>
      ) : items.length ? (
        <div className="product-grid">
          {items.map((item) => (
            <ItemCard
              {...item}
              key={item.id}
              isFavorite
              onFavoriteClick={() =>
                void model.favorites.toggleProduct(item.id)
              }
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
