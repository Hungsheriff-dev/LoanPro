import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MatListModule } from '@angular/material/list';
import { MatIconModule } from '@angular/material/icon';
import { PERMISSIONS } from '../../core/utils/role.utils';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [CommonModule, RouterModule, MatListModule, MatIconModule],
  templateUrl: './sidebar.component.html',
  styleUrl: './sidebar.component.scss',
})
export class SidebarComponent {
  constructor(public auth: AuthService) {}

  menuItems = [
    { label: 'Dashboard', icon: 'dashboard', route: '/dashboard', roles: null },
    {
      label: 'Khách hàng',
      icon: 'people',
      route: '/customers',
      roles: PERMISSIONS.CUSTOMER_CREATE,
    },
    {
      label: 'Hồ sơ vay',
      icon: 'description',
      route: '/loan-applications',
      roles: PERMISSIONS.LOAN_APP_CREATE,
    },
    {
      label: 'Phê duyệt',
      icon: 'fact_check',
      route: '/approvals',
      roles: PERMISSIONS.LOAN_APP_REVIEW,
    },
    {
      label: 'Khoản vay',
      icon: 'account_balance_wallet',
      route: '/loans',
      roles: PERMISSIONS.LOAN_VIEW,
    },
    {
      label: 'Trả nợ',
      icon: 'payments',
      route: '/repayments',
      roles: PERMISSIONS.LOAN_VIEW,
    },
    {
      label: 'Audit Logs',
      icon: 'history',
      route: '/audit-logs',
      roles: PERMISSIONS.AUDIT_LOG_VIEW,
    },
  ];

  canShow(roles: string[] | null): boolean {
    if (!roles) return true;
    return this.auth.hasAnyRole(roles);
  }
}