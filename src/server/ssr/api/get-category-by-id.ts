import { getCategoryById } from '../../data/categories';

export function createGetCategoryById() {
  return function getCategory(categoryId: string) {
    return Promise.resolve(getCategoryById(categoryId));
  };
}
