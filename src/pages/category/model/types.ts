import type { CategoryPageDC } from '../../../shared/api/api';

export interface CategoryPageContext {
  category: CategoryPageDC;
  categoryId: string;
}
