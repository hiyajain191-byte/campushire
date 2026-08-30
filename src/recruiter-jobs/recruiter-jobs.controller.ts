import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Query,
} from '@nestjs/common';

import { RecruiterJobsService } from './recruiter-jobs.service';

import { CreateRecruiterJobDto } from './dto/create-recruiter-job.dto';

@Controller('recruiter-jobs')
export class RecruiterJobsController {
  constructor(
    private readonly recruiterJobsService: RecruiterJobsService,
  ) {}

  // =====================================================
  // CREATE JOB
  // POST /recruiter-jobs
  // =====================================================

  @Post()
  async create(
    @Body() body: CreateRecruiterJobDto,
  ) {
    return this.recruiterJobsService.create(body);
  }

  // =====================================================
  // GET ALL JOBS
  // GET /recruiter-jobs
  // =====================================================

  @Get()
  async getAllJobs() {
    return this.recruiterJobsService.findAll();
  }

  // =====================================================
  // GET MY JOBS
  // GET /recruiter-jobs/my-jobs?recruiterId=...
  // =====================================================

  @Get('my-jobs')
  async getMyJobs(
    @Query('recruiterId') recruiterId: string,
  ) {
    return this.recruiterJobsService.findByRecruiter(
      recruiterId,
    );
  }

  // =====================================================
  // DELETE JOB
  // DELETE /recruiter-jobs/:id?recruiterId=...
  // =====================================================

  @Delete(':id')
  async deleteJob(
    @Param('id') id: string,
    @Query('recruiterId') recruiterId: string,
  ) {
    return this.recruiterJobsService.deleteJob(
      id,
      recruiterId,
    );
  }
}