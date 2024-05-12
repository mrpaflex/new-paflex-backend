import {
  BadRequestException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { LiveStream, LiveStreamDocument } from '../schemas/live-stream.schema';
import { Model } from 'mongoose';
import { StartLiveDto, StopLiveDto } from '../dto/live-stream.dto';

@Injectable()
export class LiveStreamService {
  constructor(
    @InjectModel(LiveStream.name)
    private readonly liveModel: Model<LiveStreamDocument>,
  ) {}
  async startLive(payload: StartLiveDto, userId: string) {
    try {
      const live = await this.liveModel.create({
        ...payload,
        creatorId: userId,
        isLiveActive: true,
      });

      return live;
    } catch (error) {
      throw error;
    }
  }

  async stopLive(id: string, userId: string) {
    try {
      const live = await this.getById(id);
      if (live.creatorId.toString() !== userId.toString()) {
        throw new UnauthorizedException(`Can't proceed`);
      }
      if (!live.isLiveActive) {
        throw new BadRequestException('Error');
      }
      const updatedInfo = await this.liveModel.findByIdAndUpdate(
        id,
        {
          isLiveActive: false,
          liveStopTime: Date.now(),
        },
        {
          new: true,
        },
      );

      const liveStartTime = live.liveStartTime.getTime();
      const liveStopTime = updatedInfo.liveStopTime.getTime();
      const liveDuration = liveStopTime - liveStartTime;
      const duration = liveDuration / (1000 * 60);
      live.streamDuration = `${duration} m`;
      await live.save();

      return true;
    } catch (error) {
      throw error;
    }
  }

  async getById(id: string) {
    const live = await this.liveModel.findById(id);
    if (!live) {
      throw new NotFoundException('Live Not Found');
    }
    return live;
  }

  async liveGifters(userId: string, liveId: string, amount: number) {
    await this.liveModel.findOneAndUpdate(
      { _id: liveId },
      {
        $push: {
          gifts: {
            amount: amount,
            giftedBy: userId,
          },
        },
      },
      { new: true },
    );
    return true;
  }
}
