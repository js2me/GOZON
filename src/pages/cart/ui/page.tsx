import { Checkbox, Skeleton } from '@heroui/react';
import { ChevronRight, Flame, Share2, Trash2, Wallet } from 'lucide-react';
import { withViewModel } from 'mobx-view-model-react';
import { ActionButton } from '../../../shared/ui/action-button';
import { Card } from '../../../shared/ui/card';
import { CartPageVM } from '../model';
import { CartEmpty } from './components/cart-empty';
import { CartSummaryCard } from './components/cart-summary-card';
import { ProductCheckboxCard } from './components/product-checkbox-card';

export const CartPage = withViewModel(
  CartPageVM,
  ({ model }) => {
    const promo = model.promo;
    const isEmpty = !model.isLoading && model.localItems.length === 0;

    return (
      <main className="w-full bg-cart-page-bg pt-4 pb-12">
        <section className="mx-auto w-full max-w-[1416px] px-4">
          <div className="mb-6 flex items-baseline gap-2">
            <h1 className="font-bold text-[28px] text-slate-900 leading-none">
              Корзина
            </h1>
            {model.isLoading ? (
              <Skeleton className="inline-block h-6 w-10 rounded-md align-middle" />
            ) : (
              <span className="align-top font-bold text-cart-accent text-lg leading-none">
                {model.headerCount}
              </span>
            )}
          </div>

          {model.loadError ? (
            <Card className="p-6 text-center text-red-600">
              {model.loadError}
            </Card>
          ) : null}

          {isEmpty ? (
            <CartEmpty />
          ) : (
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-[minmax(0,1fr)_380px] lg:items-start">
              <div className="flex min-w-0 flex-col gap-4">
                {model.isLoading && model.localItems.length === 0 ? (
                  <div className="space-y-4">
                    <Skeleton className="h-24 w-full rounded-2xl" />
                    <Skeleton className="h-12 w-full rounded-xl" />
                    <Skeleton className="h-40 w-full rounded-2xl" />
                  </div>
                ) : null}

                {promo ? (
                  <Card className="flex flex-wrap items-center justify-between gap-3 px-4 py-3">
                    <div className="flex min-w-0 items-center gap-3">
                      <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-orange-50 text-orange-500">
                        <Flame className="size-5" />
                      </span>
                      <div className="min-w-0">
                        <p className="font-semibold text-slate-900">
                          Не упустите распродажу
                        </p>
                        <p className="text-[13px] text-slate-500">
                          {promo.itemsPriceIncreasingCount} товаров скоро
                          подорожают
                        </p>
                      </div>
                    </div>
                    <span className="shrink-0 font-semibold text-cart-accent text-sm">
                      {promo.saleDeadline}
                    </span>
                  </Card>
                ) : null}

                {!model.isLoading && model.localItems.length > 0 ? (
                  <>
                    <Card className="flex flex-wrap items-center justify-between gap-3 px-4 py-3">
                      <Checkbox
                        className="text-[14px] text-slate-800"
                        isSelected={model.allSelected}
                        onChange={model.setAllSelected}
                      >
                        Выбрать все
                      </Checkbox>
                      <div className="flex items-center gap-4 text-slate-500">
                        <ActionButton
                          icon={Share2}
                          iconClassName="size-4"
                          text="Поделиться"
                          look="ghostNeutral"
                        />
                        <ActionButton
                          ariaLabel="Удалить выбранное"
                          icon={Trash2}
                          iconClassName="size-5"
                          look="ghostRisk"
                        />
                      </div>
                    </Card>

                    <Card>
                      <p className="mb-4 font-semibold text-[16px] text-slate-900">
                        Доступны для заказа
                      </p>
                      <ul className="divide-y divide-slate-100">
                        {model.localItems.map((item) => (
                          <ProductCheckboxCard
                            item={item}
                            key={item.productId}
                          />
                        ))}
                      </ul>
                    </Card>
                  </>
                ) : null}
              </div>

              <aside className="flex flex-col gap-4 lg:sticky lg:top-24">
                <Card>
                  <ActionButton
                    text="Перейти к оформлению"
                    look="solidSuccess"
                  />
                  <p className="mt-2 text-center text-[12px] text-slate-500 leading-snug">
                    Способ доставки и оплаты можно выбрать на следующем шаге
                  </p>
                </Card>

                <CartSummaryCard />

                <Card className="p-0">
                  <ActionButton
                    className="rounded-2xl"
                    look="insetRow"
                  >
                    <span className="flex w-full min-w-0 items-center justify-between gap-3">
                      <span className="flex min-w-0 items-center gap-3">
                        <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-violet-50 text-violet-600">
                          <Wallet className="size-5" />
                        </span>
                        <span className="min-w-0">
                          <span className="block font-semibold text-[14px] text-slate-900">
                            С кредитной {model.globals.stores.appInfo.bankName}{' '}
                            Картой
                          </span>
                          <span className="text-[12px] text-slate-500">
                            Рассрочка 0% на срок до 12 месяцев
                          </span>
                        </span>
                      </span>
                      <ChevronRight className="size-5 shrink-0 text-slate-400" />
                    </span>
                  </ActionButton>
                </Card>
              </aside>
            </div>
          )}
        </section>
      </main>
    );
  },
  { fallback: () => null },
);
