import { Type } from 'class-transformer';
import {
  IsCreditCard,
  IsDefined,
  IsNotEmpty,
  IsNotEmptyObject,
  IsNumber,
  IsString,
  ValidateNested,
} from 'class-validator';

export class CardDto {
  @IsNotEmpty()
  @IsCreditCard()
  number: string;

  @IsNotEmpty()
  @IsString()
  cvc: string;

  @IsNotEmpty()
  @IsNumber()
  exp_month: number;

  @IsNotEmpty()
  @IsNumber()
  exp_year: number;
}

export class CreateChargeDto {
  @IsDefined()
  @IsNotEmptyObject()
  @ValidateNested()
  @Type(() => CardDto)
  card: CardDto;

  @IsNumber()
  amount: number;
}

export class PaymentWithStripeDto {
  @IsNotEmpty()
  @IsNumber()
  point: number;

  @IsNotEmpty()
  @IsString()
  nameOnCard: string;

  @IsDefined()
  @IsNotEmptyObject()
  @ValidateNested()
  @Type(() => CreateChargeDto)
  charge: CreateChargeDto;
}

export class PaymentDto {
  @IsNotEmpty()
  @IsNumber()
  point: number;

  @IsNotEmpty()
  @IsNumber()
  amount: number;
}
