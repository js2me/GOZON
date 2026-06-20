import { computed, makeObservable, observable } from 'mobx';
import type { ViewModelParams } from 'mobx-view-model';
import type { ComputeItemKey } from 'react-virtuoso';
import type { Globals } from '../../../globals';
import { loadProducts } from '../../../shared/api/api';
import { PageVM } from '../../../shared/lib/view-models/page-vm';
import { mapProductToCard } from './map-product-to-card';
import type { ProductCardInfo, ProductRow } from './types';

const PAGE_SIZE = 100;

export const ITEMS_PER_ROW = 5;

export class HomePageVM extends PageVM {
  isProductsLoaded = false;
  isLoadingMore = false;
  hasMoreProducts = true;
  offset = 0;
  products: ProductCardInfo[] = [];
  firstPageProducts: ProductCardInfo[] = [];
  firstPageHasMoreProducts = true;

  private toCardWithFavoriteState = (
    product: ProductCardInfo,
  ): ProductCardInfo => {
    const isFavorite = this.globals.stores.favorites.hasProduct(product.id);

    return {
      ...product,
      isFavorite,
      onFavoriteClick: () => {
        this.globals.stores.favorites.toggleProduct(product.id);
      },
    };
  };

  get virtualProductRows(): ProductRow[] {
    const productRows: ProductRow[] = Array.from(
      { length: Math.ceil(this.products.length / ITEMS_PER_ROW) },
      (_, rowIndex) =>
        ({
          items: this.products
            .slice(
              rowIndex * ITEMS_PER_ROW,
              rowIndex * ITEMS_PER_ROW + ITEMS_PER_ROW,
            )
            .map(this.toCardWithFavoriteState),
        }) satisfies ProductRow,
    );
    const rows = [...productRows];

    if (this.isLoadingMore && this.hasMoreProducts) {
      rows.push({ loading: true });
    }

    return rows;
  }

  defineComputeItemKey: ComputeItemKey<ProductRow, any> = (index, row) => {
    if (row.loading) {
      return 'loading-row';
    }

    return row.items?.map((product) => product.id).join('-') || String(index);
  };

  loadProductsChunk = async () => {
    if (this.isLoadingMore || !this.hasMoreProducts) {
      return;
    }

    this.isLoadingMore = true;

    try {
      const { items, hasMore } = await loadProducts({
        limit: PAGE_SIZE,
        offset: this.offset,
      });
      const mappedProducts = items.map(mapProductToCard);

      if (this.offset === 0) {
        this.firstPageProducts = mappedProducts;
        this.firstPageHasMoreProducts = hasMore;
      }

      this.products = [...this.products, ...mappedProducts];
      this.offset += mappedProducts.length;
      this.hasMoreProducts = hasMore;
    } finally {
      this.isLoadingMore = false;
      this.isProductsLoaded = true;
    }
  };

  handleProductsEndReached = () => {
    void this.loadProductsChunk();
  };

  handleProductsTopReached = (isTop: boolean) => {
    if (!isTop || this.firstPageProducts.length === 0) {
      return;
    }

    if (this.products.length <= this.firstPageProducts.length) {
      return;
    }

    this.products = this.firstPageProducts;
    this.offset = this.firstPageProducts.length;
    this.hasMoreProducts = this.firstPageHasMoreProducts;
  };

  constructor(globals: Globals, params: ViewModelParams) {
    super(globals, params);

    makeObservable(this, {
      products: observable.ref,
      isProductsLoaded: observable.ref,
      isLoadingMore: observable.ref,
      hasMoreProducts: observable.ref,
      offset: observable.ref,
      virtualProductRows: computed,
    });
  }

  onInit() {
    if (this.globals.ssr) {
      this.globals.ssr.head.title = `${this.globals.stores.appInfo.appName} маркетплейс – миллионы товаров по выгодным ценам`;
    } else {
      this.globals.stores.favorites.load();
      void this.loadProductsChunk();
    }
  }

  // async mount() {
  //   // искусственное замедление
  //   // как демонстрация возможности выполнения чего-то асинхронного
  //   // перед отрисовки вьюшки
  //   await sleep(1000);
  //   super.mount();
  // }
}
