import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { Api } from '../../core/services/api';
import { IOrder } from '../../core/models/order';
import { IProduct } from '../../core/models/product';
import { ITestimonial } from '../../core/models/testimonial';
import { IRefund } from '../../core/models/refund';
import { IUser } from '../../core/models/user';
import { OrderStatusPipe } from '../../core/pipes/order-status.pipe';
import { getUserName } from '../../core/utils/populated.util';

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink, OrderStatusPipe],
  templateUrl: './admin-dashboard.html',
  styleUrl: './admin-dashboard.scss'
})
export class AdminDashboard implements OnInit {
  protected readonly getUserName = getUserName;

  stats = {
    totalProducts: 0,
    totalOrders: 0,
    totalUsers: 0,
    pendingTestimonials: 0,
    pendingRefunds: 0,
  };

  recentOrders: IOrder[] = [];
  isLoading = true;

  constructor(private api: Api, private cdr: ChangeDetectorRef) {}

  ngOnInit() { this.loadStats(); }

  loadStats() {
    this.api.get<{ data: { orders: IOrder[] } }>('order/admin').subscribe({
      next: (res) => {
        const orders = res.data.orders || [];
        this.stats.totalOrders = orders.length;
        this.recentOrders = orders.slice(0, 5);
        this.isLoading = false;
        this.cdr.detectChanges();
      },
      error: () => { this.isLoading = false; }
    });

    this.api.get<{ data: { refunds: IRefund[] } }>('refund/admin').subscribe({
      next: (res) => {
        const refunds = res.data.refunds || [];
        this.stats.pendingRefunds = refunds.filter(r => r.status === 'pending').length;
        this.cdr.detectChanges();
      }
    });

    this.api.get<{ data: { products: IProduct[] } }>('product').subscribe({
      next: (res) => {
        this.stats.totalProducts = res.data.products?.length || 0;
        this.cdr.detectChanges();
      }
    });

    this.api.get<{ data: { users: IUser[] } }>('admin/users').subscribe({
      next: (res) => {
        this.stats.totalUsers = res.data.users?.length || 0;
        this.cdr.detectChanges();
      }
    });

    this.api.get<{ data: { testimonials: ITestimonial[] } }>('testimonial/admin').subscribe({
      next: (res) => {
        const testimonials = res.data.testimonials || [];
        this.stats.pendingTestimonials = testimonials.filter(t => t.status === 'pending').length;
        this.cdr.detectChanges();
      }
    });
  }
}
