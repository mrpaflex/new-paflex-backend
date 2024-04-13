import {
  IsEmail,
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsPhoneNumber,
} from 'class-validator';
import { OtpType } from '../enum/otp.enum';

export class CreateOtpDto {
  @IsOptional()
  @IsEmail()
  email: string;

  @IsNotEmpty()
  @IsNumber()
  code: string;

  @IsOptional()
  @IsPhoneNumber()
  phoneNumber: string;
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

export class VerifyOtpDto extends SendOtpDto {
  @IsNumber()
  code: string;
}

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
