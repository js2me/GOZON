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
  private revision = 0;
  private syncedRevision = 0;
  private serverVersion = 0;
  private pendingToggles: number[] = [];
  loadError: string | null = null;
  hasConflict = false;
  /** До первой завершённой попытки `load()` — считаем список ещё не инициализированным с сервера. */
  private initialLoadPending = true;

  constructor() {
    this.productIds = [...this.storedProductIdsState.value];

    makeObservable<
      this,
      | 'productIds'
      | 'isReady'
      | 'loadingPromise'
      | 'syncPromise'
      | 'initialLoadPending'
    >(this, {
      productIds: observable.ref,
      isReady: observable.ref,
      loadingPromise: observable.ref,
      syncPromise: observable.ref,
      initialLoadPending: observable,
      isLoading: computed,
      loadError: observable.ref,
      hasConflict: observable.ref,
    });
  }

  get isLoading(): boolean {
    return this.initialLoadPending || this.syncPromise !== null;
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
    if (this.hasConflict) {
      if (this.syncPromise) return this.syncPromise;
      const revision = this.revision;
      this.syncPromise = (async () => {
        try {
          const { productIds, version } = await loadFavorites();
          if (revision !== this.revision) return;
          this.setProductIds(productIds);
          this.serverVersion = version;
          this.syncedRevision = revision;
          this.hasConflict = false;
          this.loadError = null;
        } catch {
          this.loadError = 'Не удалось обновить избранное';
        } finally {
          this.syncPromise = null;
        }
      })();
      return this.syncPromise;
    }
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
        const { productIds, version } = await loadFavorites();
        this.serverVersion = version;
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
    if (this.hasConflict) {
      return Promise.resolve();
    }
    if (this.syncPromise) {
      return this.syncPromise;
    }
    if (this.revision === this.syncedRevision) {
      return Promise.resolve();
    }
    this.syncPromise = (async () => {
      try {
        while (this.revision !== this.syncedRevision) {
          const revision = this.revision;
          try {
            const result = await putFavorites(
              [...this.productIds],
              this.serverVersion,
              AbortSignal.timeout(10_000),
            );
            if (!result.ok) {
              this.hasConflict = true;
              this.loadError = 'Избранное изменилось в другой вкладке';
              break;
            }
            const { productIds, version } = result.data;
            this.serverVersion = version;
            if (revision === this.revision) {
              this.setProductIds(productIds);
              this.syncedRevision = revision;
              this.loadError = null;
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
