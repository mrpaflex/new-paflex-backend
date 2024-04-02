import {
  Body,
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
import { UserDocument } from './schemas/user.schema';
import {
  CreateUserDto,
  LoginUserDto,
  PasswordDto,
  UpdateUserDto,
  VerifyPhoneNumberDto,
} from './dto/user.dto';
import { CurrentUser } from 'src/auth/decorators/loggedIn-user.decorator';
import { FileInterceptor, FilesInterceptor } from '@nestjs/platform-express';
import { AuthGuard } from '@nestjs/passport';
import { multerOptions } from 'src/common/utils/cloudinary/multer';

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

  @Post('login')
  async login(@Body() payload: LoginUserDto) {
    return await this.userService.loginWithPhoneNumber(payload);
  }

  @Post('set-password')
  async setPassword(@Body() payload: PasswordDto) {
    return await this.userService.setPassword(payload);
  }

  @Post('verify-number')
  async verifyPhoneNumber(@Body() payload: VerifyPhoneNumberDto) {
    return await this.userService.verifyPhoneNumber(payload);
  }
  @Get()
  async getAll(): Promise<UserDocument[]> {
    return await this.userService.getAll();
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
  async delete(@CurrentUser() user: any) {
    return await this.userService.delete(user);
  }

  @UseGuards(AuthGuard('jwt'))
  @Delete('profile-photo')
  async profilePhoto(@CurrentUser() user: any) {
    return await this.userService.removeProfilePhoto(user);
  }

  @UseGuards(AuthGuard('jwt'))
  @Patch('follow/:id')
  async followAndUnFollowed(@Param('id') id: string, @CurrentUser() user: any) {
    return await this.userService.followAndUnFollow(id, user);
  }
}
