import { ICategory } from './category';

export interface ISubCategory {
  _id: string;
  title: string;
  categoryId: string | ICategory;
  isActive: boolean;
  createdAt?: string;
}
