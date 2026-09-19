import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { forkJoin } from 'rxjs';
import { SettingsService } from '../../core/services/settings.service';
import { ProductService } from '../../core/services/product.service';
import { CartService } from '../../core/services/cart';
import { Auth } from '../../core/services/auth';
import { ButtonModule } from 'primeng/button';
import { IProduct } from '../../core/models/product';
import { toImageUrl } from '../../core/utils/image.util';

@Component({
  selector: 'app-product-details',
  standalone: true,
  imports: [CommonModule, ButtonModule, RouterLink],
  templateUrl: './product-details.html',
  styleUrl: './product-details.scss',
})
export class ProductDetails implements OnInit {
  protected readonly imgUrl = toImageUrl;
  product: IProduct | null = null;
  isLoading = true;
  quantity = 1;
  addedToCart = false;
  relatedProducts: IProduct[] = [];
  isAdmin = false;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private settings: SettingsService,
    private products: ProductService,
    private cart: CartService,
    private auth: Auth,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit() {
    this.auth.getUserStatus().subscribe(user => {
      this.isAdmin = user?.role === 'admin';
    });

    this.route.paramMap.subscribe(params => {
      const id = params.get('id');
      if (id) this.loadProduct(id);
    });
  }

  loadProduct(id: string) {
    this.isLoading = true;
    this.addedToCart = false;
    this.quantity = 1;

    forkJoin({
      product: this.products.getById(id),
      season: this.settings.getCurrentSeason()
    }).subscribe({
      next: ({ product, season }) => {
        this.product = product;
        this.isLoading = false;
        this.loadRelatedProducts(id, season);
        this.cdr.detectChanges();
      },
      error: (err) => {
        this.isLoading = false;
        if (err instanceof HttpErrorResponse && err.status === 404) {
          this.router.navigate(['/not-found'], { queryParams: { type: 'product' } });
          return;
        }
        this.cdr.detectChanges();
      }
    });
  }

  changeQuantity(delta: number) {
    if (!this.product) return;
    const newQty = this.quantity + delta;
    if (newQty >= 1 && newQty <= this.product.stock) {
      this.quantity = newQty;
    }
  }

  addToCart() {
    if (!this.product) return;
    this.cart.addToCart(this.product, this.quantity).subscribe({
      next: () => {
        this.addedToCart = true;
        this.cdr.detectChanges();
        setTimeout(() => {
          this.addedToCart = false;
          this.cdr.detectChanges();
        }, 2500);
      }
    });
  }

  private loadRelatedProducts(id: string, season: string) {
    this.products.getRelated(id, season).subscribe({
      next: (items) => {
        this.relatedProducts = items;
        this.cdr.detectChanges();
      }
    });
  }
}
