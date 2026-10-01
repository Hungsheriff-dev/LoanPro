import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { CreateCustomerRequest, Customer } from '../models/customer.model';

@Injectable({
  providedIn: 'root',
})
export class CustomerService {
  private baseUrl = `${environment.apiUrl}/customers`;

  constructor(private http: HttpClient) {}

  getAll() {
    return this.http.get<Customer[]>(this.baseUrl);
  }

  getById(id: string) {
    return this.http.get<Customer>(`${this.baseUrl}/${id}`);
  }

  create(data: CreateCustomerRequest) {
    return this.http.post<Customer>(this.baseUrl, data);
  }
}