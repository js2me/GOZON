import { Skeleton } from '@heroui/react';
import { observer } from 'mobx-react-lite';
import { useViewModel } from 'mobx-view-model-react';
import { declension } from 'yummies/text';
import { Card } from '../../../../shared/ui/card';
import { CartPageVM } from '../../model';

function formatMoney(value: number): string {
  return `${value.toLocaleString('ru-RU')} ₽`;
}

export const CartSummaryCard = observer(() => {
  const model = useViewModel(CartPageVM);

  const { summary, isLoading } = model;

  return (
    <Card className="p-5">
      {isLoading ? (
        <Skeleton className="mb-4 h-6 w-2/3 rounded-lg" />
      ) : (
        <>
          <div className="mb-4 flex items-start justify-between gap-2">
            <p className="font-bold text-[17px] text-slate-900">Ваша корзина</p>
            <span className="shrink-0 text-[13px] text-slate-500">
              {summary.totalSelectedCount}{' '}
              {declension(summary.totalSelectedCount, [
                'товар',
                'товара',
                'товаров',
              ])}{' '}
              • {summary.totalWeight}
            </span>
          </div>
          <div className="space-y-2 text-[14px]">
            <div className="flex justify-between gap-4 text-slate-700">
              <span>Товары ({summary.totalSelectedCount})</span>
              <span className="shrink-0 tabular-nums">
                {formatMoney(summary.basePrice)}
              </span>
            </div>
            <div className="flex justify-between gap-4">
              <span className="text-slate-700">Скидка</span>
              <span className="shrink-0 font-medium text-cart-accent tabular-nums">
                {formatMoney(summary.totalDiscount)}
              </span>
            </div>
            <button
              className="text-left text-[13px] text-brand hover:underline"
              type="button"
            >
              Подробнее
            </button>
          </div>
          <div className="mt-5 border-slate-100 border-t pt-4">
            <div className="flex flex-wrap items-baseline justify-between gap-2">
              <span className="font-bold text-[22px] text-cart-bank-benefit tabular-nums">
                {formatMoney(summary.finalPriceWithLoyalty)}
              </span>
            </div>
            <p className="mt-0.5 text-[12px] text-slate-500">
              С {model.globals.stores.appInfo.bankName} Банком
            </p>
            <div className="mt-3 flex flex-wrap items-baseline justify-between gap-2">
              <span className="text-[15px] text-slate-500 tabular-nums line-through">
                {formatMoney(summary.finalPriceStandard)}
              </span>
            </div>
            <p className="text-[12px] text-slate-400">
              Без {model.globals.stores.appInfo.bankName} Банка
            </p>
          </div>
        </>
      )}
    </Card>
  );
});
