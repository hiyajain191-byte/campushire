import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';

import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

import {
  RecruiterJob,
  RecruiterJobDocument,
} from './recruiter-job.schema';

import { CreateRecruiterJobDto } from './dto/create-recruiter-job.dto';

@Injectable()
export class RecruiterJobsService {
  constructor(
    @InjectModel(RecruiterJob.name)
    private readonly recruiterJobModel: Model<RecruiterJobDocument>,
  ) {}

  // =====================================================
  // CREATE JOB
  // =====================================================

  async create(data: CreateRecruiterJobDto) {
    const job = new this.recruiterJobModel({
      ...data,
      status: data.status || 'Active',
    });

    return job.save();
  }

  // =====================================================
  // GET ALL JOBS
  // =====================================================

  async findAll() {
    return this.recruiterJobModel
      .find()
      .sort({ createdAt: -1 })
      .exec();
  }

  // =====================================================
  // GET JOBS BY RECRUITER
  // =====================================================

  async findByRecruiter(recruiterId: string) {
    return this.recruiterJobModel
      .find({ recruiterId })
      .sort({ createdAt: -1 })
      .exec();
  }

  // =====================================================
  // DELETE JOB
  // =====================================================

  async deleteJob(
    jobId: string,
    recruiterId: string,
  ) {
    const job =
      await this.recruiterJobModel.findById(jobId);

    if (!job) {
      throw new NotFoundException(
        'Job not found',
      );
    }

    // IMPORTANT:
    // Recruiter can delete only their own job
    if (job.recruiterId !== recruiterId) {
      throw new ForbiddenException(
        'You can only delete your own jobs',
      );
    }

    await this.recruiterJobModel.findByIdAndDelete(
      jobId,
    );

    return {
      message: 'Job deleted successfully',
      jobId,
    };
  }
}