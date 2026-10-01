import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

import { CustomerService } from '../../../core/services/customer.service';
import { Customer } from '../../../core/models/customer.model';

@Component({
  selector: 'app-customer-detail',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    MatCardModule,
    MatButtonModule,
    MatProgressSpinnerModule,
  ],
  templateUrl: './customer-detail.component.html',
  styleUrl: './customer-detail.component.scss',
})
export class CustomerDetailComponent implements OnInit {
  loading = signal(true);
  errorMessage = signal('');
  customer = signal<Customer | null>(null);

  constructor(
    private route: ActivatedRoute,
    private customerService: CustomerService,
  ) {}

  ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id');
    if (!id) {
      this.errorMessage.set('Không tìm thấy ID khách hàng');
      this.loading.set(false);
      return;
    }
    this.loadCustomer(id);
  }

  loadCustomer(id: string) {
    this.loading.set(true);
    this.customerService.getById(id).subscribe({
      next: (res) => {
        this.customer.set(res);
        this.loading.set(false);
      },
      error: (err) => {
        this.loading.set(false);
        this.errorMessage.set(
          err?.error?.message || 'Không tải được thông tin khách hàng',
        );
      },
    });
  }

  formatCurrency(value?: number): string {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
      maximumFractionDigits: 0,
    }).format(value || 0);
  }

  formatDate(value?: string): string {
    if (!value) return '-';
    return new Date(value).toLocaleDateString('vi-VN');
  }
}