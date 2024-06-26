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
import { TermiiSendSMS } from 'src/common/constant/termii/sms.termii';

@Injectable()
export class OtpService {
  constructor(
    @InjectModel(Otp.name) private otpModel: Model<OtpDocument>,
    private mailService: MailService,
  ) {}

  async createOtp(payload: CreateOtpDto) {
    const { phoneNumber, type } = payload;

    const otpExist = await this.otpModel.findOne({
      phoneNumber,
      type,
    });

    if (!otpExist) {
      return await this.otpModel.create({ ...payload });
    }

    return await this.otpModel.findByIdAndUpdate(
      {
        _id: otpExist._id,
      },
      { ...payload },
      {
        new: true,
        upsert: true,
      },
    );
  }

  async sendOtp(payload: SendOtpDto): Promise<any> {
    const { email, phoneNumber, type } = payload;

    const code = await generateOtpCode.generateString();

    let template;
    let subject;

    const { AccountVerificationTemplate, ResetPasswordTemplate } =
      ConstantMessage;
    if (type === OtpType.PHONE_NUMBER_VERIFICATION) {
      template = await AccountVerificationTemplate(code);
      subject = ConstantMessage.subject;
    } else if (type === OtpType.RESET_PASSWORD) {
      template = await ResetPasswordTemplate(code);
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
      try {
        //await TermiiSendSMS();
        //await TwilioSms(phoneNumber, template);
      } catch (error) {
        throw error;
      }
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
