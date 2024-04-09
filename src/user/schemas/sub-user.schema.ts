import { Prop, Schema } from '@nestjs/mongoose';

@Schema()
export class Photo {
  @Prop()
  location: string;

  @Prop()
  key: string;
}
