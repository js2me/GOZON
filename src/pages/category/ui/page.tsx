import { Link } from '@heroui/react';
import { ChevronDown, ChevronRight } from 'lucide-react';
import { withViewModel } from 'mobx-view-model-react';
import { useRef } from 'react';
import { Virtuoso } from 'react-virtuoso';
import { cx } from 'yummies/css';
import { ActionButton } from '../../../shared/ui/action-button';
import { CategoryPageVM } from '../model';
import { CategoryNotFound } from './components/category-not-found';
import { CategoryProductCardsRow } from './components/category-product-row';

const pricePresets = [
  { id: 'under500', label: 'До 500 ₽', min: 0, max: 500 },
  { id: '500-2000', label: '500 — 2000 ₽', min: 500, max: 2000 },
  { id: '2000-5000', label: '2000 — 5000 ₽', min: 2000, max: 5000 },
  { id: '5000+', label: 'От 5000 ₽', min: 5000, max: undefined },
] as const;

export const CategoryPage = withViewModel(
  CategoryPageVM,
  ({ model }) => {
    const brandsRef = useRef<HTMLDivElement>(null);

    if (model.isCategoryContextLoading && !model.category) {
      return (
        <main className="w-full bg-base-bg pt-6 pb-10">
          <section className="mx-auto max-w-[1416px] px-4">
            <div className="h-10 w-48 animate-pulse rounded-xl bg-slate-200" />
            <div className="mt-6 h-64 animate-pulse rounded-3xl bg-slate-200" />
          </section>
        </main>
      );
    }

    if (!model.category) {
      return <CategoryNotFound />;
    }

    const c = model.category;

    const scrollBrands = () => {
      brandsRef.current?.scrollBy({ left: 280, behavior: 'smooth' });
    };

    return (
      <main className="w-full bg-base-bg pt-6 pb-10">
        <div className="mx-auto max-w-[1416px] px-4">
          <h1 className="font-bold text-[32px] text-slate-900 leading-tight tracking-tight">
            {c.title}
          </h1>

          <div className="mt-5 flex flex-wrap items-center gap-2">
            {c.subNav.map((item) => (
              <ActionButton
                key={item.id}
                text={item.label}
                look="outlinePill"
              />
            ))}
            {c.subNavMore && c.subNavMore.length > 0 ? (
              <details className="group relative">
                <summary className="flex cursor-pointer list-none items-center gap-1 rounded-full border border-slate-200 bg-contrast-bg px-4 py-2 font-semibold text-[11px] text-slate-800 uppercase tracking-wide shadow-sm [&::-webkit-details-marker]:hidden">
                  Ещё
                  <ChevronDown className="size-3.5 transition-transform group-open:rotate-180" />
                </summary>
                <div className="absolute top-full left-0 z-20 mt-2 min-w-[220px] rounded-2xl border border-slate-100 bg-contrast-bg p-2 shadow-lg">
                  {c.subNavMore.map((item) => (
                    <ActionButton
                      className="w-full justify-start"
                      key={item.id}
                      text={item.label}
                      look="outlineMenu"
                    />
                  ))}
                </div>
              </details>
            ) : null}
          </div>

          <section className="mt-8 rounded-[20px] bg-contrast-bg p-5 shadow-surface">
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
              {c.gridTiles.map((tile) => (
                <Link
                  className="group flex flex-col overflow-hidden rounded-2xl bg-slate-50 transition-shadow hover:shadow-md"
                  href={`/category/${c.id}`}
                  key={tile.id}
                >
                  <div
                    className="relative flex aspect-square items-center justify-center bg-[length:24px_24px] bg-category-tile"
                    style={{
                      backgroundImage: `repeating-linear-gradient(
                        90deg,
                        transparent,
                        transparent 11px,
                        var(--color-overlay-stripe) 11px,
                        var(--color-overlay-stripe) 12px
                      ),
                      repeating-linear-gradient(
                        0deg,
                        transparent,
                        transparent 11px,
                        var(--color-overlay-stripe) 11px,
                        var(--color-overlay-stripe) 12px
                      ),
                      var(--background-image-category-tile)`,
                    }}
                  >
                    <img
                      alt=""
                      className="max-h-[78%] max-w-[78%] object-contain transition-transform duration-300 group-hover:scale-105"
                      src={tile.imageSrc}
                    />
                  </div>
                  <p className="px-2 py-3 text-center font-medium text-[13px] text-slate-900 leading-snug">
                    {tile.title}
                  </p>
                </Link>
              ))}
            </div>
          </section>

          <section className="relative mt-6 rounded-[20px] bg-contrast-bg p-5 shadow-surface">
            <div className="mb-4 flex items-center justify-between gap-4">
              <h2 className="font-bold text-[20px] text-slate-900">
                Популярные бренды
              </h2>
              <ActionButton
                action={scrollBrands}
                ariaLabel="Показать ещё бренды"
                icon={ChevronRight}
                iconClassName="size-5"
                look="outlineCircle"
              />
            </div>
            <div
              className="flex gap-6 overflow-x-auto pb-1 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
              ref={brandsRef}
            >
              {c.brands.map((brand) => (
                <div
                  className="flex w-[100px] shrink-0 flex-col items-center gap-2"
                  key={brand.id}
                >
                  <div className="flex h-14 w-full items-center justify-center rounded-xl bg-slate-100 font-bold text-[15px] text-slate-600">
                    {brand.name.slice(0, 2).toUpperCase()}
                  </div>
                  <span className="text-center font-medium text-[12px] text-slate-700 leading-tight">
                    {brand.name}
                  </span>
                </div>
              ))}
            </div>
          </section>

          <div className="mt-10 flex flex-col gap-6 lg:flex-row lg:items-start">
            <aside className="w-full shrink-0 rounded-[20px] bg-slate-100/90 p-5 lg:max-w-[280px]">
              <p className="font-bold text-[15px] text-slate-900">Категория</p>
              <nav className="mt-3 flex flex-col gap-0.5">
                {c.sidebarCategories.map((item) => (
                  <Link
                    className={cx(
                      'rounded-xl px-3 py-2.5 text-[14px] no-underline transition-colors',
                      item.active
                        ? 'bg-contrast-bg font-medium text-slate-900 shadow-sm'
                        : 'text-slate-600 hover:bg-contrast-bg/60',
                    )}
                    href={`/category/${item.id}`}
                    key={item.id}
                  >
                    {item.title}
                  </Link>
                ))}
                <ActionButton
                  className="justify-start"
                  text="Смотреть все"
                  look="linkMuted"
                />
              </nav>

              <div className="mt-6 flex items-center justify-between gap-3">
                <span className="font-semibold text-[14px] text-slate-900">
                  Распродажа
                </span>
                <ActionButton
                  action={() => model.setSaleOnly(!model.saleOnly)}
                  htmlAttributes={{
                    'aria-checked': model.saleOnly,
                    role: 'switch',
                    type: 'button',
                  }}
                  look="switch"
                  selected={model.saleOnly}
                />
              </div>

              <div className="mt-6">
                <p className="font-bold text-[15px] text-slate-900">Доставка</p>
                <div className="mt-3 flex flex-col gap-2">
                  {(
                    [
                      ['any', 'В любое время'],
                      ['today', 'Сегодня'],
                      ['tomorrow', 'Завтра'],
                      ['3days', 'До 3 дней'],
                    ] as const
                  ).map(([id, label]) => (
                    <label
                      className="flex cursor-pointer items-center gap-2 text-[14px] text-slate-800"
                      key={id}
                    >
                      <input
                        checked={model.deliveryUi === id}
                        className="size-4 accent-brand"
                        name="delivery"
                        onChange={() => model.setDeliveryUi(id)}
                        type="radio"
                      />
                      {label}
                    </label>
                  ))}
                </div>
              </div>

              <div className="mt-6">
                <p className="font-bold text-[15px] text-slate-900">Цена, ₽</p>
                <div className="mt-3 flex gap-2">
                  <input
                    className="w-full rounded-xl border border-slate-200 bg-contrast-bg px-3 py-2 text-[14px] outline-none focus:border-brand"
                    inputMode="numeric"
                    onChange={(e) => model.setPriceMinInput(e.target.value)}
                    placeholder="От"
                    type="text"
                    value={model.priceMinInput}
                  />
                  <input
                    className="w-full rounded-xl border border-slate-200 bg-contrast-bg px-3 py-2 text-[14px] outline-none focus:border-brand"
                    inputMode="numeric"
                    onChange={(e) => model.setPriceMaxInput(e.target.value)}
                    placeholder="До"
                    type="text"
                    value={model.priceMaxInput}
                  />
                </div>
                <ActionButton
                  action={model.applyPriceFilter}
                  className="mt-3"
                  look="solidBrandBar"
                  text="Применить"
                />
                <div className="mt-3 flex flex-col gap-2">
                  {pricePresets.map((preset) => (
                    <label
                      className="flex cursor-pointer items-center gap-2 text-[13px] text-slate-800"
                      key={preset.id}
                    >
                      <input
                        className="size-4 accent-brand"
                        name="pricePreset"
                        onChange={() => {
                          model.setPriceMinInput(
                            preset.min != null ? String(preset.min) : '',
                          );
                          model.setPriceMaxInput(
                            preset.max != null && preset.max !== undefined
                              ? String(preset.max)
                              : '',
                          );
                          model.applyPriceFilter();
                        }}
                        type="radio"
                      />
                      {preset.label}
                    </label>
                  ))}
                </div>
              </div>

              <div className="mt-6 flex items-center justify-between gap-3">
                <span className="font-semibold text-[14px] text-slate-900">
                  Рассрочка
                </span>
                <ActionButton
                  action={() => model.setInstallmentUi(!model.installmentUi)}
                  htmlAttributes={{
                    'aria-checked': model.installmentUi,
                    role: 'switch',
                    type: 'button',
                  }}
                  look="switch"
                  selected={model.installmentUi}
                />
              </div>
            </aside>

            <div className="min-w-0 flex-1">
              <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
                <label className="flex items-center gap-2 text-[14px] text-slate-700">
                  <span className="font-medium">Сортировка</span>
                  <select
                    className="rounded-xl border border-slate-200 bg-contrast-bg px-3 py-2 text-[14px] text-slate-900 outline-none focus:border-brand"
                    onChange={(e) =>
                      model.setSort(
                        e.target.value as
                          | 'popular'
                          | 'price_asc'
                          | 'price_desc',
                      )
                    }
                    value={model.sort}
                  >
                    <option value="popular">Популярные</option>
                    <option value="price_asc">Сначала дешевле</option>
                    <option value="price_desc">Сначала дороже</option>
                  </select>
                </label>
              </div>

              {model.isProductsLoaded ? (
                <Virtuoso
                  computeItemKey={model.defineComputeItemKey}
                  data={model.virtualProductRows}
                  endReached={model.handleProductsEndReached}
                  atTopStateChange={model.handleProductsTopReached}
                  itemContent={(_, row) => <CategoryProductCardsRow {...row} />}
                  useWindowScroll
                />
              ) : (
                <CategoryProductCardsRow loading />
              )}
            </div>
          </div>
        </div>
      </main>
    );
  },
  {
    fallback: () => (
      <main className="w-full bg-base-bg pt-6 pb-10">
        <section className="mx-auto max-w-[1416px] px-4">
          <div className="h-10 w-48 animate-pulse rounded-xl bg-slate-200" />
        </section>
      </main>
    ),
  },
);
