import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { PDFParse } from 'pdf-parse';

import {
  Submission,
  SubmissionDocument,
} from './schemas/submission.schema';

import cloudinary from '../config/cloudinary.config';

@Injectable()
export class SubmissionsService {
  constructor(
    @InjectModel(Submission.name)
    private submissionModel: Model<SubmissionDocument>,
  ) {}

  // Create submission
  async create(
    name: string,
    email: string,
    age: number,
    filename: string,
    fileUrl: string,
    extractedText: string = '',
  ) {
    const submission = new this.submissionModel({
      name,
      email,
      age,
      filename,
      fileUrl,
      extractedText,
    });

    return submission.save();
  }

  // Upload resume + extract PDF text + save data
  async createWithFile(
    name: string,
    email: string,
    age: number,
    file: Express.Multer.File,
  ) {
    // 1. Extract text from PDF
    const parser = new PDFParse({
      data: file.buffer,
    });

    const pdfData = await parser.getText();
    const extractedText = pdfData.text;

    await parser.destroy();

    // 2. Upload resume to Cloudinary
    const uploadResult: any = await new Promise((resolve, reject) => {
      cloudinary.uploader
        .upload_stream(
          {
            folder: 'resumes',
            resource_type: 'auto',
          },
          (error: any, result: any) => {
            if (error) {
              reject(error);
            } else {
              resolve(result);
            }
          },
        )
        .end(file.buffer);
    });

    // 3. Save data in MongoDB
    return this.create(
      name,
      email,
      age,
      file.originalname,
      uploadResult.secure_url,
      extractedText,
    );
  }

  // Get all submissions
  async findAll() {
    return this.submissionModel.find();
  }
}