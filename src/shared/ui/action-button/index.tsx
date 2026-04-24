import { Skeleton } from '@heroui/react';
import type { ReactNode } from 'react';
import { cva, cx } from 'yummies/css';

type ActionButtonSize = 'l' | 'm';
type ActionButtonView = 'brand' | 'surface';

type ActionButtonProps = {
  icon: ReactNode;
  text?: string;
  size?: ActionButtonSize;
  view?: ActionButtonView;
  action: () => void;
  disabled?: boolean;
  loading?: boolean;
  className?: string;
  ariaLabel?: string;
};

const actionButtonCx = cva('inline-flex items-center justify-center', {
  variants: {
    view: {
      brand:
        'rounded-full text-brand transition-colors hover:bg-slate-200 disabled:text-slate-400',
      surface:
        'rounded-2xl bg-slate-100 text-slate-700 transition-colors hover:bg-slate-200 disabled:text-slate-400',
    },
    size: {
      m: '',
      l: '',
    },
    textMode: {
      icon: '',
      withText: '',
    },
  },
  compoundVariants: [
    { textMode: 'icon', size: 'm', class: 'size-8' },
    { textMode: 'icon', size: 'l', class: 'h-12 w-12 shrink-0' },
    { textMode: 'withText', size: 'm', class: 'h-8 shrink-0 gap-1.5 px-2.5' },
    { textMode: 'withText', size: 'l', class: 'h-12 shrink-0 gap-2 px-3' },
  ],
  defaultVariants: {
    view: 'brand',
    size: 'm',
    textMode: 'icon',
  },
});

const skeletonIconCx = cva('shrink-0', {
  variants: {
    size: {
      m: 'size-5',
      l: 'size-6',
    },
    view: {
      brand: 'rounded-full',
      surface: 'rounded-xl',
    },
  },
  defaultVariants: {
    size: 'm',
    view: 'brand',
  },
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
  defaultVariants: { size: 'm' },
});

const labelCx = cva('font-medium whitespace-nowrap leading-none', {
  variants: {
    size: {
      m: 'text-[13px]',
      l: 'text-sm',
    },
  },
  defaultVariants: { size: 'm' },
});

export function ActionButton({
  icon,
  text,
  size = 'm',
  view = 'brand',
  action,
  disabled,
  loading = false,
  className,
  ariaLabel,
}: ActionButtonProps) {
  const isDisabled = Boolean(disabled || loading);
  const hasText = Boolean(text);
  const textMode = hasText ? 'withText' : 'icon';

  return (
    <button
      aria-busy={loading || undefined}
      aria-label={ariaLabel}
      className={cx(actionButtonCx({ view, size, textMode }), className)}
      disabled={isDisabled}
      onClick={action}
      type="button"
    >
      {loading ? (
        hasText ? (
          <span className={loadingRowCx({ size })}>
            <Skeleton className={skeletonIconCx({ size, view })} />
            <Skeleton className={skeletonTextLineCx({ size })} />
          </span>
        ) : (
          <Skeleton className={skeletonIconCx({ size, view })} />
        )
      ) : hasText ? (
        <>
          {icon}
          <span className={labelCx({ size })}>{text}</span>
        </>
      ) : (
        icon
      )}
    </button>
  );
}
