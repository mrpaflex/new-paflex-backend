import { Type } from 'class-transformer';
import {
  IsNotEmpty,
  IsNumber,
  IsString,
  ValidateNested,
} from 'class-validator';

export class WithdrawalInfo {
  @IsNotEmpty()
  @IsString()
  method: string;

  @IsNotEmpty()
  @IsNumber()
  cardNo: number;

  @IsString()
  @IsNotEmpty()
  cardName: string;

  @IsNotEmpty()
  @IsNumber()
  expireDate: number;

  @IsNotEmpty()
  @IsString()
  cvv: string;
}

export class CreateWithdrawalDto {
  @IsNotEmpty()
  @IsNumber()
  amount: number;

  @IsNotEmpty()
  @ValidateNested()
  @Type(() => WithdrawalInfo)
  details: WithdrawalInfo;
}
