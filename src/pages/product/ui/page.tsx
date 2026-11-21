import {
  ChevronRight,
  Heart,
  MapPin,
  Minus,
  Plus,
  RotateCcw,
  Share2,
  Star,
  Store,
  Truck,
} from 'lucide-react';
import { withViewModel } from 'mobx-view-model-react';
import { declension } from 'yummies/text';
import { ClientOnly } from '../../../shared/ui/client-only';
import { ProductPageVM } from '../model';
import { FeedbackSections } from './components/product-feedback';
import { ProductNotFound } from './components/product-not-found';

export const ProductPage = withViewModel(
  ProductPageVM,
  ({ model }) => {
    if (!model.ctx)
      return (
        <main className="detail-page" aria-busy="true">
          Загружаем товар…
        </main>
      );
    const product = model.product;
    if (!product) return <ProductNotFound />;
    return (
      <main className="detail-page">
        <div className="product-toolbar">
          <nav aria-label="Путь к товару">
            <a href="/">Главная</a>
            <ChevronRight />
            <a href={`/category/${product.categoryId}`}>
              {model.categoriesPath.at(-1)?.title ?? 'Категория'}
            </a>
            <ChevronRight />
            <span>{product.title}</span>
          </nav>
          <button type="button" onClick={model.shareProduct}>
            <Share2 />
            Поделиться
          </button>
        </div>
        <div className="product-layout">
          <div className="product-gallery">
            {product.images?.length ? (
              <img
                className="product-photo"
                src={model.activeImage}
                alt={product.title}
              />
            ) : (
              <div className="product-photo empty-panel">Фото пока нет</div>
            )}
            {model.images.length > 1 && (
              <div className="product-thumbs">
                {model.images.map((src, index) => (
                  <button
                    type="button"
                    key={src}
                    aria-label={`Фото ${index + 1}`}
                    aria-pressed={index === model.activeImageIndex}
                    onClick={() => model.setActiveImage(index)}
                  >
                    <img src={src} alt="" />
                  </button>
                ))}
              </div>
            )}
          </div>
          <section className="product-information">
            <header>
              <h1>{product.title}</h1>
              <div className="product-rating">
                <strong>
                  <Star size={16} />
                  {product.rating.toFixed(1)}
                </strong>
                <a href="#reviews">
                  {model.reviewsText}{' '}
                  {declension(product.reviewsCount, [
                    'отзыв',
                    'отзыва',
                    'отзывов',
                  ])}
                </a>
                <a href="#questions">
                  {model.questionsText}{' '}
                  {declension(product.questionsCount, [
                    'вопрос',
                    'вопроса',
                    'вопросов',
                  ])}
                </a>
              </div>
            </header>
            <section>
              <h2>Характеристики</h2>
              <dl className="product-specs">
                {product.colorText && (
                  <div>
                    <dt>Цвет</dt>
                    <dd>{product.colorText}</dd>
                  </div>
                )}
                {model.characteristics
                  .filter((item) => item.label !== 'Наименование')
                  .map((item) => (
                    <div key={item.label}>
                      <dt>{item.label}</dt>
                      <dd>{item.value}</dd>
                    </div>
                  ))}
              </dl>
              <a className="description-link" href="#description">
                Перейти к описанию
              </a>
            </section>
            <section className="product-seller">
              <Store />
              <div>
                <small>Продавец</small>
                <strong>{model.shopName}</strong>
              </div>
            </section>
          </section>
          <aside className="purchase-panel" aria-label="Покупка и доставка">
            <div className="product-price">
              <strong>{model.priceText}</strong>
              {model.discountText && (
                <>
                  <del>{model.originalPriceText}</del>
                  <b>{model.discountText}</b>
                </>
              )}
            </div>
            {model.showPriceDropBadge && model.discountText && (
              <p className="price-note">Стало дешевле</p>
            )}
            <ClientOnly
              fallback={<div className="purchase-loading" aria-hidden="true" />}
            >
              <div className="purchase-actions">
                <button
                  type="button"
                  className="cart-primary"
                  disabled={model.isAddingToCart || model.isCartLoading}
                  onClick={model.isInCart ? model.goToCart : model.addToCart}
                >
                  {model.isAddingToCart
                    ? 'Добавляем…'
                    : model.isInCart
                      ? 'В корзине'
                      : 'В корзину'}
                </button>
                <div className="quantity-stepper" inert={!model.isInCart}>
                  <button
                    type="button"
                    aria-label="Уменьшить количество"
                    disabled={model.isCartLoading}
                    onClick={model.decrementCartQuantity}
                  >
                    <Minus />
                  </button>
                  <output aria-label="Количество">
                    <span key={model.cartQuantity}>
                      {model.cartQuantity || 1}
                    </span>
                  </output>
                  <button
                    type="button"
                    aria-label="Увеличить количество"
                    disabled={
                      model.isCartLoading || !model.canIncreaseCartQuantity
                    }
                    onClick={model.incrementCartQuantity}
                  >
                    <Plus />
                  </button>
                </div>
                <button
                  type="button"
                  className="product-heart"
                  aria-label={
                    model.isFavorite
                      ? 'Убрать из избранного'
                      : 'Добавить в избранное'
                  }
                  aria-pressed={model.isFavorite}
                  disabled={model.isFavoritesLoading}
                  onClick={model.toggleFavorite}
                >
                  <Heart />
                </button>
              </div>
            </ClientOnly>
            <section className="shipping">
              <h2>Доставка и возврат</h2>
              <div>
                <MapPin />
                <span>{model.deliveryAddress}</span>
              </div>
              <div>
                <Truck />
                <span>
                  <strong>{model.deliveryText}</strong>
                  {model.deliveryVariants.map((item) => (
                    <small key={item.variant}>{item.label}</small>
                  ))}
                </span>
              </div>
              <div>
                <RotateCcw />
                <span>{model.returnPeriodText}</span>
              </div>
            </section>
          </aside>
        </div>
        <FeedbackSections
          key={product.id}
          product={product}
          shop={model.shopName}
        />
      </main>
    );
  },
  { fallback: () => null },
);
