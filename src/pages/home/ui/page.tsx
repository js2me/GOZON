import { withViewModel } from 'mobx-view-model-react';
import { Virtuoso } from 'react-virtuoso';
import { HomePageVM } from '../model';
import { ProductCardsRow } from './components/product-cards-row';

export const HomePage = withViewModel(
  HomePageVM,
  ({ model }) => {
    return (
      <main className="home-page">
        <section className="mx-auto max-w-354">
          {model.isProductsLoaded && model.query ? (
            <h1>Результаты поиска «{model.query}»</h1>
          ) : model.isProductsLoaded && model.saleOnly ? (
            <h1>Распродажа</h1>
          ) : (
            <a className="campaign" href="/?sale=1">
              <span className="campaign-brand">GOZON</span>
              <strong>
                Большая
                <br />
                распродажа
              </strong>
              <span className="campaign-cta">
                Смотреть товары <span aria-hidden="true">↗</span>
              </span>
            </a>
          )}
          {model.isProductsLoaded && !model.products.length && (
            <div className="empty-panel">
              <h2>Товары не найдены</h2>
              <p>Попробуйте другое название товара.</p>
              <a className="primary-link" href="/">
                На главную
              </a>
            </div>
          )}
          {model.isProductsLoaded ? (
            <Virtuoso
              computeItemKey={model.defineComputeItemKey}
              data={model.virtualProductRows}
              endReached={model.handleProductsEndReached}
              atTopStateChange={model.handleProductsTopReached}
              itemContent={(_, row) => <ProductCardsRow {...row} />}
              useWindowScroll
            />
          ) : (
            <ProductCardsRow loading />
          )}
        </section>
      </main>
    );
  },
  {
    fallback: () => (
      <main className="home-page">
        <section className="mx-auto max-w-354">
          <ProductCardsRow loading />
        </section>
      </main>
    ),
  },
);
