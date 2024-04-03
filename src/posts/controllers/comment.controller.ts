import {
  Body,
  Controller,
  Delete,
  Patch,
  Post,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { CommentService } from '../services/comment.service';
import { AuthGuard } from '@nestjs/passport';
import { CurrentUser } from 'src/auth/decorators/loggedIn-user.decorator';
import { UserDocument } from 'src/user/schemas/user.schema';
import {} from '../dto/posts.dto';
import { FileInterceptor } from '@nestjs/platform-express';
import { ReactToCommentOrReplyDto } from '../dto/reaction.dto';
import {
  CommentDto,
  DeleteCommentOrReplyDTO,
  ReplyDto,
  UpdateCommentOrReplyDto,
} from '../dto/comment.dto';
import { multerOptions } from 'src/common/utils/cloudinary/multer';

@Controller('comment')
export class CommentController {
  constructor(private readonly commentService: CommentService) {}

  @UseGuards(AuthGuard('jwt'))
  @UseInterceptors(FileInterceptor('file', multerOptions))
  @Post()
  async create(
    @Body() payload: CommentDto,
    @CurrentUser() user: UserDocument,
    @UploadedFile() file: Express.Multer.File,
  ) {
    return await this.commentService.addComment(payload, user, file);
  }

  @UseGuards(AuthGuard('jwt'))
  @UseInterceptors(FileInterceptor('file', multerOptions))
  @Post('reply')
  async Reply(
    @Body() payload: ReplyDto,
    @CurrentUser() user: UserDocument,
    @UploadedFile() file: Express.Multer.File,
  ) {
    return await this.commentService.addReply(payload, user, file);
  }

  @UseGuards(AuthGuard('jwt'))
  @UseInterceptors(FileInterceptor('file', multerOptions))
  @Patch()
  async update(
    @Body() payload: UpdateCommentOrReplyDto,
    @CurrentUser() user: UserDocument,
    @UploadedFile() file: Express.Multer.File,
  ) {
    return await this.commentService.updateCommentOrReply(payload, user, file);
  }

  @UseGuards(AuthGuard('jwt'))
  @Patch('reaction')
  async React(
    @Body() payload: ReactToCommentOrReplyDto,
    @CurrentUser() user: UserDocument,
  ) {
    return await this.commentService.reactToCommentOrReply(payload, user);
  }

  @UseGuards(AuthGuard('jwt'))
  @Delete()
  async deleteCommentOrReply(
    @CurrentUser() user: UserDocument,
    @Body() payload: DeleteCommentOrReplyDTO,
  ) {
    return await this.commentService.removeCommentOrReply(user, payload);
  }
}
