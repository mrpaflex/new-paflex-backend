import { InjectModel } from '@nestjs/mongoose';
import { Gift, GiftDocument } from '../schemas/gift.schema';
import { Model } from 'mongoose';
import { BadRequestException, Injectable } from '@nestjs/common';
import { GiftPostDto } from '../dto/gift.dto';
import { PostsService } from 'src/posts/services/posts.service';
import { UserDocument } from 'src/user/schemas/user.schema';
import { UserService } from 'src/user/user.service';
import { ENVIRONMENT } from 'src/common/constant/environmentVariables/environment.var';
import { LiveStreamService } from 'src/livestream/service/live-stream.service';

@Injectable()
export class GiftService {
  constructor(
    @InjectModel(Gift.name)
    private giftModel: Model<GiftDocument>,
    private postService: PostsService,
    private userService: UserService,
    private liveStreamService: LiveStreamService,
  ) {}

  async giftForPost(payload: GiftPostDto, user: UserDocument) {
    const { postId, amount, userReceiverId, liveId } = payload;

    if (!(postId || amount || userReceiverId || liveId)) {
      throw new BadRequestException('Invalid payload');
    }

    let receiverId: any;

    const myBalance = user.balance;

    if (myBalance < amount) {
      throw new BadRequestException('Insufficient funds');
    }

    if (amount === 0 || amount < 0) {
      throw new BadRequestException('Invalid Amount');
    }

    const percentage = +ENVIRONMENT.PERCENTAGE.PERCENTAGE;
    const deductAmount = amount * percentage;
    const sendAmount = amount - deductAmount;

    ///deductAmount will be sent to company account

    if (userReceiverId) {
      await this.userService.getById(userReceiverId);
      receiverId = userReceiverId;
    } else if (postId) {
      const post = await this.postService.getById(postId);
      receiverId = post.creatorId;
      await this.postService.postGifters(user._id, postId, sendAmount);
    } else if (liveId) {
      const live = await this.liveStreamService.getById(liveId);

      if (!live.isLiveActive) {
        throw new BadRequestException('Can not proceed');
      }
      receiverId = live.creatorId;
      await this.liveStreamService.liveGifters(user._id, liveId, sendAmount);
    }

    await this.userService.increaseBalance({
      userId: receiverId,
      amount: sendAmount,
    });

    user.balance -= amount;
    await user.save();

    await this.giftModel.create({
      ...payload,
      senderId: user._id,
      receiverId: receiverId,
      deliver: true,
      transactionStatus: 'Successful',
    });

    return 'Gift Sent Successfully';
  }
}
