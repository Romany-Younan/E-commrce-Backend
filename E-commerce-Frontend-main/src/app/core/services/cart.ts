import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { tap } from 'rxjs/operators';
import { Api } from './api';
import { Auth } from './auth';
import { IProduct } from '../models/product';
import { ICart, ICartItem } from '../models/cart';
import { ApiResponse } from '../models/api-response';

type CartResponse = ApiResponse<ICart>;
type CartItemResponse = ApiResponse<{ cartItem: ICartItem }>;

interface ISimpleApiResponse {
  status: string;
  message?: string;
  data?: null;
}

interface IGuestCartItem {
  productId: string;
  product: IProduct;
  quantity: number;
  price: number;
}

@Injectable({
  providedIn: 'root'
})
export class CartService {
  private cartCount = new BehaviorSubject<number>(0);

  constructor(private api: Api, private auth: Auth) {
    this.updateCartCount();
  }

  getCartCount(): Observable<number> {
    return this.cartCount.asObservable();
  }

  updateCartCount(): void {
    if (this.auth.getTokenFromLocalStorage()) {
      this.api.get<CartResponse>('cart').subscribe({
        next: (res) => {
          let count = 0;
          if (res.data && res.data.validItems) {
            res.data.validItems.forEach((item) => count += item.quantity);
          }
          this.cartCount.next(count);
        },
        error: () => this.cartCount.next(0)
      });
    } else {
      const guestCart: IGuestCartItem[] = JSON.parse(localStorage.getItem('guestCart') || '[]');
      let count = 0;
      guestCart.forEach((item) => count += item.quantity);
      this.cartCount.next(count);
    }
  }

  addToCart(product: IProduct, quantity: number = 1): Observable<CartItemResponse | ISimpleApiResponse> {
    if (this.auth.getTokenFromLocalStorage()) {
      return this.api.post<CartItemResponse>('cart', { productId: product._id, quantity }).pipe(
        tap(() => this.updateCartCount())
      );
    } else {
      const guestCart: IGuestCartItem[] = JSON.parse(localStorage.getItem('guestCart') || '[]');
      const existingItem = guestCart.find((item) => item.productId === product._id);
      if (existingItem) {
        existingItem.quantity += quantity;
      } else {
        guestCart.push({ productId: product._id, product, quantity, price: product.price });
      }
      localStorage.setItem('guestCart', JSON.stringify(guestCart));
      this.updateCartCount();
      return of<ISimpleApiResponse>({ status: 'success' });
    }
  }

  getCart(): Observable<CartResponse> {
    if (this.auth.getTokenFromLocalStorage()) {
      return this.api.get<CartResponse>('cart');
    } else {
      const guestCart: IGuestCartItem[] = JSON.parse(localStorage.getItem('guestCart') || '[]');
      let cartTotal = 0;
      guestCart.forEach((item) => { cartTotal += item.price * item.quantity; });
      return of<CartResponse>({
        status: 'success',
        data: {
          cartTotal,
          validItems: guestCart.map((item): ICartItem => ({
            cartItemId: item.productId,
            product: item.product,
            quantity: item.quantity,
            price: item.price,
            totalPrice: item.price * item.quantity
          })),
          actionRequiredItems: []
        }
      });
    }
  }

  updateQuantity(id: string, quantity: number): Observable<CartItemResponse | ISimpleApiResponse> {
    if (this.auth.getTokenFromLocalStorage()) {
      return this.api.patch<CartItemResponse>(`cart/${id}`, { quantity }).pipe(
        tap(() => this.updateCartCount())
      );
    } else {
      const guestCart: IGuestCartItem[] = JSON.parse(localStorage.getItem('guestCart') || '[]');
      const item = guestCart.find((i) => i.productId === id);
      if (item) { item.quantity = quantity; localStorage.setItem('guestCart', JSON.stringify(guestCart)); }
      this.updateCartCount();
      return of<ISimpleApiResponse>({ status: 'success' });
    }
  }

  removeItem(id: string): Observable<ISimpleApiResponse> {
    if (this.auth.getTokenFromLocalStorage()) {
      return this.api.delete<ISimpleApiResponse>(`cart/${id}`).pipe(
        tap(() => this.updateCartCount())
      );
    } else {
      let guestCart: IGuestCartItem[] = JSON.parse(localStorage.getItem('guestCart') || '[]');
      guestCart = guestCart.filter((i) => i.productId !== id);
      localStorage.setItem('guestCart', JSON.stringify(guestCart));
      this.updateCartCount();
      return of<ISimpleApiResponse>({ status: 'success' });
    }
  }

  syncGuestCart(): Observable<ISimpleApiResponse> {
    const guestCart: IGuestCartItem[] = JSON.parse(localStorage.getItem('guestCart') || '[]');
    if (guestCart.length === 0) return of<ISimpleApiResponse>({ status: 'success' });
    const payload = guestCart.map((item) => ({ productId: item.productId, quantity: item.quantity, price: item.price }));
    return this.api.post<ISimpleApiResponse>('cart/sync', { guestCart: payload }).pipe(
      tap(() => { localStorage.removeItem('guestCart'); this.updateCartCount(); })
    );
  }
}
