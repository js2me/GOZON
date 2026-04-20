import { getShopById } from '../../data/shops';

export function createGetShopById() {
  return function getShop(shopId: number) {
    return Promise.resolve(getShopById(shopId));
  };
}
