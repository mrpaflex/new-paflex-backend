import { IsMongoId, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class StartLiveDto {
  @IsOptional()
  @IsString()
  title?: string;

  @IsOptional()
  @IsString()
  description?: string;
}

export class StopLiveDto {
  @IsNotEmpty()
  @IsMongoId()
  streamId?: string;
}
