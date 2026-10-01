export interface Customer {
    _id: string;
    customerId: string;
    fullName: string;
    dateOfBirth?: string;
    identityNumber: string;
    phone: string;
    email?: string;
    address?: string;
    occupation?: string;
    monthlyIncome?: number;
    creditScore?: number;
    status?: string;
    createdAt?: string;
  }
  
  export interface CreateCustomerRequest {
    fullName: string;
    dateOfBirth?: string;
    identityNumber: string;
    phone: string;
    email?: string;
    address?: string;
    occupation?: string;
    monthlyIncome?: number;
    creditScore?: number;
  }