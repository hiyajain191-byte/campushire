import {
  Injectable,
  UnauthorizedException,
  ConflictException,
} from '@nestjs/common';

import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';

import {
  User,
  UserDocument,
} from '../users/schemas/user.schema';

@Injectable()
export class AuthService {
  constructor(
    @InjectModel(User.name)
    private userModel: Model<UserDocument>,

    private jwtService: JwtService,
  ) {}

  // =========================
  // REGISTER
  // =========================

  async register(
    name: string,
    email: string,
    age: number,
    password: string,
    role: 'student' | 'recruiter',
  ) {
    const existingUser =
      await this.userModel.findOne({ email });

    if (existingUser) {
      throw new ConflictException(
        'Email already registered',
      );
    }

    const hashedPassword =
      await bcrypt.hash(password, 10);

    const user =
      await this.userModel.create({
        name,
        email,
        age,
        password: hashedPassword,
        role,
      });

    // =========================
    // GENERATE JWT AFTER REGISTER
    // =========================

    const token = this.jwtService.sign({
      id: user._id,
      email: user.email,
      role: user.role,
    });

    return {
      message: 'Register successful',

      // IMPORTANT
      token: token,

      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        age: user.age,
        role: user.role,
      },
    };
  }

  // =========================
  // LOGIN
  // =========================

  async login(
    email: string,
    password: string,
  ) {
    const user =
      await this.userModel.findOne({ email });

    if (!user) {
      throw new UnauthorizedException(
        'Invalid email or password',
      );
    }

    const passwordMatch =
      await bcrypt.compare(
        password,
        user.password,
      );

    if (!passwordMatch) {
      throw new UnauthorizedException(
        'Invalid email or password',
      );
    }

    const token =
      this.jwtService.sign({
        id: user._id,
        email: user.email,
        role: user.role,
      });

    return {
      message: 'Login successful',

      access_token: token,

      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    };
  }
}