import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type JobDocument = HydratedDocument<Job>;

@Schema({ timestamps: true })
export class Job {
  @Prop({ required: true, unique: true })
  externalJobId!: number;

  @Prop({ required: true })
  title!: string;

  @Prop({ required: true })
  company!: string;

  @Prop()
  location!: string;

  @Prop()
  city!: string;

  @Prop()
  roleCategory!: string;

  @Prop({
    type: {
      minYears: Number,
      maxYears: Number,
    },
  })
  experience!: {
    minYears: number;
    maxYears: number;
  };

  @Prop({
    type: {
      minLpa: Number,
      maxLpa: Number,
    },
  })
  salary!: {
    minLpa: number;
    maxLpa: number;
  };

  @Prop({ type: [String], default: [] })
  skills!: string[];

  @Prop()
  description!: string;

  @Prop()
  postedDate!: string;

  @Prop()
  workMode!: string;

  @Prop()
  jobUrl!: string;

  @Prop()
  isFresherFriendly!: boolean;
}

export const JobSchema = SchemaFactory.createForClass(Job);