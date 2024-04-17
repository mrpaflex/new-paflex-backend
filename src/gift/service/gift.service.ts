import { InjectModel } from '@nestjs/mongoose';
import { Gift, GiftDocument } from '../schemas/gift.schema';
import { Model } from 'mongoose';
import { BadRequestException, Injectable } from '@nestjs/common';
import { GiftPostDto } from '../dto/gift.dto';
import { PostsService } from 'src/posts/services/posts.service';
import { UserDocument } from 'src/user/schemas/user.schema';
import { UserService } from 'src/user/user.service';
import { ENVIRONMENT } from 'src/common/constant/environmentVariables/environment.var';

@Injectable()
export class GiftService {
  constructor(
    @InjectModel(Gift.name)
    private giftModel: Model<GiftDocument>,
    private postService: PostsService,
    private userService: UserService,
  ) {}

  async giftForPost(payload: GiftPostDto, user: UserDocument) {
    const { postId, amount, liveId, userReceiverId } = payload;

    if (!liveId && !amount && !postId && !userReceiverId) {
      throw new BadRequestException('Can not proceed');
    }

    let gift;
    let receiverId;

    if (userReceiverId) {
      await this.userService.getById(userReceiverId);

      receiverId = userReceiverId;

      gift = await this.giftModel.create({
        ...payload,
        senderId: user._id,
        receiverId: receiverId,
      });
    }

    if (postId) {
      const post = await this.postService.getById(postId);

      receiverId = post.creatorId.toString();

      gift = await this.giftModel.create({
        ...payload,
        senderId: user._id,
        receiverId: receiverId,
      });
    }

    if (liveId) {
      //not done this yet
      return;
    }

    const myBalance = user.balance;

    if (myBalance < 0 || myBalance < amount) {
      throw new BadRequestException('Insufficient fund');
    }

    const newBalance = myBalance - amount;

    const percentage = +ENVIRONMENT.PERCENTAGE.PERCENTAGE;

    const deductAmount = amount * percentage;

    const sendAmount = amount - deductAmount;

    await this.userService.increaseBalance({
      userId: receiverId,
      amount: sendAmount,
    });

    user.balance = newBalance;
    await user.save();

    await this.giftModel.findOneAndUpdate(
      { _id: gift._id },
      { deliver: true, transactionStatus: 'Successful' },
      { new: true },
    );

    return `Gift Sent Successfully`;
  }
}
