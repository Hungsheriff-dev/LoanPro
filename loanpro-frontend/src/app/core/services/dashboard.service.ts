import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';

export interface DashboardData {
  customers: { total: number };
  applications: {
    total: number;
    byStatus: {
      DRAFT: number;
      PENDING: number;
      REVIEWING: number;
      APPROVED: number;
      REJECTED: number;
      DISBURSED: number;
    };
  };
  loans: {
    total: number;
    active: number;
    totalDisbursed: number;
    totalRemaining: number;
    totalRepaid: number;
  };
  repayments: {
    overdueCount: number;
  };
}

@Injectable({
  providedIn: 'root',
})
export class DashboardService {
  constructor(private http: HttpClient) {}

  getDashboard() {
    return this.http.get<DashboardData>(
      `${environment.apiUrl}/reports/dashboard`,
    );
  }
}