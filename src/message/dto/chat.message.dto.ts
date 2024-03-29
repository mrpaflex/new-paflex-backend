import { Optional } from '@nestjs/common';
import { IsArray, IsNotEmpty, IsString } from 'class-validator';

export class MessageDTO {
  @IsNotEmpty()
  @IsString()
  message: string;
}
