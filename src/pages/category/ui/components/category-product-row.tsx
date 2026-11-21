import { ItemCard } from '../../../../widgets/item-card';
import type { ProductRow } from '../../../home/model/types';

const LOADING_PLACEHOLDER_KEYS = ['c0', 'c1', 'c2', 'c3'] as const;

export const CategoryProductCardsRow = ({ loading, items }: ProductRow) => (
  <div className="product-grid category-grid">
    {loading
      ? LOADING_PLACEHOLDER_KEYS.map((key) => <ItemCard loading key={key} />)
      : items?.map((item) => <ItemCard {...item} key={item.id} />)}
  </div>
);
