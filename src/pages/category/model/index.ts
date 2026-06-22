import { computed, makeObservable, observable } from 'mobx';
import type { ViewModelParams } from 'mobx-view-model';
import type { ComputeItemKey } from 'react-virtuoso';
import { parser } from 'yummies/parser';
import type { Globals } from '../../../globals';
import type { ProductSortParam } from '../../../shared/api/api';
import { loadCategoryById, loadProducts } from '../../../shared/api/api';
import { PageVM } from '../../../globals/stores/view-models/page-vm';
import { mapProductToCard } from '../../home/model/map-product-to-card';
import type { ProductCardInfo, ProductRow } from '../../home/model/types';
import type { CategoryPageContext } from './types';

const PAGE_SIZE = 100;

export const CATEGORY_ITEMS_PER_ROW = 4;

export class CategoryPageVM extends PageVM<CategoryPageContext | null> {
  isProductsLoaded = false;
  isLoadingMore = false;
  hasMoreProducts = true;
  offset = 0;
  products: ProductCardInfo[] = [];
  firstPageProducts: ProductCardInfo[] = [];
  firstPageHasMoreProducts = true;

  saleOnly = false;
  sort: ProductSortParam = 'popular';
  priceMinInput = '';
  priceMaxInput = '';
  /** Рассрочка — только UI, без фильтра в API. */
  installmentUi = false;
  /** Доставка — только UI. */
  deliveryUi: 'any' | 'today' | 'tomorrow' | '3days' = 'any';

  /** Клиентский переход без SSR: ждём загрузку каталога. */
  get isCategoryContextLoading(): boolean {
    return this.isInitializing;
  }

  get category(): CategoryPageContext['category'] | null {
    return this.ctx?.category ?? null;
  }

  get virtualProductRows(): ProductRow[] {
    const rowCount = Math.ceil(this.products.length / CATEGORY_ITEMS_PER_ROW);
    const productRows: ProductRow[] = Array.from(
      { length: rowCount },
      (_, rowIndex) => ({
        items: this.products.slice(
          rowIndex * CATEGORY_ITEMS_PER_ROW,
          rowIndex * CATEGORY_ITEMS_PER_ROW + CATEGORY_ITEMS_PER_ROW,
        ),
      }),
    );

    const rows = [...productRows];

    if (this.isLoadingMore && this.hasMoreProducts) {
      rows.push({ loading: true });
    }

    return rows;
  }

  get categoryId() {
    return parser.string(
      this.globals.router.routes.category.params?.categoryId,
      { fallback: null },
    );
  }

  defineComputeItemKey: ComputeItemKey<ProductRow, unknown> = (index, row) => {
    if (row.loading) {
      return 'loading-row';
    }

    return row.items?.map((product) => product.id).join('-') || String(index);
  };

  private getParsedPriceMin(): number | undefined {
    const n = Number.parseFloat(
      this.priceMinInput.replace(/\s/g, '').replace(',', '.'),
    );
    return Number.isFinite(n) && n >= 0 ? n : undefined;
  }

  private getParsedPriceMax(): number | undefined {
    const n = Number.parseFloat(
      this.priceMaxInput.replace(/\s/g, '').replace(',', '.'),
    );
    return Number.isFinite(n) && n >= 0 ? n : undefined;
  }

  loadProductsChunk = async () => {
    if (this.isLoadingMore || !this.hasMoreProducts || !this.categoryId) {
      return;
    }

    this.isLoadingMore = true;

    try {
      const { items, hasMore } = await loadProducts({
        limit: PAGE_SIZE,
        offset: this.offset,
        categoryId: this.categoryId,
        saleOnly: this.saleOnly,
        minPrice: this.getParsedPriceMin(),
        maxPrice: this.getParsedPriceMax(),
        sort: this.sort,
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

  resetListAndReload = () => {
    if (!this.categoryId) {
      return;
    }
    this.products = [];
    this.offset = 0;
    this.hasMoreProducts = true;
    this.firstPageProducts = [];
    this.firstPageHasMoreProducts = true;
    void this.loadProductsChunk();
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

  setSaleOnly = (value: boolean) => {
    this.saleOnly = value;
    this.resetListAndReload();
  };

  setSort = (value: ProductSortParam) => {
    this.sort = value;
    this.resetListAndReload();
  };

  setPriceMinInput = (value: string) => {
    this.priceMinInput = value;
  };

  setPriceMaxInput = (value: string) => {
    this.priceMaxInput = value;
  };

  setInstallmentUi = (value: boolean) => {
    this.installmentUi = value;
  };

  setDeliveryUi = (value: 'any' | 'today' | 'tomorrow' | '3days') => {
    this.deliveryUi = value;
  };

  applyPriceFilter = () => {
    this.resetListAndReload();
  };

  constructor(globals: Globals, params: ViewModelParams) {
    super(globals, params);

    makeObservable(this, {
      products: observable.ref,
      isProductsLoaded: observable.ref,
      isLoadingMore: observable.ref,
      hasMoreProducts: observable.ref,
      offset: observable.ref,
      saleOnly: observable.ref,
      sort: observable.ref,
      priceMinInput: observable.ref,
      priceMaxInput: observable.ref,
      installmentUi: observable.ref,
      deliveryUi: observable.ref,
      isCategoryContextLoading: computed,
      virtualProductRows: computed,
      category: computed,
      categoryId: computed,
    });
  }

  async onInit() {
    if (!this.categoryId) {
      return null;
    }

    if (this.globals.ssr) {
      const category = await this.globals.ssr.getCategoryById(this.categoryId);

      if (!category) {
        return null;
      }

      const head = this.globals.ssr.head;
      const appName = this.globals.stores.appInfo.appName;
      head.title = `${category.title} — купить на ${appName}`;
      head.ogTitle = category.title;
      head.ogDescription = `Товары категории «${category.title}»`;
      head.ogUrl = `/category/${category.id}`;

      this.ctx = { category };
      return;
    } else if (!this.ctx) {
      const category = await loadCategoryById(this.categoryId);

      if (!category) {
        return;
      }

      this.ctx = { category };
    }
  }

  protected willMount(): void {
    if (this.globals.isClient) {
      void this.loadProductsChunk();
    }
  }
}
