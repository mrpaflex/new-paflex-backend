import {
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Otp, OtpDocument } from './schemas/otp.schema';
import { Model } from 'mongoose';
import { CreateOtpDto } from './dto/otp.dto';
import { generateOtpCode } from 'src/common/constant/generateCode/random.code';
import { MailService } from 'src/mail/mail.service';
import { ConstantMessage } from 'src/common/constant/message/msg.response';

@Injectable()
export class OtpService {
  constructor(
    @InjectModel(Otp.name) private otpModel: Model<OtpDocument>,
    private mailService: MailService,
  ) {}

  async createOtp(payload: CreateOtpDto) {
    const { email } = payload;

    const otp = await this.otpModel.findOneAndUpdate(
      { email: email },
      { ...payload },
      { new: true, upsert: true },
    );
    return otp;
  }

  async sendOtp(email?: string, phoneNumber?: string): Promise<any> {
    await this.otpModel.findOne({ email, phoneNumber });

    const code = generateOtpCode;
    let template = await ConstantMessage.template(code);
    let subject = ConstantMessage.subject;

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
