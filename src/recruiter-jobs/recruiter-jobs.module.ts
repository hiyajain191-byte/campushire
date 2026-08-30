import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import { RecruiterJobsController } from './recruiter-jobs.controller';
import { RecruiterJobsService } from './recruiter-jobs.service';

import {
  RecruiterJob,
  RecruiterJobSchema,
} from './recruiter-job.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      {
        name: RecruiterJob.name,
        schema: RecruiterJobSchema,
      },
    ]),
  ],
  controllers: [RecruiterJobsController],
  providers: [RecruiterJobsService],
})
export class RecruiterJobsModule {}