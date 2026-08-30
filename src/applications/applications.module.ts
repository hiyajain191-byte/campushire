import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import {
  ApplicationsController,
} from './applications.controller';

import {
  ApplicationsService,
} from './applications.service';

import {
  Application,
  ApplicationSchema,
} from './schemas/application.schema';

import {
  User,
  UserSchema,
} from '../users/schemas/user.schema';

import {
  RecruiterJob,
  RecruiterJobSchema,
} from '../recruiter-jobs/recruiter-job.schema';

import { EmailModule } from '../email/email.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      {
        name: Application.name,
        schema: ApplicationSchema,
      },
      {
        name: User.name,
        schema: UserSchema,
      },
      {
        name: RecruiterJob.name,
        schema: RecruiterJobSchema,
      },
    ]),

    EmailModule,
  ],

  controllers: [
    ApplicationsController,
  ],

  providers: [
    ApplicationsService,
  ],

  exports: [
    ApplicationsService,
  ],
})
export class ApplicationsModule {}