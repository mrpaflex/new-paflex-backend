import { IsEnum, IsMongoId, IsNotEmpty, IsOptional } from 'class-validator';
import { PostReactionEnum } from 'src/common/enum/post.reactions.enum';

export class ReactionDto {
  @IsNotEmpty()
  @IsEnum(PostReactionEnum)
  reactions: string;
}

export class ReactToCommentOrReplyDto extends ReactionDto {
  @IsOptional()
  @IsMongoId()
  replyId: string;
  @IsOptional()
  @IsMongoId()
  commentId: string;
}
