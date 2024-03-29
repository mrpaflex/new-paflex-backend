import { Exclude } from 'class-transformer';
import {
  IsArray,
  IsDateString,
  IsObject,
  IsOptional,
  IsNotEmpty,
  IsPhoneNumber,
  IsString,
  IsEnum,
  IsNumber,
} from 'class-validator';
import { Interested } from 'src/common/constant/enum/enum';

export class CreateUserDto {
  @IsNotEmpty()
  @IsPhoneNumber()
  phoneNumber: string;
}

export class LoginUserDto extends CreateUserDto {}

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
}
