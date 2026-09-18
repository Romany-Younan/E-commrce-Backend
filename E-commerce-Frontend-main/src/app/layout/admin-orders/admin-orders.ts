import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Api } from '../../core/services/api';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { SelectModule } from 'primeng/select';
import { TagModule } from 'primeng/tag';
import { IOrder } from '../../core/models/order';
import { OrderStatusPipe } from '../../core/pipes/order-status.pipe';
import { getUserName } from '../../core/utils/populated.util';

@Component({
  selector: 'app-admin-orders',
  standalone: true,
  imports: [CommonModule, FormsModule, TableModule, ButtonModule, DialogModule, SelectModule, TagModule, OrderStatusPipe],
  templateUrl: './admin-orders.html',
  styleUrl: './admin-orders.scss'
})
export class AdminOrders implements OnInit {
  protected readonly getUserName = getUserName;

  orders: IOrder[] = [];
  filteredOrders: IOrder[] = [];
  isLoading = true;
  detailDialog = false;
  selectedOrder: IOrder | null = null;
  newStatus = '';
  statusFilter = '';

  statusOptions = [
    { label: 'Pending', value: 'pending' },
    { label: 'Preparing', value: 'preparing' },
    { label: 'Shipped', value: 'shipped' },
    { label: 'Received', value: 'received' },
    { label: 'Refused', value: 'refused' },
    { label: 'Cancelled By Admin', value: 'cancelledByAdmin' },
    { label: 'Cancelled By User', value: 'cancelledByUser' },
    { label: 'Refunded', value: 'refunded' },
  ];

  filterOptions = [
    { label: 'All Orders', value: '' },
    ...this.statusOptions
  ];

  constructor(private api: Api, private cdr: ChangeDetectorRef) {}

  ngOnInit() { this.loadOrders(); }

  loadOrders() {
    this.isLoading = true;
    this.api.get<{ data: { orders: IOrder[] } }>('order/admin').subscribe({
      next: (res) => {
        this.orders = res.data.orders;
        this.applyFilter();
        this.isLoading = false;
        this.cdr.detectChanges();
      }
    });
  }

  applyFilter() {
    this.filteredOrders = this.statusFilter
      ? this.orders.filter(o => o.status === this.statusFilter)
      : [...this.orders];
  }

  viewOrder(order: IOrder) {
    this.selectedOrder = order;
    this.newStatus = order.status;
    this.detailDialog = true;
  }

  updateStatus() {
    if (!this.selectedOrder) return;
    if (!this.newStatus || this.newStatus === this.selectedOrder.status) return;
    this.api.patch(`order/admin/${this.selectedOrder._id}`, { status: this.newStatus }).subscribe({
      next: () => {
        this.detailDialog = false;
        this.loadOrders();
      }
    });
  }

  getSeverity(status: string): 'success' | 'info' | 'warn' | 'danger' | 'secondary' {
    const map: Record<string, any> = {
      received: 'success', preparing: 'info', shipped: 'info',
      pending: 'warn', refused: 'danger', cancelledByAdmin: 'danger',
      cancelledByUser: 'danger', refunded: 'secondary'
    };
    return map[status] || 'secondary';
  }
}
