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
  private syncPromise: Promise<void> | null = null;
  private syncInFlight = 0;
  private revision = 0;
  private pendingToggles: number[] = [];
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
    this.revision++;

    if (this.productIds.includes(productId)) {
      this.setProductIds(this.productIds.filter((it) => it !== productId));
    } else {
      this.setProductIds([...this.productIds, productId]);
    }

    if (this.isLoaded) {
      void this.syncWithServer();
    } else {
      this.pendingToggles.push(productId);
    }
  };

  retrySync = async () => {
    await this.load();
    if (this.isLoaded) {
      await this.syncWithServer();
    }
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

    this.loadingPromise = (async () => {
      try {
        const { productIds } = await loadFavorites();
        const nextIds = [...productIds];
        for (const productId of this.pendingToggles) {
          const index = nextIds.indexOf(productId);
          if (index < 0) nextIds.push(productId);
          else nextIds.splice(index, 1);
        }
        this.setProductIds(nextIds);
        this.isLoaded = true;
        if (this.pendingToggles.length > 0) {
          this.pendingToggles = [];
          void this.syncWithServer();
        } else {
          this.loadError = null;
        }
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

  private syncWithServer(): Promise<void> {
    if (this.syncPromise) {
      return this.syncPromise;
    }
    this.syncPromise = (async () => {
      this.syncInFlight++;
      try {
        while (true) {
          const revision = this.revision;
          try {
            const { productIds } = await putFavorites([...this.productIds]);
            if (revision === this.revision) {
              this.setProductIds(productIds);
              this.loadError = null;
              break;
            }
          } catch {
            if (revision !== this.revision) {
              continue;
            }
            this.loadError = 'Не удалось синхронизировать избранное';
            break;
          }
        }
      } finally {
        this.syncInFlight--;
        this.syncPromise = null;
      }
    })();
    return this.syncPromise;
  }

  private setProductIds(productIds: number[]) {
    this.productIds = productIds;
    this.storedProductIdsState.value = productIds;
  }
}
