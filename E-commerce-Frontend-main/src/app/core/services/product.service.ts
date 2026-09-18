import { Injectable } from '@angular/core';
import { Observable, map } from 'rxjs';
import { Api, QueryParams } from './api';
import { ApiResponse } from '../models/api-response';
import { IProduct } from '../models/product';

export interface ProductListFilters {
  page: number;
  limit: number;
  sort: string;
  season: string;
  search?: string;
  categoryId?: string;
  subCategoryId?: string;
  minPrice?: number | null;
  maxPrice?: number | null;
}

@Injectable({
  providedIn: 'root'
})
export class ProductService {
  constructor(private api: Api) {}

  getById(id: string): Observable<IProduct> {
    return this.api
      .get<ApiResponse<{ product: IProduct }>>(`product/${id}`)
      .pipe(map(res => res.data.product));
  }

  getList(filters: ProductListFilters): Observable<{ products: IProduct[]; total: number }> {
    return this.api
      .get<ApiResponse<{ products: IProduct[] }> & { total: number }>('product', this.toQueryParams(filters))
      .pipe(map(res => ({ products: res.data.products, total: res.total })));
  }

  getNewArrivals(season: string, limit = 6): Observable<IProduct[]> {
    return this.api
      .get<ApiResponse<{ products: IProduct[] }>>('product', { sort: '-createdAt', limit, season })
      .pipe(map(res => res.data.products));
  }

  getBestSellers(season: string): Observable<IProduct[]> {
    return this.api
      .get<ApiResponse<{ products: IProduct[] }>>('product/best-sellers', { season })
      .pipe(map(res => res.data.products));
  }

  getRelated(productId: string, season: string): Observable<IProduct[]> {
    return this.api
      .get<ApiResponse<{ products: IProduct[] }>>(`product/${productId}/related`, { season })
      .pipe(map(res => res.data.products));
  }

  getAllForAdmin(): Observable<IProduct[]> {
    return this.api
      .get<ApiResponse<{ products: IProduct[] }>>('product/admin/list')
      .pipe(map(res => res.data.products));
  }

  create(formData: FormData): Observable<IProduct> {
    return this.api
      .post<ApiResponse<{ product: IProduct }>>('product', formData)
      .pipe(map(res => res.data.product));
  }

  update(id: string, formData: FormData): Observable<IProduct> {
    return this.api
      .patch<ApiResponse<{ product: IProduct }>>(`product/${id}`, formData)
      .pipe(map(res => res.data.product));
  }

  delete(id: string): Observable<void> {
    return this.api.delete(`product/${id}`).pipe(map(() => undefined));
  }

  private toQueryParams(filters: ProductListFilters): QueryParams {
    const params: QueryParams = {
      page: filters.page,
      limit: filters.limit,
      sort: filters.sort,
      season: filters.season
    } as QueryParams;

    if (filters.search?.trim()) params['search'] = filters.search.trim();
    if (filters.categoryId) params['categoryId'] = filters.categoryId;
    if (filters.subCategoryId) params['subCategoryId'] = filters.subCategoryId;
    if (filters.minPrice != null && filters.minPrice >= 0) params['price[gte]'] = filters.minPrice;
    if (filters.maxPrice != null && filters.maxPrice >= 0) params['price[lte]'] = filters.maxPrice;

    return params;
  }
}
