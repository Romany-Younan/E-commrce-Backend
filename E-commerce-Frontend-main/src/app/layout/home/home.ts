import { Component, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { Api } from '../../core/services/api';
import { SettingsService } from '../../core/services/settings.service';
import { ProductService } from '../../core/services/product.service';
import { IHeroSlide } from '../../core/models/hero-slide';
import { IProduct } from '../../core/models/product';
import { ITestimonial } from '../../core/models/testimonial';
import { ApiResponse } from '../../core/models/api-response';
import { getProductCategoryName } from '../../core/utils/product.util';
import { getUserName } from '../../core/utils/populated.util';
import { toImageUrl } from '../../core/utils/image.util';

@Component({
  selector: 'app-home',
  imports: [RouterLink, CommonModule],
  templateUrl: './home.html',
  styleUrl: './home.scss',
})
export class Home implements OnInit, OnDestroy {
  protected readonly getUserName = getUserName;
  protected readonly imgUrl = toImageUrl;

  slides: IHeroSlide[] = [];
  newArrivals: IProduct[] = [];
  bestSellers: IProduct[] = [];
  testimonials: ITestimonial[] = [];
  activeSlide = 0;
  private sliderInterval: ReturnType<typeof setInterval> | null = null;

  constructor(
    private api: Api,
    private settings: SettingsService,
    private products: ProductService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit() {
    this.api.get<ApiResponse<{ slides: IHeroSlide[] }>>('hero').subscribe({
      next: (res) => {
        this.slides = res.data.slides;
        if (this.slides.length > 1) {
          this.sliderInterval = setInterval(() => this.nextSlide(), 5000);
        }
        this.cdr.detectChanges();
      }
    });

    this.settings.getCurrentSeason().subscribe(season => {
      this.products.getNewArrivals(season).subscribe(items => {
        this.newArrivals = items;
        this.cdr.detectChanges();
      });
      this.products.getBestSellers(season).subscribe(items => {
        this.bestSellers = items;
        this.cdr.detectChanges();
      });
    });

    this.api.get<ApiResponse<{ testimonials: ITestimonial[] }>>('testimonial/public').subscribe({
      next: (res) => {
        this.testimonials = res.data.testimonials || [];
        this.cdr.detectChanges();
      }
    });
  }

  ngOnDestroy() {
    if (this.sliderInterval) clearInterval(this.sliderInterval);
  }

  nextSlide() {
    this.activeSlide = (this.activeSlide + 1) % this.slides.length;
    this.cdr.detectChanges();
  }

  prevSlide() {
    this.activeSlide = (this.activeSlide - 1 + this.slides.length) % this.slides.length;
    this.cdr.detectChanges();
  }

  goToSlide(index: number) {
    this.activeSlide = index;
    this.cdr.detectChanges();
  }

  getCategoryName = getProductCategoryName;
}
