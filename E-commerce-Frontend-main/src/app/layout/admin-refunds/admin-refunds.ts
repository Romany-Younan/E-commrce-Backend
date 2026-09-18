import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup } from '@angular/forms';
import { Api } from '../../core/services/api';
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { TagModule } from 'primeng/tag';
import { TextareaModule } from 'primeng/textarea';
import { IRefund } from '../../core/models/refund';
import { getApiErrorMessage } from '../../core/utils/api-error.util';
import { getUserName, getOrderIdDisplay } from '../../core/utils/populated.util';

@Component({
  selector: 'app-admin-refunds',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, ButtonModule, DialogModule, TagModule, TextareaModule],
  templateUrl: './admin-refunds.html',
  styleUrl: './admin-refunds.scss'
})
export class AdminRefunds implements OnInit {
  protected readonly getUserName = getUserName;
  protected readonly getOrderIdDisplay = getOrderIdDisplay;

  refunds: IRefund[] = [];
  isLoading = true;
  detailDialog = false;
  selectedRefund: IRefund | null = null;
  responseForm!: FormGroup;
  isUpdating = false;
  successMessage = '';
  errorMessage = '';

  constructor(private api: Api, private fb: FormBuilder, private cdr: ChangeDetectorRef) {}

  ngOnInit() { this.loadRefunds(); }

  loadRefunds() {
    this.isLoading = true;
    this.api.get<{ data: { refunds: IRefund[] } }>('refund/admin').subscribe({
      next: (res) => {
        this.refunds = res.data.refunds;
        this.isLoading = false;
        this.cdr.detectChanges();
      },
      error: () => { this.isLoading = false; }
    });
  }

  openDetail(refund: IRefund) {
    this.selectedRefund = refund;
    this.responseForm = this.fb.group({ adminResponse: [''] });
    this.successMessage = '';
    this.errorMessage = '';
    this.detailDialog = true;
  }

  updateStatus(status: 'approved' | 'rejected') {
    if (!this.selectedRefund) return;
    this.isUpdating = true;
    this.successMessage = '';
    this.errorMessage = '';

    const body: { status: 'approved' | 'rejected'; adminResponse?: string } = { status };
    const response = this.responseForm.value.adminResponse?.trim();
    if (response) body.adminResponse = response;

    this.api.patch(`refund/admin/${this.selectedRefund._id}`, body).subscribe({
      next: () => {
        this.isUpdating = false;
        this.successMessage = `Refund ${status} successfully.`;
        this.cdr.detectChanges();
        setTimeout(() => {
          this.detailDialog = false;
          this.loadRefunds();
        }, 1500);
      },
      error: (err) => {
        this.isUpdating = false;
        this.errorMessage = getApiErrorMessage(err, 'Failed to update refund status.');
        this.cdr.detectChanges();
      }
    });
  }

  getSeverity(status: string): 'success' | 'warn' | 'danger' | 'secondary' {
    const map: Record<string, 'success' | 'warn' | 'danger'> = { approved: 'success', pending: 'warn', rejected: 'danger' };
    return map[status] || 'secondary';
  }
}
