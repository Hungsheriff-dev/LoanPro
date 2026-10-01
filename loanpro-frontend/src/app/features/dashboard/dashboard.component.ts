import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatIconModule } from '@angular/material/icon';
import {
  DashboardService,
  DashboardData,
} from '../../core/services/dashboard.service';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatProgressSpinnerModule,
    MatIconModule,
  ],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss',
})
export class DashboardComponent implements OnInit {
  loading = signal(true);
  errorMessage = signal('');
  data = signal<DashboardData | null>(null);

  constructor(private dashboardService: DashboardService) {} //đưa DashboardService vào DashboardComponent để component này có thể sử dụng service đó

  ngOnInit() {
    this.loadDashboard();
  }

  loadDashboard() {
    this.loading.set(true);
    this.errorMessage.set('');

    this.dashboardService.getDashboard().subscribe({ //Gọi DashboardService để gọi API backend lấy dữ liệu Dashboard.
      next: (res) => { //subscribe: đăng ký vào để nhận...
        this.data.set(res);
        this.loading.set(false);
      },
      error: (err) => {
        this.loading.set(false);
        this.errorMessage.set(
          err?.error?.message || 'Không thể tải dữ liệu dashboard',
        );
      },
    });
  }

  formatCurrency(value: number): string { //định dạng số thành tiền Việt Nam.
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
      maximumFractionDigits: 0,
    }).format(value || 0);
  }
}