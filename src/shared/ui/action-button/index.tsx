import { Button, Skeleton } from '@heroui/react';
import type {
  AnchorHTMLAttributes,
  ComponentPropsWithoutRef,
  ComponentType,
  ReactNode,
} from 'react';
import { cloneElement, isValidElement } from 'react';
import { cva, cx } from 'yummies/css';

type ActionButtonSize = 'l' | 'm';

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

type ActionButtonIconComponent = ComponentType<{ className?: string }>;

function isIconComponent(
  value: ReactNode | ActionButtonIconComponent | undefined,
): value is ActionButtonIconComponent {
  if (value == null || isValidElement(value)) {
    return false;
  }
  if (typeof value === 'function') {
    return true;
  }
  if (typeof value === 'object' && '$$typeof' in value) {
    const { $$typeof } = value as { $$typeof: symbol };
    return (
      $$typeof === Symbol.for('react.forward_ref') ||
      $$typeof === Symbol.for('react.memo')
    );
  }
  return false;
}

type ActionButtonProps = {
  icon?: ReactNode | ActionButtonIconComponent;
  iconClassName?: string;
  text?: string;
  extraText?: string;
  size?: ActionButtonSize;
  look?: ActionButtonLook;
  /** Иконка в тон бренда на `surface` (например сердце в блоке с серым фоном). */
  accentIcon?: boolean;
  /** Выбранное состояние (рамки превью, избранное, переключатели). */
  selected?: boolean;
  action?: VoidFunction;
  href?: string;
  target?: AnchorTarget;
  disabled?: boolean;
  loading?: boolean;
  className?: string;
  ariaLabel?: string;
  children?: ReactNode;
  htmlAttributes?: Pick<
    ComponentPropsWithoutRef<'button'>,
    'role' | 'aria-checked' | 'type'
  >;
};

const actionButtonCx = cva('inline-flex items-center justify-center', {
  variants: {
    look: {
      solidBrand:
        'bg-brand font-semibold text-white shadow-none hover:bg-brand/90 disabled:text-white/70',
      solidBrandBar:
        'h-10 w-full rounded-xl bg-brand font-semibold text-white hover:bg-brand/90 disabled:text-white/70',
      solidBrandRelaxed:
        'rounded-xl bg-brand px-10 py-3 font-semibold text-[17px] text-white hover:bg-brand/90 disabled:text-white/70',
      solidBrandIcon:
        'h-10 w-11 shrink-0 rounded-none bg-brand text-white hover:bg-brand/90 disabled:text-white/70',
      solidSuccess:
        'h-12 w-full rounded-xl bg-cart-bank-benefit font-semibold text-[16px] text-white shadow-none hover:opacity-95 disabled:text-white/70',
      softBrand:
        'h-11 w-full rounded-2xl bg-product-buy-now-bg px-4 font-semibold text-[16px] text-brand',
      surface:
        'rounded-2xl bg-slate-100 text-slate-700 transition-colors hover:bg-slate-200 disabled:text-slate-400',
      neutralInset:
        'h-8 shrink-0 gap-1.5 rounded-[6px] bg-slate-100 px-3 font-medium text-slate-500 text-xs transition-colors hover:bg-slate-200',
      ghostBrand:
        'rounded-full text-brand transition-colors hover:bg-slate-200 disabled:text-slate-400',
      ghostNeutral:
        'gap-1.5 rounded-md px-0 py-0 font-inherit text-[13px] text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-800',
      ghostRisk:
        'gap-1 rounded-md p-0 font-inherit text-[13px] text-slate-500 transition-colors hover:text-cart-accent',
      ghostMuted:
        'rounded-full p-1 text-slate-400 transition-colors hover:bg-slate-200 hover:text-slate-600',
      outlinePill:
        'rounded-full border border-slate-200 bg-contrast-bg px-4 py-2 font-semibold text-[11px] text-slate-800 uppercase tracking-wide shadow-sm transition-colors hover:border-slate-300',
      outlineMenu:
        'block w-full rounded-xl px-3 py-2 text-left text-[13px] text-slate-800 transition-colors hover:bg-slate-50',
      outlineCircle:
        'inline-flex size-10 shrink-0 items-center justify-center rounded-full border border-slate-200 bg-contrast-bg text-slate-700 shadow-sm transition-colors hover:bg-slate-50',
      linkNeutral:
        'font-medium text-slate-700 text-xs underline transition-colors hover:text-slate-950',
      linkAccent:
        'rounded-md px-0 py-0 text-left font-medium text-[13px] text-brand transition-colors hover:underline',
      linkMuted:
        'mt-1 px-3 py-2 text-left text-[13px] text-profile-link transition-colors hover:underline',
      switch: 'relative h-7 w-12 shrink-0 rounded-full p-0 transition-colors',
      mediaRail:
        'min-h-0 overflow-hidden rounded-xl border-2 p-0 transition-colors',
      mediaSwatch:
        'min-h-0 overflow-hidden rounded-lg border-2 p-0 transition-colors',
      overlayIcon:
        'absolute top-2 right-2 z-10 size-8 shrink-0 rounded-full bg-transparent p-0 transition-transform hover:scale-105',
      insetRow:
        'h-auto w-full rounded-2xl p-4 text-left font-inherit transition-colors hover:bg-slate-50',
      segment:
        'size-9 shrink-0 rounded-none p-0 text-slate-600 transition-colors hover:bg-slate-200 disabled:opacity-40',
    },
    size: {
      m: '',
      l: '',
    },
    textMode: {
      icon: '',
      withText: '',
    },
    selected: {
      true: '',
      false: '',
    },
  },
  compoundVariants: [
    { look: 'ghostBrand', textMode: 'icon', size: 'm', class: 'size-8' },
    {
      look: 'ghostBrand',
      textMode: 'icon',
      size: 'l',
      class: 'h-12 w-12 shrink-0',
    },
    { look: 'surface', textMode: 'icon', size: 'm', class: 'size-8' },
    {
      look: 'surface',
      textMode: 'icon',
      size: 'l',
      class: 'h-12 w-12 shrink-0',
    },
    {
      textMode: 'withText',
      size: 'm',
      look: 'solidBrand',
      class: 'h-10 shrink-0 gap-2 rounded-xl px-4 text-sm',
    },
    {
      textMode: 'withText',
      size: 'l',
      look: 'solidBrand',
      class:
        'h-12 flex-1 justify-center rounded-2xl font-bold text-[17px] hover:bg-brand/90 disabled:text-white/70',
    },
    {
      textMode: 'withText',
      size: 'l',
      look: 'surface',
      class: 'h-12 shrink-0 gap-2 px-3',
    },
    {
      look: 'switch',
      selected: false,
      class: 'bg-slate-300',
    },
    {
      look: 'switch',
      selected: true,
      class: 'bg-brand',
    },
    {
      look: 'mediaRail',
      selected: true,
      class: 'border-brand',
    },
    {
      look: 'mediaRail',
      selected: false,
      class: 'border-transparent',
    },
    {
      look: 'mediaSwatch',
      selected: true,
      class: 'border-brand',
    },
    {
      look: 'mediaSwatch',
      selected: false,
      class: 'border-slate-200',
    },
    {
      look: 'ghostRisk',
      selected: true,
      class: 'text-cart-accent',
    },
  ],
  defaultVariants: {
    look: 'ghostBrand',
    size: 'm',
    textMode: 'icon',
    selected: false,
  },
});

const switchKnobCx = cva(
  'pointer-events-none absolute top-0.5 left-0.5 size-6 rounded-full bg-slate-50 shadow transition-transform',
  {
    variants: {
      on: {
        true: 'translate-x-5',
        false: '',
      },
    },
    defaultVariants: { on: false },
  },
);

const skeletonIconShape: Record<
  ActionButtonLook,
  'round' | 'soft' | 'square' | 'none'
> = {
  solidBrand: 'soft',
  solidBrandBar: 'soft',
  solidBrandRelaxed: 'soft',
  solidBrandIcon: 'square',
  solidSuccess: 'soft',
  softBrand: 'soft',
  surface: 'soft',
  neutralInset: 'soft',
  ghostBrand: 'round',
  ghostNeutral: 'soft',
  ghostRisk: 'soft',
  ghostMuted: 'round',
  outlinePill: 'round',
  outlineMenu: 'soft',
  outlineCircle: 'round',
  linkNeutral: 'soft',
  linkAccent: 'soft',
  linkMuted: 'soft',
  switch: 'round',
  mediaRail: 'soft',
  mediaSwatch: 'soft',
  overlayIcon: 'round',
  insetRow: 'soft',
  segment: 'soft',
};

const skeletonIconShapeCx = cva('shrink-0', {
  variants: {
    size: {
      m: 'size-5',
      l: 'size-6',
    },
    shape: {
      round: 'rounded-full',
      soft: 'rounded-xl',
      square: 'rounded-none',
      none: 'rounded-md',
    },
  },
  defaultVariants: { size: 'm', shape: 'soft' },
});

const loadingRowCx = cva('inline-flex items-center', {
  variants: {
    size: {
      m: 'gap-1.5',
      l: 'gap-2',
    },
  },
  defaultVariants: { size: 'm' },
});

const skeletonTextLineCx = cva('shrink-0 rounded-md', {
  variants: {
    size: {
      m: 'h-3.5 w-14',
      l: 'h-4 w-20',
    },
  },
  defaultVariants: {
    size: 'm',
  },
});

const labelCx = cva('font-medium leading-none', {
  variants: {
    size: {
      m: 'text-[13px]',
      l: 'text-lg',
    },
  },
  defaultVariants: { size: 'm' },
});

const extraLabelToneCx = cva(
  'block whitespace-nowrap font-medium leading-tight',
  {
    variants: {
      size: {
        m: 'text-[12px]',
        l: 'text-[15px]',
      },
      tone: {
        onBrand: 'text-white/95',
        onSurface: 'text-slate-500',
        onMuted: 'text-slate-600',
        onAccent: 'text-brand',
      },
    },
    defaultVariants: { size: 'm', tone: 'onBrand' },
  },
);

function extraLabelToneForLook(look: ActionButtonLook) {
  if (
    look === 'solidBrand' ||
    look === 'solidBrandBar' ||
    look === 'solidBrandRelaxed' ||
    look === 'solidBrandIcon' ||
    look === 'solidSuccess'
  ) {
    return 'onBrand' as const;
  }
  if (look === 'surface' || look === 'softBrand') {
    return 'onSurface' as const;
  }
  if (look === 'linkAccent' || look === 'linkMuted') {
    return 'onAccent' as const;
  }
  return 'onMuted' as const;
}

const surfaceAccentIconCx = (selected: boolean) =>
  cx('text-brand', selected ? 'fill-current' : 'fill-none');

function buildIconNode(
  icon: ActionButtonProps['icon'],
  iconSizeClass: string,
  resolvedIconClassName: string | undefined,
): ReactNode {
  if (icon == null) {
    return null;
  }
  if (isValidElement<{ className?: string }>(icon)) {
    return resolvedIconClassName
      ? cloneElement(icon, {
          className: cx(icon.props.className, resolvedIconClassName),
        })
      : icon;
  }
  if (isIconComponent(icon)) {
    const IconComponent = icon;
    return (
      <IconComponent className={cx(iconSizeClass, resolvedIconClassName)} />
    );
  }
  return null;
}

function renderActionButtonBody(params: {
  children: ReactNode | undefined;
  look: ActionButtonLook;
  selected: boolean;
  loading: boolean;
  hasText: boolean;
  hasExtraText: boolean;
  text: string | undefined;
  extraText: string | undefined;
  size: ActionButtonSize;
  iconNode: ReactNode;
}): ReactNode {
  const {
    children,
    look,
    selected,
    loading,
    hasText,
    hasExtraText,
    text,
    extraText,
    size,
    iconNode,
  } = params;

  if (children != null) {
    return children;
  }
  if (look === 'switch') {
    return <span className={switchKnobCx({ on: selected })} />;
  }
  if (loading) {
    if (hasText) {
      return (
        <span className={loadingRowCx({ size })}>
          {iconNode ? (
            <Skeleton
              className={skeletonIconShapeCx({
                size,
                shape: skeletonIconShape[look],
              })}
            />
          ) : null}
          <Skeleton className={skeletonTextLineCx({ size })} />
          {hasExtraText ? (
            <Skeleton className={skeletonTextLineCx({ size })} />
          ) : null}
        </span>
      );
    }
    return (
      <Skeleton
        className={skeletonIconShapeCx({
          size,
          shape: skeletonIconShape[look],
        })}
      />
    );
  }
  if (hasText) {
    const tone = extraLabelToneForLook(look);
    return (
      <>
        {iconNode}
        {hasExtraText ? (
          <span className="inline-flex flex-col leading-none">
            <span className={cx(labelCx({ size }), 'whitespace-nowrap')}>
              {text}
            </span>
            <span className={extraLabelToneCx({ size, tone })}>
              {extraText}
            </span>
          </span>
        ) : (
          <span className={cx(labelCx({ size }), 'whitespace-nowrap')}>
            {text}
          </span>
        )}
      </>
    );
  }
  return iconNode;
}

export function ActionButton({
  icon,
  iconClassName,
  text,
  extraText,
  size = 'm',
  look = 'ghostBrand',
  accentIcon = false,
  selected = false,
  action,
  href,
  target,
  disabled,
  loading = false,
  className,
  ariaLabel,
  children,
  htmlAttributes,
}: ActionButtonProps) {
  const isDisabled = Boolean(disabled || loading);
  const hasText = Boolean(text);
  const hasExtraText = Boolean(extraText);
  const textMode = hasText ? 'withText' : 'icon';
  const iconSizeClass = size === 'l' ? 'size-6' : 'size-5';

  const resolvedIconClassName =
    look === 'surface' && accentIcon
      ? cx(surfaceAccentIconCx(selected), iconClassName)
      : iconClassName;

  const iconNode = buildIconNode(icon, iconSizeClass, resolvedIconClassName);

  const innerContent = renderActionButtonBody({
    children,
    look,
    selected,
    loading,
    hasText,
    hasExtraText,
    text,
    extraText,
    size,
    iconNode,
  });

  const surfaceClass = cx(
    actionButtonCx({ look, size, textMode, selected }),
    className,
  );

  if (href != null) {
    return (
      <a
        {...htmlAttributes}
        aria-busy={loading || undefined}
        aria-disabled={isDisabled || undefined}
        aria-label={ariaLabel}
        className={cx(
          surfaceClass,
          isDisabled && 'pointer-events-none opacity-50',
        )}
        href={href}
        onClick={(event) => {
          if (isDisabled) {
            event.preventDefault();
            return;
          }
          action?.();
        }}
        rel={target === '_blank' ? 'noopener noreferrer' : undefined}
        target={target}
      >
        {innerContent}
      </a>
    );
  }

  return (
    <Button
      {...htmlAttributes}
      aria-busy={loading || undefined}
      aria-label={ariaLabel}
      className={surfaceClass}
      isDisabled={isDisabled}
      isIconOnly={look === 'solidBrandIcon'}
      onPress={() => action?.()}
    >
      {innerContent}
    </Button>
  );
}
