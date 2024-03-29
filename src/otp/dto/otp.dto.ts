import {
  IsEmail,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsPhoneNumber,
} from 'class-validator';

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
}

export class VerifyOtpDto extends SendOtpDto {
  @IsNumber()
  code: string;
}

export class ValidateOtpDto extends VerifyOtpDto {}
