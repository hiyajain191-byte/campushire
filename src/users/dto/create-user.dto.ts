
import {
  IsEmail,
  IsIn,
  IsInt,
  IsNotEmpty,
  IsString,
  Min,
} from 'class-validator';

export class CreateUserDto {
  @IsNotEmpty()
  @IsString()
  name!: string;

  @IsEmail()
  email!: string;

  @IsInt()
  @Min(0)
  age!: number;

  @IsNotEmpty()
  @IsString()
  password!: string;

  @IsNotEmpty()
  @IsIn(['student', 'recruiter'])
  role!: 'student' | 'recruiter';
}

