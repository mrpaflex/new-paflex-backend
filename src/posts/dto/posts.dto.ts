import {
  IsArray,
  IsEmail,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
} from 'class-validator';
import { PartialType } from '@nestjs/swagger';
import { PostTypeEnum } from 'src/common/enum/post.reactions.enum';

export class CreatePostDto {
  @IsNotEmpty()
  @IsEnum(PostTypeEnum)
  postType: string;

  @IsOptional()
  @IsString()
  text: string;
}

export class UpdatePostDto extends PartialType(CreatePostDto) {}

export class ValidateActionDto {
  @IsOptional()
  @IsEmail()
  email: string;
  @IsNotEmpty()
  @IsString()
  code: string;
}

export class DeDTO{
  @IsArray()
  @IsNotEmpty()
  ids: string[]
}
