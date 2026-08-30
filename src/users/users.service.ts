
import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

import { User, UserDocument } from './schemas/user.schema';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';

@Injectable()
export class UsersService {
  constructor(
    @InjectModel(User.name)
    private userModel: Model<UserDocument>,
  ) {}

  // =========================
  // GET ALL USERS
  // =========================

  async findAll() {
    return this.userModel.find();
  }

  // =========================
  // GET USER BY ID
  // =========================

  async findOne(id: string) {
    const user = await this.userModel.findById(id);

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return user;
  }

  // =========================
  // GET USER BY EMAIL
  // =========================

  async findByEmail(email: string) {
    return this.userModel.findOne({ email });
  }

  // =========================
  // CREATE USER
  // =========================

  async create(createUserDto: CreateUserDto) {
    const newUser = new this.userModel(createUserDto);

    return newUser.save();
  }

  // =========================
  // UPDATE USER
  // =========================

  async update(id: string, updateUserDto: UpdateUserDto) {
    const user = await this.userModel.findByIdAndUpdate(
      id,
      updateUserDto,
      { new: true },
    );

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return user;
  }

  // =========================
  // DELETE USER
  // =========================

  async delete(id: string) {
    const user = await this.userModel.findByIdAndDelete(id);

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return {
      message: 'User deleted successfully',
      deletedUser: user,
    };
  }

  // =========================
  // SAVE PDF SUBMISSION
  // =========================

  async createSubmission(
    name: string,
    email: string,
    age: number,
    password: string,
    filename: string,
    fileUrl: string,
  ) {
    const newUser = new this.userModel({
      name,
      email,
      age,
      password,
      filename,
      fileUrl,
    });

    return newUser.save();
  }
}

