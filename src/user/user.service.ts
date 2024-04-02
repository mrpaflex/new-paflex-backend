import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { User, UserDocument } from './schemas/user.schema';
import { Model } from 'mongoose';
import {
  CreateUserDto,
  LoginUserDto,
  UpdateUserDto,
  VerifyPhoneNumberDto,
} from './dto/user.dto';
import { JwtService } from '@nestjs/jwt';
import { PostsService } from 'src/posts/services/posts.service';
import { OtpService } from 'src/otp/otp.service';
import { generateOtpCode } from 'src/common/constant/generateCode/random.code';
import { Twilio } from 'twilio';
import { ENVIRONMENT } from 'src/common/constant/environmentVariables/environment.var';
import { cloudinary } from 'src/common/utils/cloudinary/cloudinary';

@Injectable()
export class UserService {
  constructor(
    @InjectModel(User.name) private userModel: Model<UserDocument>,
    private jwt: JwtService,
    private postService: PostsService,
    private otpService: OtpService,
  ) {}

  async create(req: any, referralId: string) {
    if (referralId) {
      const referredUser = await this.getById(referralId);
      if (!referredUser) {
        return true;
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
      throw new BadRequestException('user already exist');
    }

    if (referralId) {
      await this.getById(referralId);
    }

    const user = await this.userModel.create({
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

    return user;
  }

  async loginWithPhoneNumber(payload: LoginUserDto) {
    const { phoneNumber } = payload;
    const user = await this.userModel.findOne({ phoneNumber });
    if (!user) {
      throw new NotFoundException(`Account doesn't exist`);
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

  async Profile(user: UserDocument, payload: UpdateUserDto) {
    const userId = user._id.toString();
    return await this.userModel.findByIdAndUpdate(
      userId,
      { ...payload },
      { new: true, runValidators: true },
    );
  }

  async ProfilePhoto(user: UserDocument, file: Express.Multer.File) {
    const userId = user._id.toString();
    if (!file) {
      throw new BadRequestException('you can not upload empty profile');
    }

    const result = await cloudinary.uploader.upload(file.path);

    await this.userModel.findByIdAndUpdate(
      userId,
      {
        profilePicture: result.secure_url,
        cloudinary_id: result.public_id,
      },
      { new: true },
    );
    return `profile picture uploaded successfully`;
  }

  async delete(user: UserDocument) {
    const userId = user._id.toString();

    const posts = await this.postService.MyPosts(user);

    const postIds = posts.map((post) => post._id);

    const profilePict = user.profilePicture;

    if (postIds.length > 0) {
      await this.postService.deleteMyPosts(postIds, user);
    }

    await cloudinary.uploader.destroy(user.cloudinary_id);

    await this.userModel.findByIdAndDelete(userId, { new: true });

    return `Account deleted successfully`;
  }

  async removeProfilePhoto(user: UserDocument) {
    const userId = user._id.toString();

    const image = user.profilePicture;
    if (!image) {
      return;
    }

    const cloudId = user.cloudinary_id;

    if (cloudId) {
      try {
        await cloudinary.uploader.destroy(cloudId);
      } catch (error) {
        throw new InternalServerErrorException(
          'error while removing profile picture',
        );
      }
    }

    await this.userModel.findByIdAndUpdate(
      userId,
      {
        profilePicture: null,
        cloudinary_id: null,
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
    await this.addReferralBonus(userExist.referredBy.toString());
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
}
