import { Routes } from '@angular/router';
import { LoginComponent } from './features/auth/login/login.component';
import { MainLayoutComponent } from './layout/main-layout/main-layout.component';
import { authGuard } from './core/guards/auth.guard';
import { roleGuard } from './core/guards/role.guard';

export const routes: Routes = [
  { path: 'login', component: LoginComponent },

  {
    path: '',
    component: MainLayoutComponent,
    canActivate: [authGuard],
    children: [
      { path: '', pathMatch: 'full', redirectTo: 'dashboard' },

      {
        path: 'dashboard',
        loadComponent: () =>
          import('./features/dashboard/dashboard.component').then(
            (m) => m.DashboardComponent,
          ),
      },
      {
        path: 'customers',
        loadComponent: () =>
          import('./features/customers/customer-list/customer-list.component').then(
            (m) => m.CustomerListComponent,
          ),
      },
      {
        path: 'customers/create',
        loadComponent: () =>
          import('./features/customers/customer-create/customer-create.component').then(
            (m) => m.CustomerCreateComponent,
          ),
      },
      {
        path: 'customers/:id',
        loadComponent: () =>
          import('./features/customers/customer-detail/customer-detail.component').then(
            (m) => m.CustomerDetailComponent,
          ),
      },
      {
        path: 'loan-applications',
        loadComponent: () =>
          import('./features/loan-applications/loan-application-list/loan-application-list.component').then(
            (m) => m.LoanApplicationListComponent,
          ),
      },
      {
        path: 'loan-applications/create',
        loadComponent: () =>
          import('./features/loan-applications/loan-application-create/loan-application-create.component').then(
            (m) => m.LoanApplicationCreateComponent,
          ),
      },
      {
        path: 'loan-applications/:id',
        loadComponent: () =>
          import('./features/loan-applications/loan-application-detail/loan-application-detail.component').then(
            (m) => m.LoanApplicationDetailComponent,
          ),
      },

      // Phê duyệt - có phân quyền
      {
        path: 'approvals',
        canActivate: [roleGuard(['APPROVER', 'MANAGER', 'ADMIN'])],
        loadComponent: () =>
          import('./features/approvals/approval-list/approval-list.component').then(
            (m) => m.ApprovalListComponent,
          ),
      },

      {
        path: 'loans',
        loadComponent: () =>
          import('./features/loans/loan-list/loan-list.component').then(
            (m) => m.LoanListComponent,
          ),
      },
      {
        path: 'loans/:id',
        loadComponent: () =>
          import('./features/loans/loan-detail/loan-detail.component').then(
            (m) => m.LoanDetailComponent,
          ),
      },
      {
        path: 'repayments',
        loadComponent: () =>
          import('./features/repayments/repayment-list/repayment-list.component').then(
            (m) => m.RepaymentListComponent,
          ),
      },

      // Audit Logs - có phân quyền
      {
        path: 'audit-logs',
        canActivate: [roleGuard(['MANAGER', 'ADMIN'])],
        loadComponent: () =>
          import('./features/audit-logs/audit-log-list/audit-log-list.component').then(
            (m) => m.AuditLogListComponent,
          ),
      },
    ],
  },

  { path: '**', redirectTo: 'dashboard' },
];