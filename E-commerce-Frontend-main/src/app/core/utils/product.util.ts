import { IProduct } from '../models/product';
import { ICategory } from '../models/category';

export function getRefId(value: string | { _id: string } | undefined): string | undefined {
  if (!value) return undefined;
  return typeof value === 'string' ? value : value._id;
}

export function getProductCategoryName(product: IProduct): string {
  const category = product.categoryId;
  if (typeof category === 'object' && category !== null) {
    return (category as ICategory).title;
  }
  return '';
}
