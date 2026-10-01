import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatChipsModule } from '@angular/material/chips';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { RepaymentService } from '../../../core/services/repayment.service';
import { RepaymentSchedule } from '../../../core/models/repayment.model';
import { AuthService } from '../../../core/services/auth.service';
import { PERMISSIONS } from '../../../core/utils/role.utils';

@Component({
  selector: 'app-repayment-list',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    MatCardModule,
    MatTableModule,
    MatButtonModule,
    MatProgressSpinnerModule,
    MatChipsModule,
    MatIconModule,
    MatSnackBarModule,
  ],
  templateUrl: './repayment-list.component.html',
  styleUrl: './repayment-list.component.scss',
})
export class RepaymentListComponent implements OnInit {
  loading = signal(true);
  payingId = signal<string | null>(null); //(null) là giá trị trống ban đầu, ko có kỳ nào đang dc xử lý để đưa vào
  errorMessage = signal('');
  schedules = signal<RepaymentSchedule[]>([]); //các kỳ trả nợ 
  currentLoanId = signal<string | null>(null); //id khoản vay
  isOverdueMode = signal(false); //hiện tại có đang ở chế độ xem danh sách kỳ quá hạn hay không
  readonly PERMISSIONS = PERMISSIONS; //Đưa biến PERMISSIONS từ bên ngoài vào trong Component để HTML có thể sử dụng được

  displayedColumns = [
    'installmentNumber',
    'dueDate',
    'principal',
    'interest',
    'totalPayment',
    'status',
    'paidDate',
    'actions',
  ];

  constructor(
    private route: ActivatedRoute,
    private repaymentService: RepaymentService,
    private snackBar: MatSnackBar,
    public auth: AuthService,
  ) {}

  ngOnInit() {
    this.route.queryParamMap.subscribe((params) => {
      const loanId = params.get('loanId');
      this.currentLoanId.set(loanId);
      this.loadData(loanId);
    });
  }

  loadData(loanId: string | null) {
    this.loading.set(true);
    this.errorMessage.set('');
    this.schedules.set([]);

    if (loanId) {
      this.isOverdueMode.set(false);
      //isOverdueMode: cho biết giao diện hiện tại đang ở "chế độ xem danh sách quá hạn" 
      //hay đang xem lịch trả nợ của một khoản vay cụ thể phụ thuộc vào loanId
      this.repaymentService.getByLoan(loanId).subscribe({
        next: (res) => {
          this.schedules.set(res);
          this.loading.set(false);
        },
        error: (err) => {
          this.loading.set(false);
          this.errorMessage.set(
            err?.error?.message || 'Không tải được lịch trả nợ',
          );
        },
      });
    } else {
      // Không có loanId → hiện danh sách quá hạn
      this.isOverdueMode.set(true);
      this.repaymentService.getOverdue().subscribe({
        next: (res) => {
          this.schedules.set(res);
          this.loading.set(false);
        },
        error: (err) => {
          this.loading.set(false);
          this.errorMessage.set(
            err?.error?.message || 'Không tải được danh sách quá hạn',
          );
        },
      });
    }
  }

  markAsPaid(item: RepaymentSchedule) { //dùng để kiểm tra trước khi thực hiện thanh toán một kỳ trả nợ
    if (this.payingId() || item.status === 'PAID') return; //nếu payingId(đang thanh toán kỳ khác ko) hoặc item = PAID thì dừng

    this.payingId.set(item._id); //Ghi nhớ kỳ nào đang được thanh toán

    this.repaymentService.markAsPaid(item._id).subscribe({
      next: (updated) => {
        // Cập nhật lại item trong danh sách
        this.schedules.update((list) =>
          list.map((s) => (s._id === updated._id ? updated : s)),
        );
        this.payingId.set(null);
        this.snackBar.open('Đã ghi nhận thanh toán thành công', 'Đóng', {
          duration: 3000,
        });
      },
      error: (err) => {
        this.payingId.set(null);
        this.snackBar.open(
          err?.error?.message || 'Ghi nhận thanh toán thất bại',
          'Đóng',
          { duration: 4000 },
        );
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
    return new Date(date).toLocaleDateString('vi-VN');
  }

  getStatusLabel(status: string): string {
    const map: Record<string, string> = {
      PENDING: 'Chưa trả',
      PAID: 'Đã trả',
      OVERDUE: 'Quá hạn',
    };
    return map[status] || status;
  }

  getStatusColor(status: string): string {
    const map: Record<string, string> = {
      PENDING: 'accent',
      PAID: 'primary',
      OVERDUE: 'warn',
    };
    return map[status] || 'basic';
  }

  /** Trả về số kỳ nhỏ nhất chưa thanh toán */
  getNextPayableInstallmentNumber(): number | null {
    const list = this.schedules();
    const unpaid = list
      .filter((s) => s.status !== 'PAID') //lọc ra những kỳ ko phải Paid
      .sort((a, b) => a.installmentNumber - b.installmentNumber); //sort: xếp kỳ nợ theo thứ tự

    return unpaid.length > 0 ? unpaid[0].installmentNumber : null; //điều_kiện ? giá_trị_nếu_đúng : giá_trị_nếu_sai
  }

  canPay(item: RepaymentSchedule): boolean {
    if (item.status === 'PAID') return false;
    const next = this.getNextPayableInstallmentNumber(); //Tìm kỳ chưa trả đầu tiên
    return next === item.installmentNumber; //Kiểm tra kỳ hiện tại có phải kỳ được trả tiếp theo không
  }
}