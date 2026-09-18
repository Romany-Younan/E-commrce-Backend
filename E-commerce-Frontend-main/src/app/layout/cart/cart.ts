import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { CartService } from '../../core/services/cart';
import { Auth } from '../../core/services/auth';
import { ButtonModule } from 'primeng/button';
import { ICart, ICartItem } from '../../core/models/cart';
import { ApiResponse } from '../../core/models/api-response';

@Component({
  selector: 'app-cart',
  standalone: true,
  imports: [CommonModule, RouterLink, ButtonModule],
  templateUrl: './cart.html',
  styleUrl: './cart.scss',
})
export class Cart implements OnInit {
  cart: ICart | null = null;
  isLoading = true;
  isAdmin = false;

  constructor(private cartService: CartService, private auth: Auth, private cdr: ChangeDetectorRef) {}

  ngOnInit() {
    this.auth.getUserStatus().subscribe(user => {
      this.isAdmin = user?.role === 'admin';
      if (!this.isAdmin) {
        this.loadCart();
      } else {
        this.isLoading = false;
      }
    });
  }

  loadCart() {
    this.isLoading = true;
    this.cartService.getCart().subscribe({
      next: (res: ApiResponse<ICart>) => {
        this.cart = res.data;
        this.isLoading = false;
        this.cdr.detectChanges();
      },
      error: () => {
        this.isLoading = false;
        this.cdr.detectChanges();
      }
    });
  }

  updateQuantity(item: ICartItem, delta: number) {
    const newQuantity = item.quantity + delta;
    if (newQuantity < 1) return;
    this.cartService.updateQuantity(item.cartItemId, newQuantity).subscribe(() => {
      this.loadCart();
    });
  }

  acceptPriceChange(item: ICartItem) {
    this.cartService.updateQuantity(item.cartItemId, item.quantity).subscribe(() => {
      this.loadCart();
    });
  }

  removeItem(id: string) {
    this.cartService.removeItem(id).subscribe(() => {
      this.loadCart();
    });
  }
}
