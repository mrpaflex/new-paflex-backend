import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { Document } from 'mongoose';
import { Interested, UserType } from 'src/common/constant/enum/enum';
import { Photo } from './sub-user.schema';

export type UserDocument = User & Document;
@Schema({ timestamps: true })
export class User {
  @Prop({ type: String })
  email?: string;

  @Prop({ type: String })
  username?: string;

  @Prop({ type: String })
  firstName?: string;

  @Prop({ type: String })
  lastName?: string;

  @Prop({ type: [Photo], default: [] })
  profilePhoto?: Photo[];

  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'User' })
  referredBy?: mongoose.Types.ObjectId;

  @Prop({ type: Number, default: 0 })
  balance: number;

  @Prop({ type: Boolean, default: false })
  suspended: boolean;

  @Prop({ type: String, default: '19XX-month-day' })
  dob?: string;

  @Prop({ type: String })
  phoneNumber?: string;

  @Prop({ type: String, enum: UserType, default: UserType.NORMAL_USER })
  userType: string;

  @Prop({ type: [mongoose.Schema.Types.ObjectId], ref: 'User', default: [] })
  followers?: User[];

  @Prop({ type: Number, default: 0 })
  numberOfFollowers?: number;

  @Prop({ type: String, enum: Interested })
  interestedIn?: string;

  @Prop({ type: String })
  password?: string;

  @Prop({ type: String })
  description?: string;

  @Prop({ type: String })
  refreshToken?: string;

  @Prop({ type: Boolean, default: false })
  isAccountVerified: boolean;
}

export const UserSchema = SchemaFactory.createForClass(User);
