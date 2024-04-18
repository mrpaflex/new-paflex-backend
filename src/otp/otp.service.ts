import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Otp, OtpDocument } from './schemas/otp.schema';
import { Model } from 'mongoose';
import {
  CreateOtpDto,
  SendOtpDto,
  ValidateOtpDto,
  VerifyOtpDto,
} from './dto/otp.dto';
import { generateOtpCode } from 'src/common/constant/generateCode/random.code';
import { MailService } from 'src/mail/mail.service';
import { ConstantMessage } from 'src/common/constant/message/msg.response';
import { OtpType } from './enum/otp.enum';
import { TwilioSms } from 'src/common/constant/twillio/twillio.sms';

@Injectable()
export class OtpService {
  constructor(
    @InjectModel(Otp.name) private otpModel: Model<OtpDocument>,
    private mailService: MailService,
  ) {}

  async createOtp(payload: CreateOtpDto) {
    const { email, phoneNumber } = payload;

    const otpExist = await this.otpModel.findOne({
      $or: [{ email: email }, { phoneNumber: phoneNumber }],
    });

    if (otpExist) {
      throw new BadRequestException('Please try again');
    }

    return await this.otpModel.create({ ...payload });
  }

  async sendOtp(payload: SendOtpDto): Promise<any> {
    const { email, phoneNumber, type } = payload;

    const code = generateOtpCode;

    let template;
    let subject;

    if (type === OtpType.PHONE_NUMBER_VERIFICATION) {
      template = await ConstantMessage.AccountVerificationTemplate(code);
      subject = ConstantMessage.subject;
    }
    if (type === OtpType.RESET_PASSWORD) {
      template = await ConstantMessage.ResetPasswordTemplate(code);
      subject = ConstantMessage.subject;
    }

    const otp = await this.createOtp({
      email,
      code,
      phoneNumber,
      type,
    });

    if (!otp) {
      throw new InternalServerErrorException('error while generating otp');
    }

    if (email) {
      await this.mailService.sendEmail(email, subject, template);
    }

    if (phoneNumber) {
      await TwilioSms(phoneNumber, template);
    }
    return 'otp sent';
  }

  async validateOtp(payload: ValidateOtpDto) {
    const { email, phoneNumber, type, code } = payload;

    const otpExist = await this.otpModel.findOne({
      code,
      email,
      phoneNumber,
      type,
    });

    if (!otpExist) {
      throw new NotFoundException('you code has either expired or not active');
    }
    return otpExist;
  }

  async verifyOtp(payload: VerifyOtpDto) {
    const { email, phoneNumber, type, code } = payload;

    const otp = await this.validateOtp({ code, email, phoneNumber, type });

    await this.deleteOTP(otp._id);
    return true;
  }

  async deleteOTP(id: string) {
    return this.otpModel.findByIdAndDelete(id);
  }
}
