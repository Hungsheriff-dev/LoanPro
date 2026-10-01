import { IsEmail, IsEnum, IsNotEmpty, IsOptional, IsString, MinLength } from 'class-validator';

export class RegisterDto {
  @IsNotEmpty()
  @IsString()
  username: string;

  @IsNotEmpty()
  @IsEmail()
  email: string;

  @IsNotEmpty()
  @MinLength(6)
  password: string;

  @IsNotEmpty()
  @IsString()
  fullName: string;

  @IsOptional()
  @IsString()
  phone?: string;

  @IsNotEmpty()
  @IsEnum(['CUSTOMER', 'CREDIT_OFFICER', 'APPROVER', 'MANAGER', 'ADMIN'])
  role: string;

  @IsOptional()
  @IsString()
  department?: string;
}