import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Api } from '../../core/services/api';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { TagModule } from 'primeng/tag';
import { DialogModule } from 'primeng/dialog';
import { ITestimonial } from '../../core/models/testimonial';

@Component({
  selector: 'app-admin-testimonials',
  standalone: true,
  imports: [CommonModule, TableModule, ButtonModule, TagModule, DialogModule],
  templateUrl: './admin-testimonials.html',
  styleUrl: './admin-testimonials.scss'
})
export class AdminTestimonials implements OnInit {
  testimonials: ITestimonial[] = [];
  isLoading = true;
  detailDialog = false;
  selectedTestimonial: ITestimonial | null = null;

  constructor(private api: Api, private cdr: ChangeDetectorRef) {}

  ngOnInit() { this.loadTestimonials(); }

  loadTestimonials() {
    this.isLoading = true;
    this.api.get<{ data: { testimonials: ITestimonial[] } }>('testimonial/admin').subscribe({
      next: (res) => {
        this.testimonials = res.data.testimonials;
        this.isLoading = false;
        this.cdr.detectChanges();
      },
      error: () => { this.isLoading = false; }
    });
  }

  openDetail(testimonial: ITestimonial) {
    this.selectedTestimonial = testimonial;
    this.detailDialog = true;
  }

  updateStatus(id: string, status: 'approved' | 'refused') {
    this.api.patch(`testimonial/admin/${id}`, { status }).subscribe({
      next: () => {
        this.detailDialog = false;
        this.loadTestimonials();
      }
    });
  }

  getSeverity(status: string): 'success' | 'warn' | 'danger' | 'secondary' {
    const map: Record<string, any> = {
      approved: 'success', pending: 'warn', refused: 'danger'
    };
    return map[status] || 'secondary';
  }
}
