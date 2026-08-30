import {
  Body,
  Controller,
  Get,
  Post,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';

import {
  ApiBody,
  ApiConsumes,
  ApiTags,
} from '@nestjs/swagger';

import { FileInterceptor } from '@nestjs/platform-express';
import { memoryStorage } from 'multer';

import { SubmissionsService } from './submissions.service';

@ApiTags('Submissions')
@Controller('submissions')
export class SubmissionsController {
  constructor(
    private readonly submissionsService: SubmissionsService,
  ) {}

  @Post()
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(
    FileInterceptor('file', {
      storage: memoryStorage(),
    }),
  )
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        name: {
          type: 'string',
          example: 'Aman',
        },
        email: {
          type: 'string',
          example: 'aman@gmail.com',
        },
        age: {
          type: 'number',
          example: 21,
        },
        file: {
          type: 'string',
          format: 'binary',
        },
      },
      required: ['name', 'email', 'age', 'file'],
    },
  })
  async create(
    @Body('name') name: string,
    @Body('email') email: string,
    @Body('age') age: number,
    @UploadedFile() file: Express.Multer.File,
  ) {
    return this.submissionsService.createWithFile(
      name,
      email,
      age,
      file,
    );
  }

  @Get()
  async findAll() {
    return this.submissionsService.findAll();
  }
}