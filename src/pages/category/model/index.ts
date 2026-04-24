import { computed, makeObservable, observable } from 'mobx';
import type { ComputeItemKey } from 'react-virtuoso';
import type { ProductSortParam } from '../../../shared/api/api';
import { loadCategoryById, loadProducts } from '../../../shared/api/api';
import { PageVM } from '../../../shared/lib/view-models/page-vm';
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
    return this.isPageContextLoading;
  }

  get category(): CategoryPageContext['category'] | null {
    return this.ctx?.category ?? null;
  }

  get categoryId(): string | null {
    return this.ctx?.categoryId ?? null;
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

  protected willMount(): void {
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

    if (this.globals.isClient) {
      void (async () => {
        await this.loadContextOnClientIfNeeded();
        if (this.ctx?.categoryId) {
          void this.loadProductsChunk();
        }
      })();
    }
  }

  getCurrentPathname(): string {
    const history = this.globals.router.history as {
      location?: { pathname?: string };
      pathname?: string;
      path?: string;
    };

    return history.location?.pathname ?? history.pathname ?? history.path ?? '';
  }

  parseCategoryIdFromPath(): string | null {
    const path = this.getCurrentPathname();
    const match = path.match(/^\/category\/([^/]+)\/?$/);
    return match?.[1] ? decodeURIComponent(match[1]) : null;
  }

  async init(isClient = false): Promise<CategoryPageContext | null> {
    const rawId = this.parseCategoryIdFromPath();
    if (!rawId) {
      return null;
    }

    const category = isClient
      ? await loadCategoryById(rawId)
      : await this.globals.ssr.getCategoryById(rawId);
    if (!category) {
      return null;
    }

    if (!isClient) {
      const head = this.globals.ssr.head;
      const appName = this.globals.stores.appInfo.appName;
      head.title = `${category.title} — купить на ${appName}`;
      head.ogTitle = category.title;
      head.ogDescription = `Товары категории «${category.title}»`;
      head.ogUrl = `/category/${category.id}`;
    }

    return { category, categoryId: rawId };
  }
}
