import { computed, makeObservable, observable } from 'mobx';
import { assert } from 'yummies/assert';
import {
  loadProductById,
  loadProfile,
  loadShopById,
  type ProductCategoryDC,
  type ProductCharacteristicDC,
  type ProductDC,
  ProductDeliveryVariant,
} from '../../../shared/api/api';
import { PageVM } from '../../../shared/lib/view-models/page-vm';
import type { ProductPageContext } from './types';
import { parser } from 'yummies/parser';

const FALLBACK_PRODUCT_IMAGE = '/vite.svg';

const deliveryVariantLabels: Record<ProductDeliveryVariant, string> = {
  [ProductDeliveryVariant.PartnerCourier]: 'Курьерской службой партнера',
  [ProductDeliveryVariant.PartnerPickupPoints]: 'Пункты выдачи партнера',
};

export class ProductPageVM extends PageVM<ProductPageContext | null> {
  activeImageIndex = 0;

  get product(): ProductDC | null {
    return this.ctx?.product ?? null;
  }

  get images(): string[] {
    const images = this.product?.images?.filter(Boolean) ?? [];
    if (images.length > 0) {
      return images;
    }

    return [FALLBACK_PRODUCT_IMAGE];
  }

  get activeImage(): string {
    return this.images[this.activeImageIndex] ?? this.images[0];
  }

  get productId(): number | null {
    return parser.number(this.globals.router.routes.product.params?.productId, { fallback: null });
  }

  get priceText(): string {
    if (!this.product) {
      return '';
    }

    return `${this.product.price.toLocaleString('ru-RU')} ₽`;
  }

  get originalPriceText(): string {
    if (!this.product) {
      return '';
    }

    return `${this.product.originalPrice.toLocaleString('ru-RU')} ₽`;
  }

  get discountText(): string {
    if (!this.product || this.product.originalPrice <= 0) {
      return '';
    }

    const discount = Math.round(
      ((this.product.originalPrice - this.product.price) /
        this.product.originalPrice) *
      100,
    );
    if (discount <= 0) {
      return '';
    }

    return `-${discount}%`;
  }

  get saleBadgeText(): string {
    if (!this.discountText) {
      return '';
    }

    return `Распродажа ${this.discountText}`;
  }

  get reviewsText(): string {
    if (!this.product) {
      return '';
    }

    return this.product.reviewsCount.toLocaleString('ru-RU');
  }

  get questionsText(): string {
    if (!this.product) {
      return '';
    }

    return this.product.questionsCount.toLocaleString('ru-RU');
  }

  get deliveryAddress(): string {
    return this.ctx?.profile?.address ?? 'Высоковский пр-д, 20';
  }

  get deliveryVariants(): {
    variant: ProductDeliveryVariant;
    label: string;
  }[] {
    const variants = this.product?.deliveryVariants;
    if (!variants?.length) {
      return [];
    }
    return variants.map((variant) => ({
      variant,
      label: deliveryVariantLabels[variant] ?? String(variant),
    }));
  }

  get shopName(): string {
    return this.ctx?.shop?.name ?? '';
  }

  get deliveryText(): string {
    return this.product?.deliveryText ?? 'Доставим завтра';
  }

  get colorText(): string {
    return this.product?.colorText ?? 'Не указан';
  }

  get showPriceDropBadge(): boolean {
    return Boolean(this.product?.hasPriceDropBadge);
  }

  get returnPeriodText(): string {
    const days = this.product?.returnPeriodDays;
    if (!days || days <= 0) {
      return 'Можно вернуть товар';
    }

    return `Можно вернуть в течение ${days} дней`;
  }

  get characteristics(): ProductCharacteristicDC[] {
    return this.product?.characteristics ?? [];
  }

  get categoriesPath(): ProductCategoryDC[] {
    return this.product?.categoriesPath ?? [];
  }

  get isAddingToCart(): boolean {
    if (!this.productId) {
      return false;
    }
    return this.globals.stores.cart.isAddingProduct(this.productId);
  }

  get isInCart(): boolean {
    if (!this.productId || this.globals.isServer) {
      return false;
    }
    return this.globals.stores.cart.hasProduct(this.productId);
  }

  get isFavorite(): boolean {
    if (!this.productId || this.globals.isServer) {
      return false;
    }
    return this.globals.stores.favorites.hasProduct(this.productId);
  }

  get isFavoritesLoading(): boolean {
    if (!this.globals.isClient || this.globals.isServer) {
      return false;
    }
    return this.globals.stores.favorites.isLoading;
  }

  get isCartLoading(): boolean {
    if (!this.globals.isClient || this.globals.isServer) {
      return false;
    }
    const cart = this.globals.stores.cart;
    return cart.isLoading || cart.isSyncing;
  }

  get cartQuantity(): number {
    if (!this.productId) {
      return 0;
    }

    const item = this.globals.stores.cart.items.find(
      (cartItem) => cartItem.productId === this.productId,
    );
    return item?.quantity.current ?? 0;
  }

  get canIncreaseCartQuantity(): boolean {
    if (!this.productId) {
      return false;
    }

    const item = this.globals.stores.cart.items.find(
      (cartItem) => cartItem.productId === this.productId,
    );
    if (!item) {
      return false;
    }

    return item.quantity.current < item.quantity.maxAvailable;
  }

  setActiveImage = (index: number) => {
    this.activeImageIndex = index;
  };

  addToCart = async () => {
    if (!this.productId || this.isAddingToCart || this.isInCart) {
      return;
    }

    await this.globals.stores.cart.addProduct(this.productId);
  };

  goToCart = () => {
    this.globals.router.routes.cart.open();
  };

  toggleFavorite = () => {
    if (!this.productId) {
      return;
    }
    this.globals.stores.favorites.toggleProduct(this.productId);
  };

  shareProduct = async () => {
    if (!this.product || !this.globals.isClient) {
      return;
    }

    const shareUrl = `${window.location.origin}/products/${this.product.id}`;

    if (navigator.share) {
      await navigator.share({
        title: this.product.title,
        text: this.product.title,
        url: shareUrl,
      });
      return;
    }

    if (navigator.clipboard?.writeText) {
      await navigator.clipboard.writeText(shareUrl);
    }
  };

  incrementCartQuantity = () => {
    if (!this.productId) {
      return;
    }

    this.globals.stores.cart.increment(this.productId);
  };

  decrementCartQuantity = () => {
    if (!this.productId) {
      return;
    }

    if (this.cartQuantity <= 1) {
      this.globals.stores.cart.removeItem(this.productId);
      return;
    }

    this.globals.stores.cart.decrement(this.productId);
  };

  didCreate(): void {
    makeObservable(this, {
      activeImageIndex: observable.ref,
      product: computed,
      productId: computed,
      images: computed.struct,
      activeImage: computed,
      priceText: computed,
      originalPriceText: computed,
      discountText: computed,
      saleBadgeText: computed,
      reviewsText: computed,
      questionsText: computed,
      deliveryAddress: computed,
      deliveryVariants: computed,
      shopName: computed,
      deliveryText: computed,
      colorText: computed,
      showPriceDropBadge: computed,
      returnPeriodText: computed,
      characteristics: computed.struct,
      categoriesPath: computed.struct,
      isAddingToCart: computed,
      isInCart: computed,
      isFavorite: computed,
      isFavoritesLoading: computed,
      isCartLoading: computed,
      cartQuantity: computed,
      canIncreaseCartQuantity: computed,
    });

    this.onInit(async ssr => {
      try {
        assert.defined(this.productId, 'Product id is required for product page');

        if (ssr) {
          const profile = await this.globals.ssr.getProfile();
          const product = await this.globals.ssr.getProductById(this.productId);
          const shop = await this.globals.ssr.getShopById(product!.shopId);

          const pageTitle = `${product!.title} - ${this.globals.stores.appInfo.appName}`;
          const priceLabel = `от ${product!.price.toLocaleString('ru-RU')} ₽`;
          const head = this.globals.ssr.head;

          head.title = pageTitle;
          head.ogTitle = product!.title;
          head.ogDescription = `${product!.title} — ${priceLabel}`;
          head.ogImage = product!.images?.[0] ?? FALLBACK_PRODUCT_IMAGE;
          head.ogUrl = `/products/${product!.id}`;
          head.ogType = 'product';

          return { product, profile, shop };
        } else {
          const product = await loadProductById(this.productId);
          const [shop, profile] = await Promise.all([
            loadShopById(product.shopId),
            loadProfile(),
          ]);

          void this.globals.stores.cart.load();
          this.globals.stores.favorites.load();

          return { product, profile, shop };
        }

      } catch {
        return null;
      }
    })

    if (this.globals.isClient) {
      void this.globals.stores.cart.load();
      this.globals.stores.favorites.load();
    }
  }
}
