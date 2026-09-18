import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Api } from '../../../core/services/api';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { ConfirmationService } from 'primeng/api';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { ITestimonial } from '../../../core/models/testimonial';
import { getApiErrorMessage } from '../../../core/utils/api-error.util';

@Component({
  selector: 'app-my-testimonial',
  imports: [CommonModule, FormsModule, ButtonModule, InputTextModule, ConfirmDialogModule],
  providers: [ConfirmationService],
  templateUrl: './my-testimonial.html',
  styleUrl: './my-testimonial.scss',
})
export class MyTestimonial implements OnInit {
  testimonial: ITestimonial | null = null;
  isLoading = true;
  isSaving = false;
  isCancelling = false;
  stars = 5;
  comment = '';
  errorMsg = '';
  successMsg = '';

  isEditing = false;
  editStars = 5;
  editComment = '';

  constructor(private api: Api, private cdr: ChangeDetectorRef, private confirmationService: ConfirmationService) {}

  ngOnInit() {
    this.api.get<{ data: { testimonial: ITestimonial } }>('testimonial/my').subscribe({
      next: (res) => {
        this.testimonial = res.data.testimonial;
        if (this.testimonial) {
          this.stars = this.testimonial.stars;
          this.comment = this.testimonial.comment;
        }
        this.isLoading = false;
        this.cdr.detectChanges();
      },
      error: () => { this.isLoading = false; this.cdr.detectChanges(); }
    });
  }

  setStars(n: number) { this.stars = n; }
  setEditStars(n: number) { this.editStars = n; }

  openEditMode() {
    if (!this.testimonial) return;
    this.editStars = this.testimonial.stars;
    this.editComment = this.testimonial.comment;
    this.isEditing = true;
    this.errorMsg = '';
    this.successMsg = '';
  }

  cancelEditMode() {
    this.isEditing = false;
  }

  submit() {
    this.isSaving = true;
    this.errorMsg = '';
    this.api.post<{ data: { testimonial: ITestimonial } }>('testimonial', { stars: this.stars, comment: this.comment }).subscribe({
      next: (res) => {
        this.testimonial = res.data.testimonial;
        this.isSaving = false;
        this.successMsg = 'Review submitted! It will appear after admin approval.';
        this.cdr.detectChanges();
      },
      error: (err) => {
        this.errorMsg = getApiErrorMessage(err, 'Failed to submit review.');
        this.isSaving = false;
        this.cdr.detectChanges();
      }
    });
  }

  cancelTestimonial(event: Event) {
    if (!this.testimonial) return;
    this.confirmationService.confirm({
      target: event.target as EventTarget,
      message: 'Are you sure you want to cancel your pending review? You will be able to submit a new one.',
      header: 'Cancel Review',
      icon: 'pi pi-exclamation-triangle',
      acceptIcon: 'none',
      rejectIcon: 'none',
      acceptButtonStyleClass: 'p-button-danger',
      rejectButtonStyleClass: 'p-button-text p-button-secondary',
      accept: () => {
        if (!this.testimonial) return;
        this.isCancelling = true;
        this.api.delete(`testimonial/${this.testimonial._id}/cancel`).subscribe({
          next: () => {
            this.testimonial = null;
            this.isCancelling = false;
            this.stars = 5;
            this.comment = '';
            this.successMsg = 'Your review has been cancelled.';
            this.cdr.detectChanges();
          },
          error: (err) => {
            this.errorMsg = getApiErrorMessage(err, 'Failed to cancel review.');
            this.isCancelling = false;
            this.cdr.detectChanges();
          }
        });
      }
    });
  }

  updateTestimonial() {
    if (!this.testimonial) return;
    this.isSaving = true;
    this.errorMsg = '';
    this.api.patch<{ data: { testimonial: ITestimonial } }>(`testimonial/${this.testimonial._id}/update`, {
      stars: this.editStars,
      comment: this.editComment
    }).subscribe({
      next: (res) => {
        this.testimonial = res.data.testimonial;
        this.isEditing = false;
        this.isSaving = false;
        this.successMsg = 'Review updated! It will be reviewed by an admin again.';
        this.cdr.detectChanges();
      },
      error: (err) => {
        this.errorMsg = getApiErrorMessage(err, 'Failed to update review.');
        this.isSaving = false;
        this.cdr.detectChanges();
      }
    });
  }
}
