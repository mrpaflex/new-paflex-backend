import {
  Body,
  ClassSerializerInterceptor,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { UserService } from './user.service';
import { User, UserDocument } from './schemas/user.schema';
import { CreateUserDto, UpdateUserDto, UserDto } from './dto/user.dto';
import { CurrentUser } from 'src/auth/decorators/loggedIn-user.decorator';
import { FileInterceptor, FilesInterceptor } from '@nestjs/platform-express';
import { AuthGuard } from '@nestjs/passport';
import { multerOptions } from 'src/common/utils/cloudinary/multer';
import { Express } from 'express';
import {
  CustomClassInterceptor,
  Serialize,
} from 'src/common/interceptor/serialize.interceptor';

@Controller('user')
export class UserController {
  constructor(private userService: UserService) {}

  @Post('create/:referralId?')
  async createAccountWithPhoneNumber(
    @Param('referralId') referralId: string,
    @Body() payload: CreateUserDto,
  ) {
    return await this.userService.createAccountWithPhoneNumber(
      payload,
      referralId,
    );
  }

  @Get()
  @Serialize(UserDto)
  async getAll(): Promise<UserDocument[]> {
    return await this.userService.getAll();
  }

  @Get('find-one/:id')
  @Serialize(UserDto)
  @UseInterceptors(new CustomClassInterceptor(UserDto))
  async findOne(@Param('id') id: string): Promise<UserDocument> {
    return await this.userService.getById(id);
  }

  @UseGuards(AuthGuard('jwt'))
  @Patch()
  async Profile(@CurrentUser() user: any, @Body() payload: UpdateUserDto) {
    return await this.userService.updateProfile(user, payload);
  }

  @UseGuards(AuthGuard('jwt'))
  @UseInterceptors(FileInterceptor('file', multerOptions))
  @Patch('profile-photo')
  async ProfilePhoto(
    @CurrentUser() user: any,
    @UploadedFile() files: Express.Multer.File,
  ) {
    return await this.userService.ProfilePhoto(user, files);
  }

  @UseGuards(AuthGuard('jwt'))
  @Delete('account')
  async deleteAccount(@CurrentUser() user: UserDocument) {
    return await this.userService.deleteAccount(user);
  }

  @UseGuards(AuthGuard('jwt'))
  @Delete('profile-photo')
  async profilePhoto(@CurrentUser() user: UserDocument) {
    return await this.userService.removeProfilePhoto(user);
  }

  @UseGuards(AuthGuard('jwt'))
  @Patch('follow/:id')
  async followAndUnFollowed(
    @Param('id') id: string,
    @CurrentUser() user: UserDocument,
  ) {
    return await this.userService.followAndUnFollow(id, user);
  }
}
