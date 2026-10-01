import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  FormBuilder,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

import { CustomerService } from '../../../core/services/customer.service';
import { LoanApplicationService } from '../../../core/services/loan-application.service';
import { Customer } from '../../../core/models/customer.model';

@Component({
  selector: 'app-loan-application-create',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
    MatProgressSpinnerModule,
  ],
  templateUrl: './loan-application-create.component.html',
  styleUrl: './loan-application-create.component.scss',
})
export class LoanApplicationCreateComponent implements OnInit {
  loading = signal(false);
  loadingCustomers = signal(true);
  errorMessage = signal('');
  customers = signal<Customer[]>([]);

  loanTypes = ['PERSONAL', 'BUSINESS', 'MORTGAGE', 'CAR', 'OTHER'];

  form;

  constructor(
    private fb: FormBuilder,
    private customerService: CustomerService,
    private loanApplicationService: LoanApplicationService,
    private router: Router,
  ) {
    this.form = this.fb.nonNullable.group({
      customerId: ['', Validators.required],
      loanType: ['PERSONAL', Validators.required],
      amount: [0, [Validators.required, Validators.min(1000000)]],
      tenure: [12, [Validators.required, Validators.min(1)]],
      interestRate: [12],
      purpose: [''],
    });
  }

  ngOnInit() {
    this.customerService.getAll().subscribe({
      next: (res) => {
        this.customers.set(res);
        this.loadingCustomers.set(false);
      },
      error: () => {
        this.loadingCustomers.set(false);
        this.errorMessage.set('Không tải được danh sách khách hàng');
      },
    });
  }

  onSubmit() {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.loading.set(true);
    this.errorMessage.set('');

    const raw = this.form.getRawValue();
    const payload = {
      customerId: raw.customerId,
      loanType: raw.loanType,
      amount: Number(raw.amount),
      tenure: Number(raw.tenure),
      interestRate: raw.interestRate ? Number(raw.interestRate) : undefined,
      purpose: raw.purpose || undefined,
    };

    this.loanApplicationService.create(payload).subscribe({
      next: (res) => {
        this.loading.set(false);
        this.router.navigate(['/loan-applications', res._id]);
      },
      error: (err) => {
        this.loading.set(false);
        this.errorMessage.set(
          err?.error?.message || 'Tạo hồ sơ vay thất bại',
        );
      },
    });
  }
}