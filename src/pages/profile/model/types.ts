import type { ProfileDC } from '../../../shared/api/api';
import type { ItemCardBadge } from '../../../widgets/item-card';

export interface ProfilePageContext {
  profile: ProfileDC;
}

export interface ProfileMenuItem {
  label: string;
  href: string;
  count?: number;
  active?: boolean;
}

export interface ProfileMenuSection {
  title: string;
  items: ProfileMenuItem[];
}

export interface ProfileRatingCard {
  id: string;
  title: string;
}

export interface ProfileViewedCard {
  id: string;
  brand: string;
  title: string;
  imageSrc: string;
  price: string;
  originalPrice?: string;
  discount?: string;
  badge?: ItemCardBadge | null;
}
