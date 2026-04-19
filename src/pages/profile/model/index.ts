import { computed, makeObservable, observable } from 'mobx';
import {
  loadProfileRatingProducts,
  loadProfileViewedProducts,
} from '../../../shared/api/api';
import { PageVM } from '../../../shared/lib/view-models/page-vm';
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
        title: 'Личная информация',
        items: [
          { label: 'Главная', href: '/profile', active: true },
          { label: 'Ozon Карта', href: '/profile/ozon-card' },
          { label: 'Кредитная карта', href: '/profile/credit-card' },
          { label: 'Мои компании', href: '/profile/companies' },
          { label: 'Коды и сертификаты', href: '/profile/codes' },
          { label: 'Баллы и бонусы', href: '/profile/bonuses', count: 2001 },
          { label: 'Способы оплаты', href: '/profile/payment' },
          { label: 'Ozon Premium', href: '/profile/premium' },
          { label: 'Баланс средств', href: '/profile/balance' },
          { label: 'Моя семья', href: '/profile/family' },
          { label: 'Мой гараж', href: '/profile/garage' },
        ],
      },
      {
        title: 'Заказы',
        items: [
          { label: 'Моя корзина', href: '/cart' },
          { label: 'Мои заказы', href: '/orders' },
          { label: 'Мои возвраты', href: '/profile/returns' },
          { label: 'Купленные товары', href: '/profile/purchased' },
          { label: 'OZON Travel', href: '/travel' },
          { label: 'Для меня', href: '/for-me' },
          { label: 'Сравнение товаров', href: '/compare' },
          { label: 'Сообщения', href: '/messages', count: 193 },
          { label: 'Электронные чеки', href: '/checks' },
        ],
      },
      {
        title: 'Отзывы и вопросы о товарах',
        items: [
          { label: 'Мои отзывы', href: '/reviews', count: 169 },
          { label: 'Акция «Баллы за отзывы»', href: '/reviews/promo' },
          { label: 'Мои вопросы и ответы', href: '/questions' },
        ],
      },
    ];
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
  }

  protected willMount(): void {
    makeObservable(this, {
      ratingProducts: observable.ref,
      viewedProducts: observable.ref,
      isRatingLoading: observable.ref,
      isViewedLoading: observable.ref,
      menuSections: computed.struct,
      ratingCards: computed.struct,
      viewedCards: computed.struct,
      shouldShowRatingSkeletons: computed,
      shouldShowViewedSkeletons: computed,
    });

    if (this.ctx?.profile) {
      this.globals.stores.appInfo.setTitle(
        `${this.ctx.profile.firstName} ${this.ctx.profile.lastName} - Профиль`,
      );
    }

    if (this.globals.isClient) {
      void this.loadProfileProducts();
    }
  }

  protected async loadContext(): Promise<ProfilePageContext> {
    const profile = await this.globals.db.getProfile();

    return {
      profile,
    }
  }
}
