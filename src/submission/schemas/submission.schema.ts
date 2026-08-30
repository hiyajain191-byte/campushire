import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type SubmissionDocument = HydratedDocument<Submission>;

@Schema()
export class Submission {
  @Prop({ required: true })
  name!: string;

  @Prop({ required: true })
  email!: string;

  @Prop({ required: true })
  age!: number;

  @Prop({ required: true })
  filename!: string;

  @Prop({ required: true })
  fileUrl!: string;

  @Prop({ required: true })
  extractedText!: string;
}

export const SubmissionSchema =
  SchemaFactory.createForClass(Submission);