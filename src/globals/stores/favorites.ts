import { computed, makeObservable, observable, runInAction } from 'mobx';
import { storageData } from 'mobx-web-api';
import { loadFavorites, putFavorites } from '../../shared/api/api';

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
  private syncInFlight = 0;
  private revision = 0;
  loadError: string | null = null;
  /** До первой завершённой попытки `load()` — считаем список ещё не инициализированным с сервера. */
  private initialLoadPending = true;

  constructor() {
    this.productIds = [...this.storedProductIdsState.value];

    makeObservable<
      this,
      | 'productIds'
      | 'isReady'
      | 'loadingPromise'
      | 'syncInFlight'
      | 'initialLoadPending'
    >(this, {
      productIds: observable.ref,
      isReady: observable.ref,
      loadingPromise: observable.ref,
      syncInFlight: observable,
      initialLoadPending: observable,
      isLoading: computed,
      loadError: observable.ref,
    });
  }

  get isLoading(): boolean {
    return this.initialLoadPending || this.syncInFlight > 0;
  }

  hasProduct = (productId: number): boolean => {
    if (!this.isReady) {
      return false;
    }
    return this.productIds.includes(productId);
  };

  toggleProduct = async (productId: number) => {
    await this.load();
    if (!this.isLoaded) {
      return;
    }
    this.revision++;

    if (this.productIds.includes(productId)) {
      this.setProductIds(this.productIds.filter((it) => it !== productId));
    } else {
      this.setProductIds([...this.productIds, productId]);
    }

    void this.syncWithServer();
  };

  load = async () => {
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

    this.loadError = null;
    this.loadingPromise = (async () => {
      try {
        const { productIds } = await loadFavorites();
        this.setProductIds(productIds);
        this.isLoaded = true;
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

  private async syncWithServer() {
    if (this.syncInFlight > 0) {
      return;
    }
    this.syncInFlight++;
    this.loadError = null;
    try {
      let revision: number;
      do {
        revision = this.revision;
        const { productIds } = await putFavorites([...this.productIds]);
        if (revision === this.revision) {
          this.setProductIds(productIds);
        }
      } while (revision !== this.revision);
    } catch {
      this.loadError = 'Не удалось синхронизировать избранное';
    } finally {
      this.syncInFlight--;
    }
  }

  private setProductIds(productIds: number[]) {
    this.productIds = productIds;
    this.storedProductIdsState.value = productIds;
  }
}
