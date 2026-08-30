import {
  Prop,
  Schema,
  SchemaFactory,
} from '@nestjs/mongoose';

import {
  HydratedDocument,
} from 'mongoose';

export type ApplicationDocument =
  HydratedDocument<Application>;

@Schema({ timestamps: true })
export class Application {
  @Prop({ required: true })
  jobId!: string;

  @Prop({ required: true })
  jobTitle!: string;

  @Prop({ required: true })
  company!: string;

  @Prop({ required: true })
  name!: string;

  @Prop({ required: true })
  email!: string;

  @Prop()
  phone?: string;

  @Prop()
  resumeUrl?: string;

  @Prop()
  coverMessage?: string;

  // Recruiter who owns this job
  @Prop()
  recruiterId?: string;

  @Prop({ default: 'Applied' })
  status!: string;
}

export const ApplicationSchema =
  SchemaFactory.createForClass(Application);