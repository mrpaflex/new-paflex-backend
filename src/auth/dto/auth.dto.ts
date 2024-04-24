import {
  IsEmail,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsPhoneNumber,
  IsString,
} from 'class-validator';
import { OtpType } from 'src/otp/enum/otp.enum';

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

export class GoogleCreateUserDto {
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @IsString()
  @IsOptional()
  firstName: string;

  @IsString()
  @IsOptional()
  lastName: string;

  @IsString()
  @IsOptional()
  refreshToken: string;

  @IsString()
  @IsOptional()
  picture: string;
}

export class ForgotPasswordDto {
  @IsNotEmpty()
  @IsPhoneNumber()
  phoneNumber: string;
}

export class ResetPasswordDto extends ForgotPasswordDto {
  @IsNotEmpty()
  @IsString()
  code: string;

  @IsNotEmpty()
  @IsString()
  password: string;
}
