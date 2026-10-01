import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatChipsModule } from '@angular/material/chips';
import { MatDividerModule } from '@angular/material/divider';
import { MatIconModule } from '@angular/material/icon';
import { LoanApplicationService } from '../../../core/services/loan-application.service';
import { LoanApplication } from '../../../core/models/loan-application.model';
import { MatDialog } from '@angular/material/dialog';
import { AuthService } from '../../../core/services/auth.service';
import { PERMISSIONS } from '../../../core/utils/role.utils';
import {
  ConfirmDialogComponent,
  ConfirmDialogData,
} from '../../../shared/confirm-dialog/confirm-dialog.component';

@Component({
  selector: 'app-loan-application-detail',
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
  templateUrl: './loan-application-detail.component.html',
  styleUrl: './loan-application-detail.component.scss',
})
export class LoanApplicationDetailComponent implements OnInit {
  loading = signal(true);
  submitting = signal(false);
  errorMessage = signal('');
  application = signal<LoanApplication | null>(null); //LoanApplication | null: có thể chứa Loan... hoặc null

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private loanApplicationService: LoanApplicationService,
    private dialog: MatDialog,
    public auth: AuthService,
  ) {}

  canSubmit(): boolean {
    return this.auth.hasAnyRole(PERMISSIONS.LOAN_APP_SUBMIT);
  }
  
  canDisburse(): boolean {
    return this.auth.hasAnyRole(PERMISSIONS.LOAN_APP_DISBURSE);
  }
  
  canReview(): boolean {
    return this.auth.hasAnyRole(PERMISSIONS.LOAN_APP_REVIEW);
  }

  ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id');
    if (!id) {
      this.errorMessage.set('Không tìm thấy mã hồ sơ');
      this.loading.set(false);
      return;
    }

    this.loanApplicationService.getById(id).subscribe({
      next: (res) => {
        this.application.set(res);
        this.loading.set(false);
      },
      error: () => {
        this.errorMessage.set('Không tải được thông tin hồ sơ vay');
        this.loading.set(false);
      },
    });
  }

  onSubmitApplication() {
    const app = this.application();
    if (!app || this.submitting()) return;

    this.submitting.set(true);
    this.errorMessage.set('');

    this.loanApplicationService.submit(app._id).subscribe({
      next: (res) => { //nếu submit thành công
        this.application.set(res);
        this.submitting.set(false);
      },
      error: (err) => { //nếu submit failed
        this.submitting.set(false);
        this.errorMessage.set(
          err?.error?.message || 'Gửi hồ sơ thất bại',
        );
      },
    });
  }

  getStatusLabel(status: string): string {
    const map: Record<string, string> = {
      DRAFT: 'Nháp',
      SUBMITTED: 'Đã gửi',
      UNDER_REVIEW: 'Đang xét duyệt',
      APPROVED: 'Đã duyệt',
      REJECTED: 'Từ chối',
      DISBURSED: 'Đã giải ngân',
    };
    return map[status] || status;
  }

  getStatusColor(status: string): string {
    const map: Record<string, string> = {
      DRAFT: 'basic',
      SUBMITTED: 'primary',
      UNDER_REVIEW: 'accent',
      APPROVED: 'primary',
      REJECTED: 'warn',
      DISBURSED: 'primary',
    };
    return map[status] || 'basic';
  }

  getCustomerField(
    customer: LoanApplication['customer'],
    field: 'fullName' | 'customerId' | 'identityNumber' | 'phone' | '_id',
  ): string {
    if (!customer) return '—';
    if (typeof customer === 'string') {
      return field === '_id' || field === 'customerId' ? customer : '—';
    }
  
    const value = customer[field as keyof typeof customer];
    return (value as string) || '—';
  }

  getCustomerName(customer: LoanApplication['customer']): string {
    if (!customer) return '—';
    if (typeof customer === 'string') return customer;
    return customer.fullName || customer.customerId || '—';
  }
  
  getCustomerCode(customer: LoanApplication['customer']): string {
    if (!customer) return '—';
    if (typeof customer === 'string') return customer;
    return customer.customerId || customer._id || '—';
  }
  
  getCustomerPhone(customer: LoanApplication['customer']): string {
    if (!customer) return '—';
    if (typeof customer === 'string') return '—';
    return customer.phone || '—';
  }
  
  getCustomerIdentity(customer: LoanApplication['customer']): string {
    if (!customer) return '—';
    if (typeof customer === 'string') return '—';
    return customer.identityNumber || '—';
  }

  formatCurrency(value: number): string {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
    }).format(value);
  }

  formatDate(date?: string): string {
    if (!date) return '—';
    return new Date(date).toLocaleString('vi-VN');
  }

disbursing = signal(false);

// Thêm method
onDisburse() {
  const app = this.application();
  if (!app || this.disbursing()) return;

  const dialogRef = this.dialog.open(ConfirmDialogComponent, {
    width: '400px',
    data: {
      title: 'Xác nhận giải ngân',
      message:
        'Bạn có chắc muốn giải ngân hồ sơ này?\nHệ thống sẽ tạo khoản vay và lịch trả nợ.',
      confirmText: 'Giải ngân',
      cancelText: 'Hủy',
    } as ConfirmDialogData,
  });

  dialogRef.afterClosed().subscribe((confirmed) => {
    if (!confirmed) return;

    this.disbursing.set(true);
    this.errorMessage.set('');

    this.loanApplicationService.disburse(app._id).subscribe({
      next: (res) => {
        this.application.set(res);
        this.disbursing.set(false);
      },
      error: (err) => {
        this.disbursing.set(false);
        this.errorMessage.set(
          err?.error?.message || 'Giải ngân thất bại',
        );
      },
    });
  });
}
}