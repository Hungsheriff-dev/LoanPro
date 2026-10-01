export interface RepaymentSchedule {
    _id: string;
    loan: any; // Loan (có thể chỉ là ObjectId hoặc đã populate)
    installmentNumber: number;
    dueDate: string;
    principal: number;
    interest: number;
    totalPayment: number;
    status: 'PENDING' | 'PAID' | 'OVERDUE' | string;
    paidDate?: string;
    paidAmount?: number;
    createdAt?: string;
    updatedAt?: string;
  }
  
  export interface MarkAsPaidRequest {
    paidAmount?: number;
    paidDate?: string;
  }