import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Api } from '../../core/services/api';
import { ApiResponse } from '../../core/models/api-response';
import { ISalesReport } from '../../core/models/report';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';

@Component({
  selector: 'app-admin-reports',
  standalone: true,
  imports: [CommonModule, FormsModule, TableModule, ButtonModule],
  templateUrl: './admin-reports.html',
  styleUrl: './admin-reports.scss'
})
export class AdminReports implements OnInit {
  report: ISalesReport | null = null;
  isLoading = false;
  dateRange: Date[] = [];

  startDate: Date = new Date(new Date().getFullYear(), new Date().getMonth(), 1);
  endDate: Date = new Date();

  constructor(private api: Api, private cdr: ChangeDetectorRef) {}

  ngOnInit() { this.loadReport(); }

  loadReport() {
    this.isLoading = true;
    this.report = null;
    const start = new Date(this.startDate).toISOString().split('T')[0];
    const end = new Date(this.endDate).toISOString().split('T')[0];

    this.api.get<ApiResponse<ISalesReport>>('report/sales', { startDate: start, endDate: end }).subscribe({
      next: (res: ApiResponse<ISalesReport>) => {
        this.report = res.data;
        this.isLoading = false;
        this.cdr.detectChanges();
      },
      error: () => { this.isLoading = false; }
    });
  }

  getMonthName(month: number): string {
    return new Date(2000, month - 1, 1).toLocaleString('default', { month: 'short' });
  }
}
