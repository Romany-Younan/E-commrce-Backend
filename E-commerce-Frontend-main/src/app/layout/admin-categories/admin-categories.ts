import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Api } from '../../core/services/api';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { InputTextModule } from 'primeng/inputtext';
import { TooltipModule } from 'primeng/tooltip';
import { ConfirmationService } from 'primeng/api';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { ICategory } from '../../core/models/category';

@Component({
  selector: 'app-admin-categories',
  standalone: true,
  imports: [
    CommonModule, FormsModule, TableModule, ButtonModule,
    DialogModule, InputTextModule, TooltipModule, ConfirmDialogModule
  ],
  providers: [ConfirmationService],
  templateUrl: './admin-categories.html',
  styleUrl: './admin-categories.scss'
})
export class AdminCategories implements OnInit {
  categories: ICategory[] = [];

  categoryDialog = false;
  isEditing = false;
  currentCategory: Partial<ICategory> = {};

  constructor(private api: Api, private cdr: ChangeDetectorRef, private confirmationService: ConfirmationService) {}

  ngOnInit() {
    this.loadCategories();
  }

  loadCategories() {
    this.api.get<{ data: { categories: ICategory[] } }>('category').subscribe({
      next: (res) => {
        this.categories = res.data.categories;
        this.cdr.detectChanges();
      }
    });
  }

  openNew() {
    this.currentCategory = { isActive: true };
    this.isEditing = false;
    this.categoryDialog = true;
  }

  editCategory(category: ICategory) {
    this.currentCategory = { ...category };
    this.isEditing = true;
    this.categoryDialog = true;
  }

  deleteCategory(event: Event, category: ICategory) {
    this.confirmationService.confirm({
      target: event.target as EventTarget,
      message: `Are you sure you want to delete "${category.title}"? This will also delete related subcategories and products.`,
      header: 'Confirm Category Deletion',
      icon: 'pi pi-exclamation-triangle',
      acceptIcon: 'none',
      rejectIcon: 'none',
      acceptButtonStyleClass: 'p-button-danger',
      rejectButtonStyleClass: 'p-button-text p-button-secondary',
      accept: () => {
        this.api.delete(`category/${category._id}`).subscribe({
          next: () => this.loadCategories()
        });
      }
    });
  }

  hideDialog() {
    this.categoryDialog = false;
  }

  saveCategory() {
    if (this.isEditing) {
      this.api.patch(`category/${this.currentCategory._id}`, {
        title: this.currentCategory.title,
        isActive: this.currentCategory.isActive
      }).subscribe({
        next: () => { this.loadCategories(); this.hideDialog(); }
      });
    } else {
      this.api.post('category', {
        title: this.currentCategory.title,
        isActive: this.currentCategory.isActive
      }).subscribe({
        next: () => { this.loadCategories(); this.hideDialog(); }
      });
    }
  }
}
