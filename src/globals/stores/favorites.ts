import { makeObservable, observable } from 'mobx';

const STORAGE_KEY = 'gozon:favorites';

export class FavoritesStore {
  productIds = observable.set<number>();

  constructor() {
    makeObservable(this, {
      productIds: observable,
    });
  }

  hasProduct = (productId: number): boolean => {
    return this.productIds.has(productId);
  };

  toggleProduct = (productId: number) => {
    if (this.productIds.has(productId)) {
      this.productIds.delete(productId);
    } else {
      this.productIds.add(productId);
    }
    this.persist();
  };

  load = () => {
    if (typeof window === 'undefined') {
      return;
    }

    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) {
        return;
      }

      const parsed = JSON.parse(raw) as unknown;
      if (!Array.isArray(parsed)) {
        return;
      }

      this.productIds.clear();
      for (const id of parsed) {
        const numericId = Number(id);
        if (Number.isInteger(numericId)) {
          this.productIds.add(numericId);
        }
      }
    } catch {
      // ignore broken localStorage data
    }
  };

  private persist() {
    if (typeof window === 'undefined') {
      return;
    }

    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(Array.from(this.productIds)));
    } catch {
      // ignore storage errors
    }
  }
}
