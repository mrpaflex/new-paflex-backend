import { Exclude } from 'class-transformer';
import {
  IsArray,
  IsDateString,
  IsObject,
  IsOptional,
  IsPhoneNumber,
  IsString,
  IsEnum,
  IsNotEmpty,
  IsMongoId,
  IsNumber,
} from 'class-validator';
import { Interested } from 'src/common/constant/enum/enum';
import { OtpType } from 'src/otp/enum/otp.enum';

export class CreateUserDto {
  @IsNotEmpty()
  @IsPhoneNumber()
  phoneNumber: string;
}

export class UpdateUserDto {
  @IsOptional()
  @IsString()
  username?: string;

  @IsOptional()
  @IsString()
  firstName?: string;

  @IsOptional()
  @IsString()
  lastName?: string;

  @IsOptional()
  @IsDateString()
  dob?: string;

  @IsOptional()
  @IsPhoneNumber()
  phones?: string;

  @IsOptional()
  @IsObject()
  profilePicture?: object;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  @IsEnum(Interested, { each: true })
  interestedIn: string[];

  @IsOptional()
  @IsString()
  description: string;

  @Exclude()
  refreshToken: string;
}

export class VerifyPhoneNumberDto {
  @IsNotEmpty()
  @IsPhoneNumber()
  phoneNumber: string;

  @IsNotEmpty()
  code: string;

  @IsNotEmpty()
  @IsEnum(OtpType)
  type: string;
}

export class PasswordDto {
  @IsNotEmpty()
  @IsPhoneNumber()
  phoneNumber: string;

  @IsNotEmpty()
  @IsString()
  //@IsStrongPassword()
  password: string;
}

export class IncreaseBalanceDto {
  @IsNotEmpty()
  @IsMongoId()
  userId: string;

  @IsNotEmpty()
  @IsNumber()
  amount: number;
}

export class LoginUserDto extends PasswordDto {}
