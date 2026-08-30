
import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';

import { FileInterceptor } from '@nestjs/platform-express';
import { memoryStorage } from 'multer';

import {
  ApiBody,
  ApiConsumes,
  ApiOperation,
} from '@nestjs/swagger';

import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';

import { SubmissionsService } from '../submission/submissions.service';

import cloudinary from '../config/cloudinary.config';

@Controller('users')
export class UsersController {
  constructor(
    private readonly usersService: UsersService,
    private readonly submissionsService: SubmissionsService,
  ) {}

  // =========================
  // PDF SUBMISSION
  // =========================

  @Post('submission')
  @ApiOperation({ summary: 'Submit user details with PDF' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        name: {
          type: 'string',
          example: 'Hiya',
        },
        email: {
          type: 'string',
          example: 'hiya@gmail.com',
        },
        age: {
          type: 'number',
          example: 18,
        },
        submission: {
          type: 'string',
          format: 'binary',
        },
      },
      required: ['name', 'email', 'age', 'submission'],
    },
  })
  @UseInterceptors(
    FileInterceptor('submission', {
      storage: memoryStorage(),
    }),
  )
  async submission(
    @Body('name') name: string,
    @Body('email') email: string,
    @Body('age') age: string,
    @UploadedFile() file: Express.Multer.File,
  ) {
    if (!file) {
      throw new Error('PDF file is required');
    }

    // Upload PDF to Cloudinary
    const result = await cloudinary.uploader.upload(
      `data:${file.mimetype};base64,${file.buffer.toString('base64')}`,
      {
        folder: 'submissions',
        resource_type: 'raw',
        public_id: `submission_${Date.now()}.pdf`,
      },
    );

    // Save submission details + Cloudinary URL in MongoDB
    const savedSubmission = await this.submissionsService.create(
      name,
      email,
      Number(age),
      file.originalname,
      result.secure_url,
    );

    return {
      message: 'Submission successful',
      submission: savedSubmission,
      fileUrl: result.secure_url,
    };
  }

  // =========================
  // GET ALL USERS
  // =========================

  @Get()
  findAll() {
    return this.usersService.findAll();
  }

  // =========================
  // GET USER BY ID
  // =========================

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.usersService.findOne(id);
  }

  // =========================
  // CREATE USER
  // =========================

  @Post()
  create(@Body() createUserDto: CreateUserDto) {
    return this.usersService.create(createUserDto);
  }

  // =========================
  // UPDATE USER
  // =========================

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateUserDto: UpdateUserDto,
  ) {
    return this.usersService.update(id, updateUserDto);
  }

  // =========================
  // DELETE USER
  // =========================

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.usersService.delete(id);
  }
}

