import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import {
  CreateLoanApplicationRequest,
  LoanApplication,
} from '../models/loan-application.model';

@Injectable({
  providedIn: 'root',
})
export class LoanApplicationService {
  private baseUrl = `${environment.apiUrl}/loan-applications`;

  constructor(private http: HttpClient) {}

  getAll() {
    return this.http.get<LoanApplication[]>(this.baseUrl);
  }

  getById(id: string) {
    return this.http.get<LoanApplication>(`${this.baseUrl}/${id}`);
  }

  create(data: CreateLoanApplicationRequest) {
    return this.http.post<LoanApplication>(this.baseUrl, data);
  }

  submit(id: string) {
    return this.http.patch<LoanApplication>(`${this.baseUrl}/${id}/submit`, {});
  }

  // loan-application.service.ts

  getPending() {
    return this.http.get<LoanApplication[]>(`${this.baseUrl}/pending/list`);
  }
  
  review(id: string, data: { action: string; comment?: string }) {
    return this.http.patch<LoanApplication>(`${this.baseUrl}/${id}/review`, data);
  }

  disburse(id: string) {
    return this.http.patch<LoanApplication>(`${this.baseUrl}/${id}/disburse`, {});
  }
}