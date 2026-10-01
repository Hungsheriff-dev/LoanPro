import { IsNumber, IsOptional, IsDateString, Min } from 'class-validator';

export class MarkAsPaidDto {
  @IsOptional()
  @IsNumber()
  @Min(0)
  paidAmount?: number;

  @IsOptional()
  @IsDateString()
  paidDate?: string;
}