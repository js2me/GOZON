import { ItemCard } from '../../../../widgets/item-card';
import { CATEGORY_ITEMS_PER_ROW } from '../../model';
import type { ProductRow } from '../../../home/model/types';

const LOADING_PLACEHOLDER_KEYS = ['c0', 'c1', 'c2', 'c3'] as const;

export const CategoryProductCardsRow = ({ loading, items }: ProductRow) => (
  <div
    className="grid gap-3 pb-3"
    style={{
      gridTemplateColumns: `repeat(${items?.length ?? CATEGORY_ITEMS_PER_ROW}, 1fr)`,
    }}
  >
    {loading
      ? LOADING_PLACEHOLDER_KEYS.map((key) => <ItemCard loading key={key} />)
      : items?.map((item) => <ItemCard {...item} key={item.id} />)}
  </div>
);
