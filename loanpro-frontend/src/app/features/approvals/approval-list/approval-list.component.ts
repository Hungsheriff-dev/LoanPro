import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatDialogModule } from '@angular/material/dialog';

import { LoanApplicationService } from '../../../core/services/loan-application.service';
import { LoanApplication } from '../../../core/models/loan-application.model';

@Component({
  selector: 'app-approval-list',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    FormsModule,
    MatTableModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatProgressSpinnerModule,
    MatDialogModule,
  ],
  templateUrl: './approval-list.component.html',
  styleUrl: './approval-list.component.scss',
})
export class ApprovalListComponent implements OnInit {
  loading = signal(true);
  errorMessage = signal('');
  applications = signal<LoanApplication[]>([]);

  // form review tạm theo từng dòng
  selectedId: string | null = null;
  action = 'APPROVE';
  comment = '';
  reviewing = signal(false);

  displayedColumns = [
    'applicationId',
    'customer',
    'amount',
    'loanType',
    'status',
    'actions',
  ];

  constructor(private loanApplicationService: LoanApplicationService) {}

  ngOnInit() {
    this.loadPending();
  }

  loadPending() {
    this.loading.set(true);
    this.errorMessage.set('');

    this.loanApplicationService.getPending().subscribe({
      next: (res) => {
        this.applications.set(res);
        this.loading.set(false);
      },
      error: (err) => {
        this.loading.set(false);
        this.errorMessage.set(
          err?.error?.message || 'Không tải được danh sách chờ duyệt',
        );
      },
    });
  }

  openReview(id: string) {
    this.selectedId = id;
    this.action = 'APPROVE';
    this.comment = '';
  }

  cancelReview() {
    this.selectedId = null;
    this.comment = '';
  }

  submitReview() {
    if (!this.selectedId) return;

    this.reviewing.set(true);

    this.loanApplicationService
      .review(this.selectedId, {
        action: this.action,
        comment: this.comment || undefined,
      })
      .subscribe({
        next: () => {
          this.reviewing.set(false);
          this.selectedId = null;
          this.loadPending();
        },
        error: (err) => {
          this.reviewing.set(false);
          alert(err?.error?.message || 'Phê duyệt thất bại');
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

  getCustomerName(row: LoanApplication): string {
    const customer = row.customer;
  
    if (!customer) return '-';
  
    // Nếu customer là string (chỉ là id)
    if (typeof customer === 'string') {
      return customer;
    }
  
    // Nếu customer là object đã populate
    return customer.fullName || customer.customerId || customer._id || '-';
  }
}