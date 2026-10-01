import { IsOptional, IsString } from 'class-validator';

export class SubmitLoanApplicationDto {
  @IsOptional()
  @IsString()
  note?: string;
}