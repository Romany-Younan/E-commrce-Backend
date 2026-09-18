import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { SelectModule } from 'primeng/select';
import { InputTextModule } from 'primeng/inputtext';
import { TextareaModule } from 'primeng/textarea';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { ConfirmationService } from 'primeng/api';
import { ProductService } from '../../core/services/product.service';
import { CategoryService } from '../../core/services/category.service';
import { IProduct } from '../../core/models/product';
import { ICategory } from '../../core/models/category';
import { ISubCategory } from '../../core/models/subcategory';
import { SEASON_OPTIONS, DEFAULT_SEASON } from '../../core/constants/seasons';
import { getProductCategoryName, getRefId } from '../../core/utils/product.util';
import { getApiErrorMessage } from '../../core/utils/api-error.util';
import { MAX_IMAGE_SIZE_BYTES, MAX_IMAGE_SIZE_MB } from '../../core/constants/upload';

@Component({
  selector: 'app-admin-products',
  standalone: true,
  imports: [
    CommonModule, FormsModule, TableModule, ButtonModule,
    DialogModule, SelectModule, InputTextModule, TextareaModule, ConfirmDialogModule
  ],
  providers: [ConfirmationService],
  templateUrl: './admin-products.html',
  styleUrl: './admin-products.scss'
})
export class AdminProducts implements OnInit {
  products: IProduct[] = [];
  categories: ICategory[] = [];
  subCategories: ISubCategory[] = [];

  productDialog = false;
  isEditing = false;
  currentProduct: Partial<IProduct> = {};
  selectedFile: File | null = null;
  saveError = '';
  isSaving = false;

  seasons = SEASON_OPTIONS;
  readonly maxImageMb = MAX_IMAGE_SIZE_MB;

  constructor(
    private productService: ProductService,
    private categoryService: CategoryService,
    private cdr: ChangeDetectorRef,
    private confirmationService: ConfirmationService
  ) {}

  ngOnInit() {
    this.loadProducts();
    this.loadCategories();
  }

  loadProducts() {
    this.productService.getAllForAdmin().subscribe({
      next: (items) => {
        this.products = items;
        this.cdr.detectChanges();
      },
      error: (err) => {
        this.saveError = getApiErrorMessage(err, 'Failed to load products.');
        this.cdr.detectChanges();
      }
    });
  }

  loadCategories() {
    this.categoryService.getAll().subscribe({
      next: (items) => {
        this.categories = items;
        this.cdr.detectChanges();
      }
    });
  }

  onCategoryChange(categoryId: string) {
    this.categoryService.getSubcategories(categoryId).subscribe({
      next: (items) => {
        this.subCategories = items;
        this.cdr.detectChanges();
      }
    });
  }

  openNew() {
    this.currentProduct = { isActive: true, season: DEFAULT_SEASON };
    this.isEditing = false;
    this.selectedFile = null;
    this.subCategories = [];
    this.productDialog = true;
  }

  editProduct(product: IProduct) {
    this.currentProduct = {
      ...product,
      categoryId: getRefId(product.categoryId),
      subCategoryId: getRefId(product.subCategoryId)
    };

    this.isEditing = true;
    this.selectedFile = null;

    const categoryId = this.currentProduct.categoryId as string | undefined;
    if (categoryId) {
      this.onCategoryChange(categoryId);
    } else {
      this.subCategories = [];
    }

    this.productDialog = true;
  }

  deleteProduct(event: Event, product: IProduct) {
    this.confirmationService.confirm({
      target: event.target as EventTarget,
      message: `Delete "${product.name}"? This cannot be undone.`,
      header: 'Delete Product',
      icon: 'pi pi-trash',
      acceptButtonStyleClass: 'p-button-danger',
      rejectButtonStyleClass: 'p-button-text p-button-secondary',
      acceptIcon: 'none',
      rejectIcon: 'none',
      accept: () => {
        this.productService.delete(product._id).subscribe({ next: () => this.loadProducts() });
      }
    });
  }

  hideDialog() {
    this.productDialog = false;
    this.saveError = '';
    this.selectedFile = null;
    this.isSaving = false;
  }

  onFileSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (!file) return;

    if (file.size > MAX_IMAGE_SIZE_BYTES) {
      this.saveError = `Image must be smaller than ${MAX_IMAGE_SIZE_MB}MB.`;
      this.selectedFile = null;
      input.value = '';
      this.cdr.detectChanges();
      return;
    }

    this.saveError = '';
    this.selectedFile = file;
    this.cdr.detectChanges();
  }

  saveProduct() {
    this.saveError = '';
    const p = this.currentProduct;

    if (!this.isEditing && !this.selectedFile) {
      this.saveError = 'Please choose a product image before saving.';
      this.cdr.detectChanges();
      return;
    }

    if (this.selectedFile && this.selectedFile.size > MAX_IMAGE_SIZE_BYTES) {
      this.saveError = `Image must be smaller than ${MAX_IMAGE_SIZE_MB}MB.`;
      this.cdr.detectChanges();
      return;
    }

    this.isSaving = true;
    const formData = new FormData();

    formData.append('name', p.name ?? '');
    formData.append('desc', p.desc ?? '');
    formData.append('price', String(p.price ?? 0));
    formData.append('stock', String(p.stock ?? 0));

    if (p.categoryId) formData.append('categoryId', String(p.categoryId));
    if (p.subCategoryId) formData.append('subCategoryId', String(p.subCategoryId));
    formData.append('isActive', String(p.isActive ?? true));
    formData.append('season', p.season ?? DEFAULT_SEASON);
    if (this.selectedFile) formData.append('image', this.selectedFile);

    const request = this.isEditing && p._id
      ? this.productService.update(p._id, formData)
      : this.productService.create(formData);

    request.subscribe({
      next: () => {
        this.isSaving = false;
        this.loadProducts();
        this.hideDialog();
      },
      error: (err) => {
        this.isSaving = false;
        this.saveError = getApiErrorMessage(err, 'Failed to save product.');
        this.cdr.detectChanges();
      }
    });
  }

  getCategoryName = getProductCategoryName;
}
