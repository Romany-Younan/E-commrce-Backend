import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators, FormsModule } from '@angular/forms';
import { Api } from '../../core/services/api';
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { ToggleSwitch } from 'primeng/toggleswitch';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { ConfirmationService } from 'primeng/api';
import { InputTextModule } from 'primeng/inputtext';
import { TextareaModule } from 'primeng/textarea';
import { IHeroSlide } from '../../core/models/hero-slide';

@Component({
  selector: 'app-admin-hero-slides',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule, ButtonModule, DialogModule, ToggleSwitch, ConfirmDialogModule, InputTextModule, TextareaModule],
  providers: [ConfirmationService],
  templateUrl: './admin-hero-slides.html',
  styleUrl: './admin-hero-slides.scss'
})
export class AdminHeroSlides implements OnInit {
  slides: IHeroSlide[] = [];
  isLoading = true;
  slideDialog = false;
  isEditing = false;
  selectedSlide: IHeroSlide | null = null;
  selectedFile: File | null = null;
  previewUrl: string | null = null;
  isSaving = false;

  slideForm!: FormGroup;

  constructor(private api: Api, private fb: FormBuilder, private cdr: ChangeDetectorRef, private confirmationService: ConfirmationService) {}

  ngOnInit() { this.loadSlides(); }

  loadSlides() {
    this.isLoading = true;
    this.api.get<{ data: { slides: IHeroSlide[] } }>('hero/admin').subscribe({
      next: (res) => {
        this.slides = res.data.slides;
        this.isLoading = false;
        this.cdr.detectChanges();
      },
      error: () => { this.isLoading = false; }
    });
  }

  buildForm(slide?: IHeroSlide) {
    this.slideForm = this.fb.group({
      title: [slide?.title || '', Validators.required],
      subtitle: [slide?.subtitle || ''],
      ctaText: [slide?.ctaText || 'Shop Now'],
      ctaLink: [slide?.ctaLink || '/products'],
      order: [slide?.order ?? 0, Validators.required]
    });
  }

  openNew() {
    this.isEditing = false;
    this.selectedSlide = null;
    this.selectedFile = null;
    this.previewUrl = null;
    this.buildForm();
    this.slideDialog = true;
  }

  editSlide(slide: IHeroSlide) {
    this.isEditing = true;
    this.selectedSlide = slide;
    this.selectedFile = null;
    this.previewUrl = null;
    this.buildForm(slide);
    this.slideDialog = true;
  }

  onFileSelected(event: Event) {
    const file = (event.target as HTMLInputElement).files?.[0];
    if (file) {
      this.selectedFile = file;
      const reader = new FileReader();
      reader.onload = (e: ProgressEvent<FileReader>) => {
        this.previewUrl = e.target?.result as string;
        this.cdr.detectChanges();
      };
      reader.readAsDataURL(file);
    }
  }

  saveSlide() {
    if (this.slideForm.invalid) {
      this.slideForm.markAllAsTouched();
      return;
    }
    if (!this.isEditing && !this.selectedFile) {
      return;
    }

    this.isSaving = true;
    const formData = new FormData();
    const vals = this.slideForm.value;
    formData.append('title', vals.title);
    formData.append('subtitle', vals.subtitle || '');
    formData.append('ctaText', vals.ctaText || 'Shop Now');
    formData.append('ctaLink', vals.ctaLink || '/products');
    formData.append('order', String(vals.order));
    if (this.selectedFile) formData.append('image', this.selectedFile);

    const request = this.isEditing && this.selectedSlide
      ? this.api.patch(`hero/${this.selectedSlide._id}`, formData)
      : this.api.post('hero', formData);

    request.subscribe({
      next: () => {
        this.slideDialog = false;
        this.isSaving = false;
        this.loadSlides();
      },
      error: () => { this.isSaving = false; }
    });
  }

  toggleActive(slide: IHeroSlide) {
    this.api.patch(`hero/${slide._id}`, { isActive: !slide.isActive }).subscribe({
      next: () => this.loadSlides()
    });
  }

  confirmDelete(event: Event, slide: IHeroSlide) {
    this.confirmationService.confirm({
      target: event.target as EventTarget,
      message: `Delete slide "${slide.title}"? This cannot be undone.`,
      header: 'Delete Slide',
      icon: 'pi pi-trash',
      acceptButtonStyleClass: 'p-button-danger',
      rejectButtonStyleClass: 'p-button-text p-button-secondary',
      acceptIcon: 'none',
      rejectIcon: 'none',
      accept: () => {
        this.api.delete(`hero/${slide._id}`).subscribe({ next: () => this.loadSlides() });
      }
    });
  }

  get f() { return this.slideForm.controls; }
}
