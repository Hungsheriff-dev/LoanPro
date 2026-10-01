import { IsEnum, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class ReviewLoanApplicationDto {
  @IsNotEmpty()
  @IsEnum(['APPROVE', 'REJECT', 'REQUEST_MORE_INFO'])
  action: 'APPROVE' | 'REJECT' | 'REQUEST_MORE_INFO';

  @IsOptional()
  @IsString()
  comment?: string;
}