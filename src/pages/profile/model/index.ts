import { computed, makeObservable } from 'mobx';
import { PageVM } from '../../../shared/lib/view-models/page-vm';
import type {
  ProfileMenuSection,
  ProfilePageContext,
  ProfileRatingCard,
  ProfileViewedCard,
} from './types';

export class ProfilePageVM extends PageVM<ProfilePageContext> {
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
    return [
      { id: '1', title: 'Слайм лизун очиститель для салона автомобиля' },
      { id: '2', title: 'Трусы брифы, боксеры мужские трусы, 1 шт' },
      {
        id: '3',
        title: 'Чай Шу Пуэр Бодрейший №2 китайский черный прессованный',
      },
    ];
  }

  get viewedCards(): ProfileViewedCard[] {
    return [
      {
        id: '1',
        brand: 'TECNO',
        title: 'Ноутбук Megabook K16',
        imageSrc:
          'https://images.unsplash.com/photo-1517336714739-489689fd1ca8?auto=format&fit=crop&w=640&q=80',
        price: '58 859 ₽',
        badge: { label: 'Распродажа' },
      },
      {
        id: '2',
        brand: 'DIGMA',
        title: 'Ноутбук Pro',
        imageSrc:
          'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?auto=format&fit=crop&w=640&q=80',
        price: '51 069 ₽',
        originalPrice: '76 000 ₽',
        discount: '-33%',
        badge: { label: 'Распродажа' },
      },
      {
        id: '3',
        brand: 'MONERIS',
        title: 'Монитор 27" 165Hz',
        imageSrc:
          'https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?auto=format&fit=crop&w=640&q=80',
        price: '9 275 ₽',
        originalPrice: '24 999 ₽',
        discount: '-63%',
        badge: { label: 'Распродажа' },
      },
      {
        id: '4',
        brand: 'MONERIS',
        title: 'AMD RYZEN 7-8845HS',
        imageSrc:
          'https://images.unsplash.com/photo-1624705002806-5d72df19c3ac?auto=format&fit=crop&w=640&q=80',
        price: '59 110 ₽',
        originalPrice: '284 485 ₽',
        discount: '-79%',
        badge: { label: 'Распродажа' },
      },
      {
        id: '5',
        brand: 'MONERIS',
        title: 'NVIDIA RTX3050 8Gb',
        imageSrc:
          'https://images.unsplash.com/photo-1591488320449-011701bb6704?auto=format&fit=crop&w=640&q=80',
        price: '57 639 ₽',
        originalPrice: '102 888 ₽',
        discount: '-43%',
        badge: { label: 'Распродажа' },
      },
      {
        id: '6',
        brand: 'new balance',
        title: 'Кроссовки 530',
        imageSrc:
          'https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=640&q=80',
        price: '3 538 ₽',
        originalPrice: '26 999 ₽',
        discount: '-86%',
        badge: { label: 'Распродажа' },
      },
    ];
  }

  protected willMount(): void {
    makeObservable(this, {
      menuSections: computed.struct,
      ratingCards: computed.struct,
      viewedCards: computed.struct,
    });
  }

  async loadContext(): Promise<ProfilePageContext> {
    const profile = await this.globals.db.getProfile();

    return {
      key: 'profile-page',
      profile,
    }
  }

  async mount() {
    await super.mount();
    this.globals.stores.appInfo.setTitle(`${this.ctx.profile.firstName} ${this.ctx.profile.lastName} - Профиль`);
  }
}
