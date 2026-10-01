import {
    IsEnum,
    IsNotEmpty,
    IsNumber,
    IsOptional,
    IsString,
    Min,
  } from 'class-validator';
  
  export class CreateLoanApplicationDto {
    @IsNotEmpty()
    @IsString()
    customerId: string; // ID của khách hàng (MongoDB _id)
  
    @IsNotEmpty()
    @IsEnum(['PERSONAL', 'BUSINESS', 'MORTGAGE', 'CAR', 'OTHER'])
    loanType: string; // loại khoản vay
  
    @IsNotEmpty()
    @IsNumber()
    @Min(1000000) // Tối thiểu 1 triệu
    amount: number; //số lượng
  
    @IsNotEmpty()
    @IsNumber()
    @Min(1)
    tenure: number; // Số tháng, nhiệm kỳ
  
    @IsOptional()
    @IsNumber()
    interestRate?: number; //lãi suất
  
    @IsOptional()
    @IsString()
    purpose?: string; //mục đích
  }