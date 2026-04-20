import { getProductById } from '../../data/products';

export function createGetProductById() {
  return function getProduct(productId: number) {
    return Promise.resolve(getProductById(productId));
  };
}
