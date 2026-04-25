import type { AnchorHTMLAttributes, ComponentType } from 'react';

export type ActionButtonSize = 's' | 'l' | 'm';

/** Внешний вид: тон и роль контрола, без привязки к экрану или сценарию. */
export type ActionButtonLook =
  | 'solidBrand'
  | 'solidBrandBar'
  | 'solidBrandIcon'
  | 'solidBrandRelaxed'
  | 'solidSuccess'
  | 'softBrand'
  | 'surface'
  | 'neutralInset'
  | 'ghostBrand'
  | 'ghostNeutral'
  | 'ghostRisk'
  | 'ghostMuted'
  | 'outlinePill'
  | 'outlineMenu'
  | 'outlineCircle'
  | 'linkNeutral'
  | 'linkAccent'
  | 'linkMuted'
  | 'switch'
  | 'mediaRail'
  | 'mediaSwatch'
  | 'overlayIcon'
  | 'insetRow'
  | 'segment';

export type AnchorTarget = AnchorHTMLAttributes<HTMLAnchorElement>['target'];

export type ActionButtonIconComponent = ComponentType<{ className?: string }>;
