import { computed, makeObservable } from 'mobx';
import type { Router } from '../router';

export interface MainCategory {
  id: string;
  label: string;
}

export class CategoryStore {
  constructor(
    private router: Router,
    private readonly categories: MainCategory[],
  ) {
    makeObservable(this, {
      mainCategories: computed.struct,
    });
  }

  get mainCategories(): Array<{ href: string; label: string }> {
    return this.categories.map((category) => ({
      href: this.router.routes.category.createUrl({ categoryId: category.id }),
      label: category.label,
    }));
  }
}
