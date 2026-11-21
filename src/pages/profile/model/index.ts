import { computed, computedStruct, makeObservable, observableRef } from 'mobx';
import type { ViewModelParams } from 'mobx-view-model';
import type { Globals } from '../../../globals';
import { PageVM } from '../../../globals/stores/view-models/page-vm';
import {
  loadProfile,
  loadProfileRatingProducts,
  loadProfileViewedProducts,
} from '../../../shared/api/api';
import type {
  ProfileMenuSection,
  ProfilePageContext,
  ProfileRatingCard,
  ProfileViewedCard,
} from './types';

export class ProfilePageVM extends PageVM<ProfilePageContext> {
  ratingProducts: ProfileRatingCard[] = [];
  viewedProducts: ProfileViewedCard[] = [];
  isRatingLoading = true;
  isViewedLoading = true;

  get menuSections(): ProfileMenuSection[] {
    return [
      {
        title: 'Личный кабинет',
        items: [
          { label: 'Мой профиль', href: '/profile', active: true },
          { label: 'Мои заказы', href: '/orders' },
          { label: 'Избранное', href: '/favorites' },
          { label: 'Корзина', href: '/cart' },
        ],
      },
    ];
  }

  hideRatingCard(id: string) {
    this.ratingProducts = this.ratingProducts.filter(
      (product) => product.id !== id,
    );
  }

  get ratingCards(): ProfileRatingCard[] {
    return this.ratingProducts;
  }

  get viewedCards(): ProfileViewedCard[] {
    return this.viewedProducts;
  }

  get shouldShowRatingSkeletons(): boolean {
    return this.isRatingLoading && this.ratingProducts.length === 0;
  }

  get shouldShowViewedSkeletons(): boolean {
    return this.isViewedLoading && this.viewedProducts.length === 0;
  }

  private loadProfileProducts = async () => {
    this.isRatingLoading = true;
    this.isViewedLoading = true;
    try {
      const [ratingProducts, viewedProducts] = await Promise.all([
        loadProfileRatingProducts(),
        loadProfileViewedProducts(),
      ]);

      this.ratingProducts = ratingProducts;
      this.viewedProducts = viewedProducts;
    } finally {
      this.isRatingLoading = false;
      this.isViewedLoading = false;
    }
  };

  constructor(globals: Globals, params: ViewModelParams) {
    super(globals, params);

    makeObservable(this, {
      ratingProducts: observableRef,
      viewedProducts: observableRef,
      isRatingLoading: observableRef,
      isViewedLoading: observableRef,
      menuSections: computedStruct,
      ratingCards: computedStruct,
      viewedCards: computedStruct,
      shouldShowRatingSkeletons: computed,
      shouldShowViewedSkeletons: computed,
    });
  }

  async willMount() {
    if (this.globals.ssr) {
      const profile = await this.globals.ssr.getProfile();

      this.globals.ssr.head.title = `${profile.firstName} ${profile.lastName} - Профиль`;

      this.ctx = {
        profile,
      };
      return;
    }

    if (!this.ctx) {
      const profile = await loadProfile();
      this.ctx = { profile };
    }

    void this.globals.stores.favorites.load();
    void this.loadProfileProducts();
  }
}
