import { Button, Link } from '@heroui/react';
import {
  Check,
  ChevronRight,
  Heart,
  MessageCircle,
  Percent,
  Share2,
  Star,
} from 'lucide-react';
import { withViewModel } from 'mobx-view-model-react';
import { ProductNotFound } from './components/product-not-found';
import { ProductPageVM } from '../model';

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
            <span>Одежда</span>
            <ChevronRight className="size-3.5" />
            <span>Мужская одежда</span>
            <ChevronRight className="size-3.5" />
            <span>Брюки</span>
            <ChevronRight className="size-3.5" />
            <span className="font-medium text-slate-700">GGBO</span>
          </div>

          <div className="grid grid-cols-[80px_minmax(0,1fr)_minmax(420px,1fr)_390px] gap-5">
            <aside className="rounded-3xl bg-white p-2">
              <div className="flex flex-col gap-2">
                {model.images.map((img, index) => (
                  <button
                    className={`overflow-hidden rounded-xl border-2 transition-colors ${
                      index === model.activeImageIndex
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
                  {model.reviewsText} отзывов
                </span>
                <span className="text-slate-500">·</span>
                <span className="font-medium text-slate-600">40 вопросов</span>
              </div>

              <p className="mt-2 text-[15px] text-slate-600">
                Цвет: Хлопок и лен серый
              </p>

              <div className="mt-4 flex gap-2">
                {model.images.map((image, index) => (
                  <button
                    className={`overflow-hidden rounded-lg border-2 ${
                      index === model.activeImageIndex
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
                <div className="flex justify-between gap-4 border-slate-200 border-b pb-2">
                  <dt className="text-slate-500">Материал</dt>
                  <dd className="text-slate-900">Лен</dd>
                </div>
                <div className="flex justify-between gap-4 border-slate-200 border-b pb-2">
                  <dt className="text-slate-500">Состав материала</dt>
                  <dd className="text-slate-900">100% хлопок</dd>
                </div>
                <div className="flex justify-between gap-4 border-slate-200 border-b pb-2">
                  <dt className="text-slate-500">Коллекция</dt>
                  <dd className="text-slate-900">Базовая коллекция</dd>
                </div>
                <div className="flex justify-between gap-4 border-slate-200 border-b pb-2">
                  <dt className="text-slate-500">Рост</dt>
                  <dd className="text-slate-900">155-185</dd>
                </div>
              </dl>
            </section>

            <aside className="rounded-3xl bg-white p-5">
              <div className="rounded-2xl bg-product-sale-bg px-4 py-3 text-[14px] flex items-center text-product-sale-text">
                <p className="inline-flex items-center gap-2 font-semibold my-auto">
                  <Percent className="size-4" />
                  Распродажа
                </p>
              </div>

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
                <p className="mt-2 inline-flex items-center gap-2 text-[14px] text-brand">
                  <Check className="size-4" />
                  Стало дешевле
                </p>
              </div>

              <Button className="mt-5 h-12 w-full rounded-2xl bg-brand font-bold text-[17px] text-white">
                В корзину
              </Button>

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
                <p>Можно вернуть в течение 15 дней</p>
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

              <button
                className="mt-3 inline-flex items-center gap-2 text-[13px] text-slate-500"
                type="button"
              >
                <Heart className="size-4" />В избранное
              </button>
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
