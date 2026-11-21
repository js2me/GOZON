import { Link } from '@heroui/react';
import { ChevronRight } from 'lucide-react';
import { withViewModel } from 'mobx-view-model-react';
import { useRef, useState } from 'react';
import { Virtuoso } from 'react-virtuoso';
import { cx } from 'yummies/css';
import { ActionButton } from '../../../shared/ui/action-button';
import { Card } from '../../../shared/ui/card';
import { CategoryPageVM } from '../model';
import { CategoryNotFound } from './components/category-not-found';
import { CategoryProductCardsRow } from './components/category-product-row';

const pricePresets = [
  { id: 'under500', label: 'До 500 ₽', min: 0, max: 500 },
  { id: '500-2000', label: '500 — 2000 ₽', min: 500, max: 2000 },
  { id: '2000-5000', label: '2000 — 5000 ₽', min: 2000, max: 5000 },
  { id: '5000+', label: 'От 5000 ₽', min: 5000, max: undefined },
] as const;

const CategoryLoading = () => (
  <main className="category-page">
    <section className="mx-auto max-w-[1416px]">
      <div className="h-10 w-48 animate-pulse rounded-xl bg-slate-200" />
    </section>
  </main>
);

export const CategoryPage = withViewModel(
  CategoryPageVM,
  ({ model }) => {
    const results = useRef<HTMLDivElement>(null);
    const [filtersOpen, setFiltersOpen] = useState(false);

    if (!model.ctx) {
      return <CategoryLoading />;
    }

    if (!model.category) {
      return <CategoryNotFound />;
    }

    const c = model.category;

    const choose = (label: string) => {
      model.chooseCollection(label);
      results.current?.scrollIntoView({ block: 'start' });
    };

    return (
      <main className="category-page">
        <div className="mx-auto max-w-[1416px]">
          <nav className="department-crumb" aria-label="Путь к категории">
            <a href="/">Главная</a>
            <ChevronRight size={13} />
            <span>{c.title}</span>
          </nav>
          <h1>{c.title}</h1>
          {c.collections && (
            <nav className="department-links" aria-label="Разделы категории">
              {c.collections.map((item) => (
                <button
                  key={item.label}
                  type="button"
                  onClick={() => choose(item.label)}
                >
                  {item.label}
                </button>
              ))}
            </nav>
          )}
          {c.banner && (
            <button
              type="button"
              className="department-banner"
              onClick={() => choose('Уход за лицом')}
              aria-label="Дермакосметика — смотреть уход за лицом"
            >
              <img src={c.banner} alt="Дермакосметика. Красота здоровой кожи" />
            </button>
          )}
          {c.collections ? (
            <div className="department-tiles">
              {c.collections.map((item) => (
                <button
                  key={item.label}
                  type="button"
                  onClick={() => choose(item.label)}
                >
                  <img src={item.imageSrc} alt="" />
                  <span>{item.label}</span>
                </button>
              ))}
            </div>
          ) : (
            <div className="department-products">
              {c.gridTiles.map((tile) => (
                <a key={tile.id} href={`/products/${tile.id}`}>
                  <img src={tile.imageSrc} alt="" />
                  <span>{tile.title}</span>
                </a>
              ))}
            </div>
          )}
          {c.brands.length > 0 && (
            <section className="department-brands">
              <h2>Популярные бренды</h2>
              <div>
                {c.brands.map((brand) => (
                  <button
                    key={brand.id}
                    type="button"
                    aria-label={brand.name}
                    onClick={() => choose(brand.name)}
                  >
                    <img src={brand.imageSrc} alt={brand.name} />
                  </button>
                ))}
              </div>
            </section>
          )}
          <div className="department-results" ref={results}>
            <button
              className="filter-trigger"
              type="button"
              aria-expanded={filtersOpen}
              onClick={() => setFiltersOpen(!filtersOpen)}
            >
              Фильтры
            </button>
            <aside className="department-filters" data-expanded={filtersOpen}>
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
              <div className="department-results-heading">
                <h2>
                  {model.collection ||
                    (model.saleOnly ? 'Акции и скидки' : 'Все товары')}
                </h2>
                {(model.collection || model.saleOnly) && (
                  <button type="button" onClick={() => choose('')}>
                    Сбросить подборку
                  </button>
                )}

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

              {model.loadError ? (
                <Card
                  role="alert"
                  className="mb-4 flex flex-wrap items-center justify-between gap-4 border border-slate-200 p-5 shadow-none"
                >
                  <div>
                    <p className="font-semibold text-slate-900">
                      {model.loadError}
                    </p>
                    <p className="mt-1 text-slate-500 text-sm">
                      Попробуйте загрузить их ещё раз.
                    </p>
                  </div>
                  <ActionButton
                    action={() => void model.loadProductsChunk()}
                    look="solidBrand"
                    text="Повторить"
                  />
                </Card>
              ) : null}
              {model.isProductsLoaded &&
                !model.products.length &&
                !model.loadError && <p>По выбранным фильтрам товаров нет.</p>}
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
    fallback: CategoryLoading,
  },
);
