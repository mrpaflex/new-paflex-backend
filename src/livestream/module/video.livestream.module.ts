import { Module } from '@nestjs/common';
import { LiveStreamController } from '../controller/live-stream.controller';
import { LiveStreamService } from '../service/live-stream.service';
import { MongooseModule } from '@nestjs/mongoose';
import { LiveStream, LiveStreamSchema } from '../schemas/live-stream.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: LiveStream.name, schema: LiveStreamSchema },
    ]),
  ],
  controllers: [LiveStreamController],
  providers: [LiveStreamService],
  exports: [LiveStreamService],
})
export class LiveStreamModule {}
