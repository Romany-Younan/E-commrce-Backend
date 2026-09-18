import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { Api } from '../../../core/services/api';
import { IOrder } from '../../../core/models/order';
import { OrderStatusPipe } from '../../../core/pipes/order-status.pipe';

const STATUS_STYLES: Record<string, string> = {
  pending: 'bg-yellow-100 text-yellow-700',
  preparing: 'bg-blue-100 text-blue-700',
  shipped: 'bg-indigo-100 text-indigo-700',
  received: 'bg-green-100 text-green-700',
  cancelledByUser: 'bg-red-100 text-red-500',
  cancelledByAdmin: 'bg-red-100 text-red-500',
  refused: 'bg-gray-100 text-gray-500',
  refunded: 'bg-purple-100 text-purple-600',
};

@Component({
  selector: 'app-my-orders',
  imports: [CommonModule, RouterLink, OrderStatusPipe],
  templateUrl: './my-orders.html',
  styleUrl: './my-orders.scss',
})
export class MyOrders implements OnInit {
  orders: IOrder[] = [];
  isLoading = true;
  cancellingId: string | null = null;

  statusStyles = STATUS_STYLES;

  constructor(private api: Api, private cdr: ChangeDetectorRef) {}

  ngOnInit() {
    this.loadOrders();
  }

  loadOrders() {
    this.isLoading = true;
    this.api.get<{ data: { orders: IOrder[] } }>('order').subscribe({
      next: (res) => {
        this.orders = res.data.orders;
        this.isLoading = false;
        this.cdr.detectChanges();
      },
      error: () => { this.isLoading = false; this.cdr.detectChanges(); }
    });
  }

  canCancel(status: string): boolean {
    return ['pending', 'preparing'].includes(status);
  }

  cancelOrder(id: string) {
    this.cancellingId = id;
    this.api.patch(`order/${id}/cancel`, {}).subscribe({
      next: () => {
        this.cancellingId = null;
        this.loadOrders();
        this.cdr.detectChanges();
      },
      error: () => { this.cancellingId = null; this.cdr.detectChanges(); }
    });
  }
}
