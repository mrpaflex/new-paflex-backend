import {
  IsEmail,
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsPhoneNumber,
  IsString,
} from 'class-validator';
import { OtpType } from '../enum/otp.enum';

export class CreateOtpDto {
  @IsOptional()
  @IsEmail()
  email: string;

  @IsNotEmpty()
  @IsString()
  code: string;

  @IsOptional()
  @IsPhoneNumber()
  phoneNumber: string;

  @IsNotEmpty()
  @IsEnum(OtpType)
  type: string;
}

export class SendOtpDto {
  @IsOptional()
  @IsEmail()
  email: string;

  @IsOptional()
  @IsPhoneNumber()
  phoneNumber: string;

  @IsEnum(OtpType)
  @IsNotEmpty()
  type: string;
}

export class VerifyOtpDto extends CreateOtpDto {}

export class RequestOtpDto {
  @IsPhoneNumber()
  @IsOptional()
  phoneNumber: string;

  @IsNotEmpty()
  @IsEnum(OtpType)
  type: string;

  @IsOptional()
  @IsEmail()
  email: string;
}

export class ValidateOtpDto extends VerifyOtpDto {}
