import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

import { Job, JobDocument } from './schemas/job.schema';

import {
  RecruiterJob,
  RecruiterJobDocument,
} from '../recruiter-jobs/recruiter-job.schema';

@Injectable()
export class JobsService {
  constructor(
    @InjectModel(Job.name)
    private readonly jobModel: Model<JobDocument>,

    @InjectModel(RecruiterJob.name)
    private readonly recruiterJobModel: Model<RecruiterJobDocument>,
  ) {}

  /* =====================================================
     GET ALL JOBS

     Returns:
     1. Imported / existing jobs
     2. Recruiter posted jobs
  ===================================================== */

  async findAll() {
    const [normalJobs, recruiterJobs] =
      await Promise.all([
        this.jobModel
          .find()
          .sort({ createdAt: -1 })
          .lean()
          .exec(),

        this.recruiterJobModel
          .find({ status: 'Active' })
          .sort({ createdAt: -1 })
          .lean()
          .exec(),
      ]);

    /*
     * Convert recruiter jobs into the same structure
     * that the student frontend can use.
     */

    const formattedRecruiterJobs =
      recruiterJobs.map((job) => ({
        _id: job._id,

        title: job.title,

        company: job.company,

        location: job.location,

        city: job.location,

        jobType: job.jobType,

        workMode: job.jobType,

        salary: job.salary || '',

        // EXPERIENCE
        experience: job.experience || '',

        skills: job.skills || [],

        description: job.description,

        recruiterId: job.recruiterId,

        status: job.status,

        createdAt: job.createdAt,

        updatedAt: job.updatedAt,

        postedDate: job.createdAt,

        isFresherFriendly: true,
      }));

    /*
     * Existing imported jobs + recruiter jobs
     */

    const allJobs = [
      ...normalJobs,
      ...formattedRecruiterJobs,
    ];

    /*
     * Newest jobs first
     */

    allJobs.sort((a: any, b: any) => {
      const dateA = new Date(
        a.createdAt || a.postedDate || 0,
      ).getTime();

      const dateB = new Date(
        b.createdAt || b.postedDate || 0,
      ).getTime();

      return dateB - dateA;
    });

    return allJobs;
  }

  /* =====================================================
     GET SINGLE JOB
  ===================================================== */

  async findById(id: string) {
    /*
     * First check normal/imported jobs
     */

    const normalJob =
      await this.jobModel
        .findById(id)
        .lean()
        .exec();

    if (normalJob) {
      return normalJob;
    }

    /*
     * If not found, check recruiter jobs
     */

    const recruiterJob =
      await this.recruiterJobModel
        .findById(id)
        .lean()
        .exec();

    if (!recruiterJob) {
      return null;
    }

    /*
     * Return recruiter job in same format
     * as normal jobs.
     */

    return {
      _id: recruiterJob._id,

      title: recruiterJob.title,

      company: recruiterJob.company,

      location: recruiterJob.location,

      city: recruiterJob.location,

      jobType: recruiterJob.jobType,

      workMode: recruiterJob.jobType,

      salary: recruiterJob.salary || '',

      // EXPERIENCE
      experience: recruiterJob.experience || '',

      skills: recruiterJob.skills || [],

      description: recruiterJob.description,

      recruiterId: recruiterJob.recruiterId,

      status: recruiterJob.status,

      createdAt: recruiterJob.createdAt,

      updatedAt: recruiterJob.updatedAt,

      postedDate: recruiterJob.createdAt,

      isFresherFriendly: true,
    };
  }

  /* =====================================================
     FIND BY EXTERNAL ID
  ===================================================== */

  async findByExternalId(
    externalJobId: number,
  ) {
    return this.jobModel
      .findOne({ externalJobId })
      .exec();
  }

  /* =====================================================
     CREATE NORMAL JOB
  ===================================================== */

  async create(
    jobData: Partial<Job>,
  ) {
    return this.jobModel.create(
      jobData,
    );
  }

  /* =====================================================
     CREATE MANY NORMAL JOBS
  ===================================================== */

  async createMany(
    jobs: Partial<Job>[],
  ) {
    return this.jobModel.insertMany(
      jobs,
      {
        ordered: false,
      },
    );
  }

  /* =====================================================
     DELETE NORMAL JOBS
  ===================================================== */

  async deleteAll() {
    return this.jobModel.deleteMany({});
  }
}