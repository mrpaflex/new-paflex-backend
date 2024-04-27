import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { User, UserDocument } from './schemas/user.schema';
import { Model } from 'mongoose';
import {
  CreateUserDto,
  IncreaseBalanceDto,
  LoginUserDto,
  PasswordDto,
  UpdateUserDto,
  VerifyPhoneNumberDto,
} from './dto/user.dto';
import { JwtService } from '@nestjs/jwt';
import { PostsService } from 'src/posts/services/posts.service';
import { OtpService } from 'src/otp/otp.service';
//import { Twilio } from 'twilio';
import { ENVIRONMENT } from 'src/common/constant/environmentVariables/environment.var';
import { OtpType } from '../otp/enum/otp.enum';
import {
  comparedHashedPassword,
  hashPassword,
} from 'src/common/utils/hashed/password.bcrypt';
import {
  deletePostFile,
  uploadFiles,
} from 'src/common/utils/aws-bucket/file-aws-bucket';
import { GoogleCreateUserDto } from 'src/auth/dto/auth.dto';

@Injectable()
export class UserService {
  constructor(
    @InjectModel(User.name) private userModel: Model<UserDocument>,
    private jwt: JwtService,
    private postService: PostsService,
    private otpService: OtpService,
  ) {}

  async create(
    payloadInput: GoogleCreateUserDto,
    referralId: string,
  ): Promise<UserDocument> {
    if (referralId) {
      const referredUser = await this.getById(referralId);

      if (!referredUser) {
        return;
      }
      await this.addReferralBonus(referralId);
    }
    const { email, firstName, lastName, refreshToken, picture } = payloadInput;

    const createdUser = await this.userModel.create({
      email,
      firstName,
      lastName,
      refreshToken,
      referredBy: referralId,
      isAccountVerified: true,
      profilePicture: picture,
      isGoogleAuth: true,
    });
    return createdUser;
  }

  async createAccountWithPhoneNumber(
    payload: CreateUserDto,
    referralId?: string | undefined,
  ) {
    const { phoneNumber } = payload;

    const userExist = await this.userModel.findOne({ phoneNumber });

    if (userExist) {
      if (userExist.isAccountVerified === false) {
        return await this.otpService.sendOtp({
          email: userExist.email, //null
          phoneNumber: userExist.phoneNumber,
          type: OtpType.PHONE_NUMBER_VERIFICATION,
        });
      } else if (userExist.isAccountVerified) {
        return 'You Account is Verified';
      }
    }

    if (referralId) {
      await this.getById(referralId);
    }

    const createdUser = await this.userModel.create({
      phoneNumber,
      referredBy: referralId,
    });

    await this.otpService.sendOtp({
      email: createdUser.email, //null
      phoneNumber: phoneNumber,
      type: OtpType.PHONE_NUMBER_VERIFICATION,
    });

    return `verify your account`;
  }

  async loginWithPhoneNumber(payload: LoginUserDto) {
    const { phoneNumber, password } = payload;
    const user = await this.userModel.findOne({ phoneNumber });
    if (!user) {
      throw new NotFoundException(`Account doesn't exist`);
    }

    if (!user.isAccountVerified) {
      throw new BadRequestException(`You haven't verify your phone number`);
    }

    if ((await comparedHashedPassword(password, user.password)) === false) {
      throw new UnauthorizedException('Password does not match');
    }

    const jwtPayload = {
      id: user._id,
      firstName: user.firstName,
      username: user.username,
    };

    const token = this.jwt.sign(jwtPayload);
    return token;
  }

  async getByEmail(email: string): Promise<UserDocument> {
    const user = await this.userModel.findOne({ email });
    if (!user) {
      return;
    }
    return user;
  }

  async getByPhoneNumber(phoneNumber: string): Promise<UserDocument> {
    const user = await this.userModel.findOne({ phoneNumber });
    if (!user) {
      return;
    }
    return user;
  }

  async getById(id: string): Promise<UserDocument> {
    const user = await this.userModel.findById(id);
    if (!user) {
      throw new NotFoundException('user not found');
    }
    return user;
  }

  async getAll(): Promise<UserDocument[]> {
    return await this.userModel.find();
  }

  async updateProfile(user: UserDocument, payload: UpdateUserDto) {
    return await this.userModel.findOneAndUpdate(
      { _id: user._id },
      { ...payload },
      { new: true },
    );
  }

  async updateUserProfileByPhoneNumber(phoneNumber: string, payload: any) {
    return await this.userModel.updateOne({ phoneNumber }, payload);
  }

  async ProfilePhoto(user: UserDocument, file: Express.Multer.File) {
    let profilePhoto = [];
    const userId = user._id.toString();
    if (!file) {
      throw new BadRequestException('you can not upload empty profile');
    }

    if (user.profilePhoto && user.profilePhoto.length > 0) {
      await deletePostFile(user.profilePhoto);
    }

    const result = await uploadFiles(file);

    profilePhoto.push({
      location: result.Location,
      key: result.Key,
    });

    await this.userModel.findByIdAndUpdate(
      userId,
      {
        profilePhoto: profilePhoto,
      },
      { new: true },
    );
    return `profile picture uploaded successfully`;
  }

  async delete(user: UserDocument) {
    const userId = user._id.toString();

    const posts = await this.postService.MyPosts(user);

    const postIds = posts.map((post) => post._id);

    if (postIds.length > 0) {
      await this.postService.deleteMyPosts(postIds, user);
    }

    if (user.profilePhoto && user.profilePhoto.length > 0) {
      await deletePostFile(user.profilePhoto);
    }

    await this.userModel.findByIdAndDelete(userId, { new: true });

    return `Account deleted successfully`;
  }

  async removeProfilePhoto(user: UserDocument) {
    const userId = user._id.toString();

    const profilePhoto = user.profilePhoto;

    if (!profilePhoto || profilePhoto.length === 0) {
      return;
    }

    await deletePostFile(profilePhoto);

    await this.userModel.findByIdAndUpdate(
      userId,
      {
        profilePhoto: [],
      },
      { new: true },
    );

    return 'profile picture removed';
  }

  async followAndUnFollow(id: string, user: UserDocument) {
    const userId = user._id.toString();

    const userExist = await this.userModel.findById(id);
    if (!userExist) {
      throw new NotFoundException('user you want to follow not found');
    }

    if (id === userId) {
      throw new BadRequestException('you can not follow yourself');
    }

    const alreadyFollowed = userExist.followers.includes(userId);

    if (alreadyFollowed) {
      await this.userModel.findByIdAndUpdate(id, {
        $inc: { numberOfFollowers: -1 },
        $pull: { followers: userId },
      });
    } else {
      await this.userModel.findByIdAndUpdate(id, {
        $inc: { numberOfFollowers: 1 },
        $push: { followers: userId },
      });
    }
    return true;
  }

  async verifyPhoneNumber(payload: VerifyPhoneNumberDto) {
    const { phoneNumber, code } = payload;
    const userExist = await this.getByPhoneNumber(phoneNumber);
    await this.otpService.verifyOtp({
      email: null,
      phoneNumber: phoneNumber,
      code: code,
      type: OtpType.PHONE_NUMBER_VERIFICATION,
    });

    if (userExist.isAccountVerified) {
      throw new BadRequestException('Your account is already verified');
    }
    userExist.isAccountVerified = true;

    await userExist.save();

    if (userExist.referredBy) {
      await this.addReferralBonus(userExist.referredBy.toString());
    }

    return 'your account is now verified';
  }

  async addReferralBonus(referralId: string) {
    const referUser = await this.getById(referralId);
    const oldBalance = referUser.balance;
    const ReferralPoint = ENVIRONMENT.REFERRAL.ReferralPoint;
    const NewBalance = oldBalance + ReferralPoint;

    await this.userModel.findByIdAndUpdate(
      referralId,
      { balance: NewBalance },
      { new: true },
    );
  }

  async setPassword(payload: PasswordDto) {
    const { phoneNumber } = payload;
    const user = await this.getByPhoneNumber(phoneNumber);

    if (!user) {
      throw new NotFoundException('No user found');
    }

    if (!user.isAccountVerified) {
      throw new BadRequestException('Can not proceed');
    }

    const password = await hashPassword(payload.password);

    user.password = password;

    await user.save();

    const result = await user.save();

    delete result['_doc'].password;

    return result;
  }

  async findUserByPhoneNumberOrEmail(email: string, phoneNumber: string) {
    const user = await this.userModel.findOne({
      $or: [{ email: email }, { phoneNumber: phoneNumber }],
    });
    if (!user) {
      throw new NotFoundException('user not found');
    }

    return user;
  }

  async increaseBalance(payload: IncreaseBalanceDto) {
    const { userId, amount } = payload;
    const newBalance = await this.userModel.findOneAndUpdate(
      { _id: userId },
      { $inc: { balance: amount } },
      { new: true },
    );

    if (!newBalance) {
      throw new InternalServerErrorException('Server Error while sending gift');
    }
    return newBalance;
  }
}
