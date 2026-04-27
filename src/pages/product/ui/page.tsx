import { Link } from '@heroui/react';
import {
  Check,
  ChevronRight,
  Heart,
  MessageCircle,
  Minus,
  Percent,
  Plus,
  Share2,
  Star,
} from 'lucide-react';
import { withViewModel } from 'mobx-view-model-react';
import { cx } from 'yummies/css';
import { declension } from 'yummies/text';
import { ActionButton } from '../../../shared/ui/action-button';
import { ClientOnly } from '../../../shared/ui/client-only';
import { ProductPageVM } from '../model';
import { ProductNotFound } from './components/product-not-found';

export const ProductPage = withViewModel(
  ProductPageVM,
  ({ model }) => {
    if (model.isInitializing && !model.product) {
      return (
        <main className="w-full bg-base-bg pt-4 pb-10">
          <section className="mx-auto w-full max-w-[1416px] px-4">
            <div className="mb-3 h-5 w-2/3 max-w-md animate-pulse rounded-lg bg-slate-200" />
            <div className="grid grid-cols-[80px_minmax(0,1fr)_minmax(420px,1fr)_390px] gap-5">
              <aside className="mb-auto rounded-3xl bg-contrast-bg p-2">
                <div className="h-16 w-full animate-pulse rounded-xl bg-slate-200" />
              </aside>
              <div className="h-[620px] animate-pulse rounded-3xl bg-slate-200" />
              <div className="rounded-3xl bg-contrast-bg px-5 py-6">
                <div className="h-8 w-3/4 animate-pulse rounded-lg bg-slate-200" />
                <div className="mt-4 h-40 animate-pulse rounded-xl bg-slate-200" />
              </div>
              <aside className="rounded-3xl bg-contrast-bg p-5">
                <div className="h-32 animate-pulse rounded-2xl bg-slate-200" />
              </aside>
            </div>
          </section>
        </main>
      );
    }

    if (!model.product) {
      return <ProductNotFound />;
    }

    const product = model.product;

    return (
      <main className="w-full bg-base-bg pt-4 pb-10">
        <section className="mx-auto w-full max-w-[1416px] px-4">
          <div className="mb-3 flex items-center gap-1 text-[13px] text-slate-500">
            {model.categoriesPath.map((category, index) => {
              const isLastCategory = index === model.categoriesPath.length - 1;
              return (
                <div className="contents" key={category.id}>
                  <span
                    className={
                      isLastCategory ? 'font-medium text-slate-700' : ''
                    }
                  >
                    {category.title}
                  </span>
                  <ChevronRight className="size-3.5" />
                </div>
              );
            })}
            <span className="font-medium text-slate-700">
              {product.title.slice(0, 16)}
            </span>
          </div>

          <div className="grid grid-cols-[80px_minmax(0,1fr)_minmax(420px,1fr)_390px] gap-5">
            <aside className="mb-auto rounded-3xl bg-contrast-bg p-2">
              <div className="flex flex-col gap-2">
                {model.images.map((img, index) => (
                  <ActionButton
                    action={() => model.setActiveImage(index)}
                    className="w-full"
                    key={`${product.id}-${img}-preview`}
                    selected={index === model.activeImageIndex}
                    look="mediaRail"
                  >
                    <img
                      alt=""
                      className="h-[64px] w-full object-cover"
                      src={img}
                    />
                  </ActionButton>
                ))}
              </div>
            </aside>

            <section className="rounded-3xl bg-contrast-bg p-3">
              <div className="relative overflow-hidden rounded-3xl bg-slate-100">
                <img
                  alt={model.product.title}
                  className="h-[620px] w-full object-cover"
                  src={model.activeImage}
                />
                <div className="absolute top-4 left-4 rounded-xl bg-black/40 px-3 py-1.5 font-semibold text-[24px] text-white uppercase leading-[0.95]">
                  {model.product.title.slice(0, 16)}
                </div>
              </div>
            </section>

            <section className="rounded-3xl bg-contrast-bg px-5 py-6">
              <div className="mb-2 flex items-center gap-4 text-[13px] text-slate-500">
                <span>Артикул: {model.product.id}</span>
                <Link className="text-slate-500 no-underline" href="#">
                  В сравнение
                </Link>
                <ActionButton
                  action={() => void model.shareProduct()}
                  icon={Share2}
                  iconClassName="size-4"
                  text="Поделиться"
                  look="ghostNeutral"
                />
              </div>

              <h1 className="font-bold text-[28px] text-slate-900 leading-[1.1]">
                {model.product.title}
              </h1>

              <div className="mt-3 flex items-center gap-2.5 text-[16px]">
                <span className="inline-flex items-center gap-1 font-medium text-slate-800">
                  <Star className="size-4 fill-rating-accent text-rating-accent" />
                  {model.product.rating.toFixed(1)}
                </span>
                <span className="text-slate-500">·</span>
                <span className="font-medium text-slate-600">
                  {model.reviewsText}{' '}
                  {declension(model.product.reviewsCount, [
                    'отзыв',
                    'отзыва',
                    'отзывов',
                  ])}
                </span>
                <span className="text-slate-500">·</span>
                <span className="font-medium text-slate-600">
                  {model.questionsText} вопросов
                </span>
              </div>

              <p className="mt-2 text-[15px] text-slate-600">
                Цвет: {model.colorText}
              </p>

              <div className="mt-4 flex gap-2">
                {model.images.map((image, index) => (
                  <ActionButton
                    action={() => model.setActiveImage(index)}
                    key={`${product.id}-${image}-thumb`}
                    selected={index === model.activeImageIndex}
                    look="mediaSwatch"
                  >
                    <img
                      alt=""
                      className="h-18 w-16 object-cover"
                      src={image}
                    />
                  </ActionButton>
                ))}
              </div>

              <div className="mt-5 flex items-center justify-between">
                <p className="font-semibold text-[20px] text-slate-900">
                  О товаре
                </p>
                <Link
                  className="text-[14px] text-link-primary no-underline"
                  href="#"
                >
                  Перейти к описанию
                </Link>
              </div>

              <dl className="mt-3 space-y-3 text-[14px]">
                {model.characteristics.map((characteristic) => (
                  <div
                    className="flex justify-between gap-4 border-slate-200 border-b pb-2"
                    key={characteristic.label}
                  >
                    <dt className="text-slate-500">{characteristic.label}</dt>
                    <dd className="text-slate-900">{characteristic.value}</dd>
                  </div>
                ))}
              </dl>
            </section>

            <aside className="rounded-3xl bg-contrast-bg p-5">
              {model.saleBadgeText ? (
                <div className="flex items-center rounded-2xl bg-highlight-bg px-4 py-3 text-[14px] text-highlight-text">
                  <p className="my-auto inline-flex items-center gap-2 font-semibold">
                    <Percent className="size-4" />
                    {model.saleBadgeText}
                  </p>
                </div>
              ) : null}

              <div className="mt-4 rounded-2xl bg-surface-positive p-4">
                <p className="font-extrabold text-[36px] text-brand-accent leading-none">
                  {model.priceText}
                </p>
                <p className="mt-1 flex items-center gap-2 text-[16px] text-slate-600">
                  <span className="line-through">
                    {model.originalPriceText}
                  </span>
                  <span className="font-bold text-brand-accent">
                    {model.discountText}
                  </span>
                </p>
                {model.showPriceDropBadge ? (
                  <p className="mt-2 inline-flex items-center gap-2 text-[14px] text-brand">
                    <Check className="size-4" />
                    Стало дешевле
                  </p>
                ) : null}
              </div>

              <ClientOnly
                fallback={
                  <div
                    aria-hidden
                    className="mt-5 flex h-12 items-center gap-3"
                  >
                    <div className="h-12 min-h-12 flex-1 rounded-2xl bg-slate-200/70" />
                    <div className="h-12 w-0 min-w-0 shrink-0 overflow-hidden opacity-0" />
                    <div className="size-12 shrink-0 rounded-2xl bg-slate-200/70" />
                  </div>
                }
              >
                <div className="mt-5 flex items-center gap-3">
                  <ActionButton
                    action={model.isInCart ? model.goToCart : model.addToCart}
                    disabled={model.isAddingToCart}
                    className="min-w-[120px] flex-1"
                    extraText={model.isInCart ? undefined : model.deliveryText}
                    look="solidBrand"
                    size="l"
                    text={
                      model.isAddingToCart
                        ? 'Добавляем…'
                        : model.isInCart
                          ? 'В корзине'
                          : 'В корзину'
                    }
                  />

                  <div
                    className={cx(
                      'overflow-hidden transition-all duration-300 ease-out',
                      model.isInCart
                        ? 'w-[255px] opacity-100'
                        : 'w-0 opacity-0',
                    )}
                  >
                    <div className="flex h-12 items-center justify-between rounded-2xl bg-slate-100 px-4">
                      <ActionButton
                        action={model.decrementCartQuantity}
                        icon={Minus}
                        loading={model.isCartLoading}
                        size="m"
                      />
                      <span className="font-semibold text-2xl text-slate-900 tabular-nums leading-none">
                        {model.cartQuantity}
                      </span>
                      <ActionButton
                        action={model.incrementCartQuantity}
                        disabled={!model.canIncreaseCartQuantity}
                        icon={Plus}
                        loading={model.isCartLoading}
                        size="m"
                      />
                    </div>
                  </div>

                  <ActionButton
                    accentIcon
                    action={model.toggleFavorite}
                    ariaLabel={
                      model.isFavorite
                        ? 'Убрать из избранного'
                        : 'Добавить в избранное'
                    }
                    icon={Heart}
                    loading={model.isFavoritesLoading}
                    look="surface"
                    selected={model.isFavorite}
                    size="l"
                  />
                </div>
              </ClientOnly>

              <ActionButton
                className="mt-3"
                look="softBrand"
                text="Купить сейчас"
              />

              <div className="mt-5 space-y-3 rounded-2xl bg-surface-info p-4 text-[14px] text-slate-700">
                <p>{model.deliveryAddress}</p>
                {model.deliveryVariants.map(({ variant, label }) => (
                  <p key={variant}>{label}</p>
                ))}
                <p>{model.returnPeriodText}</p>
              </div>

              <div className="mt-4 rounded-2xl border border-slate-200 p-4">
                <p className="font-semibold text-[17px] text-slate-900">
                  Магазин
                </p>
                <p className="mt-2 text-[15px] text-slate-700">
                  {model.shopName}
                </p>
                <p className="mt-2 inline-flex items-center gap-1 text-[13px] text-slate-500">
                  <MessageCircle className="size-4" />
                  Чат
                </p>
              </div>
            </aside>
          </div>
        </section>
      </main>
    );
  },
  {
    fallback: () => null,
  },
);
