import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { UserDocument } from 'src/user/schemas/user.schema';
import { MessageDTO } from './dto/chat.message.dto';
import { UserService } from 'src/user/user.service';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Message, MessageDocument } from './schemas/message.schema';

@Injectable()
export class MessageService {
  constructor(
    @InjectModel(Message.name) private messageModel: Model<MessageDocument>,
    private userService: UserService,
  ) {}

  async create(id: string, messageBody: MessageDTO, user: UserDocument) {
    const senderId = user?._id;
    const { message } = messageBody;
    const receiver = await this.userService.getById(id);
    if (!receiver) {
      throw new BadRequestException('can not proceed');
    }
    return await this.messageModel.create({
      senderId,
      message,
      receiverId: id,
    });
  }

  async getAll(user: UserDocument) {
    const userId = user._id;
    const message = await this.messageModel
      .find({ $or: [{ senderId: userId }, { receiverId: userId }] })
      .select('message senderId receiverId');

    if (!message) {
      throw new NotFoundException('you have no message yet');
    }

    return message;
  }

  async getChatByUserId(
    otherUserId: string,
    user: UserDocument,
  ): Promise<MessageDocument[]> {
    const userId = user._id;
    const [userExist, ourMessages] = await Promise.all([
      this.userService.getById(otherUserId),
      this.messageModel
        .find({
          $or: [
            { senderId: userId, receiverId: otherUserId },
            { senderId: otherUserId, receiverId: userId },
          ],
        })
        .select('message senderId receiverId'),
    ]);

    if (!userExist) {
      throw new NotFoundException('user not found');
    }

    if (!ourMessages) {
      return;
    }
    return ourMessages;
  }
}
