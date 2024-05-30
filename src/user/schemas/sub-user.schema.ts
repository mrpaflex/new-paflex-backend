import { Prop, Schema } from '@nestjs/mongoose';
import { Expose } from 'class-transformer';

@Schema()
export class Photo {
  @Prop()
  @Expose()
  location: string;

  @Prop()
  @Expose()
  key: string;
}
