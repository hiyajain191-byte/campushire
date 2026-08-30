
import { Body, Controller, Post } from '@nestjs/common';
import { AuthService } from './auth.service';
import { ApiBody } from '@nestjs/swagger';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  // =========================
  // REGISTER
  // =========================

  @Post('register')
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

        password: {
          type: 'string',
          example: '123456',
        },

        role: {
          type: 'string',
          enum: ['student', 'recruiter'],
          example: 'student',
        },
      },

      required: [
        'name',
        'email',
        'age',
        'password',
        'role',
      ],
    },
  })
  register(@Body() body: any) {
    return this.authService.register(
      body.name,
      body.email,
      body.age,
      body.password,
      body.role,
    );
  }

  // =========================
  // LOGIN
  // =========================

  @Post('login')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        email: {
          type: 'string',
          example: 'aman@gmail.com',
        },

        password: {
          type: 'string',
          example: '123456',
        },
      },

      required: ['email', 'password'],
    },
  })
  login(@Body() body: any) {
    return this.authService.login(
      body.email,
      body.password,
    );
  }
}

