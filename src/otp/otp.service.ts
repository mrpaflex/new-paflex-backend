import {
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Otp, OtpDocument } from './schemas/otp.schema';
import { Model } from 'mongoose';
import { CreateOtpDto, SendOtpDto } from './dto/otp.dto';
import { generateOtpCode } from 'src/common/constant/generateCode/random.code';
import { MailService } from 'src/mail/mail.service';
import { ConstantMessage } from 'src/common/constant/message/msg.response';
import { OtpType } from './enum/otp.enum';
import { TwilioSms } from 'src/common/constant/twillio.sms';

@Injectable()
export class OtpService {
  constructor(
    @InjectModel(Otp.name) private otpModel: Model<OtpDocument>,
    private mailService: MailService,
  ) {}

  async createOtp(payload: CreateOtpDto) {
    const { email, phoneNumber } = payload;

    const otp = await this.otpModel.findOneAndUpdate(
      { $or: [{ email: email }, { phoneNumber: phoneNumber }] },
      { ...payload },
      { new: true, upsert: true },
    );

    return otp;
  }

  async sendOtp(payload: SendOtpDto): Promise<any> {
    const { email, phoneNumber, type } = payload;
    await this.otpModel.findOne({ email, phoneNumber });

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

  async validateOtp(code: string, email?: string, phoneNumber?: string) {
    const otpExist = await this.otpModel.findOne({ code, email, phoneNumber });

    if (!otpExist) {
      throw new NotFoundException('you code has either expired or not active');
    }
    return otpExist;
  }

  async verifyOtp(code: string, email?: string, phoneNumber?: string) {
    const otp = await this.validateOtp(code, email, phoneNumber);

    await this.deleteOTP(otp._id);
    return true;
  }

  async deleteOTP(id: string) {
    return this.otpModel.findByIdAndDelete(id);
  }
}
