import { ItemCard } from '../../../../widgets/item-card';
import { ITEMS_PER_ROW } from '../../model';
import type { ProductRow } from '../../model/types';

export const ProductCardsRow = ({ loading, items }: ProductRow) => (
  <div
    className="grid gap-3 pb-3"
    style={{
      gridTemplateColumns: `repeat(${items?.length ?? ITEMS_PER_ROW}, 1fr)`,
    }}
  >
    {loading
      ? Array.from({ length: ITEMS_PER_ROW }, (_, i) => (
          <ItemCard loading key={i} />
        ))
      : items?.map((item) => <ItemCard {...item} key={item.id} />)}
  </div>
);
