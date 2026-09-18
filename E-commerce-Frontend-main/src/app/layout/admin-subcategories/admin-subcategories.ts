import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Api } from '../../core/services/api';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { InputTextModule } from 'primeng/inputtext';
import { SelectModule } from 'primeng/select';
import { ConfirmationService } from 'primeng/api';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { ISubCategory } from '../../core/models/subcategory';
import { ICategory } from '../../core/models/category';

@Component({
  selector: 'app-admin-subcategories',
  standalone: true,
  imports: [
    CommonModule, FormsModule, TableModule, ButtonModule,
    DialogModule, InputTextModule, SelectModule, ConfirmDialogModule
  ],
  providers: [ConfirmationService],
  templateUrl: './admin-subcategories.html'
})
export class AdminSubcategories implements OnInit {
  subcategories: ISubCategory[] = [];
  categories: ICategory[] = [];

  subCategoryDialog = false;
  isEditing = false;
  currentSubCategory: Partial<ISubCategory> = {};

  constructor(private api: Api, private cdr: ChangeDetectorRef, private confirmationService: ConfirmationService) {}

  ngOnInit() {
    this.loadCategories();
    this.loadSubcategories();
  }

  loadCategories() {
    this.api.get<{ data: { categories: ICategory[] } }>('category').subscribe({
      next: (res) => {
        this.categories = res.data.categories;
        this.cdr.detectChanges();
      }
    });
  }

  loadSubcategories() {
    this.api.get<{ data: { subcategories: ISubCategory[] } }>('subcategory').subscribe({
      next: (res) => {
        this.subcategories = res.data.subcategories;
        this.cdr.detectChanges();
      }
    });
  }

  openNew() {
    this.currentSubCategory = { isActive: true };
    this.isEditing = false;
    this.subCategoryDialog = true;
  }

  editSubCategory(sub: ISubCategory) {
    this.currentSubCategory = { ...sub };
    if (this.currentSubCategory.categoryId && typeof this.currentSubCategory.categoryId === 'object') {
      this.currentSubCategory.categoryId = (this.currentSubCategory.categoryId as ICategory)._id;
    }
    this.isEditing = true;
    this.subCategoryDialog = true;
  }

  deleteSubCategory(event: Event, sub: ISubCategory) {
    this.confirmationService.confirm({
      target: event.target as EventTarget,
      message: `Are you sure you want to delete "${sub.title}"?`,
      header: 'Confirm Subcategory Deletion',
      icon: 'pi pi-exclamation-triangle',
      acceptIcon: 'none',
      rejectIcon: 'none',
      acceptButtonStyleClass: 'p-button-danger',
      rejectButtonStyleClass: 'p-button-text p-button-secondary',
      accept: () => {
        this.api.delete(`subcategory/${sub._id}`).subscribe({
          next: () => this.loadSubcategories()
        });
      }
    });
  }

  hideDialog() {
    this.subCategoryDialog = false;
  }

  saveSubCategory() {
    if (this.isEditing) {
      this.api.patch(`subcategory/${this.currentSubCategory._id}`, {
        title: this.currentSubCategory.title,
        categoryId: this.currentSubCategory.categoryId,
        isActive: this.currentSubCategory.isActive
      }).subscribe({
        next: () => { this.loadSubcategories(); this.hideDialog(); }
      });
    } else {
      this.api.post('subcategory', {
        title: this.currentSubCategory.title,
        categoryId: this.currentSubCategory.categoryId,
        isActive: this.currentSubCategory.isActive
      }).subscribe({
        next: () => { this.loadSubcategories(); this.hideDialog(); }
      });
    }
  }
}
