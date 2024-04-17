import { IsMongoId, IsNotEmpty, IsNumber, IsOptional } from 'class-validator';

export class GiftPostDto {
  @IsOptional()
  @IsMongoId()
  postId: string;

  @IsOptional()
  @IsMongoId()
  liveId: string;

  @IsOptional()
  @IsMongoId()
  userReceiverId: string;

  @IsNotEmpty()
  @IsNumber()
  amount: number;
}
