import { computed, makeObservable, observable } from 'mobx';
import { assert } from 'yummies/assert';
import type { ProductDC } from '../../../shared/api/api';
import { PageVM } from '../../../shared/lib/view-models/page-vm';
import type { ProductPageContext } from './types';

const FALLBACK_PRODUCT_IMAGE = '/public/vite.svg';

export class ProductPageVM extends PageVM<ProductPageContext> {
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
    const path = this.getCurrentPathname();
    const match = path.match(/^\/products\/(\d+)\/?$/);
    if (!match?.[1]) {
      return null;
    }

    return Number(match[1]);
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
      ((this.product.originalPrice - this.product.price) / this.product.originalPrice) * 100,
    );
    if (discount <= 0) {
      return '';
    }

    return `-${discount}%`;
  }

  get reviewsText(): string {
    if (!this.product) {
      return '';
    }

    return this.product.reviewsCount.toLocaleString('ru-RU');
  }

  get deliveryAddress(): string {
    return this.ctx?.profile?.address ?? 'Высоковский пр-д, 20';
  }

  get shopName(): string {
    return this.ctx?.shop?.name ?? '';
  }

  setActiveImage = (index: number) => {
    this.activeImageIndex = index;
  };

  protected willMount(): void {
    makeObservable(this, {
      activeImageIndex: observable.ref,
      product: computed,
      productId: computed,
      images: computed.struct,
      activeImage: computed,
      priceText: computed,
      originalPriceText: computed,
      discountText: computed,
      reviewsText: computed,
      deliveryAddress: computed,
      shopName: computed,
    });

    if (this.product?.title) {
      this.globals.stores.appInfo.setTitle(`${this.product.title} - GOZON`);
    }
  }

  private getCurrentPathname(): string {
    const history = this.globals.router.history as {
      location?: { pathname?: string };
      pathname?: string;
      path?: string;
    };

    return history.location?.pathname ?? history.pathname ?? history.path ?? '';
  }

  async init(): Promise<ProductPageContext> {
    const profile = await this.globals.db.getProfile();
    const productId = this.productId;

    assert.defined(productId, 'Product id is required for product page');

    try {
      const product = await this.globals.db.getProductById(productId);
      const shop = await this.globals.db.getShopById(product!.shopId);
      return { product, profile, shop };
    } catch {
      return { product: null, profile, shop: null };
    }
  }
}
