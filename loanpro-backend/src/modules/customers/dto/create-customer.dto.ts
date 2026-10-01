import { IsEmail, IsNotEmpty, IsNumber, IsOptional, IsString, IsDateString } from 'class-validator';

export class CreateCustomerDto {
  @IsNotEmpty()
  @IsString()
  fullName: string;

  @IsOptional()
  @IsDateString()
  dateOfBirth?: string;

  @IsNotEmpty()
  @IsString()
  identityNumber: string; // CMND/CCCD

  @IsNotEmpty()
  @IsString()
  phone: string;

  @IsOptional()
  @IsEmail()
  email?: string;

  @IsOptional()
  @IsString()
  address?: string;

  @IsOptional()
  @IsString()
  occupation?: string;

  @IsOptional()
  @IsNumber()
  monthlyIncome?: number;

  @IsOptional()
  @IsNumber()
  creditScore?: number;
}