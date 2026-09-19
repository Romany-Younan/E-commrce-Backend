import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { PaginatorModule } from 'primeng/paginator';
import { Subject } from 'rxjs';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';
import { PaginatorState } from 'primeng/paginator';
import { SettingsService } from '../../core/services/settings.service';
import { ProductService } from '../../core/services/product.service';
import { CategoryService } from '../../core/services/category.service';
import { IProduct } from '../../core/models/product';
import { ICategory } from '../../core/models/category';
import { ISubCategory } from '../../core/models/subcategory';
import { DEFAULT_SEASON } from '../../core/constants/seasons';
import { getProductCategoryName } from '../../core/utils/product.util';
import { toImageUrl } from '../../core/utils/image.util';

@Component({
  selector: 'app-products-list',
  standalone: true,
  imports: [CommonModule, PaginatorModule, RouterLink, FormsModule],
  templateUrl: './products-list.html',
  styleUrl: './products-list.scss',
})
export class ProductsList implements OnInit {
  protected readonly imgUrl = toImageUrl;
  products: IProduct[] = [];
  categories: ICategory[] = [];
  totalRecords = 0;
  rows = 20;
  page = 1;
  isLoading = false;

  searchQuery = '';
  selectedCategory = '';
  selectedSubCategory = '';
  selectedSort = '-createdAt';
  currentSeason = DEFAULT_SEASON;

  subcategories: ISubCategory[] = [];
  minPrice: number | null = null;
  maxPrice: number | null = null;

  sortOptions = [
    { label: 'Newest First', value: '-createdAt' },
    { label: 'Price: Low → High', value: 'price' },
    { label: 'Price: High → Low', value: '-price' },
    { label: 'Best Sellers', value: '-soldCount' },
  ];

  private searchSubject = new Subject<string>();
  private priceSubject = new Subject<void>();

  constructor(
    private settings: SettingsService,
    private productService: ProductService,
    private categoryService: CategoryService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit() {
    this.categoryService.getAll().subscribe(items => {
      this.categories = items;
      this.cdr.detectChanges();
    });

    this.searchSubject.pipe(debounceTime(300), distinctUntilChanged()).subscribe(() => {
      this.page = 1;
      this.loadProducts();
    });

    this.priceSubject.pipe(debounceTime(400)).subscribe(() => {
      this.page = 1;
      this.loadProducts();
    });

    this.settings.getCurrentSeason().subscribe(season => {
      this.currentSeason = season;
      this.loadProducts();
    });
  }

  loadProducts() {
    this.isLoading = true;

    this.productService.getList({
      page: this.page,
      limit: this.rows,
      sort: this.selectedSort,
      season: this.currentSeason,
      search: this.searchQuery,
      categoryId: this.selectedCategory,
      subCategoryId: this.selectedSubCategory,
      minPrice: this.minPrice,
      maxPrice: this.maxPrice
    }).subscribe({
      next: (res) => {
        this.products = res.products;
        this.totalRecords = res.total;
        this.isLoading = false;
        this.cdr.detectChanges();
      },
      error: () => {
        this.isLoading = false;
        this.cdr.detectChanges();
      }
    });
  }

  onSearchInput() {
    this.searchSubject.next(this.searchQuery);
  }

  onSortChange() {
    this.page = 1;
    this.loadProducts();
  }

  onCategoryChange() {
    this.page = 1;
    this.selectedSubCategory = '';
    this.subcategories = [];

    if (this.selectedCategory) {
      this.categoryService.getSubcategories(this.selectedCategory).subscribe(items => {
        this.subcategories = items;
        this.cdr.detectChanges();
      });
    }

    this.loadProducts();
  }

  onSubCategoryChange() {
    this.page = 1;
    this.loadProducts();
  }

  onPriceChange() {
    this.priceSubject.next();
  }

  clearFilters() {
    this.searchQuery = '';
    this.selectedCategory = '';
    this.selectedSubCategory = '';
    this.subcategories = [];
    this.minPrice = null;
    this.maxPrice = null;
    this.selectedSort = '-createdAt';
    this.page = 1;
    this.loadProducts();
  }

  onPageChange(event: PaginatorState) {
    this.page = (event.page ?? 0) + 1;
    this.rows = event.rows ?? this.rows;
    this.loadProducts();
  }

  getCategoryName = getProductCategoryName;
}
