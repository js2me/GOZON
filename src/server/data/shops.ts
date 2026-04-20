import type { ShopDC } from '../../shared/api/api';

export const allShops: ShopDC[] = [
  { id: 1, name: 'Божественная Красота' },
  { id: 2, name: 'Мастерская Уюта' },
  { id: 3, name: 'Сила Стиля' },
  { id: 4, name: 'Дом Трендов' },
  { id: 5, name: 'Северный Склад' },
  { id: 6, name: 'Лайм Маркет' },
  { id: 7, name: 'Империя Комфорта' },
  { id: 8, name: 'Формула Выгоды' },
];

export function getShopById(shopId: number): ShopDC | null {
  return allShops.find((shop) => shop.id === shopId) ?? null;
}
