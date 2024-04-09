import {
  Body,
  Controller,
  Post,
  Get,
  UploadedFiles,
  UseGuards,
  UseInterceptors,
  Patch,
  Param,
  Delete,
} from '@nestjs/common';
import { PostsService } from '../services/posts.service';
import { AuthGuard } from '@nestjs/passport';
import { FilesInterceptor } from '@nestjs/platform-express';
import { CurrentUser } from 'src/auth/decorators/loggedIn-user.decorator';
import {
  CreatePostDto,
  UpdatePostDto,
  ValidateActionDto,
} from '../dto/posts.dto';
import { PostsDocument } from '../schemas/posts.schema';
import { UserDocument } from 'src/user/schemas/user.schema';
import { ReactionDto, UpdateReactionDTO } from '../dto/reaction.dto';
import { multerOptions } from 'src/common/utils/cloudinary/multer';

@Controller('posts')
export class PostsController {
  constructor(private postService: PostsService) {}

  @UseGuards(AuthGuard('jwt'))
  @UseInterceptors(FilesInterceptor('files', 4, multerOptions))
  @Post()
  async Create(
    @Body() payload: CreatePostDto,
    @CurrentUser() user: UserDocument,
    @UploadedFiles() files: Array<Express.Multer.File>,
  ) {
    return await this.postService.create(payload, user._id, files);
  }


  @Get('findAll')
  async getAll(): Promise<PostsDocument[]> {
    return await this.postService.getAll();
  }

  @Get('videos')
  async getAllVideos(): Promise<PostsDocument[]> {
    return await this.postService.getAllVideos();
  }

  @Get(':id')
  async getById(@Param('id') id: string): Promise<PostsDocument> {
    return await this.postService.getById(id);
  }

  @UseGuards(AuthGuard('jwt'))
  @UseInterceptors(FilesInterceptor('files', 4, multerOptions))
  @Patch('update/:id')
  async update(
    @Param('id') id: string,
    @Body() payload: UpdatePostDto,
    @CurrentUser() user: UserDocument,
    @UploadedFiles() files: Array<Express.Multer.File>,
  ) {
    return await this.postService.updatePost(id, payload, user, files);
  }



  @UseGuards(AuthGuard('jwt'))
  @Patch('update-reactions')
  async updateReaction(
    @Body() payload: UpdateReactionDTO,
    @CurrentUser() user: UserDocument,
  ) {
    return await this.postService.updatePostReaction(payload, user);
  }

  @UseGuards(AuthGuard('jwt'))
  @Delete(':id')
  async DeleteById(@Param('id') id: string, @CurrentUser() user: any) {
    return await this.postService.DeleteById(id, user);
  }

  @UseGuards(AuthGuard('jwt'))
  @Get('my-posts')
  async MyPost(@CurrentUser() user: any) {
    return await this.postService.MyPosts(user);
  }

  //like post handle

  @UseGuards(AuthGuard('jwt'))
  @Patch('reaction')
  async React(@Body() payload: ReactionDto, @CurrentUser() user: UserDocument) {
    return await this.postService.reactToPost(payload, user);
  }


}
