import { Component, signal } from '@angular/core';
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
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

import { CustomerService } from '../../../core/services/customer.service';

@Component({
  selector: 'app-customer-create',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatProgressSpinnerModule,
  ],
  templateUrl: './customer-create.component.html',
  styleUrl: './customer-create.component.scss',
})
export class CustomerCreateComponent {
  loading = signal(false);
  errorMessage = signal('');

  form;

  constructor(
    private fb: FormBuilder,
    private customerService: CustomerService,
    private router: Router,
  ) {
    this.form = this.fb.nonNullable.group({
      fullName: ['', Validators.required],
      dateOfBirth: [''],
      identityNumber: ['', Validators.required],
      phone: ['', Validators.required],
      email: ['', Validators.email],
      address: [''],
      occupation: [''],
      monthlyIncome: [null as number | null],
      creditScore: [null as number | null],
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
      fullName: raw.fullName,
      dateOfBirth: raw.dateOfBirth || undefined,
      identityNumber: raw.identityNumber,
      phone: raw.phone,
      email: raw.email || undefined,
      address: raw.address || undefined,
      occupation: raw.occupation || undefined,
      monthlyIncome: raw.monthlyIncome ?? undefined,
      creditScore: raw.creditScore ?? undefined,
    };

    this.customerService.create(payload).subscribe({
      next: (res) => {
        this.loading.set(false);
        this.router.navigate(['/customers', res._id]);
      },
      error: (err) => {
        this.loading.set(false);
        this.errorMessage.set(
          err?.error?.message || 'Tạo khách hàng thất bại',
        );
      },
    });
  }
}