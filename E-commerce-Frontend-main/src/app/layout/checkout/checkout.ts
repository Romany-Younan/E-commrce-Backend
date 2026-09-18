import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Api } from '../../core/services/api';
import { CartService } from '../../core/services/cart';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { ICart } from '../../core/models/cart';
import { IAddress } from '../../core/models/address';
import { getApiErrorMessage } from '../../core/utils/api-error.util';
import { ApiResponse } from '../../core/models/api-response';

@Component({
  selector: 'app-checkout',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule, ReactiveFormsModule, ButtonModule, InputTextModule],
  templateUrl: './checkout.html',
  styleUrl: './checkout.scss',
})
export class Checkout implements OnInit {
  cart: ICart | null = null;
  addresses: IAddress[] = [];

  checkoutForm: FormGroup;
  showAddressForm = false;

  isLoading = true;
  isPlacingOrder = false;
  orderSuccess = false;
  orderError = '';

  constructor(
    private api: Api,
    private cartService: CartService,
    private router: Router,
    private cdr: ChangeDetectorRef,
    private fb: FormBuilder
  ) {
    this.checkoutForm = this.fb.group({
      newAddressLabel: ['Home'],
      newAddressText: [''],
      phoneNumber: ['', [Validators.required, Validators.pattern('^[0-9+]+$')]],
      backupPhone: ['', [Validators.pattern('^[0-9+]+$')]]
    });
  }

  ngOnInit() {
    this.loadData();
    this.checkoutForm.valueChanges.subscribe(() => this.cdr.detectChanges());
  }

  loadData() {
    this.isLoading = true;
    this.cartService.getCart().subscribe({
      next: (res: ApiResponse<ICart>) => {
        this.cart = res.data;
        if (!this.cart || !this.cart.validItems || this.cart.validItems.length === 0) {
          this.router.navigate(['/cart']);
          return;
        }

        this.api.get<{ data: { addresses: IAddress[] } }>('address').subscribe({
          next: (addrRes) => {
            this.addresses = addrRes.data.addresses.sort((a, b) => (b.isDefault ? 1 : 0) - (a.isDefault ? 1 : 0));
            if (this.addresses.length === 0) {
              this.showAddressForm = true;
            }
            this.isLoading = false;
            this.cdr.detectChanges();
          },
          error: () => {
            this.isLoading = false;
            this.cdr.detectChanges();
          }
        });
      },
      error: () => {
        this.isLoading = false;
        this.cdr.detectChanges();
      }
    });
  }

  saveAddressAndCheckout() {
    if (this.checkoutForm.invalid) {
      this.checkoutForm.markAllAsTouched();
      return;
    }

    const formValues = this.checkoutForm.value;

    if (this.showAddressForm && formValues.newAddressText.trim()) {
      this.isPlacingOrder = true;
      this.api.post('address', {
        label: formValues.newAddressLabel || 'Home',
        addressText: formValues.newAddressText,
        isDefault: true
      }).subscribe({
        next: () => { this.placeOrder(); },
        error: () => {
          this.isPlacingOrder = false;
          this.cdr.detectChanges();
        }
      });
    } else {
      this.placeOrder();
    }
  }

  placeOrder() {
    this.isPlacingOrder = true;
    this.orderError = '';
    const formValues = this.checkoutForm.value;

    this.api.post('order', {
      phoneNumber: formValues.phoneNumber,
      backupPhone: formValues.backupPhone
    }).subscribe({
      next: () => {
        this.orderSuccess = true;
        this.cartService.updateCartCount();
        this.isPlacingOrder = false;
        this.cdr.detectChanges();
        setTimeout(() => this.router.navigate(['/account/orders']), 2500);
      },
      error: (err) => {
        this.isPlacingOrder = false;
        this.orderError = getApiErrorMessage(err, 'Something went wrong. Please try again.');
        this.cdr.detectChanges();
      }
    });
  }
}
