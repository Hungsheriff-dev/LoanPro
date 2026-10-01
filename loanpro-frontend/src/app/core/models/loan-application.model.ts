export interface LoanApplicationCustomer {
  _id: string;
  customerId?: string;
  fullName?: string;
  phone?: string;
  identityNumber?: string;
  email?: string;
}

export interface LoanApplicationUser {
  _id: string;
  username?: string;
  fullName?: string;
  role?: string;
}

export interface ReviewHistoryItem {
  user?: LoanApplicationUser | string;
  action?: ReviewAction;
  comment?: string;
  date?: string;
  _id?: string;
}

export interface LoanApplication {
  _id: string;
  applicationId: string;
  customer: LoanApplicationCustomer | string;
  loanType: string;
  amount: number;
  tenure: number;
  interestRate?: number;
  purpose?: string;
  status: string;
  currentStep?: number;
  submittedBy?: LoanApplicationUser | string;
  submittedAt?: string;
  reviewedBy?: ReviewHistoryItem[];
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateLoanApplicationRequest {
  customerId: string;
  loanType: string;
  amount: number;
  tenure: number;
  interestRate?: number;
  purpose?: string;
}

export type ReviewAction = 'APPROVE' | 'REJECT' | 'REQUEST_MORE_INFO';

export interface ReviewLoanApplicationRequest {
  action: ReviewAction;
  comment?: string;
}