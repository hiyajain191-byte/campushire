import {
  Injectable,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';

import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

import {
  Application,
  ApplicationDocument,
} from './schemas/application.schema';

import {
  User,
  UserDocument,
} from '../users/schemas/user.schema';

import {
  RecruiterJob,
  RecruiterJobDocument,
} from '../recruiter-jobs/recruiter-job.schema';

import cloudinary from '../config/cloudinary.config';

import { EmailService } from '../email/email.service';

@Injectable()
export class ApplicationsService {
  constructor(
    @InjectModel(Application.name)
    private readonly applicationModel: Model<ApplicationDocument>,

    @InjectModel(User.name)
    private readonly userModel: Model<UserDocument>,

    @InjectModel(RecruiterJob.name)
    private readonly recruiterJobModel: Model<RecruiterJobDocument>,

    private readonly emailService: EmailService,
  ) {}

  // =====================================================
  // CREATE APPLICATION
  // =====================================================

  async create(
    data: {
      jobId: string;
      jobTitle: string;
      company: string;
      name: string;
      email: string;
      phone?: string;
      coverMessage?: string;
      status?: string;
      recruiterId?: string;
    },
    file?: Express.Multer.File,
  ) {
    // ===================================================
    // CHECK RESUME
    // ===================================================

    if (!file) {
      throw new BadRequestException(
        'Resume file is required',
      );
    }

    // ===================================================
    // FIND RECRUITER JOB
    // ===================================================

    const job =
      await this.recruiterJobModel.findById(
        data.jobId,
      );

    // ===================================================
    // GET RECRUITER ID
    // ===================================================

    let recruiterId =
      data.recruiterId;

    if (job?.recruiterId) {
      recruiterId = job.recruiterId;
    }

    console.log(
      'JOB ID:',
      data.jobId,
    );

    console.log(
      'RECRUITER ID:',
      recruiterId,
    );

    // ===================================================
    // UPLOAD RESUME
    // ===================================================

    const resumeUrl =
      await new Promise<string>(
        (resolve, reject) => {
          const uploadStream =
            cloudinary.uploader.upload_stream(
              {
                folder:
                  'campushire/resumes',
                resource_type: 'auto',
              },

              (error, result) => {
                if (error) {
                  reject(error);
                  return;
                }

                if (
                  !result?.secure_url
                ) {
                  reject(
                    new Error(
                      'Resume upload failed',
                    ),
                  );
                  return;
                }

                resolve(
                  result.secure_url,
                );
              },
            );

          uploadStream.end(
            file.buffer,
          );
        },
      );

    // ===================================================
    // SAVE APPLICATION
    // ===================================================

    const application =
      new this.applicationModel({
        jobId: data.jobId,
        jobTitle: data.jobTitle,
        company: data.company,
        name: data.name,
        email: data.email,
        phone: data.phone,
        recruiterId,
        resumeUrl,
        coverMessage:
          data.coverMessage,
        status:
          data.status || 'Applied',
      });

    const savedApplication =
      await application.save();

    console.log(
      'APPLICATION SAVED:',
      savedApplication._id,
    );

    // ===================================================
    // CANDIDATE EMAIL
    // ===================================================

    try {
      await this.emailService
        .sendApplicationConfirmation(
          data.email,
          data.name,
          data.jobTitle,
          data.company,
        );

      console.log(
        'Candidate confirmation email sent to:',
        data.email,
      );
    } catch (error) {
      console.error(
        'Candidate confirmation email failed:',
        error,
      );
    }

    // ===================================================
    // RECRUITER EMAIL
    // =====================================================

    try {
      if (recruiterId) {
        const recruiter =
          await this.userModel.findById(
            recruiterId,
          );

        if (
          recruiter &&
          recruiter.role === 'recruiter' &&
          recruiter.email
        ) {
          await this.emailService
            .sendRecruiterApplicationNotification(
              recruiter.email,
              recruiter.name,
              data.name,
              data.email,
              data.phone,
              data.jobTitle,
              data.company,
              data.coverMessage,
            );

          console.log(
            'Recruiter notification email sent to:',
            recruiter.email,
          );
        } else {
          console.log(
            'Recruiter not found:',
            recruiterId,
          );
        }
      } else {
        console.log(
          'No recruiterId found',
        );
      }
    } catch (error) {
      console.error(
        'Recruiter notification email failed:',
        error,
      );
    }

    return savedApplication;
  }

  // =====================================================
  // GET ALL APPLICATIONS
  // =====================================================

  async findAll() {
    return this.applicationModel
      .find()
      .sort({
        createdAt: -1,
      })
      .exec();
  }

  // =====================================================
  // GET STUDENT APPLICATIONS
  // =====================================================

  async findByEmail(
    email: string,
  ) {
    return this.applicationModel
      .find({
        email,
      })
      .sort({
        createdAt: -1,
      })
      .exec();
  }

  // =====================================================
  // GET RECRUITER APPLICATIONS
  // =====================================================

  async findByRecruiter(
    recruiterId: string,
  ) {
    if (!recruiterId) {
      throw new BadRequestException(
        'recruiterId is required',
      );
    }

    // ===================================================
    // FIND RECRUITER'S JOBS
    // ===================================================

    const recruiterJobs =
      await this.recruiterJobModel
        .find({
          recruiterId,
        })
        .select('_id')
        .lean()
        .exec();

    const jobIds =
      recruiterJobs.map(
        (job) =>
          job._id.toString(),
      );

    console.log(
      'RECRUITER:',
      recruiterId,
    );

    console.log(
      'RECRUITER JOB IDS:',
      jobIds,
    );

    // ===================================================
    // FIND APPLICATIONS
    // ===================================================

    const applications =
      await this.applicationModel
        .find({
          $or: [
            {
              recruiterId,
            },
            {
              jobId: {
                $in: jobIds,
              },
            },
          ],
        })
        .sort({
          createdAt: -1,
        })
        .exec();

    console.log(
      'RECRUITER APPLICATION COUNT:',
      applications.length,
    );

    return applications;
  }

  // =====================================================
  // UPDATE APPLICATION STATUS
  // =====================================================

  async updateStatus(
    id: string,
    status: string,
  ) {
    if (!status) {
      throw new BadRequestException(
        'Status is required',
      );
    }

    const allowedStatuses = [
      'Applied',
      'Under Review',
      'Shortlisted',
      'Rejected',
    ];

    if (
      !allowedStatuses.includes(
        status,
      )
    ) {
      throw new BadRequestException(
        'Invalid application status',
      );
    }

    const application =
      await this.applicationModel
        .findByIdAndUpdate(
          id,
          {
            status,
          },
          {
            new: true,
          },
        );

    if (!application) {
      throw new NotFoundException(
        'Application not found',
      );
    }

    // ===================================================
    // SEND STATUS EMAIL
    // ===================================================

    if (
      status === 'Shortlisted' ||
      status === 'Rejected'
    ) {
      try {
        await this.emailService
          .sendApplicationStatusUpdate(
            application.email,
            application.name,
            application.jobTitle,
            application.company,
            status,
          );

        console.log(
          `${status} email sent to:`,
          application.email,
        );
      } catch (error) {
        console.error(
          'Application status email failed:',
          error,
        );
      }
    }

    return application;
  }

  // =====================================================
  // DELETE APPLICATION
  // =====================================================

  async deleteApplication(
    id: string,
  ) {
    const application =
      await this.applicationModel
        .findByIdAndDelete(id);

    if (!application) {
      throw new NotFoundException(
        'Application not found',
      );
    }

    console.log(
      'APPLICATION DELETED:',
      id,
    );

    return {
      message:
        'Application deleted successfully',
      id,
    };
  }
}