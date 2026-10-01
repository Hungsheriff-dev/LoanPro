import { IsNumber, IsOptional, Min } from 'class-validator';

export class DisburseLoanDto {
  @IsOptional()
  @IsNumber()
  @Min(0)
  disbursedAmount?: number; // Nếu không gửi thì lấy bằng amount của hồ sơ
}