import { Injectable } from '@angular/core';
import { Observable, map } from 'rxjs';
import { Api } from './api';
import { ApiResponse } from '../models/api-response';
import { ICategory } from '../models/category';
import { ISubCategory } from '../models/subcategory';

@Injectable({
  providedIn: 'root'
})
export class CategoryService {
  constructor(private api: Api) {}

  getAll(): Observable<ICategory[]> {
    return this.api
      .get<ApiResponse<{ categories: ICategory[] }>>('category')
      .pipe(map(res => res.data.categories || []));
  }

  getSubcategories(categoryId: string): Observable<ISubCategory[]> {
    return this.api
      .get<ApiResponse<{ subcategories: ISubCategory[] }>>('subcategory', { categoryId })
      .pipe(map(res => res.data.subcategories || []));
  }
}
