import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';

import { UsersModule } from './users/users.module';
import { AuthModule } from './auth/auth.module';
import { SubmissionsModule } from './submission/submissions.module';
import { JobsModule } from './jobs/jobs.module';
import { ApplicationsModule } from './applications/applications.module';
import { RecruiterJobsModule } from './recruiter-jobs/recruiter-jobs.module';
import { EmailModule } from './email/email.module';

@Module({
  imports: [
    // Load .env variables globally
    ConfigModule.forRoot({
      isGlobal: true,
    }),

    // MongoDB connection
    MongooseModule.forRoot(process.env.MONGODB_URI!),

    // Application modules
    UsersModule,
    AuthModule,
    SubmissionsModule,
    JobsModule,
    ApplicationsModule,
    RecruiterJobsModule,

    // Email module
    EmailModule,
  ],
})
export class AppModule {}