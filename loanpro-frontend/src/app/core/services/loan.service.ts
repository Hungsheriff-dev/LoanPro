import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { Loan, UpdateLoanRequest } from '../models/loan.model';

@Injectable({
  providedIn: 'root',
})
export class LoanService {
  private baseUrl = `${environment.apiUrl}/loans`;

  constructor(private http: HttpClient) {}

  getAll() {
    return this.http.get<Loan[]>(this.baseUrl);
  }

  getById(id: string) {
    return this.http.get<Loan>(`${this.baseUrl}/${id}`);
  }

  getByLoanId(loanId: string) {
    return this.http.get<Loan>(`${this.baseUrl}/code/${loanId}`);
  }

  getByCustomer(customerId: string) {
    return this.http.get<Loan[]>(`${this.baseUrl}/customer/${customerId}`);
  }

  update(id: string, data: UpdateLoanRequest) {
    return this.http.patch<Loan>(`${this.baseUrl}/${id}`, data);
  }
}