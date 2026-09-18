import { ICategory } from './category';
import { ISubCategory } from './subcategory';

export interface IProduct {
  _id: string;
  name: string;
  desc?: string;
  price: number;
  image: string;
  categoryId: string | ICategory;
  subCategoryId?: string | ISubCategory;
  stock: number;
  isActive: boolean;
  season?: string;
  createdAt?: string;
}
