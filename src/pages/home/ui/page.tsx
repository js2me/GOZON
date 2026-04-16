import { withViewModel } from 'mobx-view-model-react';
import { Virtuoso } from 'react-virtuoso';
import { HomePageVM } from '../model';
import { ProductCardsRow } from './components/product-cards-row';

export const HomePage = withViewModel(
  HomePageVM,
  ({ model }) => {
    return (
      <main className="w-full bg-base-bg pt-6 pb-10">
        <section className="mx-auto max-w-354">
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
      <main className="w-full bg-base-bg pt-6 pb-10">
        <section className="mx-auto max-w-354">
          <ProductCardsRow loading />
        </section>
      </main>
    ),
  },
);
