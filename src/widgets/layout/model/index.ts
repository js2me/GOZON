import { Heart } from 'lucide-react';
import { computedStruct, makeObservable, observableRef } from 'mobx';
import type { ViewModelParams } from 'mobx-view-model';
import { createRef } from 'yummies/mobx';
import type { Globals } from '../../../globals';
import { VM } from '../../../globals/stores/view-models/vm';
import { BoxIcon, CartIcon, UserIcon } from '../../../shared/assets/icons';
import type { LayoutNavItem, LayoutQuickLink } from './types';

export class LayoutVM extends VM {
  isHeaderCompact = false;

  headerRef = createRef<HTMLDivElement>({
    onSet: () => {
      globalThis.addEventListener('scroll', this.handleWindowScroll, {
        passive: true,
        signal: this.unmountSignal,
      });
    },
    onUnset: () => {
      globalThis.removeEventListener('scroll', this.handleWindowScroll);
    },
  });

  favorites = this.globals.stores.favorites;

  appNameLink = '/';

  get navItems(): LayoutNavItem[] {
    return [
      {
        href: this.globals.router.routes.profile.createUrl(),
        icon: UserIcon,
        label: 'Профиль',
      },
      {
        href: this.globals.router.routes.orders.createUrl(),
        icon: BoxIcon,
        label: 'Заказы',
      },
      {
        href: this.globals.router.routes.favorites.createUrl(),
        icon: Heart,
        label: 'Избранное',
      },
      {
        href: this.globals.router.routes.cart.createUrl(),
        icon: CartIcon,
        label: 'Корзина',
      },
    ];
  }

  get quickLinks(): LayoutQuickLink[] {
    return this.globals.stores.category.mainCategories;
  }

  handleWindowScroll = () => {
    this.isHeaderCompact = globalThis.scrollY > 120;
  };

  constructor(globals: Globals, params: ViewModelParams) {
    super(globals, params);

    makeObservable(this, {
      navItems: computedStruct,
      quickLinks: computedStruct,
      isHeaderCompact: observableRef,
    });
  }
}
