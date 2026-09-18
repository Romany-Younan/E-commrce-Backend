import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { ButtonModule } from 'primeng/button';

type NotFoundType = 'page' | 'product' | 'order';

@Component({
  selector: 'app-not-found',
  standalone: true,
  imports: [CommonModule, RouterLink, ButtonModule],
  templateUrl: './not-found.html',
  styleUrl: './not-found.scss',
})
export class NotFound implements OnInit {
  title = 'Page Not Found';
  message = "The page you're looking for doesn't exist or was moved.";
  icon = 'pi-compass';

  private readonly copy: Record<NotFoundType, { title: string; message: string; icon: string }> = {
    page: {
      title: 'Page Not Found',
      message: "The page you're looking for doesn't exist or was moved.",
      icon: 'pi-compass',
    },
    product: {
      title: 'Product Not Found',
      message: 'This product may have been removed or is no longer available.',
      icon: 'pi-shopping-bag',
    },
    order: {
      title: 'Order Not Found',
      message: "We couldn't find that order. It may have been removed or you don't have access to it.",
      icon: 'pi-receipt',
    },
  };

  constructor(private route: ActivatedRoute) {}

  ngOnInit() {
    this.route.queryParamMap.subscribe(params => {
      const type = params.get('type') as NotFoundType | null;
      const content = type && this.copy[type] ? this.copy[type] : this.copy.page;
      this.title = content.title;
      this.message = content.message;
      this.icon = content.icon;
    });
  }
}
