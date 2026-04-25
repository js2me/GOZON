import { House } from 'lucide-react';
import { computed, makeObservable, observable } from 'mobx';
import { createRef } from 'yummies/mobx';
import { BoxIcon, CartIcon, UserIcon } from '../../../shared/assets/icons';
import { VM } from '../../../shared/lib/view-models/vm';
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

  appNameLink = '/';

  get navItems(): LayoutNavItem[] {
    return [
      {
        href: this.globals.router.routes.home.createUrl(),
        icon: House,
        label: 'Главная',
      },
      {
        href: this.globals.router.routes.profile.createUrl(),
        icon: UserIcon,
        label: 'Профиль',
      },
      {
        href: '/orders',
        icon: BoxIcon,
        label: 'Заказы',
      },
      {
        href: this.globals.router.routes.cart.createUrl(),
        icon: CartIcon,
        label: 'Корзина',
      },
    ];
  }

  get quickLinks(): LayoutQuickLink[] {
    return [
      {
        href: '/fresh',
        label: 'GOZ0N fresh',
      },
      {
        href: '/bank',
        label: 'GOZ0N Банк',
      },
      {
        href: '/travel',
        label: 'Билеты, отели',
      },
      {
        href: '/business',
        label: 'Для бизнеса',
      },
      ...this.globals.stores.category.mainCategories,
    ];
  }

  handleWindowScroll = () => {
    this.isHeaderCompact = globalThis.scrollY > 120;
  };

  didCreate(): void {
    makeObservable(this, {
      navItems: computed.struct,
      quickLinks: computed.struct,
      isHeaderCompact: observable.ref,
    });
  }
}
