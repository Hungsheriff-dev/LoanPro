import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { RepaymentSchedule, MarkAsPaidRequest } from '../models/repayment.model';

@Injectable({
  providedIn: 'root',
})
export class RepaymentService {
  private baseUrl = `${environment.apiUrl}/repayments`;

  constructor(private http: HttpClient) {}

  getByLoan(loanId: string) {
    return this.http.get<RepaymentSchedule[]>(`${this.baseUrl}/loan/${loanId}`);
  }

  getOverdue() {
    return this.http.get<RepaymentSchedule[]>(`${this.baseUrl}/overdue/list`);
  }

  getById(id: string) {
    return this.http.get<RepaymentSchedule>(`${this.baseUrl}/${id}`);
  }

  markAsPaid(id: string, data: MarkAsPaidRequest = {}) {
    return this.http.patch<RepaymentSchedule>(`${this.baseUrl}/${id}/pay`, data);
  }
}