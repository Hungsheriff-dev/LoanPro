export interface Loan {
    _id: string;
    loanId: string;
    application?: any; // LoanApplication (populated)
    customer?: any;    // Customer (populated)
    principalAmount: number;
    disbursedAmount?: number;
    disbursedDate?: string;
    tenure?: number;
    interestRate?: number;
    status: 'ACTIVE' | 'COMPLETED' | 'OVERDUE' | 'CLOSED' | string;
    totalRepaid?: number;
    remainingBalance?: number;
    createdAt?: string;
    updatedAt?: string;
  }
  
  export interface UpdateLoanRequest {
    status?: 'ACTIVE' | 'COMPLETED' | 'OVERDUE' | 'CLOSED';
    totalRepaid?: number;
    remainingBalance?: number;
  }