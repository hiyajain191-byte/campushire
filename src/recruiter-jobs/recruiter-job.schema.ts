import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type RecruiterJobDocument =
  HydratedDocument<RecruiterJob>;

@Schema({ timestamps: true })
export class RecruiterJob {
  @Prop({ required: true, trim: true })
  title: string;

  @Prop({ required: true, trim: true })
  company: string;

  @Prop({ required: true, trim: true })
  location: string;

  @Prop({ required: true })
  jobType: string;

  @Prop()
  salary?: string;

  @Prop()
  experience?: string;

  @Prop({ type: [String], default: [] })
  skills: string[];

  @Prop({ required: true })
  description: string;

  @Prop({ required: true })
  recruiterId: string;

  @Prop({ default: 'Active' })
  status: string;

  // IMPORTANT: timestamps
  createdAt?: Date;

  updatedAt?: Date;
}

export const RecruiterJobSchema =
  SchemaFactory.createForClass(RecruiterJob);