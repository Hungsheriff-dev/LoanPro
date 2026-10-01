import { IsEnum, IsNumber, IsOptional } from 'class-validator';

export class UpdateLoanDto {
  @IsOptional()
  @IsEnum(['ACTIVE', 'COMPLETED', 'OVERDUE', 'CLOSED'])
  status?: string;

  @IsOptional()
  @IsNumber()
  totalRepaid?: number;

  @IsOptional()
  @IsNumber()
  remainingBalance?: number;
}