import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import {
  Job,
  JobSchema,
} from './schemas/job.schema';

import {
  RecruiterJob,
  RecruiterJobSchema,
} from '../recruiter-jobs/recruiter-job.schema';

import { JobsService } from './jobs.service';
import { JobsController } from './jobs.controller';

@Module({
  imports: [
    MongooseModule.forFeature([
      {
        name: Job.name,
        schema: JobSchema,
      },

      {
        name: RecruiterJob.name,
        schema: RecruiterJobSchema,
      },
    ]),
  ],

  controllers: [
    JobsController,
  ],

  providers: [
    JobsService,
  ],

  exports: [
    JobsService,
  ],
})
export class JobsModule {}