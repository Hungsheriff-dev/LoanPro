import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatChipsModule } from '@angular/material/chips';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { FormsModule } from '@angular/forms';
import { LoanService } from '../../../core/services/loan.service';
import { Loan } from '../../../core/models/loan.model';

@Component({
  selector: 'app-loan-list',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    FormsModule,
    MatCardModule,
    MatTableModule,
    MatButtonModule,
    MatProgressSpinnerModule,
    MatChipsModule,
    MatFormFieldModule,
    MatSelectModule,
  ],
  templateUrl: './loan-list.component.html',
  styleUrl: './loan-list.component.scss',
})
export class LoanListComponent implements OnInit {
  loading = signal(true);
  errorMessage = signal('');
  loans = signal<Loan[]>([]);
  filteredLoans = signal<Loan[]>([]);

  statusFilter = 'ALL';

  displayedColumns = [
    'loanId',
    'customer',
    'principalAmount',
    'remainingBalance',
    'interestRate',
    'tenure',
    'status',
    'disbursedDate',
    'actions',
  ];

  constructor(private loanService: LoanService) {}

  ngOnInit() {
    this.loadData();
  }

  loadData() {
    this.loading.set(true);
    this.errorMessage.set('');

    this.loanService.getAll().subscribe({
      next: (res) => {
        this.loans.set(res);
        this.applyFilter();
        this.loading.set(false);
      },
      error: (err) => {
        this.loading.set(false);
        this.errorMessage.set(
          err?.error?.message || 'Không tải được danh sách khoản vay',
        );
      },
    });
  }

  applyFilter() {
    const all = this.loans();
    if (this.statusFilter === 'ALL') {
      this.filteredLoans.set(all);
    } else {
      this.filteredLoans.set(all.filter((l) => l.status === this.statusFilter));
    }
  }

  onFilterChange() {
    this.applyFilter();
  }

  formatCurrency(value?: number): string {
    if (value == null) return '—';
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
    }).format(value);
  }

  formatDate(date?: string): string {
    if (!date) return '—';
    return new Date(date).toLocaleDateString('vi-VN');
  }

  getStatusLabel(status: string): string {
    const map: Record<string, string> = {
      ACTIVE: 'Đang hoạt động',
      COMPLETED: 'Hoàn thành',
      OVERDUE: 'Quá hạn',
      CLOSED: 'Đã đóng',
    };
    return map[status] || status;
  }

  getStatusColor(status: string): string {
    const map: Record<string, string> = {
      ACTIVE: 'primary',
      COMPLETED: 'accent',
      OVERDUE: 'warn',
      CLOSED: 'basic',
    };
    return map[status] || 'basic';
  }
}