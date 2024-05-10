import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
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

  async create(id: string, messageBody: MessageDTO, senderId: string) {
    const { message } = messageBody;
    const receiver = await this.userService.getById(id);
    if (!receiver) {
      throw new BadRequestException('Can not proceed');
    }
    return await this.messageModel.create({
      senderId,
      message,
      receiverId: id,
    });
  }

  async getAll(userId: string) {
    const message = await this.messageModel
      .find({ $or: [{ senderId: userId }, { receiverId: userId }] })
      .select('message senderId receiverId');

    if (!message) {
      throw new NotFoundException('you have no message yet');
    }

    return message;
  }

  async getChatByUserId(
    receiverId: string,
    userId: string,
  ): Promise<MessageDocument[]> {
    const [userExist, ourMessages] = await Promise.all([
      this.userService.getById(receiverId),
      this.messageModel
        .find({
          $or: [
            { senderId: userId, receiverId: receiverId },
            { senderId: receiverId, receiverId: userId },
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
