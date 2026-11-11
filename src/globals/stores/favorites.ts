import { computed, makeObservable, observable, runInAction } from 'mobx';
import { storageData } from 'mobx-web-api';
import { loadFavorites, toggleFavorite } from '../../shared/api/api';

export class FavoritesStore {
  private readonly storedProductIdsState = storageData.key<number[]>(
    'favoriteProductIds',
    [],
    'session',
  );
  private productIds: number[] = [];
  private isReady = false;

  private isLoaded = false;
  private loadingPromise: Promise<void> | null = null;
  private mutationPromise: Promise<void> | null = null;
  loadError: string | null = null;
  /** До первого ответа сервера избранное не готово к отображению. */
  private initialLoadPending = true;

  constructor() {
    this.productIds = [...this.storedProductIdsState.value];

    makeObservable<
      this,
      | 'productIds'
      | 'isReady'
      | 'loadingPromise'
      | 'mutationPromise'
      | 'initialLoadPending'
    >(this, {
      productIds: observable.ref,
      isReady: observable.ref,
      loadingPromise: observable.ref,
      mutationPromise: observable.ref,
      initialLoadPending: observable,
      isLoading: computed,
      loadError: observable.ref,
    });
  }

  get isLoading(): boolean {
    return this.initialLoadPending || this.mutationPromise !== null;
  }

  hasProduct = (productId: number): boolean => {
    if (!this.isReady) {
      return false;
    }
    return this.productIds.includes(productId);
  };

  toggleProduct = (productId: number): Promise<void> => {
    const previous = this.mutationPromise ?? this.loadingPromise;
    const task = (async () => {
      if (previous) await previous;
      try {
        const { productIds } = await toggleFavorite(productId);
        this.setProductIds(productIds);
        this.isLoaded = true;
        this.isReady = true;
        this.loadError = null;
      } catch {
        this.loadError = 'Не удалось изменить избранное';
      } finally {
        this.initialLoadPending = false;
      }
    })();
    this.mutationPromise = task;
    void task.finally(() => {
      if (this.mutationPromise === task) this.mutationPromise = null;
    });
    return task;
  };

  refresh = async () => {
    if (this.mutationPromise) await this.mutationPromise;
    this.isLoaded = false;
    await this.load();
  };

  load = async () => {
    if (this.mutationPromise) return this.mutationPromise;
    if (this.isLoaded) {
      this.isReady = true;
      runInAction(() => {
        this.initialLoadPending = false;
      });
      return;
    }
    if (this.loadingPromise) {
      await this.loadingPromise;
      return;
    }

    this.loadingPromise = (async () => {
      try {
        const { productIds } = await loadFavorites();
        this.setProductIds(productIds);
        this.isLoaded = true;
        this.loadError = null;
      } catch {
        this.loadError = 'Не удалось загрузить избранное';
      } finally {
        runInAction(() => {
          this.isReady = true;
          this.loadingPromise = null;
          this.initialLoadPending = false;
        });
      }
    })();

    await this.loadingPromise;
  };

  private setProductIds(productIds: number[]) {
    this.productIds = productIds;
    this.storedProductIdsState.value = productIds;
  }
}
