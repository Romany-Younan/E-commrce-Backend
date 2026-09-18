import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpErrorResponse } from '@angular/common/http';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { Api } from '../../../core/services/api';
import { ConfirmationService } from 'primeng/api';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { IOrder } from '../../../core/models/order';
import { OrderStatusPipe } from '../../../core/pipes/order-status.pipe';
import { getApiErrorMessage } from '../../../core/utils/api-error.util';

@Component({
  selector: 'app-order-detail',
  imports: [CommonModule, RouterLink, FormsModule, ConfirmDialogModule, OrderStatusPipe],
  providers: [ConfirmationService],
  templateUrl: './order-detail.html',
  styleUrl: './order-detail.scss',
})
export class OrderDetail implements OnInit {
  order: IOrder | null = null;
  isLoading = true;
  showRefundModal = false;
  refundReason = '';
  isRefunding = false;
  refundError = '';
  refundSuccess = false;

  constructor(
    private api: Api,
    private route: ActivatedRoute,
    private router: Router,
    private cdr: ChangeDetectorRef,
    private confirmationService: ConfirmationService
  ) {}

  ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.api.get<{ data: { order: IOrder } }>(`order/my/${id}`).subscribe({
        next: (res) => {
          this.order = res.data.order;
          this.isLoading = false;
          this.cdr.detectChanges();
        },
        error: (err) => {
          this.isLoading = false;
          if (err instanceof HttpErrorResponse && err.status === 404) {
            this.router.navigate(['/not-found'], { queryParams: { type: 'order' } });
            return;
          }
          this.cdr.detectChanges();
        }
      });
    }
  }

  isCancelEligible(): boolean {
    return !!this.order && (this.order.status === 'pending' || this.order.status === 'preparing');
  }

  cancelOrder(event: Event) {
    if (!this.order) return;
    this.confirmationService.confirm({
      target: event.target as EventTarget,
      message: 'Are you sure you want to cancel this order?',
      header: 'Cancel Confirmation',
      icon: 'pi pi-exclamation-triangle',
      acceptIcon: 'none',
      rejectIcon: 'none',
      rejectButtonStyleClass: 'p-button-text p-button-secondary',
      acceptButtonStyleClass: 'p-button-danger',
      accept: () => {
        if (!this.order) return;
        this.api.patch<{ data: { order: IOrder } }>(`order/${this.order._id}/cancel`, {}).subscribe({
          next: (res) => {
            this.order = res.data.order;
            this.cdr.detectChanges();
          },
          error: () => {}
        });
      }
    });
  }

  isRefundEligible(): boolean {
    if (!this.order || this.order.status !== 'received') return false;
    const updatedAt = new Date(this.order.updatedAt || this.order.createdAt!);
    const diffDays = Math.ceil(Math.abs(new Date().getTime() - updatedAt.getTime()) / (1000 * 60 * 60 * 24));
    return diffDays <= 7;
  }

  openRefundModal() {
    this.showRefundModal = true;
    this.refundReason = '';
    this.refundError = '';
    this.refundSuccess = false;
  }

  closeRefundModal() { this.showRefundModal = false; }

  submitRefund() {
    if (!this.refundReason.trim()) { this.refundError = 'Please provide a reason.'; return; }
    if (!this.order) return;
    this.isRefunding = true;
    this.refundError = '';
    this.api.post('refund', { orderId: this.order._id, reason: this.refundReason }).subscribe({
      next: () => {
        this.isRefunding = false;
        this.refundSuccess = true;
        this.cdr.detectChanges();
        setTimeout(() => { this.closeRefundModal(); this.cdr.detectChanges(); }, 2000);
      },
      error: (err) => {
        this.isRefunding = false;
        this.refundError = getApiErrorMessage(err, 'Failed to submit refund request.');
        this.cdr.detectChanges();
      }
    });
  }
}
