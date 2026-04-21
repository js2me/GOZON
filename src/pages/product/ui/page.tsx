import { Button, Link } from '@heroui/react';
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
import { ProductPageVM } from '../model';
import { ProductNotFound } from './components/product-not-found';

export const ProductPage = withViewModel(
  ProductPageVM,
  ({ model }) => {
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
                  <span className={isLastCategory ? 'font-medium text-slate-700' : ''}>
                    {category.title}
                  </span>
                  <ChevronRight className="size-3.5" />
                </div>
              );
            })}
            <span className="font-medium text-slate-700">{product.title.slice(0, 16)}</span>
          </div>

          <div className="grid grid-cols-[80px_minmax(0,1fr)_minmax(420px,1fr)_390px] gap-5">
            <aside className="rounded-3xl bg-white p-2 mb-auto">
              <div className="flex flex-col gap-2">
                {model.images.map((img, index) => (
                  <button
                    className={`overflow-hidden rounded-xl border-2 transition-colors ${index === model.activeImageIndex
                      ? 'border-brand'
                      : 'border-transparent'
                      }`}
                    key={`${product.id}-${img}-preview`}
                    onClick={() => model.setActiveImage(index)}
                    type="button"
                  >
                    <img
                      alt=""
                      className="h-[64px] w-full object-cover"
                      src={img}
                    />
                  </button>
                ))}
              </div>
            </aside>

            <section className="rounded-3xl bg-white p-3">
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

            <section className="rounded-3xl bg-white px-5 py-6">
              <div className="mb-2 flex items-center gap-4 text-[13px] text-slate-500">
                <span>Артикул: {model.product.id}</span>
                <Link className="text-slate-500 no-underline" href="#">
                  В сравнение
                </Link>
                <button
                  className="inline-flex items-center gap-1"
                  onClick={() => void model.shareProduct()}
                  type="button"
                >
                  <Share2 className="size-4" />
                  <span>Поделиться</span>
                </button>
              </div>

              <h1 className="font-bold text-[28px] text-slate-900 leading-[1.1]">
                {model.product.title}
              </h1>

              <div className="mt-3 flex items-center gap-2.5 text-[16px]">
                <span className="inline-flex items-center gap-1 font-medium text-slate-800">
                  <Star className="size-4 fill-rating-star text-rating-star" />
                  {model.product.rating.toFixed(1)}
                </span>
                <span className="text-slate-500">·</span>
                <span className="font-medium text-slate-600">
                  {model.reviewsText}{' '}
                  {declension(model.product.reviewsCount, ['отзыв', 'отзыва', 'отзывов'])}
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
                  <button
                    className={`overflow-hidden rounded-lg border-2 ${index === model.activeImageIndex
                      ? 'border-brand'
                      : 'border-slate-200'
                      }`}
                    key={`${product.id}-${image}-thumb`}
                    onClick={() => model.setActiveImage(index)}
                    type="button"
                  >
                    <img
                      alt=""
                      className="h-18 w-16 object-cover"
                      src={image}
                    />
                  </button>
                ))}
              </div>

              <div className="mt-5 flex items-center justify-between">
                <p className="font-semibold text-[20px] text-slate-900">
                  О товаре
                </p>
                <Link
                  className="text-[14px] text-profile-link no-underline"
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

            <aside className="rounded-3xl bg-white p-5">
              {model.saleBadgeText ? (
                <div className="flex items-center rounded-2xl bg-product-sale-bg px-4 py-3 text-[14px] text-product-sale-text">
                  <p className="my-auto inline-flex items-center gap-2 font-semibold">
                    <Percent className="size-4" />
                    {model.saleBadgeText}
                  </p>
                </div>
              ) : null}

              <div className="mt-4 rounded-2xl bg-product-price-panel-bg p-4">
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

              <div className="mt-5 flex items-center gap-3">
                <Button
                  className="h-12 flex-1 rounded-2xl bg-brand font-bold text-[17px] text-white"
                  isDisabled={model.isAddingToCart || model.isInCart}
                  onClick={model.addToCart}
                >
                  <span className="flex min-w-[120px] flex-1 justify-center">
                    {model.isAddingToCart
                      ? 'Добавляем…'
                      : model.isInCart
                        ? 'В корзине'
                        : 'В корзину'}
                  </span>
                  {!model.isInCart && <span
                    className="block font-medium text-white/95 leading-tight"
                    style={{ fontSize: '15px' }}
                  >
                    {model.deliveryText}
                  </span>}
                </Button>

                <div
                  className={cx(
                    'overflow-hidden transition-all duration-300 ease-out',
                    model.isInCart ? 'w-[255px] opacity-100' : 'w-0 opacity-0',
                  )}
                >
                  <div className="flex h-12 items-center justify-between rounded-2xl bg-slate-100 px-4">
                    <button
                      className="inline-flex size-8 items-center justify-center rounded-full text-brand transition-colors hover:bg-slate-200 disabled:text-slate-400"
                      onClick={model.decrementCartQuantity}
                      type="button"
                    >
                      <Minus className="size-5" />
                    </button>
                    <span
                      className="font-semibold text-slate-900 tabular-nums leading-none"
                      style={{ fontSize: '34px' }}
                    >
                      {model.cartQuantity}
                    </span>
                    <button
                      className="inline-flex size-8 items-center justify-center rounded-full text-brand transition-colors hover:bg-slate-200 disabled:text-slate-400"
                      disabled={!model.canIncreaseCartQuantity}
                      onClick={model.incrementCartQuantity}
                      type="button"
                    >
                      <Plus className="size-5" />
                    </button>
                  </div>
                </div>

                <button
                  className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-[#dfe8f2] text-brand transition-colors hover:bg-[#d1deeb]"
                  onClick={model.toggleFavorite}
                  type="button"
                >
                  <Heart
                    className={`size-6 ${model.isFavorite ? 'fill-brand text-brand' : ''}`}
                  />
                </button>
              </div>

              <Button
                className="mt-3 h-11 w-full rounded-2xl bg-product-buy-now-bg font-semibold text-[16px] text-brand"
                variant="secondary"
              >
                Купить сейчас
              </Button>

              <div className="mt-5 space-y-3 rounded-2xl bg-product-delivery-bg p-4 text-[14px] text-slate-700">
                <p>{model.deliveryAddress}</p>
                <p>Курьерской службой партнера</p>
                <p>Пункты выдачи партнера</p>
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
