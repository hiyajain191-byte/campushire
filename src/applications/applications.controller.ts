import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';

import { FileInterceptor } from '@nestjs/platform-express';

import { ApplicationsService } from './applications.service';

@Controller('applications')
export class ApplicationsController {
  constructor(
    private readonly applicationsService: ApplicationsService,
  ) {}

  // =====================================================
  // STUDENT APPLY
  // POST /applications
  // =====================================================

  @Post()
  @UseInterceptors(
    FileInterceptor('resume'),
  )
  async create(
    @Body() body: any,
    @UploadedFile()
    file: Express.Multer.File,
  ) {
    return this.applicationsService.create(
      body,
      file,
    );
  }

  // =====================================================
  // ALL APPLICATIONS
  // GET /applications
  // =====================================================

  @Get()
  async findAll() {
    return this.applicationsService.findAll();
  }

  // =====================================================
  // STUDENT APPLICATIONS
  // GET /applications/user?email=...
  // =====================================================

  @Get('user')
  async findByEmail(
    @Query('email') email: string,
  ) {
    return this.applicationsService.findByEmail(
      email,
    );
  }

  // =====================================================
  // RECRUITER APPLICATIONS
  // GET /applications/recruiter?recruiterId=...
  // =====================================================

  @Get('recruiter')
  async findByRecruiter(
    @Query('recruiterId')
    recruiterId: string,
  ) {
    return this.applicationsService.findByRecruiter(
      recruiterId,
    );
  }

  // =====================================================
  // UPDATE APPLICATION STATUS
  // PATCH /applications/:id/status
  // =====================================================

  @Patch(':id/status')
  async updateStatus(
    @Param('id') id: string,
    @Body('status') status: string,
  ) {
    return this.applicationsService.updateStatus(
      id,
      status,
    );
  }

  // =====================================================
  // DELETE APPLICATION
  // DELETE /applications/:id
  // =====================================================

  @Delete(':id')
  async deleteApplication(
    @Param('id') id: string,
  ) {
    return this.applicationsService.deleteApplication(
      id,
    );
  }
}