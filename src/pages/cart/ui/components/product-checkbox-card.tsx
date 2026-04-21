import { Link } from '@heroui/react';
import { Heart, Minus, Plus, Trash2 } from 'lucide-react';
import { observer } from 'mobx-react-lite';
import { useViewModel } from 'mobx-view-model-react';
import type { CartItemBenefit, CartItemInfo } from '../../../../globals/stores/cart/types';
import type { CartPageVM } from '../../model';
import { cva } from 'yummies/css';

interface ProductCheckboxCardProps {
  item: CartItemInfo;
}

const badgeCx = cva('rounded-md px-2 py-0.5 font-medium text-[11px] leading-tight', {
  variants: {
    colorType: {
      sale: 'border border-pink-200 bg-pink-50 text-cart-accent',
      installment:
        'border border-violet-100 bg-violet-50 text-cart-badge-muted',
      postpay: 'border border-blue-100 bg-blue-50 text-cart-badge-muted',
    },
  },
});

function getBadgeLabel(type: CartItemBenefit): string {
  switch (type) {
    case 'sale':
      return 'Распродажа';
    case 'installment':
      return '0% до 140 дней';
    case 'postpay':
      return 'Постоплата';
  }
}

function formatMoney(value: number): string {
  return `${value.toLocaleString('ru-RU')} ₽`;
}

export const ProductCheckboxCard = observer(({ item }: ProductCheckboxCardProps) => {
  const model = useViewModel<CartPageVM>();
  const isFavorite = model.isFavorite(item.id);

  return (
    <li className="flex flex-col gap-4 py-5 first:pt-0 last:pb-0 lg:flex-row lg:gap-5">
      <div className="flex min-w-0 flex-1 gap-3">
        <input
          checked={item.isSelected}
          className="mt-1 size-4 shrink-0 rounded border-slate-300 accent-cart-bank-benefit"
          onChange={() => model.toggleItem(item.id)}
          type="checkbox"
        />
        <Link className="shrink-0 overflow-hidden rounded-xl" href={item.productHref}>
          <img alt="" className="size-[88px] object-cover" src={item.imageUrl} />
        </Link>
        <div className="min-w-0 flex-1">
          <Link
            className="font-medium text-[15px] text-slate-900 no-underline hover:underline"
            href={item.productHref}
          >
            {item.title}
          </Link>
          <div className="mt-2 flex flex-wrap gap-1.5">
            {item.types.map((type) => (
              <span className={badgeCx({ colorType: type })} key={`${item.id}-${type}`}>
                {getBadgeLabel(type)}
              </span>
            ))}
          </div>
          <p className="mt-2 text-[13px] text-slate-500">{item.variant}</p>
          <div className="mt-3 flex flex-wrap items-center gap-4 text-[13px] text-slate-500">
            <button
              aria-label={isFavorite ? 'Убрать из избранного' : 'Добавить в избранное'}
              className={`inline-flex items-center gap-1 transition-colors hover:text-cart-accent ${isFavorite ? 'text-cart-accent' : ''}`}
              onClick={() => model.toggleFavorite(item.id)}
              type="button"
            >
              <Heart className="size-4" fill={isFavorite ? 'currentColor' : 'none'} />
            </button>
            <button
              className="inline-flex items-center gap-1 transition-colors hover:text-cart-accent"
              onClick={() => model.removeItem(item.id)}
              type="button"
            >
              <Trash2 className="size-4" />
            </button>
            <button
              className="font-medium text-brand transition-colors hover:underline"
              type="button"
            >
              Купить
            </button>
          </div>
        </div>
      </div>

      <div className="flex flex-col items-stretch gap-3 sm:flex-row sm:items-start sm:justify-between lg:flex-col lg:items-end">
        <div className="text-right">
          <p
            className={`font-bold text-[18px] leading-tight ${item.price.current < item.price.original ? 'text-cart-accent' : 'text-slate-900'}`}
          >
            {formatMoney(item.price.current)}
          </p>
          {item.price.original > item.price.current ? (
            <p className="mt-0.5 text-[13px] text-slate-400 line-through">
              {formatMoney(item.price.original)}
            </p>
          ) : null}
          <span
            aria-hidden
            className="mt-1 inline-block size-5 rounded bg-slate-100"
            title={`${model.globals.stores.appInfo.bankName} Банк`}
          />
        </div>

        <div className="flex flex-col items-end gap-1">
          <div className="flex items-center gap-0 overflow-hidden rounded-lg border border-slate-200 bg-slate-50">
            <button
              className="flex size-9 items-center justify-center text-slate-600 transition-colors hover:bg-slate-200 disabled:opacity-40"
              disabled={item.quantity.current <= 1}
              onClick={() => model.decrement(item.id)}
              type="button"
            >
              <Minus className="size-4" />
            </button>
            <span className="min-w-[36px] text-center font-medium text-[14px] text-slate-900 tabular-nums">
              {item.quantity.current}
            </span>
            <button
              className="flex size-9 items-center justify-center text-slate-600 transition-colors hover:bg-slate-200 disabled:opacity-40"
              disabled={item.quantity.current >= item.quantity.maxAvailable}
              onClick={() => model.increment(item.id)}
              type="button"
            >
              <Plus className="size-4" />
            </button>
          </div>
          {item.stockStatus === 'limited' ? (
            <p className="max-w-[200px] text-right text-[11px] text-cart-accent">
              Количество ограничено
            </p>
          ) : null}
        </div>
      </div>
    </li>
  );
});
