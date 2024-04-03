import {
  IsEnum,
  IsMongoId,
  IsNotEmpty,
  IsOptional,
  IsString,
} from 'class-validator';
import { PartialType } from '@nestjs/swagger';
import { PostTypeEnum } from 'src/common/enum/post.reactions.enum';
export class ReplyDto {
  @IsNotEmpty()
  @IsEnum(PostTypeEnum)
  replyType: string;

  @IsOptional()
  @IsString()
  reply: string;

  @IsOptional()
  @IsMongoId()
  replyId: string;

  @IsOptional()
  @IsMongoId()
  commentId: string;
}

export class CommentDto {
  @IsNotEmpty()
  @IsEnum(PostTypeEnum)
  commentType: string;

  @IsOptional()
  @IsString()
  comment: string;

  @IsNotEmpty()
  @IsMongoId()
  postId: string;
}

export class UpdateCommentOrReplyDto extends PartialType(ReplyDto) {
  @IsOptional()
  @IsString()
  editText: string;

  @IsNotEmpty()
  @IsEnum(PostTypeEnum)
  updateType: string;
}

export class DeleteCommentOrReplyDTO {
  @IsOptional()
  @IsMongoId()
  replyId: string;

  @IsOptional()
  @IsMongoId()
  commentId: string;
}