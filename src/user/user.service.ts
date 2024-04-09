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
  LoginUserDto,
  PasswordDto,
  UpdateUserDto,
  VerifyPhoneNumberDto,
} from './dto/user.dto';
import { JwtService } from '@nestjs/jwt';
import { PostsService } from 'src/posts/services/posts.service';
import { OtpService } from 'src/otp/otp.service';
import { generateOtpCode } from 'src/common/constant/generateCode/random.code';
import { Twilio } from 'twilio';
import { ENVIRONMENT } from 'src/common/constant/environmentVariables/environment.var';
import {
  comparedHashedPassword,
  hashPassword,
} from 'src/common/utils/hashed/password.bcrypt';
import {
  deletePostFile,
  uploadFiles,
} from 'src/common/utils/aws-bucket/file-aws-bucket';

@Injectable()
export class UserService {
  constructor(
    @InjectModel(User.name) private userModel: Model<UserDocument>,
    private jwt: JwtService,
    private postService: PostsService,
    private otpService: OtpService,
  ) {}

  async create(req: any, referralId: string): Promise<UserDocument> {
    if (referralId) {
      const referredUser = await this.getById(referralId);

      if (!referredUser) {
        return;
      }
      await this.addReferralBonus(referralId);
    }
    const { email, firstName, lastName, refreshToken, picture } = req.user;

    const createdUser = await this.userModel.create({
      email,
      firstName,
      lastName,
      refreshToken,
      referredBy: referralId,
      isAccountVerified: true,
      profilePicture: picture,
    });
    return createdUser;
  }

  async createAccountWithPhoneNumber(
    payload: CreateUserDto,
    referralId?: string | undefined,
  ) {
    const client = new Twilio(
      ENVIRONMENT.TWILLO.account_id,
      ENVIRONMENT.TWILLO.authToken,
    );
    const { phoneNumber } = payload;

    const userExist = await this.userModel.findOne({ phoneNumber });

    if (userExist) {
      throw new BadRequestException('Account already exist');
    }

    if (referralId) {
      await this.getById(referralId);
    }

    await this.userModel.create({
      phoneNumber,
      referredBy: referralId,
    });

    const code = generateOtpCode;

    await this.otpService.sendOtp('', phoneNumber);

    const msg = await client.messages.create({
      body: `your verification code is ${code}`,
      from: ENVIRONMENT.TWILLO.FROM,
      to: `${phoneNumber}`,
    });

    if (!msg) {
      throw new InternalServerErrorException('Can not proceed');
    }

    return `verify your account`;
  }

  async loginWithPhoneNumber(payload: LoginUserDto) {
    const { phoneNumber, password } = payload;
    const user = await this.userModel.findOne({ phoneNumber });
    if (!user) {
      throw new NotFoundException(`Account doesn't exist`);
    }

    if ((await comparedHashedPassword(password, user.password)) === false) {
      throw new UnauthorizedException('Password does not match');
    }

    if (!user.isAccountVerified) {
      throw new BadRequestException(`You haven't verify your phone number`);
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
    await this.otpService.verifyOtp(code, '', phoneNumber);

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
}
