import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatChipsModule } from '@angular/material/chips';
import { MatDividerModule } from '@angular/material/divider';
import { MatIconModule } from '@angular/material/icon';
import { LoanService } from '../../../core/services/loan.service';
import { Loan } from '../../../core/models/loan.model';

@Component({
  selector: 'app-loan-detail',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    MatCardModule,
    MatButtonModule,
    MatProgressSpinnerModule,
    MatChipsModule,
    MatDividerModule,
    MatIconModule,
  ],
  templateUrl: './loan-detail.component.html',
  styleUrl: './loan-detail.component.scss',
})
export class LoanDetailComponent implements OnInit {
  loading = signal(true);
  errorMessage = signal('');
  loan = signal<Loan | null>(null);
  // Loan | null → loan có thể chứa một khoản vay hoặc null.
  //(null) → giá trị ban đầu là null.

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private loanService: LoanService,
  ) {}

  ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id');
    if (!id) {
      this.errorMessage.set('Không tìm thấy mã khoản vay');
      this.loading.set(false);
      return;
    }

    this.loanService.getById(id).subscribe({
      next: (res) => {
        this.loan.set(res);
        this.loading.set(false);
      },
      error: () => {
        this.errorMessage.set('Không tải được thông tin khoản vay');
        this.loading.set(false);
      },
    });
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
    return new Date(date).toLocaleString('vi-VN');
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

  goToRepayments() {
    const currentLoan = this.loan();
    if (!currentLoan) return;
    // Sau này khi có trang repayments sẽ dẫn đến /repayments?loanId=...
    this.router.navigate(['/repayments'], {
      queryParams: { loanId: currentLoan._id },
    });
  }
}