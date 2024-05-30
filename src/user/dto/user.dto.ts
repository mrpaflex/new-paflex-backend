import { Exclude, Expose, Type } from 'class-transformer';
import {
  IsArray,
  IsDateString,
  IsOptional,
  IsPhoneNumber,
  IsString,
  IsEnum,
  IsNotEmpty,
  IsMongoId,
  IsNumber,
} from 'class-validator';
import { Interested, UserType } from 'src/common/constant/enum/enum';
import { Photo } from '../schemas/sub-user.schema';
import mongoose from 'mongoose';

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
  @IsString()
  profilePicture?: string;

  @IsOptional()
  @IsArray()
  @IsEnum(Interested, { each: true })
  interestedIn: Interested[];

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

export class UserDto {
  @Expose()
  email: string;

  @Expose()
  phoneNumber: string;

  @Expose()
  firstName: string;

  @Expose()
  lastName: string;

  @Expose()
  @Type(() => Photo)
  profilePhoto: Photo[];

  @Expose()
  referredBy: mongoose.Types.ObjectId;

  @Expose()
  isGoogleAuth: boolean;

  @Expose()
  balance: number;

  @Expose()
  dob: string;

  @Expose()
  userType: UserType;

  @Expose()
  numberOfFollowers: number;

  @Expose()
  interestedIn: string;

  @Expose()
  description: string;

  @Expose()
  accessToken: string;
}
