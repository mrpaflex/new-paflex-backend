import { Prop, Schema } from '@nestjs/mongoose';

@Schema()
export class CardDetail {
  @Prop({ type: String, required: true })
  nameOnCard: string;

  @Prop({ type: String, required: true })
  number: string;
}
